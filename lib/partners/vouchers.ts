import { prisma } from "@/lib/prisma";

type Metadata = Record<string, unknown>;

function metadata(value: unknown): Metadata {
  return value && typeof value === "object" ? value as Metadata : {};
}

export function normalizeVoucherCode(value: unknown) {
  return String(value ?? "").trim().toUpperCase().replace(/s+/g, "");
}

export async function getActivePartnerVoucher(rawCode: unknown) {
  const code = normalizeVoucherCode(rawCode);
  if (!code) return null;

  const latest = await prisma.auditLog.findFirst({
    where: { entity: "PartnerVoucher", entityId: code },
    select: { action: true, metadata: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  if (!latest || latest.action !== "PARTNER_VOUCHER_CREATED") return null;

  const data = metadata(latest.metadata);
  const partnerId = String(data.partnerId ?? "");
  if (!partnerId) return null;

  const partner = await prisma.user.findFirst({
    where: { id: partnerId, role: "SUPPORT" },
    select: { id: true, email: true, firstName: true },
  });
  if (!partner) return null;

  return { code, partner, createdAt: latest.createdAt };
}

export async function attributeOrderToPartner(
  actorId: string,
  orderId: string,
  voucher: { code: string; partner: { id: string; email: string } },
) {
  return prisma.auditLog.create({
    data: {
      actorId,
      action: "ORDER_PARTNER_ATTRIBUTED",
      entity: "PaymentOrder",
      entityId: orderId,
      metadata: {
        code: voucher.code,
        partnerId: voucher.partner.id,
        partnerEmail: voucher.partner.email,
      },
    },
  });
}

export async function getPartnerVoucherCodes(partnerId: string) {
  const logs = await prisma.auditLog.findMany({
    where: {
      entity: "PartnerVoucher",
      action: { in: ["PARTNER_VOUCHER_CREATED", "PARTNER_VOUCHER_DISABLED"] },
    },
    select: { action: true, entityId: true, metadata: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  const latest = new Map<string, typeof logs[number]>();
  for (const log of logs) {
    if (!log.entityId || latest.has(log.entityId)) continue;
    latest.set(log.entityId, log);
  }

  return [...latest.values()]
    .filter((log) => {
      if (log.action !== "PARTNER_VOUCHER_CREATED" || !log.entityId) return false;
      return String(metadata(log.metadata).partnerId ?? "") === partnerId;
    })
    .map((log) => log.entityId as string);
}
