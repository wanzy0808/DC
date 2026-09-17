import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Belum login." }, { status: 401 });
    }

    const { id } = await params;
    const guest = await prisma.guest.findUnique({
      where: { id },
      select: {
        id: true,
        invitation: { select: { ownerId: true } },
      },
    });

    if (!guest || guest.invitation.ownerId !== user.id) {
      return NextResponse.json({ error: "Tamu tidak ditemukan." }, { status: 404 });
    }

    const body = await request.json();
    const category =
      body.category == null || String(body.category).trim() === ""
        ? null
        : String(body.category).trim().slice(0, 80);
    const tags = Array.isArray(body.tags)
      ? [...new Set(body.tags.map((tag: unknown) => String(tag).trim()).filter(Boolean))].slice(0, 20)
      : [];

    const updated = await prisma.guest.update({
      where: { id },
      data: { category, tags },
      select: {
        id: true,
        invitationId: true,
        name: true,
        category: true,
        tags: true,
      },
    });

    return NextResponse.json({ guest: updated });
  } catch (error) {
    console.error("PATCH /api/guests/[id]/labels failed", error);
    return NextResponse.json(
      { error: "Kategori dan label tamu gagal disimpan." },
      { status: 500 },
    );
  }
}
