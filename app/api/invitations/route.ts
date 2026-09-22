import { Prisma } from "@/generated/prisma/client";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPaidDigitalInvitation } from "@/lib/packages/access";
import { isLegacyInvitationSlug, slugifyCouple } from "@/lib/invitations/slug";
import {
  buildEventTitle,
  getEventCategory,
  normalizeEventCategory,
  normalizeIndonesiaTimezone,
} from "@/lib/events/catalog";

import { hasWeddingSessions, parseWeddingSessions, validWeddingSessionAccess } from "@/lib/events/wedding-sessions";

type InvitationType = "WEDDING" | "ADAT_AKAD";

const END_TIME_SENTINEL = "END";

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

function databaseFailure(error: unknown, fallback: string) {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    (error.code === "P2021" || error.code === "P2022")
  ) {
    return NextResponse.json(
      {
        error:
          "Database server belum sinkron dengan versi aplikasi terbaru. Jalankan pnpm db:deploy di server lalu coba simpan lagi.",
      },
      { status: 503 },
    );
  }

  return NextResponse.json({ error: fallback }, { status: 500 });
}

function optionalName(value: unknown) {
  return String(value ?? "").trim() || null;
}

function optionalPositiveInt(value: unknown) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function isValidTime24(value: string | null) {
  return !value || /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function isValidReceptionTime(value: string | null) {
  return value === END_TIME_SENTINEL || isValidTime24(value);
}

const EVENT_DETAIL_MUTATION_FIELDS = [
  "type",
  "eventCategory",
  "title",
  "groomName",
  "brideName",
  "groomFatherName",
  "groomMotherName",
  "groomChildOrder",
  "brideFatherName",
  "brideMotherName",
  "brideChildOrder",
  "venue",
  "address",
  "mapUrl",
  "timezone",
  "eventDate",
  "ceremonyTime",
  "receptionTime",
  "weddingCeremonyEnabled",
  "weddingReceptionEnabled",
  "weddingCeremonyStart",
  "weddingCeremonyEnd",
  "weddingCeremonyVenue",
  "weddingCeremonyAddress",
  "weddingCeremonyMapUrl",
  "weddingReceptionStart",
  "weddingReceptionEnd",
  "weddingReceptionVenue",
  "weddingReceptionAddress",
  "weddingReceptionMapUrl",
  "description",
  "eventNotes",
  "eventConfigured",
] as const;

function hasEventDetailMutation(body: Record<string, unknown>) {
  return EVENT_DETAIL_MUTATION_FIELDS.some((field) =>
    Object.prototype.hasOwnProperty.call(body, field),
  );
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

  try {
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
  } catch (error) {
    console.error("GET /api/invitations failed", error);
    return databaseFailure(error, "Data acara belum dapat dimuat.");
  }
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
      const wedding = eventCategory === "WEDDING";
      const groomFatherName = wedding ? optionalName(body.groomFatherName) : null;
      const groomMotherName = wedding ? optionalName(body.groomMotherName) : null;
      const groomChildOrder = wedding ? optionalPositiveInt(body.groomChildOrder) : null;
      const brideFatherName = wedding ? optionalName(body.brideFatherName) : null;
      const brideMotherName = wedding ? optionalName(body.brideMotherName) : null;
      const brideChildOrder = wedding ? optionalPositiveInt(body.brideChildOrder) : null;
      const venue = String(body.venue ?? "").trim();
      const address = String(body.address ?? "").trim() || null;
      const mapUrl = String(body.mapUrl ?? "").trim() || null;
      const timezone = normalizeIndonesiaTimezone(body.timezone);
      const eventDate = new Date(String(body.eventDate ?? ""));
      const ceremonyTime = String(body.ceremonyTime ?? "").trim() || null;
      const receptionTime = String(body.receptionTime ?? "").trim() || null;
      const weddingSessions = wedding ? parseWeddingSessions(body as Record<string, unknown>) : null;
      if (wedding && weddingSessions?.error) return NextResponse.json({ error: weddingSessions.error }, { status: 400 });
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
      if (wedding && String(body.groomChildOrder ?? "").trim() && !groomChildOrder) {
        return NextResponse.json({ error: "Anak keberapa pengantin pria harus berupa angka lebih dari 0." }, { status: 400 });
      }
      if (wedding && String(body.brideChildOrder ?? "").trim() && !brideChildOrder) {
        return NextResponse.json({ error: "Anak keberapa pengantin wanita harus berupa angka lebih dari 0." }, { status: 400 });
      }
      if (Number.isNaN(eventDate.getTime())) {
        return NextResponse.json({ error: "Tanggal acara wajib diisi." }, { status: 400 });
      }
      if (!ceremonyTime) {
        return NextResponse.json({ error: "Waktu mulai wajib diisi." }, { status: 400 });
      }
      if (!isValidTime24(ceremonyTime) || !isValidReceptionTime(receptionTime)) {
        return NextResponse.json(
          { error: "Waktu acara harus menggunakan format 24 jam HH:mm (00:00–23:59)." },
          { status: 400 },
        );
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
        groomFatherName,
        groomMotherName,
        groomChildOrder,
        brideFatherName,
        brideMotherName,
        brideChildOrder,
        venue,
        address,
        mapUrl,
        timezone,
        eventDate,
        ceremonyTime,
        receptionTime,
        ...(weddingSessions?.value ?? {}),
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
    return databaseFailure(error, "Acara baru belum dapat dibuat.");
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

    if (
      invitation.isPublished &&
      (hasEventDetailMutation(body as Record<string, unknown>) || body.isPublished === false)
    ) {
      return NextResponse.json(
        {
          error:
            "Acara yang sudah dipublish terkunci dan tidak dapat diedit atau dikembalikan menjadi draft.",
        },
        { status: 409 },
      );
    }

    const eventCategory = normalizeEventCategory(body.eventCategory ?? invitation.eventCategory);
    const category = getEventCategory(eventCategory);
    const groomName = String(body.groomName ?? invitation.groomName).trim();
    const brideName = String(body.brideName ?? invitation.brideName).trim();
    const wedding = eventCategory === "WEDDING";
    const groomFatherName = wedding
      ? optionalName(body.groomFatherName ?? invitation.groomFatherName)
      : null;
    const groomMotherName = wedding
      ? optionalName(body.groomMotherName ?? invitation.groomMotherName)
      : null;
    const groomChildOrder = wedding
      ? optionalPositiveInt(body.groomChildOrder ?? invitation.groomChildOrder)
      : null;
    const brideFatherName = wedding
      ? optionalName(body.brideFatherName ?? invitation.brideFatherName)
      : null;
    const brideMotherName = wedding
      ? optionalName(body.brideMotherName ?? invitation.brideMotherName)
      : null;
    const brideChildOrder = wedding
      ? optionalPositiveInt(body.brideChildOrder ?? invitation.brideChildOrder)
      : null;
    const venue = String(body.venue ?? invitation.venue).trim();
    const address = String(body.address ?? invitation.address ?? "").trim() || null;
    const mapUrl = String(body.mapUrl ?? invitation.mapUrl ?? "").trim() || null;
    const timezone = normalizeIndonesiaTimezone(body.timezone ?? invitation.timezone);
    const rawEventDate = String(body.eventDate ?? invitation.eventDate);
    const eventDate = new Date(rawEventDate);
    const ceremonyTime = String(body.ceremonyTime ?? invitation.ceremonyTime ?? "").trim() || null;
    const receptionTime = String(body.receptionTime ?? invitation.receptionTime ?? "").trim() || null;
    const sessionFieldChanged = [
      "weddingCeremonyEnabled", "weddingReceptionEnabled", "weddingCeremonyStart",
      "weddingCeremonyEnd", "weddingCeremonyVenue", "weddingCeremonyAddress",
      "weddingCeremonyMapUrl", "weddingReceptionStart", "weddingReceptionEnd",
      "weddingReceptionVenue", "weddingReceptionAddress", "weddingReceptionMapUrl",
    ].some((field) => Object.prototype.hasOwnProperty.call(body, field));
    const usingSessions = wedding && (sessionFieldChanged || hasWeddingSessions(invitation));
    const weddingSessions = usingSessions
      ? parseWeddingSessions({ ...invitation, ...body } as Record<string, unknown>)
      : null;
    if (weddingSessions?.error) return NextResponse.json({ error: weddingSessions.error }, { status: 400 });
    if (sessionFieldChanged && !wedding) {
      return NextResponse.json({ error: "Sesi Upacara Nikah dan Resepsi hanya tersedia untuk Pernikahan." }, { status: 400 });
    }
    if (sessionFieldChanged && weddingSessions?.value) {
      const guestAccess = await prisma.guest.findMany({
        where: { invitationId: invitation.id, weddingSessionAccess: { not: null } },
        select: { weddingSessionAccess: true },
      });
      if (guestAccess.some((guest) => !validWeddingSessionAccess(weddingSessions.value!, guest.weddingSessionAccess))) {
        return NextResponse.json({
          error: "Ada tamu yang masih diundang ke sesi yang hendak dinonaktifkan. Perbarui cakupan undangan tamu terlebih dahulu.",
        }, { status: 409 });
      }
    }
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
      if (wedding && body.groomChildOrder !== undefined && String(body.groomChildOrder ?? "").trim() && !groomChildOrder) {
        return NextResponse.json({ error: "Anak keberapa pengantin pria harus berupa angka lebih dari 0." }, { status: 400 });
      }
      if (wedding && body.brideChildOrder !== undefined && String(body.brideChildOrder ?? "").trim() && !brideChildOrder) {
        return NextResponse.json({ error: "Anak keberapa pengantin wanita harus berupa angka lebih dari 0." }, { status: 400 });
      }
      if (Number.isNaN(eventDate.getTime())) {
        return NextResponse.json({ error: "Tanggal acara wajib diisi." }, { status: 400 });
      }
      if (!ceremonyTime) {
        return NextResponse.json({ error: "Waktu mulai wajib diisi." }, { status: 400 });
      }
      if (!isValidTime24(ceremonyTime) || !isValidReceptionTime(receptionTime)) {
        return NextResponse.json(
          { error: "Waktu acara harus menggunakan format 24 jam HH:mm (00:00–23:59)." },
          { status: 400 },
        );
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
        groomFatherName,
        groomMotherName,
        groomChildOrder,
        brideFatherName,
        brideMotherName,
        brideChildOrder,
        venue,
        address,
        mapUrl,
        timezone,
        eventDate: Number.isNaN(eventDate.getTime()) ? invitation.eventDate : eventDate,
        eventConfigured,
        ceremonyTime,
        receptionTime,
        ...(weddingSessions?.value ?? (!wedding ? { weddingCeremonyEnabled: false, weddingReceptionEnabled: false } : {})),
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
    return databaseFailure(error, "Undangan belum dapat disimpan.");
  }
}


export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });

  try {
    const id = new URL(request.url).searchParams.get("id")?.trim() || "";
    if (!id) {
      return NextResponse.json({ error: "Acara belum dipilih." }, { status: 400 });
    }

    const invitation = await findOwnedInvitation(user.id, id);
    if (!invitation) {
      return NextResponse.json({ error: "Acara tidak ditemukan." }, { status: 404 });
    }
    if (invitation.isPublished) {
      return NextResponse.json(
        { error: "Acara yang sudah dipublish tidak dapat dihapus." },
        { status: 409 },
      );
    }

    await prisma.invitation.delete({ where: { id: invitation.id } });
    return NextResponse.json({ deleted: true, id: invitation.id });
  } catch (error) {
    console.error("DELETE /api/invitations failed", error);
    return databaseFailure(error, "Acara belum dapat dihapus.");
  }
}
