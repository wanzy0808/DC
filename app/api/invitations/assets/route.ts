import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPaidDigitalInvitation } from "@/lib/packages/access";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });

  try {
    const body = await request.json();
    const invitation = await prisma.invitation.findFirst({
      where: { id: String(body.invitationId), ownerId: user.id },
      include: { payment: true },
    });
    if (!invitation) return NextResponse.json({ error: "Undangan tidak ditemukan." }, { status: 404 });
    if (!hasPaidDigitalInvitation(invitation.payment)) {
      return NextResponse.json({ error: "Upload asset membutuhkan paket Undangan Digital yang aktif." }, { status: 402 });
    }
    const assetCount = await prisma.invitationAsset.count({ where: { invitationId: invitation.id } });
    if (assetCount >= 30) return NextResponse.json({ error: "Maksimal 30 asset per undangan." }, { status: 400 });
    const type = body.type === "AUDIO" ? "AUDIO" : "IMAGE";
    const url = String(body.url ?? "").trim();
    if (!url || !/^https?:\/\//i.test(url)) return NextResponse.json({ error: "Asset harus berupa URL http atau https." }, { status: 400 });
    const asset = await prisma.invitationAsset.create({
      data: { invitationId: invitation.id, ownerId: user.id, type, url, title: String(body.title ?? "").trim() || null },
    });
    return NextResponse.json({ asset }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Asset belum dapat ditambahkan." }, { status: 500 });
  }
}
