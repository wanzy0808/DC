import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPaidDigitalInvitation } from "@/lib/packages/access";

async function getInvitation(userId: string) {
  return prisma.invitation.findFirst({ where: { ownerId: userId }, include: { payment: true }, orderBy: { createdAt: "asc" } });
}

function isSeatingEligibleGuest(guest: { source: "RSVP" | "MANUAL"; rsvpStatus: string }) {
  return guest.source === "MANUAL" || guest.rsvpStatus === "ATTENDING";
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });
    const invitation = await getInvitation(user.id);
    if (!invitation || !hasPaidDigitalInvitation(invitation.payment)) return NextResponse.json({ error: "Pengelolaan tempat duduk membutuhkan paket Digital Invitation." }, { status: 402 });

    const { id } = await params;
    const body = await request.json();
    const tableId = body.tableId == null || String(body.tableId).trim() === "" ? null : String(body.tableId).trim();
    const seatNumber = body.seatNumber == null || body.seatNumber === "" ? null : Number(body.seatNumber);

    if (seatNumber !== null && (!Number.isInteger(seatNumber) || seatNumber < 1)) return NextResponse.json({ error: "Nomor kursi tidak valid." }, { status: 400 });
    if (!tableId && seatNumber !== null) return NextResponse.json({ error: "Nomor kursi harus memiliki meja." }, { status: 400 });

    const guest = await prisma.guest.findFirst({ where: { id, invitationId: invitation.id }, select: { id: true, tableId: true, source: true, rsvpStatus: true } });
    if (!guest) return NextResponse.json({ error: "Tamu tidak ditemukan." }, { status: 404 });
    if (!isSeatingEligibleGuest(guest)) return NextResponse.json({ error: "Tamu RSVP yang belum berstatus ATTENDING tidak dapat ditempatkan di denah." }, { status: 409 });

    const updated = await prisma.$transaction(async (tx) => {
      if (!tableId) return tx.guest.update({ where: { id: guest.id }, data: { tableId: null, seatNumber: null }, include: { table: true } });

      const table = await tx.weddingTable.findFirst({ where: { id: tableId, invitationId: invitation.id } });
      if (!table) throw new PlacementError("Meja tidak ditemukan.", 404);
      if (seatNumber !== null && seatNumber > table.capacity) throw new PlacementError(`Nomor kursi melebihi kapasitas meja (${table.capacity}).`, 400);

      const eligibleWhere = { invitationId: invitation.id, tableId, id: { not: guest.id }, OR: [{ source: "MANUAL" as const }, { source: "RSVP" as const, rsvpStatus: "ATTENDING" as const }] };
      const occupied = await tx.guest.count({ where: eligibleWhere });
      if (occupied >= table.capacity && guest.tableId !== tableId) throw new PlacementError("Meja sudah penuh.", 409);

      if (seatNumber !== null) {
        const duplicateSeat = await tx.guest.findFirst({ where: { ...eligibleWhere, seatNumber }, select: { id: true } });
        if (duplicateSeat) throw new PlacementError("Nomor kursi sudah digunakan.", 409);
      }

      return tx.guest.update({ where: { id: guest.id }, data: { tableId, seatNumber }, include: { table: true } });
    });

    return NextResponse.json({ guest: updated });
  } catch (error) {
    if (error instanceof PlacementError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("PATCH /api/guests/[id] failed", error);
    return NextResponse.json({ error: "Penempatan tamu gagal disimpan." }, { status: 500 });
  }
}

class PlacementError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}
