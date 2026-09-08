import { unlink } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_request: Request, { params }: { params: Promise<{ assetId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });

  const { assetId } = await params;
  const asset = await prisma.invitationAsset.findFirst({ where: { id: assetId, ownerId: user.id } });
  if (!asset) return NextResponse.json({ error: "Asset tidak ditemukan." }, { status: 404 });
  const deleted = await prisma.invitationAsset.deleteMany({ where: { id: assetId, ownerId: user.id } });
  if (!deleted.count) return NextResponse.json({ error: "Asset tidak ditemukan." }, { status: 404 });
  if (asset.url.startsWith("/uploads/music/")) {
    await unlink(path.join(process.cwd(), "public", asset.url.slice(1))).catch(() => undefined);
  }
  return NextResponse.json({ ok: true });
}