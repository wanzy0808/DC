import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPaidDigitalInvitation } from "@/lib/packages/access";
import { isLegacyInvitationSlug, slugifyCouple } from "@/lib/invitation-slug";

type InvitationType = "WEDDING" | "ADAT_AKAD";

function makeSlug(firstName: string, userId: string, type: InvitationType) {
  const name = firstName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const suffix = type === "ADAT_AKAD" ? "-akad" : "-moment";
  return `${name || "wedding"}${suffix}-${userId.slice(-6)}`;
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

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });

  const type: InvitationType =
    new URL(request.url).searchParams.get("type") === "ADAT_AKAD" ? "ADAT_AKAD" : "WEDDING";
  const invitation = await getOrCreateInvitation(user, type);
  const paid = Boolean(await getUserPayment(user.id));

  return NextResponse.json({
    invitation: { ...sanitizeInvitation(invitation), accessPaid: paid },
  });
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });

  try {
    const body = await request.json();
    const type: InvitationType = body.type === "ADAT_AKAD" ? "ADAT_AKAD" : "WEDDING";
    const invitation = await getOrCreateInvitation(user, type);
    const groomName = String(body.groomName ?? invitation.groomName).trim();
    const brideName = String(body.brideName ?? invitation.brideName).trim();
    const venue = String(body.venue ?? invitation.venue).trim();
    const address = String(body.address ?? invitation.address ?? "").trim() || null;
    const mapUrl = String(body.mapUrl ?? invitation.mapUrl ?? "").trim() || null;
    const timezone = String(body.timezone ?? invitation.timezone ?? "Asia/Jakarta").trim() || "Asia/Jakarta";
    const eventDate = new Date(String(body.eventDate ?? invitation.eventDate));
    const templateKey = String(body.templateKey ?? invitation.templateKey).trim();
    const title = String(body.title ?? invitation.title).trim() || (groomName && brideName ? `${groomName} & ${brideName}` : "");
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
  } catch {
    return NextResponse.json({ error: "Undangan belum dapat disimpan." }, { status: 500 });
  }
}
