import { prisma } from "@/lib/prisma";
import { isLegacyInvitationSlug, slugifyCouple } from "@/lib/invitations/slug";

export type InvitationType = "WEDDING" | "ADAT_AKAD";

export function normalizeType(value: unknown): InvitationType {
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

export async function makeEventSlug(firstName: string, userId: string, sequence: number) {
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

export async function getOrCreateLegacyInvitation(
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

export async function resolveLegacyCoupleSlug(
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

export function studioInvitationId(
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

export async function findOwnedInvitation(userId: string, id: string) {
  return prisma.invitation.findFirst({
    where: { id, ownerId: userId },
    include: { assets: { orderBy: { createdAt: "asc" } }, payment: true },
  });
}

export async function findReusableDraft(userId: string) {
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
