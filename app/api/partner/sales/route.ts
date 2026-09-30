import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPartnerVoucherCodes } from "@/lib/partners/vouchers";
import { saleAmounts, summarizePartnerSales } from "@/lib/partners/sales-summary";

function metadata(value: unknown) {
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

export async function GET() {
  const partner = await getCurrentUser();
  if (!partner || partner.role !== "SUPPORT") {
    return NextResponse.json({ error: "Akses Mitra diperlukan." }, { status: 403 });
  }

  const codes = await getPartnerVoucherCodes(partner.id);
  const logs = await prisma.auditLog.findMany({
    where: { action: { in: ["ORDER_PARTNER_ATTRIBUTED", "ORDER_PARTNER_ATTRIBUTION_CLEARED"] }, entity: "PaymentOrder" },
    select: { action: true, entityId: true, metadata: true, createdAt: true },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });

  const latest = new Map<string, { code: string; partnerId: string; regularPrice: unknown }>();
  for (const log of logs) {
    if (!log.entityId || latest.has(log.entityId)) continue;
    const data = metadata(log.metadata);
    const code = String(data.code ?? "");
    const partnerId = String(data.partnerId ?? "");
    latest.set(log.entityId, log.action === "ORDER_PARTNER_ATTRIBUTION_CLEARED"
      ? { code: "", partnerId: "", regularPrice: null }
      : { code, partnerId, regularPrice: data.regularPrice });
  }

  const ids = [...latest.entries()].filter(([, value]) => value.partnerId === partner.id).map(([id]) => id);
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
    ...saleAmounts(order.amount, latest.get(order.id)?.regularPrice),
  }));

  return NextResponse.json({
    partner: { email: partner.email, name: partner.firstName },
    vouchers: codes,
    summary: summarizePartnerSales(sales),
    sales,
  });
}
