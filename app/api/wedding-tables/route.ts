import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPaidDigitalInvitation } from "@/lib/packages/access";

async function getInvitation(userId: string) {
  return prisma.invitation.findFirst({
    where: { ownerId: userId, type: "WEDDING" },
    include: { payment: true },
    orderBy: { createdAt: "asc" },
  });
}

async function authorize(userId: string) {
  const invitation = await getInvitation(userId);
  if (!invitation || !hasPaidDigitalInvitation(invitation.payment)) return null;
  return invitation;
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });
    const invitation = await authorize(user.id);
    if (!invitation) return NextResponse.json({ error: "Penempatan Tamu membutuhkan paket Digital Invitation." }, { status: 402 });
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const capacity = Math.max(1, Math.floor(Number(body.capacity ?? 8)));
    const shape = String(body.shape ?? "ROUND").trim() || "ROUND";
    if (!name) return NextResponse.json({ error: "Nama meja wajib diisi." }, { status: 400 });
    if (!Number.isFinite(capacity)) return NextResponse.json({ error: "Kapasitas bangku tidak valid." }, { status: 400 });

    const table = await prisma.weddingTable.create({
      data: { invitationId: invitation.id, name, capacity, shape },
    });
    return NextResponse.json({ table }, { status: 201 });
  } catch (error) {
    console.error("POST /api/wedding-tables failed", error);
    return NextResponse.json({ error: "Meja gagal dibuat." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });
    const invitation = await authorize(user.id);
    if (!invitation) return NextResponse.json({ error: "Penempatan Tamu membutuhkan paket Digital Invitation." }, { status: 402 });
    const body = await request.json();
    const id = String(body.id ?? "").trim();
    if (!id) return NextResponse.json({ error: "ID meja wajib diisi." }, { status: 400 });
    const table = await prisma.weddingTable.updateMany({
      where: { id, invitationId: invitation.id },
      data: {
        ...(body.name !== undefined ? { name: String(body.name).trim() } : {}),
        ...(body.capacity !== undefined ? { capacity: Math.max(1, Math.floor(Number(body.capacity))) } : {}),
        ...(body.shape !== undefined ? { shape: String(body.shape).trim() || "ROUND" } : {}),
      },
    });
    if (!table.count) return NextResponse.json({ error: "Meja tidak ditemukan." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("PATCH /api/wedding-tables failed", error);
    return NextResponse.json({ error: "Meja gagal diperbarui." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });
    const invitation = await authorize(user.id);
    if (!invitation) return NextResponse.json({ error: "Penempatan Tamu membutuhkan paket Digital Invitation." }, { status: 402 });
    const id = String(new URL(request.url).searchParams.get("id") ?? "").trim();
    if (!id) return NextResponse.json({ error: "ID meja wajib diisi." }, { status: 400 });
    const result = await prisma.weddingTable.deleteMany({ where: { id, invitationId: invitation.id } });
    if (!result.count) return NextResponse.json({ error: "Meja tidak ditemukan." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/wedding-tables failed", error);
    return NextResponse.json({ error: "Meja gagal dihapus." }, { status: 500 });
  }
}
