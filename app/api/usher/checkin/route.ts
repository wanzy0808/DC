import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getUsherInvitation(userId: string) {
  const invitation = await prisma.invitation.findFirst({
    where: { ownerId: userId },
    include: { payment: true },
    orderBy: { createdAt: "asc" },
  });
  if (!invitation?.payment || invitation.payment.status !== "PAID" || invitation.payment.packageKey !== "GUESTBOOK_DIGITAL") return null;
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
    if (!guestId) return NextResponse.json({ error: "QR tamu tidak valid." }, { status: 400 });

    const guest = await prisma.guest.findFirst({ where: { id: guestId, invitationId: invitation.id } });
    if (!guest) return NextResponse.json({ error: "QR tidak terdaftar pada undangan ini." }, { status: 404 });
    if (guest.checkedIn) return NextResponse.json({ error: `${guest.name} sudah check-in sebelumnya.`, guest }, { status: 409 });

    const updated = await prisma.guest.update({ where: { id: guest.id }, data: { checkedIn: true } });
    return NextResponse.json({ guest: updated, checkedInAt: updated.updatedAt });
  } catch (error) {
    console.error("POST /api/usher/checkin failed", error);
    return NextResponse.json({ error: "Check-in gagal diproses." }, { status: 500 });
  }
}
