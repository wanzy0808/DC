import { prisma } from "@/lib/prisma";

export type ManualPackageAccess = {
  digital: boolean;
  guestbook: boolean;
};

function parseAccess(metadata: unknown): ManualPackageAccess {
  if (!metadata || typeof metadata !== "object") return { digital: false, guestbook: false };
  const value = metadata as { digital?: unknown; guestbook?: unknown };
  const guestbook = value.guestbook === true;
  return {
    digital: guestbook || value.digital === true,
    guestbook,
  };
}

export async function getOwnerPackageGrant(userId: string): Promise<ManualPackageAccess> {
  const latest = await prisma.auditLog.findFirst({
    where: {
      action: "OWNER_PACKAGE_ACCESS_UPDATED",
      entity: "User",
      entityId: userId,
    },
    select: { metadata: true },
    orderBy: { createdAt: "desc" },
  });
  return parseAccess(latest?.metadata);
}

export async function setOwnerPackageGrant(
  actorId: string,
  userId: string,
  access: ManualPackageAccess,
) {
  const guestbook = access.guestbook === true;
  const digital = guestbook || access.digital === true;
  return prisma.auditLog.create({
    data: {
      actorId,
      action: "OWNER_PACKAGE_ACCESS_UPDATED",
      entity: "User",
      entityId: userId,
      metadata: { digital, guestbook },
    },
  });
}
