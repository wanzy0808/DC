import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPaidGuestbook } from "@/lib/packages/access";
import { verifyGuestQrToken } from "@/lib/usher/qr";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });

    const body = await request.json();
    const token = String(body.token ?? "").trim();
    const guestId = verifyGuestQrToken(token);
    if (!guestId) {
      return NextResponse.json({ error: "QR tidak valid atau bukan QR resmi undangan ini." }, { status: 400 });
    }

    const guest = await prisma.guest.findFirst({
      where: { id: guestId, invitation: { ownerId: user.id } },
      include: { invitation: { include: { payment: true } } },
    });
    if (!guest) return NextResponse.json({ error: "QR tidak terdaftar pada akun ini." }, { status: 404 });

    const selectedEvent = String(body.invitationId ?? "").trim();
    if (selectedEvent && guest.invitationId !== selectedEvent) {
      return NextResponse.json(
        { error: "QR ini milik acara lain. Ganti acara di Usher App sebelum check-in." },
        { status: 409 },
      );
    }
    if (!hasPaidGuestbook(guest.invitation.payment)) {
      return NextResponse.json({ error: "Usher App belum aktif untuk acara tamu ini." }, { status: 402 });
    }

    const checkedInAt = new Date();
    // Only ONE successful scan may change the canonical Guest record.
    const result = await prisma.guest.updateMany({
      where: { id: guest.id, invitationId: guest.invitationId, checkedIn: false },
      data: { checkedIn: true, checkedInAt, checkedInById: user.id },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: `${guest.name} sudah check-in sebelumnya.` },
        { status: 409 },
      );
    }

    const updated = await prisma.guest.findUnique({
      where: { id: guest.id },
      select: {
        id: true,
        invitationId: true,
        name: true,
        phone: true,
        rsvpStatus: true,
        plusOnes: true,
        checkedIn: true,
        checkedInAt: true,
        updatedAt: true,
      },
    });
    if (!updated) return NextResponse.json({ error: "Data check-in gagal dimuat ulang." }, { status: 500 });
    return NextResponse.json({ guest: updated, checkedInAt: updated.checkedInAt });
  } catch (error) {
    console.error("POST /api/usher/checkin failed", error);
    return NextResponse.json({ error: "Check-in gagal diproses." }, { status: 500 });
  }
}
