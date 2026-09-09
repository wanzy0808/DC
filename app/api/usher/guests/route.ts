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

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });
    const invitation = await getUsherInvitation(user.id);
    if (!invitation) return NextResponse.json({ error: "Usher App belum aktif. Aktifkan paket Guestbook Digital terlebih dahulu." }, { status: 402 });

    const guests = await prisma.guest.findMany({
      where: { invitationId: invitation.id },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ guests });
  } catch (error) {
    console.error("GET /api/usher/guests failed", error);
    return NextResponse.json({ error: "Data usher gagal dimuat." }, { status: 500 });
  }
}
