import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasAccountGuestbook } from "@/lib/packages/server-access";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });

    const body = await request.json();
    const guestId = String(body.guestId ?? "").trim();
    if (!guestId) return NextResponse.json({ error: "Tamu belum dipilih." }, { status: 400 });

    const current = await prisma.guest.findUnique({
      where: { id: guestId },
      include: { invitation: { include: { payment: true } } },
    });
    if (!current || current.invitation.ownerId !== user.id) {
      return NextResponse.json({ error: "Tamu tidak terdaftar pada acara ini." }, { status: 404 });
    }
    if (!(await hasAccountGuestbook(user.id, current.invitation.payment))) {
      return NextResponse.json({ error: "Usher App belum aktif." }, { status: 402 });
    }
    if (current.checkedIn) {
      return NextResponse.json({ error: `${current.name} sudah check-in sebelumnya.`, guest: current }, { status: 409 });
    }

    const checkedInAt = new Date();
    const result = await prisma.guest.updateMany({
      where: { id: guestId, invitationId: current.invitationId, checkedIn: false },
      data: { checkedIn: true, checkedInAt, checkedInById: user.id },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: `${current.name} sudah check-in sebelumnya.`, guest: current }, { status: 409 });
    }

    const guest = await prisma.guest.findUnique({ where: { id: guestId } });
    return NextResponse.json({ guest, checkedInAt: guest?.checkedInAt });
  } catch (error) {
    console.error("POST /api/usher/manual-checkin failed", error);
    return NextResponse.json({ error: "Check-in manual gagal diproses." }, { status: 500 });
  }
}