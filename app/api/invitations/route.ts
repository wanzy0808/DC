import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPaidDigitalInvitation } from "@/lib/packages/access";
import { isLegacyInvitationSlug, slugifyCouple } from "@/lib/invitation-slug";

type InvitationType = "WEDDING" | "ADAT_AKAD";

const MAX_INVITATIONS = 3;

function normalizeType(value: unknown): InvitationType {
  return value === "ADAT_AKAD" ? "ADAT_AKAD" : "WEDDING";
}

function makeSlug(firstName: string, userId: string, type: InvitationType) {
  const name = firstName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const suffix = type === "ADAT_AKAD" ? "-akad" : "-moment";
  return `${name || "wedding"}${suffix}-${userId.slice(-6)}`;
}

async function makeAdditionalSlug(firstName: string, userId: string, sequence: number) {
  const name = firstName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const base = `${name || "wedding"}-event-${sequence}-${userId.slice(-6)}`;
  let candidate = base;
  let suffix = 2;

  while (await prisma.invitation.findUnique({ where: { slug: candidate }, select: { id: true } })) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

function sanitizeInvitation<T extends object>(invitation: T) {
  const { passwordHash: _passwordHash, ...safeInvitation } = invitation as T & { passwordHash?: string | null };
  return safeInvitation;
}

async function getUserPayment(userId: string) {
  return prisma.payment.findFirst({
    where: {
      userId,
      status: "PAID",
      packageKey: { in: ["INVITATION_BASIC", "INVITATION_GUESTBOOK"] },
    },
    orderBy: { paidAt: "desc" },
  });
}

async function getOrCreateInvitation(
  user: { id: string; firstName: string },
  type: InvitationType,
) {
  const existing = await prisma.invitation.findFirst({
    where: { ownerId: user.id, type },
    include: { assets: { orderBy: { createdAt: "asc" } }, payment: true },
    orderBy: { createdAt: "asc" },
  });
  if (existing) return existing;

  const invitation = await prisma.invitation.create({
    data: {
      ownerId: user.id,
      slug: makeSlug(user.firstName, user.id, type),
      type,
      templateKey: "",
      title: "",
      groomName: "",
      brideName: "",
      venue: "",
      timezone: "Asia/Jakarta",
      ceremonyTime: type === "ADAT_AKAD" ? "09:00" : null,
      description: null,
    },
  });

  return prisma.invitation.findUniqueOrThrow({
    where: { id: invitation.id },
    include: { assets: { orderBy: { createdAt: "asc" } }, payment: true },
  });
}

async function resolveWeddingSlug(invitationId: string, groomName: string, brideName: string, currentSlug: string) {
  if (!isLegacyInvitationSlug(currentSlug)) return currentSlug;

  const base = slugifyCouple(groomName, brideName);
  let candidate = base;
  let suffix = 2;

  while (await prisma.invitation.findFirst({ where: { slug: candidate, id: { not: invitationId } }, select: { id: true } })) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

function studioInvitationId(
  request: Request,
  explicitId?: unknown,
  requestedType?: InvitationType,
) {
  const direct = String(explicitId ?? "").trim();
  if (direct) return direct;

  const referer = request.headers.get("referer");
  if (!referer) return "";
  try {
    const refererUrl = new URL(referer);
    const refererId = refererUrl.searchParams.get("invitationId")?.trim() || "";
    if (!refererId) return "";
    if (!requestedType) return refererId;
    const refererType = normalizeType(refererUrl.searchParams.get("type"));
    return refererType === requestedType ? refererId : "";
  } catch {
    return "";
  }
}

async function findOwnedInvitation(userId: string, id: string) {
  return prisma.invitation.findFirst({
    where: { id, ownerId: userId },
    include: { assets: { orderBy: { createdAt: "asc" } }, payment: true },
  });
}

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });

  const url = new URL(request.url);
  if (url.searchParams.get("all") === "1") {
    await getOrCreateInvitation(user, "WEDDING");
    const paid = Boolean(await getUserPayment(user.id));
    const invitations = await prisma.invitation.findMany({
      where: { ownerId: user.id },
      include: { assets: { orderBy: { createdAt: "asc" } }, payment: true },
      orderBy: [{ type: "desc" }, { createdAt: "asc" }],
      take: MAX_INVITATIONS,
    });

    return NextResponse.json({
      invitations: invitations.map((invitation) => ({ ...sanitizeInvitation(invitation), accessPaid: paid })),
      limit: MAX_INVITATIONS,
    });
  }

  const requestedType = normalizeType(url.searchParams.get("type"));
  const requestedId = studioInvitationId(
    request,
    url.searchParams.get("id"),
    requestedType,
  );
  if (requestedId) {
    const invitation = await findOwnedInvitation(user.id, requestedId);
    if (!invitation) return NextResponse.json({ error: "Undangan tidak ditemukan." }, { status: 404 });
    const paid = Boolean(await getUserPayment(user.id));
    return NextResponse.json({ invitation: { ...sanitizeInvitation(invitation), accessPaid: paid } });
  }

  const invitation = await getOrCreateInvitation(user, requestedType);
  const paid = Boolean(await getUserPayment(user.id));

  return NextResponse.json({
    invitation: { ...sanitizeInvitation(invitation), accessPaid: paid },
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });

  try {
    const main = await getOrCreateInvitation(user, "WEDDING");
    const count = await prisma.invitation.count({ where: { ownerId: user.id } });
    if (count >= MAX_INVITATIONS) {
      return NextResponse.json({ error: `Maksimal ${MAX_INVITATIONS} rangkaian acara.` }, { status: 409 });
    }

    const sequence = count + 1;
    const slug = await makeAdditionalSlug(user.firstName, user.id, sequence);
    const invitation = await prisma.invitation.create({
      data: {
        ownerId: user.id,
        slug,
        type: "ADAT_AKAD",
        templateKey: "",
        title: "",
        groomName: main.groomName,
        brideName: main.brideName,
        venue: "",
        timezone: main.timezone || "Asia/Jakarta",
        eventDate: main.eventDate,
        description: null,
      },
      include: { assets: { orderBy: { createdAt: "asc" } }, payment: true },
    });

    return NextResponse.json({ invitation: sanitizeInvitation(invitation), limit: MAX_INVITATIONS }, { status: 201 });
  } catch (error) {
    console.error("POST /api/invitations failed", error);
    return NextResponse.json({ error: "Rangkaian acara belum dapat dibuat." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });

  try {
    const body = await request.json();
    const fallbackType = normalizeType(body.type);
    const requestedId = studioInvitationId(request, body.id, fallbackType);
    const invitation = requestedId
      ? await findOwnedInvitation(user.id, requestedId)
      : await getOrCreateInvitation(user, fallbackType);

    if (!invitation) return NextResponse.json({ error: "Undangan tidak ditemukan." }, { status: 404 });

    const type = invitation.type as InvitationType;
    const groomName = String(body.groomName ?? invitation.groomName).trim();
    const brideName = String(body.brideName ?? invitation.brideName).trim();
    const venue = String(body.venue ?? invitation.venue).trim();
    const address = String(body.address ?? invitation.address ?? "").trim() || null;
    const mapUrl = String(body.mapUrl ?? invitation.mapUrl ?? "").trim() || null;
    const timezone = String(body.timezone ?? invitation.timezone ?? "Asia/Jakarta").trim() || "Asia/Jakarta";
    const eventDate = new Date(String(body.eventDate ?? invitation.eventDate));
    const templateKey = String(body.templateKey ?? invitation.templateKey).trim();
    const requestedTitle = String(body.title ?? invitation.title).trim();
    const title = requestedTitle || (type === "WEDDING" && groomName && brideName ? `${groomName} & ${brideName}` : invitation.title);
    const wantsPublish = Boolean(body.isPublished);

    if (!groomName || !brideName) {
      return NextResponse.json({ error: "Nama pasangan wajib diisi." }, { status: 400 });
    }
    if (wantsPublish && (!venue || Number.isNaN(eventDate.getTime()))) {
      return NextResponse.json({ error: "Tempat dan tanggal wajib diisi sebelum publish." }, { status: 400 });
    }

    const userPayment = await getUserPayment(user.id);
    const canPublish = Boolean(userPayment) || hasPaidDigitalInvitation(invitation.payment);
    const slug = type === "WEDDING"
      ? await resolveWeddingSlug(invitation.id, groomName, brideName, invitation.slug)
      : invitation.slug;

    const updated = await prisma.invitation.update({
      where: { id: invitation.id },
      data: {
        slug,
        groomName,
        brideName,
        venue,
        address,
        mapUrl,
        timezone,
        eventDate: Number.isNaN(eventDate.getTime()) ? invitation.eventDate : eventDate,
        eventConfigured: body.eventConfigured === true ? true : invitation.eventConfigured,
        ceremonyTime: String(body.ceremonyTime ?? invitation.ceremonyTime ?? "").trim() || null,
        receptionTime: String(body.receptionTime ?? invitation.receptionTime ?? "").trim() || null,
        title,
        templateKey,
        description: String(body.description ?? invitation.description ?? "").trim() || null,
        weddingHashtag: String(body.weddingHashtag ?? invitation.weddingHashtag ?? "").trim() || null,
        dressCode: String(body.dressCode ?? invitation.dressCode ?? "").trim() || null,
        liveStreamUrl: String(body.liveStreamUrl ?? invitation.liveStreamUrl ?? "").trim() || null,
        eventNotes: String(body.eventNotes ?? invitation.eventNotes ?? "").trim() || null,
        giftBankName: String(body.giftBankName ?? invitation.giftBankName ?? "").trim() || null,
        giftAccountName: String(body.giftAccountName ?? invitation.giftAccountName ?? "").trim() || null,
        giftAccountNumber: String(body.giftAccountNumber ?? invitation.giftAccountNumber ?? "").trim() || null,
        musicUrl: String(body.musicUrl ?? invitation.musicUrl ?? "").trim() || null,
        isPublished: canPublish && wantsPublish,
      },
      include: { assets: { orderBy: { createdAt: "asc" } }, payment: true },
    });

    return NextResponse.json({
      invitation: { ...sanitizeInvitation(updated), accessPaid: Boolean(userPayment) },
      accessPaid: Boolean(userPayment),
    });
  } catch (error) {
    console.error("PUT /api/invitations failed", error);
    return NextResponse.json({ error: "Undangan belum dapat disimpan." }, { status: 500 });
  }
}