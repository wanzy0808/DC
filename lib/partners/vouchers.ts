import { prisma } from "@/lib/prisma";
import { normalizeReferralCode } from "@/lib/partners/referral-pricing";
import { randomBytes } from "node:crypto";
import type { Prisma } from "@/generated/prisma/client";

type Metadata = Record<string, unknown>;

function metadata(value: unknown): Metadata {
  return value && typeof value === "object" ? value as Metadata : {};
}

export function normalizeVoucherCode(value: unknown) {
  return normalizeReferralCode(value);
}

export async function createPartnerVoucher(actorId: string, partner: { id: string; email: string }) {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const code = `MITRA-${randomBytes(5).toString("hex").toUpperCase()}`;
    const exists = await prisma.auditLog.findFirst({
      where: { entity: "PartnerVoucher", entityId: code },
      select: { id: true },
    });
    if (exists) continue;
    await prisma.auditLog.create({
      data: {
        actorId,
        action: "PARTNER_VOUCHER_CREATED",
        entity: "PartnerVoucher",
        entityId: code,
        metadata: { partnerId: partner.id, partnerEmail: partner.email },
      },
    });
    return code;
  }
  return null;
}

export async function getSelectedReferralCode(userId: string) {
  const selected = await prisma.auditLog.findFirst({
    where: { entity: "UserReferral", entityId: userId },
    select: { action: true, metadata: true },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });
  if (selected?.action !== "USER_REFERRAL_SELECTED") return "";
  return normalizeVoucherCode(metadata(selected.metadata).code);
}

export async function setSelectedReferralCode(userId: string, code: string) {
  return prisma.auditLog.create({
    data: {
      actorId: userId,
      action: code ? "USER_REFERRAL_SELECTED" : "USER_REFERRAL_CLEARED",
      entity: "UserReferral",
      entityId: userId,
      metadata: code ? { code } : {},
    },
  });
}

export async function getActivePartnerVoucher(rawCode: unknown) {
  const code = normalizeVoucherCode(rawCode);
  if (!code) return null;

  const latest = await prisma.auditLog.findFirst({
    where: { entity: "PartnerVoucher", entityId: code },
    select: { action: true, metadata: true, createdAt: true },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
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
  voucher: { code: string; partner: { id: string; email: string } } | null,
  pricing?: { regularPrice: number; percent: number; discount: number },
  db: Prisma.TransactionClient = prisma,
) {
  return db.auditLog.create({
    data: {
      actorId,
      action: voucher ? "ORDER_PARTNER_ATTRIBUTED" : "ORDER_PARTNER_ATTRIBUTION_CLEARED",
      entity: "PaymentOrder",
      entityId: orderId,
      metadata: voucher ? {
        code: voucher.code,
        partnerId: voucher.partner.id,
        partnerEmail: voucher.partner.email,
        ...(pricing ?? {}),
      } : {},
    },
  });
}

export async function getOrderReferral(orderId: string, db: Prisma.TransactionClient = prisma) {
  const latest = await db.auditLog.findFirst({
    where: {
      entity: "PaymentOrder",
      entityId: orderId,
      action: { in: ["ORDER_PARTNER_ATTRIBUTED", "ORDER_PARTNER_ATTRIBUTION_CLEARED"] },
    },
    select: { action: true, metadata: true },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });
  if (latest?.action !== "ORDER_PARTNER_ATTRIBUTED") return null;
  const data = metadata(latest.metadata);
  return {
    code: String(data.code ?? ""),
    partnerId: String(data.partnerId ?? ""),
    regularPrice: typeof data.regularPrice === "number" ? data.regularPrice : null,
  };
}

export async function getPartnerVoucherCodes(partnerId: string) {
  const logs = await prisma.auditLog.findMany({
    where: {
      entity: "PartnerVoucher",
      action: { in: ["PARTNER_VOUCHER_CREATED", "PARTNER_VOUCHER_DISABLED"] },
    },
    select: { action: true, entityId: true, metadata: true, createdAt: true },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
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
