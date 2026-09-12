import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPaidDigitalInvitation } from "@/lib/packages/access";

async function getInvitation(userId: string) {
  return prisma.invitation.findFirst({ where: { ownerId: userId }, include: { payment: true }, orderBy: { createdAt: "asc" } });
}

async function authorize(userId: string) {
  const invitation = await getInvitation(userId);
  if (!invitation || !hasPaidDigitalInvitation(invitation.payment)) return null;
  return invitation;
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });
    const invitation = await authorize(user.id);
    if (!invitation) return NextResponse.json({ error: "Pengelolaan tamu membutuhkan paket Digital Invitation." }, { status: 402 });
    const body = await request.json();
    const id = String(body.id ?? "").trim();
    if (!id) return NextResponse.json({ error: "ID tamu wajib diisi." }, { status: 400 });
    const data: Record<string, unknown> = {};
    if (body.name !== undefined) data.name = String(body.name).trim();
    if (body.phone !== undefined) data.phone = String(body.phone).trim() || null;
    if (body.tableId !== undefined) data.tableId = String(body.tableId).trim() || null;
    if (body.plusOnes !== undefined) data.plusOnes = Math.max(0, Number(body.plusOnes));
    if (body.rsvpStatus !== undefined) data.rsvpStatus = String(body.rsvpStatus);
    const result = await prisma.guest.updateMany({ where: { id, invitationId: invitation.id }, data });
    if (!result.count) return NextResponse.json({ error: "Tamu tidak ditemukan." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("PATCH /api/guests/manage failed", error);
    return NextResponse.json({ error: "Data tamu gagal diperbarui." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });
    const invitation = await authorize(user.id);
    if (!invitation) return NextResponse.json({ error: "Pengelolaan tamu membutuhkan paket Digital Invitation." }, { status: 402 });
    const id = String(new URL(request.url).searchParams.get("id") ?? "").trim();
    if (!id) return NextResponse.json({ error: "ID tamu wajib diisi." }, { status: 400 });
    const result = await prisma.guest.deleteMany({ where: { id, invitationId: invitation.id } });
    if (!result.count) return NextResponse.json({ error: "Tamu tidak ditemukan." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/guests/manage failed", error);
    return NextResponse.json({ error: "Tamu gagal dihapus." }, { status: 500 });
  }
}
