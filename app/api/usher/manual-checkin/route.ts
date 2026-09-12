import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPaidGuestbook } from "@/lib/packages/access";

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
    const guestId = String(body.guestId ?? "").trim();
    if (!guestId) return NextResponse.json({ error: "Tamu belum dipilih." }, { status: 400 });

    const checkedInAt = new Date();
    const result = await prisma.guest.updateMany({
      where: { id: guestId, invitationId: invitation.id, checkedIn: false },
      data: { checkedIn: true, checkedInAt, checkedInById: user.id },
    });

    if (result.count === 0) {
      const current = await prisma.guest.findFirst({ where: { id: guestId, invitationId: invitation.id } });
      if (!current) return NextResponse.json({ error: "Tamu tidak terdaftar pada undangan ini." }, { status: 404 });
      return NextResponse.json({ error: `${current.name} sudah check-in sebelumnya.`, guest: current }, { status: 409 });
    }

    const guest = await prisma.guest.findUnique({ where: { id: guestId } });
    return NextResponse.json({ guest, checkedInAt: guest?.checkedInAt });
  } catch (error) {
    console.error("POST /api/usher/manual-checkin failed", error);
    return NextResponse.json({ error: "Check-in manual gagal diproses." }, { status: 500 });
  }
}
