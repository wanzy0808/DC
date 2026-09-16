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

const guestSelect = {
  id: true,
  invitationId: true,
  tableId: true,
  seatNumber: true,
  name: true,
  phone: true,
  source: true,
  rsvpStatus: true,
  plusOnes: true,
  checkedIn: true,
  checkedInAt: true,
  checkedInById: true,
  waBlastSelected: true,
  waBlastSentAt: true,
  personalToken: true,
  personalPublished: true,
  personalPasswordProtected: true,
  personalViewCount: true,
  createdAt: true,
  updatedAt: true,
  table: true,
} as const;

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });
    const invitation = await getInvitation(user.id);
    if (!invitation) return NextResponse.json({ guests: [], tables: [], canManageGuests: false, canUseRsvp: true });

    if (!hasPaidDigitalInvitation(invitation.payment)) {
      return NextResponse.json({ guests: [], tables: [], canManageGuests: false, canUseRsvp: true });
    }

    const guests = await prisma.guest.findMany({
      where: { invitationId: invitation.id },
      select: guestSelect,
      orderBy: { name: "asc" },
    });
    const tables = await prisma.weddingTable.findMany({
      where: { invitationId: invitation.id },
      include: { _count: { select: { guests: true } } },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ guests, tables, canManageGuests: true, canUseRsvp: true });
  } catch (error) {
    console.error("GET /api/guests failed", error);
    return NextResponse.json({ error: "Data tamu gagal dimuat. Periksa koneksi database." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });
    const invitation = await getInvitation(user.id);
    if (!invitation || !hasPaidDigitalInvitation(invitation.payment)) return NextResponse.json({ error: "Pengelolaan daftar tamu membutuhkan paket Digital Invitation." }, { status: 402 });

    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const tableId = String(body.tableId ?? "").trim() || null;
    const plusOnes = Number(body.plusOnes ?? 0);

    if (!name) return NextResponse.json({ error: "Nama tamu wajib diisi." }, { status: 400 });
    if (!Number.isInteger(plusOnes) || plusOnes < 0) {
      return NextResponse.json({ error: "Jumlah plus one tidak valid." }, { status: 400 });
    }

    if (tableId) {
      const table = await prisma.weddingTable.findFirst({
        where: { id: tableId, invitationId: invitation.id },
        include: { _count: { select: { guests: true } } },
      });
      if (!table) return NextResponse.json({ error: "Meja tidak ditemukan pada undangan ini." }, { status: 404 });
      if (table._count.guests >= table.capacity) {
        return NextResponse.json({ error: "Meja sudah penuh. Pilih meja lain atau simpan tamu tanpa meja." }, { status: 409 });
      }
    }

    const guest = await prisma.guest.create({
      data: {
        invitationId: invitation.id,
        name,
        phone: String(body.phone ?? "").trim() || null,
        tableId,
        plusOnes,
        source: "MANUAL",
      },
      select: guestSelect,
    });
    return NextResponse.json({ guest }, { status: 201 });
  } catch (error) {
    console.error("POST /api/guests failed", error);
    return NextResponse.json({ error: "Tamu gagal ditambahkan." }, { status: 500 });
  }
}