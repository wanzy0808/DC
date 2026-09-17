import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPaidDigitalInvitation } from "@/lib/packages/access";
import { isLegacyInvitationSlug, slugifyCouple } from "@/lib/invitation-slug";
import {
  buildEventTitle,
  getEventCategory,
  normalizeEventCategory,
  normalizeIndonesiaTimezone,
} from "@/lib/events/catalog";

type InvitationType = "WEDDING" | "ADAT_AKAD";

function normalizeType(value: unknown): InvitationType {
  return value === "ADAT_AKAD" ? "ADAT_AKAD" : "WEDDING";
}

function slugBase(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function makeLegacySlug(firstName: string, userId: string, type: InvitationType) {
  const name = slugBase(firstName);
  const suffix = type === "ADAT_AKAD" ? "-akad" : "-moment";
  return `${name || "event"}${suffix}-${userId.slice(-6)}`;
}

async function makeEventSlug(firstName: string, userId: string, sequence: number) {
  const name = slugBase(firstName) || "event";
  const base = `${name}-event-${sequence}-${userId.slice(-6)}`;
  let candidate = base;
  let suffix = 2;

  while (await prisma.invitation.findUnique({ where: { slug: candidate }, select: { id: true } })) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

function sanitizeInvitation<T extends object>(invitation: T) {
  const { passwordHash: _passwordHash, ...safeInvitation } = invitation as T & {
    passwordHash?: string | null;
  };
  return safeInvitation;
}

async function getOrCreateLegacyInvitation(
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
      slug: makeLegacySlug(user.firstName, user.id, type),
      type,
      templateKey: "",
      title: "",
      eventCategory: "OTHER",
      groomName: "",
      brideName: "",
      venue: "",
      timezone: "Asia/Jakarta",
      description: null,
      eventConfigured: false,
      waBlastQuota: 0,
    },
  });

  return prisma.invitation.findUniqueOrThrow({
    where: { id: invitation.id },
    include: { assets: { orderBy: { createdAt: "asc" } }, payment: true },
  });
}

async function resolveLegacyCoupleSlug(
  invitationId: string,
  groomName: string,
  brideName: string,
  currentSlug: string,
) {
  if (!groomName || !brideName || !isLegacyInvitationSlug(currentSlug)) return currentSlug;

  const base = slugifyCouple(groomName, brideName);
  let candidate = base;
  let suffix = 2;

  while (
    await prisma.invitation.findFirst({
      where: { slug: candidate, id: { not: invitationId } },
      select: { id: true },
    })
  ) {
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

async function findReusableDraft(userId: string) {
  return prisma.invitation.findFirst({
    where: {
      ownerId: userId,
      eventConfigured: false,
      isPublished: false,
      title: "",
      venue: "",
      groomName: "",
      brideName: "",
    },
    include: { assets: { orderBy: { createdAt: "asc" } }, payment: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });

  const url = new URL(request.url);
  if (url.searchParams.get("all") === "1") {
    const invitations = await prisma.invitation.findMany({
      where: { ownerId: user.id },
      include: { assets: { orderBy: { createdAt: "asc" } }, payment: true },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      invitations: invitations.map((invitation) => ({
        ...sanitizeInvitation(invitation),
        accessPaid: hasPaidDigitalInvitation(invitation.payment),
      })),
      unlimited: true,
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
    return NextResponse.json({
      invitation: {
        ...sanitizeInvitation(invitation),
        accessPaid: hasPaidDigitalInvitation(invitation.payment),
      },
    });
  }

  const invitation = await getOrCreateLegacyInvitation(user, requestedType);
  return NextResponse.json({
    invitation: {
      ...sanitizeInvitation(invitation),
      accessPaid: hasPaidDigitalInvitation(invitation.payment),
    },
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });

  try {
    const body = await request.json().catch(() => null);
    const reusableDraft = await findReusableDraft(user.id);

    if (body?.eventConfigured === true) {
      const type = normalizeType(body.type);
      const eventCategory = normalizeEventCategory(body.eventCategory);
      const category = getEventCategory(eventCategory);
      const groomName = String(body.groomName ?? "").trim();
      const brideName = String(body.brideName ?? "").trim();
      const venue = String(body.venue ?? "").trim();
      const address = String(body.address ?? "").trim() || null;
      const mapUrl = String(body.mapUrl ?? "").trim() || null;
      const timezone = normalizeIndonesiaTimezone(body.timezone);
      const eventDate = new Date(String(body.eventDate ?? ""));
      const ceremonyTime = String(body.ceremonyTime ?? "").trim() || null;
      const receptionTime = String(body.receptionTime ?? "").trim() || null;
      const requestedTitle = String(body.title ?? "").trim();
      const title = buildEventTitle(eventCategory, groomName, brideName, requestedTitle);

      if (!title) {
        return NextResponse.json({ error: "Nama acara wajib diisi." }, { status: 400 });
      }
      if (category.nameMode === "couple" && (!groomName || !brideName)) {
        return NextResponse.json(
          { error: "Nama pengantin pria dan wanita wajib diisi untuk acara ini." },
          { status: 400 },
        );
      }
      if (category.nameMode === "single" && !groomName) {
        return NextResponse.json({ error: "Nama utama acara wajib diisi." }, { status: 400 });
      }
      if (Number.isNaN(eventDate.getTime())) {
        return NextResponse.json({ error: "Tanggal acara wajib diisi." }, { status: 400 });
      }
      if (!ceremonyTime) {
        return NextResponse.json({ error: "Waktu mulai wajib diisi." }, { status: 400 });
      }
      if (!venue) {
        return NextResponse.json({ error: "Nama tempat wajib diisi." }, { status: 400 });
      }

      const data = {
        type,
        eventCategory,
        title,
        groomName,
        brideName,
        venue,
        address,
        mapUrl,
        timezone,
        eventDate,
        ceremonyTime,
        receptionTime,
        description: String(body.description ?? "").trim() || null,
        eventNotes: String(body.eventNotes ?? "").trim() || null,
        eventConfigured: true,
      };

      const invitation = reusableDraft
        ? await prisma.invitation.update({
            where: { id: reusableDraft.id },
            data,
            include: { assets: { orderBy: { createdAt: "asc" } }, payment: true },
          })
        : await prisma.invitation.create({
            data: {
              ownerId: user.id,
              slug: await makeEventSlug(
                user.firstName,
                user.id,
                (await prisma.invitation.count({ where: { ownerId: user.id } })) + 1,
              ),
              templateKey: "",
              waBlastQuota: 0,
              ...data,
            },
            include: { assets: { orderBy: { createdAt: "asc" } }, payment: true },
          });

      return NextResponse.json(
        {
          invitation: {
            ...sanitizeInvitation(invitation),
            accessPaid: hasPaidDigitalInvitation(invitation.payment),
          },
          unlimited: true,
          reused: Boolean(reusableDraft),
        },
        { status: reusableDraft ? 200 : 201 },
      );
    }

    if (reusableDraft) {
      return NextResponse.json({
        invitation: {
          ...sanitizeInvitation(reusableDraft),
          accessPaid: hasPaidDigitalInvitation(reusableDraft.payment),
        },
        unlimited: true,
        reused: true,
      });
    }

    const count = await prisma.invitation.count({ where: { ownerId: user.id } });
    const invitation = await prisma.invitation.create({
      data: {
        ownerId: user.id,
        slug: await makeEventSlug(user.firstName, user.id, count + 1),
        type: "WEDDING",
        templateKey: "",
        title: "",
        eventCategory: "OTHER",
        groomName: "",
        brideName: "",
        venue: "",
        timezone: "Asia/Jakarta",
        description: null,
        eventConfigured: false,
        waBlastQuota: 0,
      },
      include: { assets: { orderBy: { createdAt: "asc" } }, payment: true },
    });

    return NextResponse.json(
      { invitation: { ...sanitizeInvitation(invitation), accessPaid: false }, unlimited: true },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/invitations failed", error);
    return NextResponse.json({ error: "Acara baru belum dapat dibuat." }, { status: 500 });
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
      : await getOrCreateLegacyInvitation(user, fallbackType);

    if (!invitation) return NextResponse.json({ error: "Undangan tidak ditemukan." }, { status: 404 });

    const eventCategory = normalizeEventCategory(body.eventCategory ?? invitation.eventCategory);
    const category = getEventCategory(eventCategory);
    const groomName = String(body.groomName ?? invitation.groomName).trim();
    const brideName = String(body.brideName ?? invitation.brideName).trim();
    const venue = String(body.venue ?? invitation.venue).trim();
    const address = String(body.address ?? invitation.address ?? "").trim() || null;
    const mapUrl = String(body.mapUrl ?? invitation.mapUrl ?? "").trim() || null;
    const timezone = normalizeIndonesiaTimezone(body.timezone ?? invitation.timezone);
    const rawEventDate = String(body.eventDate ?? invitation.eventDate);
    const eventDate = new Date(rawEventDate);
    const ceremonyTime = String(body.ceremonyTime ?? invitation.ceremonyTime ?? "").trim() || null;
    const receptionTime = String(body.receptionTime ?? invitation.receptionTime ?? "").trim() || null;
    const templateKey = String(body.templateKey ?? invitation.templateKey).trim();
    const requestedTitle = String(body.title ?? invitation.title).trim();
    const title = buildEventTitle(eventCategory, groomName, brideName, requestedTitle);
    const wantsPublish = body.isPublished === undefined ? invitation.isPublished : Boolean(body.isPublished);
    const canPublish = hasPaidDigitalInvitation(invitation.payment);
    const eventConfigured = body.eventConfigured === true ? Boolean(title) : invitation.eventConfigured;

    if (body.eventConfigured === true) {
      if (!title) {
        return NextResponse.json({ error: "Nama acara wajib diisi." }, { status: 400 });
      }
      if (category.nameMode === "couple" && (!groomName || !brideName)) {
        return NextResponse.json(
          { error: "Nama pengantin pria dan wanita wajib diisi untuk acara ini." },
          { status: 400 },
        );
      }
      if (category.nameMode === "single" && !groomName) {
        return NextResponse.json({ error: "Nama utama acara wajib diisi." }, { status: 400 });
      }
      if (Number.isNaN(eventDate.getTime())) {
        return NextResponse.json({ error: "Tanggal acara wajib diisi." }, { status: 400 });
      }
      if (!ceremonyTime) {
        return NextResponse.json({ error: "Waktu mulai wajib diisi." }, { status: 400 });
      }
      if (!venue) {
        return NextResponse.json({ error: "Nama tempat wajib diisi." }, { status: 400 });
      }
    }

    if (wantsPublish && !eventConfigured) {
      return NextResponse.json({ error: "Lengkapi dan simpan acara sebelum publish." }, { status: 400 });
    }
    if (wantsPublish && (!title || !venue || Number.isNaN(eventDate.getTime()))) {
      return NextResponse.json({ error: "Nama acara, tempat, dan tanggal wajib diisi sebelum publish." }, { status: 400 });
    }
    if (wantsPublish && !templateKey) {
      return NextResponse.json({ error: "Pilih dan simpan template sebelum publish." }, { status: 400 });
    }
    if (wantsPublish && !canPublish) {
      return NextResponse.json({ error: "Aktifkan Undangan Digital Rp150.000 untuk acara ini sebelum publish." }, { status: 402 });
    }

    const slug = await resolveLegacyCoupleSlug(
      invitation.id,
      groomName,
      brideName,
      invitation.slug,
    );

    const updated = await prisma.invitation.update({
      where: { id: invitation.id },
      data: {
        slug,
        eventCategory,
        groomName,
        brideName,
        venue,
        address,
        mapUrl,
        timezone,
        eventDate: Number.isNaN(eventDate.getTime()) ? invitation.eventDate : eventDate,
        eventConfigured,
        ceremonyTime,
        receptionTime,
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
        isPublished: wantsPublish,
      },
      include: { assets: { orderBy: { createdAt: "asc" } }, payment: true },
    });

    return NextResponse.json({
      invitation: {
        ...sanitizeInvitation(updated),
        accessPaid: hasPaidDigitalInvitation(updated.payment),
      },
      accessPaid: hasPaidDigitalInvitation(updated.payment),
    });
  } catch (error) {
    console.error("PUT /api/invitations failed", error);
    return NextResponse.json({ error: "Undangan belum dapat disimpan." }, { status: 500 });
  }
}
