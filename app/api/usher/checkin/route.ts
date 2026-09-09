import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPaidGuestbook } from "@/lib/packages/access";
import { verifyGuestQrToken } from "@/lib/usher-qr";

async function getUsherInvitation(userId: string) {
  const invitation = await prisma.invitation.findFirst({
    where: { ownerId: userId },
    include: { payment: true },
    orderBy: { createdAt: "asc" },
  });
  if (!hasPaidGuestbook(invitation?.payment)) return null;
  return invitation;
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });

    const invitation = await getUsherInvitation(user.id);
    if (!invitation) return NextResponse.json({ error: "Usher App belum aktif." }, { status: 402 });

    const body = await request.json();
    const token = String(body.token ?? "").trim();
    const guestId = verifyGuestQrToken(token);
    if (!guestId) {
      return NextResponse.json({ error: "QR tidak valid atau bukan QR resmi undangan ini." }, { status: 400 });
    }

    const guest = await prisma.guest.findFirst({
      where: { id: guestId, invitationId: invitation.id },
    });
    if (!guest) return NextResponse.json({ error: "QR tidak terdaftar pada undangan ini." }, { status: 404 });
    if (guest.checkedIn) return NextResponse.json({ error: `${guest.name} sudah check-in sebelumnya.`, guest }, { status: 409 });

    const updated = await prisma.guest.update({
      where: { id: guest.id },
      data: { checkedIn: true },
    });

    return NextResponse.json({ guest: updated, checkedInAt: updated.updatedAt });
  } catch (error) {
    console.error("POST /api/usher/checkin failed", error);
    return NextResponse.json({ error: "Check-in gagal diproses." }, { status: 500 });
  }
}
