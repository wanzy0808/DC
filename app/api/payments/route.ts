import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });

  try {
    const body = await request.json();
    const invitation = await prisma.invitation.findFirst({ where: { id: String(body.invitationId), ownerId: user.id } });
    if (!invitation) return NextResponse.json({ error: "Undangan tidak ditemukan." }, { status: 404 });

    const proofUrl = String(body.proofUrl ?? "").trim();
    if (!proofUrl || !/^https?:\/\//i.test(proofUrl)) {
      return NextResponse.json({ error: "Masukkan URL bukti transfer." }, { status: 400 });
    }

    const payment = await prisma.payment.upsert({
      where: { invitationId: invitation.id },
      update: { proofUrl, note: String(body.note ?? "").trim() || null, status: "PENDING", confirmedAt: null, confirmedById: null },
      create: { userId: user.id, invitationId: invitation.id, proofUrl, note: String(body.note ?? "").trim() || null },
    });
    return NextResponse.json({ payment });
  } catch {
    return NextResponse.json({ error: "Bukti transfer belum dapat disimpan." }, { status: 500 });
  }
}