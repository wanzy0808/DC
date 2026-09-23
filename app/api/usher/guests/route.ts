import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPaidGuestbook } from "@/lib/packages/access";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });

    const requestedId = new URL(request.url).searchParams.get("invitationId")?.trim() || "";
    const invitations = await prisma.invitation.findMany({
      where: { ownerId: user.id, eventConfigured: true },
      include: { payment: true },
      orderBy: { createdAt: "asc" },
    });
    // Legacy URLs without an ID open the first eligible event. A selected
    // event NEVER falls back to another event's guest list.
    const invitation = requestedId
      ? invitations.find((item) => item.id === requestedId)
      : invitations.find((item) => hasPaidGuestbook(item.payment));
    if (!invitation) {
      return NextResponse.json({ error: "Acara tidak ditemukan pada akun ini." }, { status: 404 });
    }
    if (!hasPaidGuestbook(invitation.payment)) {
      return NextResponse.json({ error: "Usher App belum aktif untuk acara ini." }, { status: 402 });
    }
    const guests = await prisma.guest.findMany({
      where: { invitationId: invitation.id },
      orderBy: { name: "asc" },
      select: {
        id: true,
        invitationId: true,
        name: true,
        phone: true,
        category: true,
        tags: true,
        invitedPax: true,
        rsvpStatus: true,
        plusOnes: true,
        checkedIn: true,
        checkedInAt: true,
        updatedAt: true,
      },
    });
    return NextResponse.json({ guests, invitation: { id: invitation.id, title: invitation.title } });
  } catch (error) {
    console.error("GET /api/usher/guests failed", error);
    return NextResponse.json({ error: "Data usher gagal dimuat." }, { status: 500 });
  }
}
