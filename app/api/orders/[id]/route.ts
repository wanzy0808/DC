import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isTrustedMutationOrigin } from "@/lib/security/request-origin";

function validProof(value: string) {
  return /^https?:\/\//i.test(value) || /^data:(image\/(png|jpeg|webp)|application\/pdf);base64,/i.test(value);
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });
  const { id } = await params;
  const order = await prisma.paymentOrder.findFirst({ where: { id, userId: user.id }, include: { invitation: { select: { title: true, groomName: true, brideName: true } } } });
  if (!order) return NextResponse.json({ error: "Invoice tidak ditemukan." }, { status: 404 });
  return NextResponse.json({ order });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });
  if (!isTrustedMutationOrigin(request)) return NextResponse.json({ error: "Origin permintaan tidak valid." }, { status: 403 });
  const { id } = await params;
  const order = await prisma.paymentOrder.findFirst({ where: { id, userId: user.id } });
  if (!order) return NextResponse.json({ error: "Invoice tidak ditemukan." }, { status: 404 });
  if (order.status !== "PENDING") return NextResponse.json({ error: "Invoice ini sudah tidak menunggu pembayaran." }, { status: 409 });

  const body = await request.json();
  const action = String(body.action ?? "");

  if (action === "REPORT_PAID") {
    const existing = await prisma.auditLog.findFirst({
      where: { actorId: user.id, action: "PAYMENT_REPORTED", entity: "PaymentOrder", entityId: order.id },
      orderBy: { createdAt: "desc" },
    });
    const report = existing ?? await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: "PAYMENT_REPORTED",
        entity: "PaymentOrder",
        entityId: order.id,
        metadata: { invoiceNumber: order.invoiceNumber, packageKey: order.packageKey },
      },
    });
    const updated = await prisma.paymentOrder.update({ where: { id: order.id }, data: { updatedAt: new Date() } });
    return NextResponse.json({ order: { ...updated, reportedAt: report.createdAt } });
  }

  const proofUrl = String(body.proofUrl ?? "").trim();
  if (!proofUrl || !validProof(proofUrl)) return NextResponse.json({ error: "Upload bukti transfer berupa JPG, PNG, WEBP, PDF, atau masukkan URL file." }, { status: 400 });
  if (proofUrl.startsWith("data:") && proofUrl.length > 4_200_000) return NextResponse.json({ error: "File terlalu besar. Maksimal sekitar 3 MB." }, { status: 400 });

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.paymentOrder.update({
      where: { id },
      data: { proofUrl, note: String(body.note ?? "").trim() || null },
    });
    const report = await tx.auditLog.create({
      data: {
        actorId: user.id,
        action: "PAYMENT_PROOF_SUBMITTED",
        entity: "PaymentOrder",
        entityId: order.id,
        metadata: { invoiceNumber: order.invoiceNumber, packageKey: order.packageKey },
      },
    });
    return { updated, reportedAt: report.createdAt };
  });

  return NextResponse.json({ order: { ...result.updated, reportedAt: result.reportedAt } });
}
