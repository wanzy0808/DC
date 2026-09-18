import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasAccountDigitalInvitation } from "@/lib/packages/server-access";
import { createGuestQrToken } from "@/lib/usher/qr";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });

    const body = await request.json();
    const guestId = String(body.guestId ?? "").trim();
    if (!guestId) return NextResponse.json({ error: "Tamu belum dipilih." }, { status: 400 });

    const guest = await prisma.guest.findUnique({
      where: { id: guestId },
      include: { invitation: { include: { payment: true } } },
    });
    if (!guest || guest.invitation.ownerId !== user.id) {
      return NextResponse.json({ error: "Tamu tidak terdaftar pada acara ini." }, { status: 404 });
    }
    if (!(await hasAccountDigitalInvitation(user.id, guest.invitation.payment))) {
      return NextResponse.json({ error: "QR tamu membutuhkan paket Undangan Digital." }, { status: 402 });
    }

    const token = createGuestQrToken(guest.id);
    return NextResponse.json({
      guest: {
        id: guest.id,
        invitationId: guest.invitationId,
        name: guest.name,
        phone: guest.phone,
        rsvpStatus: guest.rsvpStatus,
        plusOnes: guest.plusOnes,
      },
      token,
    });
  } catch (error) {
    console.error("POST /api/usher/qr failed", error);
    return NextResponse.json({ error: "QR tamu gagal dibuat." }, { status: 500 });
  }
}