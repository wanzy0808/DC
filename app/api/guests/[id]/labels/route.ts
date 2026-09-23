import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parsePersonalGuestFields } from "@/lib/guests/personal-profile";

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
    let profile;
    try {
      profile = parsePersonalGuestFields({ category: body.category ?? "", tags: body.tags ?? [] });
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Kategori dan kelompok tamu tidak valid." },
        { status: 400 },
      );
    }

    const updated = await prisma.guest.update({
      where: { id },
      data: { category: profile.category, tags: profile.tags },
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
