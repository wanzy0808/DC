import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasAccountDigitalInvitation } from "@/lib/packages/server-access";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });

    const { id } = await params;
    const sourceOwner = await prisma.guest.findUnique({
      where: { id },
      select: {
        invitation: {
          select: {
            id: true,
            ownerId: true,
            payment: { select: { packageKey: true, status: true } },
          },
        },
      },
    });
    if (!sourceOwner || sourceOwner.invitation.ownerId !== user.id) {
      return NextResponse.json({ error: "Tamu tidak ditemukan." }, { status: 404 });
    }
    if (!(await hasAccountDigitalInvitation(user.id, sourceOwner.invitation.payment))) {
      return NextResponse.json({ error: "Pengelolaan tempat duduk membutuhkan paket Digital Invitation." }, { status: 402 });
    }

    const body = await request.json();
    const targetGuestId = typeof body.targetGuestId === "string" ? body.targetGuestId.trim() : "";
    if (!targetGuestId || targetGuestId === id) {
      return NextResponse.json({ error: "Tamu tujuan tukar posisi tidak valid." }, { status: 400 });
    }

    const invitationId = sourceOwner.invitation.id;
    const result = await prisma.$transaction(async (tx) => {
      const [source, target] = await Promise.all([
        tx.guest.findFirst({
          where: { id, invitationId },
          select: { id: true, name: true, tableId: true, seatNumber: true, source: true, rsvpStatus: true },
        }),
        tx.guest.findFirst({
          where: { id: targetGuestId, invitationId },
          select: { id: true, name: true, tableId: true, seatNumber: true, source: true, rsvpStatus: true },
        }),
      ]);

      if (!source || !target) throw new SwapError("Tamu tidak ditemukan pada acara ini.", 404);
      if (source.source !== "MANUAL" && !(source.source === "RSVP" && source.rsvpStatus === "ATTENDING")) {
        throw new SwapError("Tamu sumber tidak termasuk roster seating.", 409);
      }
      if (target.source !== "MANUAL" && !(target.source === "RSVP" && target.rsvpStatus === "ATTENDING")) {
        throw new SwapError("Tamu tujuan tidak termasuk roster seating.", 409);
      }
      if (!source.tableId || !source.seatNumber || !target.tableId || !target.seatNumber) {
        throw new SwapError("Kedua tamu harus sudah memiliki meja dan kursi untuk ditukar.", 400);
      }

      const sourceTableId = source.tableId;
      const sourceSeatNumber = source.seatNumber;
      const targetTableId = target.tableId;
      const targetSeatNumber = target.seatNumber;

      await tx.guest.updateMany({
        where: { id: { in: [source.id, target.id] }, invitationId },
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