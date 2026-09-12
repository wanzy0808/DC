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

    // Make the state transition atomic so two near-simultaneous scans cannot both succeed.
    const checkedInAt = new Date();
    const result = await prisma.guest.updateMany({
      where: {
        id: guest.id,
        invitationId: invitation.id,
        checkedIn: false,
      },
      data: {
        checkedIn: true,
        checkedInAt,
        checkedInById: user.id,
      },
    });

    if (result.count === 0) {
      const current = await prisma.guest.findUnique({ where: { id: guest.id } });
      return NextResponse.json(
        { error: `${current?.name ?? guest.name} sudah check-in sebelumnya.`, guest: current ?? guest },
        { status: 409 },
      );
    }

    const updated = await prisma.guest.findUnique({ where: { id: guest.id } });
    if (!updated) {
      return NextResponse.json({ error: "Data check-in tidak dapat dimuat ulang." }, { status: 500 });
    }

    return NextResponse.json({ guest: updated, checkedInAt: updated.checkedInAt });
  } catch (error) {
    console.error("POST /api/usher/checkin failed", error);
    return NextResponse.json({ error: "Check-in gagal diproses." }, { status: 500 });
  }
}
