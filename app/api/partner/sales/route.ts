import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPartnerVoucherCodes } from "@/lib/partners/vouchers";

function metadata(value: unknown) {
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

export async function GET() {
  const partner = await getCurrentUser();
  if (!partner || partner.role !== "SUPPORT") {
    return NextResponse.json({ error: "Akses Mitra diperlukan." }, { status: 403 });
  }

  const codes = await getPartnerVoucherCodes(partner.id);
  const codeSet = new Set(codes);
  const logs = await prisma.auditLog.findMany({
    where: { action: "ORDER_PARTNER_ATTRIBUTED", entity: "PaymentOrder" },
    select: { entityId: true, metadata: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  const latest = new Map<string, { code: string; partnerId: string }>();
  for (const log of logs) {
    if (!log.entityId || latest.has(log.entityId)) continue;
    const data = metadata(log.metadata);
    const code = String(data.code ?? "");
    const partnerId = String(data.partnerId ?? "");
    if (partnerId === partner.id || codeSet.has(code)) {
      latest.set(log.entityId, { code, partnerId });
    }
  }

  const ids = [...latest.keys()];
  const orders = ids.length
    ? await prisma.paymentOrder.findMany({
        where: { id: { in: ids } },
        select: {
          id: true,
          invoiceNumber: true,
          packageKey: true,
          status: true,
          amount: true,
          createdAt: true,
          paidAt: true,
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const sales = orders.map((order) => ({
    ...order,
    voucherCode: latest.get(order.id)?.code ?? "",
  }));
  const paid = sales.filter((order) => order.status === "PAID");

  return NextResponse.json({
    partner: { email: partner.email, name: partner.firstName },
    vouchers: codes,
    summary: {
      attributedOrders: sales.length,
      paidSales: paid.length,
      pendingSales: sales.filter((order) => order.status === "PENDING").length,
      revenue: paid.reduce((sum, order) => sum + order.amount, 0),
    },
    sales,
  });
}
