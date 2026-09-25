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
    orderBy: { updatedAt: "desc" },
  });

  const orderIds = orders.map((order) => order.id);
  const reportLogs = orderIds.length
    ? await prisma.auditLog.findMany({
        where: {
          entity: "PaymentOrder",
          entityId: { in: orderIds },
          action: { in: ["PAYMENT_REPORTED", "PAYMENT_PROOF_SUBMITTED"] },
        },
        select: { entityId: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      })
    : [];
  const reportedAtByOrder = new Map<string, Date>();
  for (const log of reportLogs) {
    if (log.entityId && !reportedAtByOrder.has(log.entityId)) reportedAtByOrder.set(log.entityId, log.createdAt);
  }

  return NextResponse.json({
    orders: orders.map((order) => ({
      ...order,
      reportedAt: reportedAtByOrder.get(order.id) ?? (order.proofUrl ? order.updatedAt : null),
    })),
  });
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

    const now = new Date();
    const updated = await prisma.$transaction(async (tx) => {
      const paidOrder = await tx.paymentOrder.update({
        where: { id: order.id },
        data: { status: "PAID", paidAt: now, confirmedAt: now, confirmedById: admin.id },
      });

      if (order.packageKey === "WA_BLAST_50") {
        await tx.invitation.update({
          where: { id: order.invitationId },
          data: { waBlastQuota: { increment: 50 } },
        });
        await tx.auditLog.create({
          data: {
            actorId: admin.id,
            action: "WA_BLAST_QUOTA_ADDED",
            entity: "PaymentOrder",
            entityId: order.id,
            metadata: {
              packageKey: order.packageKey,
              amount: order.amount,
              invoiceNumber: order.invoiceNumber,
              invitationId: order.invitationId,
              quotaAdded: 50,
            },
          },
        });
        return paidOrder;
      }

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
          paidAt: now,
          confirmedAt: now,
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
          paidAt: now,
          confirmedAt: now,
          confirmedById: admin.id,
        },
      });
      await tx.auditLog.create({
        data: {
          actorId: admin.id,
          action: "PACKAGE_ACTIVATED",
          entity: "PaymentOrder",
          entityId: order.id,
          metadata: {
            packageKey: order.packageKey,
            amount: order.amount,
            invoiceNumber: order.invoiceNumber,
            invitationId: order.invitationId,
          },
        },
      });
      return paidOrder;
    });

    return NextResponse.json({ order: updated });
  } catch (error) {
    console.error("PATCH /api/admin/payments failed", error);
    return NextResponse.json({ error: "Status pembayaran belum dapat diubah." }, { status: 500 });
  }
}
