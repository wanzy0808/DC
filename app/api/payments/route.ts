import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isTrustedMutationOrigin } from "@/lib/security/request-origin";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });
  if (!isTrustedMutationOrigin(request)) return NextResponse.json({ error: "Origin permintaan tidak valid." }, { status: 403 });

  try {
    const body = await request.json();
    const invitation = await prisma.invitation.findFirst({ where: { id: String(body.invitationId), ownerId: user.id } });
    if (!invitation) return NextResponse.json({ error: "Undangan tidak ditemukan." }, { status: 404 });

    const proofUrl = String(body.proofUrl ?? "").trim();
    if (!proofUrl || !/^https?:\/\//i.test(proofUrl)) {
      return NextResponse.json({ error: "Masukkan URL bukti transfer." }, { status: 400 });
    }

    // Payment is the server-owned entitlement. Customer proofs belong to an unpaid order.
    const order = await prisma.paymentOrder.findFirst({
      where: { invitationId: invitation.id, userId: user.id, status: "PENDING" },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });
    if (!order) return NextResponse.json({ error: "Buat invoice pembayaran terlebih dahulu." }, { status: 409 });

    const updated = await prisma.$transaction(async (tx) => {
      const pending = await tx.paymentOrder.updateMany({
        where: { id: order.id, userId: user.id, status: "PENDING" },
        data: { proofUrl, note: String(body.note ?? "").trim() || null },
      });
      if (pending.count !== 1) return null;
      await tx.auditLog.create({
        data: {
          actorId: user.id,
          action: "PAYMENT_PROOF_SUBMITTED",
          entity: "PaymentOrder",
          entityId: order.id,
          metadata: { invitationId: invitation.id },
        },
      });
      return tx.paymentOrder.findUniqueOrThrow({ where: { id: order.id } });
    });
    if (!updated) return NextResponse.json({ error: "Invoice ini sudah diproses." }, { status: 409 });
    return NextResponse.json({ order: updated });
  } catch {
    return NextResponse.json({ error: "Bukti transfer belum dapat disimpan." }, { status: 500 });
  }
}