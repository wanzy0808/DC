import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });

  const orders = await prisma.paymentOrder.findMany({
    where: { userId: user.id },
    include: {
      invitation: { select: { title: true, groomName: true, brideName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    transactions: orders.map((order) => ({
      id: order.id,
      invoiceNumber: order.invoiceNumber,
      packageKey: order.packageKey,
      status: order.status,
      amount: order.amount,
      provider: order.provider,
      proofUrl: order.proofUrl,
      paidAt: order.paidAt,
      createdAt: order.createdAt,
      invitation: order.invitation,
    })),
  });
}
