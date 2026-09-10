import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });

  const payments = await prisma.payment.findMany({
    where: { userId: user.id },
    include: {
      invitation: {
        select: {
          title: true,
          groomName: true,
          brideName: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    transactions: payments.map((payment) => ({
      id: payment.id,
      packageKey: payment.packageKey,
      status: payment.status,
      amount: payment.amount,
      provider: payment.provider,
      externalRef: payment.externalRef,
      paidAt: payment.paidAt,
      createdAt: payment.createdAt,
      invitation: payment.invitation,
    })),
  });
}
