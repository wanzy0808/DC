import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || !["ADMIN", "OWNER", "FINANCE"].includes(user.role)) return null;
  return user;
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Akses admin diperlukan." }, { status: 403 });

  const orders = await prisma.paymentOrder.findMany({
    include: {
      user: { select: { email: true, firstName: true } },
      invitation: { select: { title: true, groomName: true, brideName: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ orders });
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Akses admin diperlukan." }, { status: 403 });

  try {
    const body = await request.json();
    const orderId = String(body.orderId ?? "");
    const action = body.action === "ACTIVATE" ? "ACTIVATE" : "REJECT";
    const order = await prisma.paymentOrder.findUnique({ where: { id: orderId } });
    if (!order) return NextResponse.json({ error: "Order tidak ditemukan." }, { status: 404 });
    if (order.status !== "PENDING") return NextResponse.json({ error: "Order ini sudah diproses." }, { status: 409 });

    if (action === "REJECT") {
      const updated = await prisma.paymentOrder.update({
        where: { id: order.id },
        data: { status: "FAILED", confirmedAt: new Date(), confirmedById: admin.id },
      });
      return NextResponse.json({ order: updated });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const paidOrder = await tx.paymentOrder.update({
        where: { id: order.id },
        data: { status: "PAID", paidAt: new Date(), confirmedAt: new Date(), confirmedById: admin.id },
      });
      await tx.payment.upsert({
        where: { invitationId: order.invitationId },
        update: {
          userId: order.userId,
          packageKey: order.packageKey,
          amount: order.amount,
          status: "PAID",
          provider: "manual",
          proofUrl: order.proofUrl,
          note: order.note,
          paidAt: new Date(),
          confirmedAt: new Date(),
          confirmedById: admin.id,
        },
        create: {
          userId: order.userId,
          invitationId: order.invitationId,
          packageKey: order.packageKey,
          amount: order.amount,
          status: "PAID",
          provider: "manual",
          proofUrl: order.proofUrl,
          note: order.note,
          paidAt: new Date(),
          confirmedAt: new Date(),
          confirmedById: admin.id,
        },
      });
      await tx.auditLog.create({
        data: {
          actorId: admin.id,
          action: "PACKAGE_ACTIVATED",
          entity: "PaymentOrder",
          entityId: order.id,
          metadata: { packageKey: order.packageKey, amount: order.amount, invoiceNumber: order.invoiceNumber },
        },
      });
      return paidOrder;
    });

    return NextResponse.json({ order: updated });
  } catch {
    return NextResponse.json({ error: "Status pembayaran belum dapat diubah." }, { status: 500 });
  }
}
