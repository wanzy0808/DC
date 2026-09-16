import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPaidDigitalInvitation } from "@/lib/packages/access";

async function getMainInvitation(userId: string) {
  return prisma.invitation.findFirst({
    where: { ownerId: userId, type: "WEDDING" },
    include: { payment: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });
    const invitation = await getMainInvitation(user.id);
    if (!invitation) return NextResponse.json({ quota: 100, selected: [], selectedCount: 0 });
    if (!hasPaidDigitalInvitation(invitation.payment)) {
      return NextResponse.json({ error: "WA Blast membutuhkan paket Digital Invitation." }, { status: 402 });
    }

    const selected = await prisma.guest.findMany({
      where: { invitationId: invitation.id, waBlastSelected: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        phone: true,
        waBlastSelected: true,
        waBlastSentAt: true,
      },
    });

    return NextResponse.json({
      quota: invitation.waBlastQuota,
      selected,
      selectedCount: selected.length,
      remaining: Math.max(0, invitation.waBlastQuota - selected.length),
    });
  } catch (error) {
    console.error("GET /api/wa-blast failed", error);
    return NextResponse.json({ error: "Data WA Blast gagal dimuat." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });
    const invitation = await getMainInvitation(user.id);
    if (!invitation || !hasPaidDigitalInvitation(invitation.payment)) {
      return NextResponse.json({ error: "WA Blast membutuhkan paket Digital Invitation." }, { status: 402 });
    }

    const body = await request.json();
    const selectedCount = await prisma.guest.count({
      where: { invitationId: invitation.id, waBlastSelected: true },
    });
    if (selectedCount >= invitation.waBlastQuota) {
      return NextResponse.json({ error: "Kuota WA Blast sudah penuh." }, { status: 409 });
    }

    const guestId = String(body.guestId ?? "").trim();
    if (guestId) {
      const guest = await prisma.guest.findFirst({
        where: { id: guestId, invitationId: invitation.id },
      });
      if (!guest) return NextResponse.json({ error: "Tamu tidak ditemukan." }, { status: 404 });
      if (!guest.phone) return NextResponse.json({ error: "Nomor WhatsApp tamu belum tersedia." }, { status: 400 });
      const updated = await prisma.guest.update({
        where: { id: guest.id },
        data: { waBlastSelected: true },
        select: { id: true, name: true, phone: true, waBlastSelected: true, waBlastSentAt: true },
      });
      return NextResponse.json({ guest: updated });
    }

    const name = String(body.name ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    if (!name) return NextResponse.json({ error: "Nama tamu wajib diisi." }, { status: 400 });
    if (!phone) return NextResponse.json({ error: "Nomor WhatsApp wajib diisi." }, { status: 400 });

    const guest = await prisma.guest.create({
      data: {
        invitationId: invitation.id,
        name,
        phone,
        source: "MANUAL",
        waBlastSelected: true,
      },
      select: { id: true, name: true, phone: true, waBlastSelected: true, waBlastSentAt: true },
    });

    return NextResponse.json({ guest }, { status: 201 });
  } catch (error) {
    console.error("POST /api/wa-blast failed", error);
    return NextResponse.json({ error: "Tamu WA Blast belum dapat disimpan." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });
    const invitation = await getMainInvitation(user.id);
    if (!invitation || !hasPaidDigitalInvitation(invitation.payment)) {
      return NextResponse.json({ error: "WA Blast membutuhkan paket Digital Invitation." }, { status: 402 });
    }

    const guestId = new URL(request.url).searchParams.get("guestId")?.trim();
    if (!guestId) return NextResponse.json({ error: "Tamu wajib dipilih." }, { status: 400 });
    const guest = await prisma.guest.findFirst({ where: { id: guestId, invitationId: invitation.id } });
    if (!guest) return NextResponse.json({ error: "Tamu tidak ditemukan." }, { status: 404 });

    await prisma.guest.update({ where: { id: guest.id }, data: { waBlastSelected: false } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/wa-blast failed", error);
    return NextResponse.json({ error: "Tamu belum dapat dihapus dari daftar WA Blast." }, { status: 500 });
  }
}