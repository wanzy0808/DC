import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { hasPaidDigitalInvitation } from "@/lib/packages/access";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });

    const invitation = await prisma.invitation.findFirst({
      where: { ownerId: user.id },
      include: { payment: true },
      orderBy: { createdAt: "asc" },
    });
    if (!invitation || !hasPaidDigitalInvitation(invitation.payment)) {
      return NextResponse.json({ error: "Pengelolaan tempat duduk membutuhkan paket Digital Invitation." }, { status: 402 });
    }

    const { id } = await params;
    const body = await request.json();
    const targetGuestId = typeof body.targetGuestId === "string" ? body.targetGuestId.trim() : "";
    if (!targetGuestId || targetGuestId === id) {
      return NextResponse.json({ error: "Tamu tujuan tukar posisi tidak valid." }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const [source, target] = await Promise.all([
        tx.guest.findFirst({ where: { id, invitationId: invitation.id }, select: { id: true, name: true, tableId: true, seatNumber: true } }),
        tx.guest.findFirst({ where: { id: targetGuestId, invitationId: invitation.id }, select: { id: true, name: true, tableId: true, seatNumber: true } }),
      ]);

      if (!source || !target) throw new SwapError("Tamu tidak ditemukan.", 404);
      if (!source.tableId || !source.seatNumber || !target.tableId || !target.seatNumber) {
        throw new SwapError("Kedua tamu harus sudah memiliki meja dan kursi untuk ditukar.", 400);
      }

      const sourceTableId = source.tableId;
      const sourceSeatNumber = source.seatNumber;
      const targetTableId = target.tableId;
      const targetSeatNumber = target.seatNumber;

      await tx.guest.updateMany({
        where: { id: { in: [source.id, target.id] }, invitationId: invitation.id },
        data: { tableId: null, seatNumber: null },
      });

      const updatedSource = await tx.guest.update({
        where: { id: source.id },
        data: { tableId: targetTableId, seatNumber: targetSeatNumber },
        include: { table: true },
      });
      const updatedTarget = await tx.guest.update({
        where: { id: target.id },
        data: { tableId: sourceTableId, seatNumber: sourceSeatNumber },
        include: { table: true },
      });

      return { guests: [updatedSource, updatedTarget] };
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof SwapError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("POST /api/guests/[id]/swap failed", error);
    return NextResponse.json({ error: "Tukar posisi tamu gagal disimpan." }, { status: 500 });
  }
}

class SwapError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}
