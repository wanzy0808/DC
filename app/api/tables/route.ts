import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPaidDigitalInvitation } from "@/lib/packages/access";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });
  const invitation = await prisma.invitation.findFirst({ where: { ownerId: user.id }, include: { payment: true } });
  if (!invitation || !hasPaidDigitalInvitation(invitation.payment)) return NextResponse.json({ error: "Table arrangement membutuhkan paket Digital Invitation." }, { status: 402 });
  const body = await request.json();
  const name = String(body.name ?? "").trim();
  const capacity = Number(body.capacity ?? 8);
  if (!name || !Number.isInteger(capacity) || capacity < 1) return NextResponse.json({ error: "Nama dan kapasitas meja wajib valid." }, { status: 400 });
  const table = await prisma.weddingTable.create({ data: { invitationId: invitation.id, name, shape: String(body.shape ?? "ROUND"), capacity } });
  return NextResponse.json({ table }, { status: 201 });
}
