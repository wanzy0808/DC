import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "OWNER")) return null;
  return user;
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: "Akses admin diperlukan." }, { status: 403 });
  const payments = await prisma.payment.findMany({ include: { user: true, invitation: true }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ payments });
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Akses admin diperlukan." }, { status: 403 });

  try {
    const body = await request.json();
    const status = body.status === "PAID" ? "PAID" : "FAILED";
    const payment = await prisma.payment.update({
      where: { id: String(body.paymentId) },
      data: { status, paidAt: status === "PAID" ? new Date() : null, confirmedAt: new Date(), confirmedById: admin.id },
    });
    return NextResponse.json({ payment });
  } catch {
    return NextResponse.json({ error: "Status pembayaran belum dapat diubah." }, { status: 500 });
  }
}