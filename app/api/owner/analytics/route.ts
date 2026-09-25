import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Metadata = Record<string, unknown>;

async function requireOwner() {
  const user = await getCurrentUser();
  return user?.role === "OWNER" ? user : null;
}

function metadata(value: unknown): Metadata {
  return value && typeof value === "object" ? value as Metadata : {};
}

async function activePartnerVouchers() {
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
    if (log.entityId && !latest.has(log.entityId)) latest.set(log.entityId, log);
  }

  return [...latest.values()]
    .filter((log) => log.action === "PARTNER_VOUCHER_CREATED" && log.entityId)
    .map((log) => {
      const data = metadata(log.metadata);
      return {
        code: log.entityId as string,
        partnerId: String(data.partnerId ?? ""),
        partnerEmail: String(data.partnerEmail ?? ""),
        createdAt: log.createdAt,
      };
    })
    .filter((item) => item.partnerId);
}

export async function GET() {
  const owner = await requireOwner();
  if (!owner) return NextResponse.json({ error: "Akses Owner diperlukan." }, { status: 403 });

  const [templates, paidOrders, partners, vouchers, attributionLogs] = await Promise.all([
    prisma.designerTemplate.findMany({
      where: { status: "PUBLISHED" },
      select: {
        templateNo: true,
        name: true,
        designerId: true,
        designer: { select: { email: true, firstName: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.paymentOrder.findMany({
      where: {
        status: "PAID",
        packageKey: { in: ["INVITATION_BASIC", "GUESTBOOK_DIGITAL"] },
      },
      select: {
        id: true,
        invitationId: true,
        amount: true,
        paidAt: true,
        createdAt: true,
        invitation: { select: { templateKey: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      where: { role: "SUPPORT" },
      select: { id: true, email: true, firstName: true },
      orderBy: { createdAt: "asc" },
    }),
    activePartnerVouchers(),
    prisma.auditLog.findMany({
      where: { action: "ORDER_PARTNER_ATTRIBUTED", entity: "PaymentOrder" },
      select: { entityId: true, metadata: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const templateByNo = new Map(templates.map((item) => [item.templateNo, item]));
  const templateStats = new Map<string, { invitationIds: Set<string>; orderValue: number; lastSaleAt: Date | null }>();

  for (const order of paidOrders) {
    const match = order.invitation.templateKey.match(/designer:([0-9]+)/);
    if (!match) continue;
    const template = templateByNo.get(match[1]);
    if (!template) continue;
    const stats = templateStats.get(template.templateNo) ?? {
      invitationIds: new Set<string>(),
      orderValue: 0,
      lastSaleAt: null,
    };
    stats.invitationIds.add(order.invitationId);
    stats.orderValue += order.amount;
    const saleAt = order.paidAt ?? order.createdAt;
    if (!stats.lastSaleAt || saleAt > stats.lastSaleAt) stats.lastSaleAt = saleAt;
    templateStats.set(template.templateNo, stats);
  }

  const designerMap = new Map<string, {
    id: string;
    name: string;
    email: string;
    templates: Array<{ templateNo: string; name: string; salesCount: number; orderValue: number }>;
    saleEvents: Set<string>;
    orderValue: number;
  }>();

  for (const template of templates) {
    const stats = templateStats.get(template.templateNo);
    const row = designerMap.get(template.designerId) ?? {
      id: template.designerId,
      name: template.designer.firstName || template.designer.email,
      email: template.designer.email,
      templates: [],
      saleEvents: new Set<string>(),
      orderValue: 0,
    };
    const invitationIds = stats?.invitationIds ?? new Set<string>();
    invitationIds.forEach((id) => row.saleEvents.add(id));
    row.orderValue += stats?.orderValue ?? 0;
    row.templates.push({
      templateNo: template.templateNo,
      name: template.name,
      salesCount: invitationIds.size,
      orderValue: stats?.orderValue ?? 0,
    });
    designerMap.set(template.designerId, row);
  }

  const latestAttribution = new Map<string, { code: string; partnerId: string }>();
  for (const log of attributionLogs) {
    if (!log.entityId || latestAttribution.has(log.entityId)) continue;
    const data = metadata(log.metadata);
    latestAttribution.set(log.entityId, {
      code: String(data.code ?? ""),
      partnerId: String(data.partnerId ?? ""),
    });
  }

  const attributedOrderIds = [...latestAttribution.keys()];
  const attributedOrders = attributedOrderIds.length
    ? await prisma.paymentOrder.findMany({
        where: { id: { in: attributedOrderIds } },
        select: { id: true, status: true, amount: true, paidAt: true, createdAt: true },
      })
    : [];
  const orderById = new Map(attributedOrders.map((order) => [order.id, order]));

  const partnerRows = partners.map((partner) => {
    const partnerVouchers = vouchers.filter((voucher) => voucher.partnerId === partner.id);
    const partnerCodes = new Set(partnerVouchers.map((voucher) => voucher.code));
    const orders = [...latestAttribution.entries()]
      .filter(([, value]) => value.partnerId === partner.id || partnerCodes.has(value.code))
      .map(([orderId, value]) => ({ order: orderById.get(orderId), code: value.code }))
      .filter((item): item is { order: NonNullable<typeof item.order>; code: string } => Boolean(item.order));
    const paid = orders.filter((item) => item.order.status === "PAID");

    return {
      id: partner.id,
      name: partner.firstName || partner.email,
      email: partner.email,
      vouchers: partnerVouchers.map((voucher) => voucher.code),
      attributedOrders: orders.length,
      paidSales: paid.length,
      revenue: paid.reduce((sum, item) => sum + item.order.amount, 0),
    };
  });

  return NextResponse.json({
    designers: [...designerMap.values()].map((designer) => ({
      id: designer.id,
      name: designer.name,
      email: designer.email,
      templateCount: designer.templates.length,
      salesCount: designer.saleEvents.size,
      orderValue: designer.orderValue,
      templates: designer.templates.sort((a, b) => b.salesCount - a.salesCount),
    })),
    partners: partnerRows,
  });
}

export async function POST(request: Request) {
  const owner = await requireOwner();
  if (!owner) return NextResponse.json({ error: "Akses Owner diperlukan." }, { status: 403 });

  try {
    const body = await request.json();
    if (body.action !== "GENERATE_VOUCHER") {
      return NextResponse.json({ error: "Aksi tidak dikenal." }, { status: 400 });
    }

    const partnerId = String(body.partnerId ?? "").trim();
    const partner = await prisma.user.findFirst({
      where: { id: partnerId, role: "SUPPORT" },
      select: { id: true, email: true },
    });
    if (!partner) return NextResponse.json({ error: "Mitra tidak ditemukan." }, { status: 404 });

    let code = "";
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const candidate = `MITRA-${randomBytes(4).toString("hex").toUpperCase()}`;
      const exists = await prisma.auditLog.findFirst({
        where: { entity: "PartnerVoucher", entityId: candidate },
        select: { id: true },
      });
      if (!exists) {
        code = candidate;
        break;
      }
    }
    if (!code) return NextResponse.json({ error: "Kode belum dapat dibuat. Coba lagi." }, { status: 409 });

    await prisma.auditLog.create({
      data: {
        actorId: owner.id,
        action: "PARTNER_VOUCHER_CREATED",
        entity: "PartnerVoucher",
        entityId: code,
        metadata: { partnerId: partner.id, partnerEmail: partner.email },
      },
    });

    return NextResponse.json({ code, partnerId: partner.id }, { status: 201 });
  } catch (error) {
    console.error("POST /api/owner/analytics failed", error);
    return NextResponse.json({ error: "Kode voucher belum dapat dibuat." }, { status: 500 });
  }
}
