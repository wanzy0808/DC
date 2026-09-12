import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPaidDigitalInvitation } from "@/lib/packages/access";
import { createGuestQrToken } from "@/lib/usher-qr";

async function getInvitationForQr(userId: string) {
  const invitation = await prisma.invitation.findFirst({
    where: { ownerId: userId },
    include: { payment: true },
    orderBy: { createdAt: "asc" },
  });
  if (!hasPaidDigitalInvitation(invitation?.payment)) return null;
  return invitation;
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });

    const invitation = await getInvitationForQr(user.id);
    if (!invitation) return NextResponse.json({ error: "QR tamu membutuhkan paket Undangan Digital." }, { status: 402 });

    const body = await request.json();
    const guestId = String(body.guestId ?? "").trim();
    if (!guestId) return NextResponse.json({ error: "Tamu belum dipilih." }, { status: 400 });

    const guest = await prisma.guest.findFirst({
      where: { id: guestId, invitationId: invitation.id },
    });
    if (!guest) return NextResponse.json({ error: "Tamu tidak terdaftar pada undangan ini." }, { status: 404 });

    const token = createGuestQrToken(guest.id);
    return NextResponse.json({
      guest: {
        id: guest.id,
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
