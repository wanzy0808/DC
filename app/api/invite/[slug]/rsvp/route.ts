import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasPaidDigitalInvitation } from "@/lib/packages/access";
import { createGuestQrToken } from "@/lib/usher-qr";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const invitation = await prisma.invitation.findUnique({ where: { slug }, include: { payment: true } });
    if (!invitation || !invitation.isPublished || !hasPaidDigitalInvitation(invitation.payment)) {
      return NextResponse.json({ error: "Undangan tidak ditemukan." }, { status: 404 });
    }

    const body = await request.json();
    const status = String(body.status ?? "PENDING");
    if (!["ATTENDING", "NOT_ATTENDING", "TENTATIVE"].includes(status)) {
      return NextResponse.json({ error: "Status kehadiran tidak valid." }, { status: 400 });
    }

    const guestId = String(body.guestId ?? "").trim();
    const name = String(body.name ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const plusOnes = Math.min(10, Math.max(0, Number(body.plusOnes ?? 0)));

    let guest;
    if (guestId) {
      guest = await prisma.guest.findFirst({ where: { id: guestId, invitationId: invitation.id } });
      if (!guest) return NextResponse.json({ error: "Tamu tidak ditemukan." }, { status: 404 });
      guest = await prisma.guest.update({
        where: { id: guest.id },
        data: { rsvpStatus: status as "ATTENDING" | "NOT_ATTENDING" | "TENTATIVE", plusOnes },
      });
    } else {
      if (!name || !phone) return NextResponse.json({ error: "Nama dan nomor WhatsApp wajib diisi." }, { status: 400 });
      guest = await prisma.guest.create({
        data: {
          invitationId: invitation.id,
          name,
          phone,
          rsvpStatus: status as "ATTENDING" | "NOT_ATTENDING" | "TENTATIVE",
          plusOnes,
        },
      });
    }

    const qrToken = status === "ATTENDING" ? createGuestQrToken(guest.id) : null;
    return NextResponse.json({ guest, qrToken });
  } catch (error) {
    console.error("POST /api/invite/[slug]/rsvp failed", error);
    return NextResponse.json({ error: "RSVP belum dapat disimpan." }, { status: 500 });
  }
}
