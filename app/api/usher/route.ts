import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPaidGuestbook } from "@/lib/packages/access";

async function getInvitation(userId: string) {
  return prisma.invitation.findFirst({ where: { ownerId: userId }, include: { payment: true }, orderBy: { createdAt: "asc" } });
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });
    const invitation = await getInvitation(user.id);
    if (!invitation || !hasPaidGuestbook(invitation.payment)) {
      return NextResponse.json({ error: "Usher App membutuhkan paket Guestbook Digital." }, { status: 402 });
    }
    const query = new URL(request.url).searchParams.get("guestId");
    if (!query) return NextResponse.json({ error: "guestId wajib diisi." }, { status: 400 });
    const guest = await prisma.guest.findFirst({ where: { id: query, invitationId: invitation.id }, include: { table: true } });
    if (!guest) return NextResponse.json({ error: "QR/tamu tidak ditemukan." }, { status: 404 });
    return NextResponse.json({ guest });
  } catch (error) {
    console.error("GET /api/usher failed", error);
    return NextResponse.json({ error: "Verifikasi tamu gagal." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });
    const invitation = await getInvitation(user.id);
    if (!invitation || !hasPaidGuestbook(invitation.payment)) {
      return NextResponse.json({ error: "Usher App membutuhkan paket Guestbook Digital." }, { status: 402 });
    }
    const body = await request.json();
    const guestId = String(body.guestId ?? "").trim();
    if (!guestId) return NextResponse.json({ error: "guestId wajib diisi." }, { status: 400 });
    const guest = await prisma.guest.findFirst({ where: { id: guestId, invitationId: invitation.id }, include: { table: true } });
    if (!guest) return NextResponse.json({ error: "QR/tamu tidak valid." }, { status: 404 });
    if (guest.checkedIn) return NextResponse.json({ error: "Tamu sudah check-in.", guest }, { status: 409 });
    const checkedIn = await prisma.guest.update({ where: { id: guest.id }, data: { checkedIn: true }, include: { table: true } });
    return NextResponse.json({ guest: checkedIn });
  } catch (error) {
    console.error("POST /api/usher failed", error);
    return NextResponse.json({ error: "Check-in gagal." }, { status: 500 });
  }
}
