import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasPaidDigitalInvitation } from "@/lib/packages/access";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const invitation = await prisma.invitation.findUnique({ where: { slug }, include: { payment: true } });
  if (!invitation || !invitation.isPublished || !hasPaidDigitalInvitation(invitation.payment)) return NextResponse.json({ error: "Undangan tidak ditemukan." }, { status: 404 });

  const body = await request.json();
  const status = String(body.status ?? "PENDING");
  if (![
    "ATTENDING",
    "NOT_ATTENDING",
    "TENTATIVE",
  ].includes(status)) return NextResponse.json({ error: "Status kehadiran tidak valid." }, { status: 400 });

  const guestId = String(body.guestId ?? "").trim();
  if (!guestId) return NextResponse.json({ error: "Link RSVP tamu tidak valid." }, { status: 400 });

  const guest = await prisma.guest.findFirst({ where: { id: guestId, invitationId: invitation.id } });
  if (!guest) return NextResponse.json({ error: "Tamu tidak ditemukan." }, { status: 404 });

  const updatedGuest = await prisma.guest.update({
    where: { id: guest.id },
    data: { rsvpStatus: status as "ATTENDING" | "NOT_ATTENDING" | "TENTATIVE", plusOnes: Number(body.plusOnes ?? 0) },
  });
  return NextResponse.json({ guest: updatedGuest });
}