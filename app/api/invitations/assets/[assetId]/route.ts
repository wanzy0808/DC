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
  const deleted = await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT "id" FROM "Invitation" WHERE "id" = ${asset.invitationId} FOR UPDATE`;
    const result = await tx.invitationAsset.deleteMany({ where: { id: assetId, ownerId: user.id } });
    if (result.count && asset.type === "AUDIO") {
      await tx.invitation.updateMany({
        where: { id: asset.invitationId, ownerId: user.id, musicUrl: asset.url },
        data: { musicUrl: null },
      });
    }
    return result;
  });
  if (!deleted.count) return NextResponse.json({ error: "Asset tidak ditemukan." }, { status: 404 });
  const imagePrefix = `/uploads/images/${asset.invitationId}/`;
  const isEventOwnedImage = asset.type === "IMAGE"
    && asset.url.startsWith(imagePrefix)
    && /^[0-9a-f-]{36}\.webp$/.test(asset.url.slice(imagePrefix.length));
  // Only remove generated files in the verified event folder; never unlink
  // arbitrary URLs/legacy assets on behalf of an incoming client request.
  if ((asset.type === "AUDIO" && /^\/uploads\/music\/[0-9a-f-]{36}\.(mp3|wav|ogg|aac|m4a|mp4)$/.test(asset.url)) || isEventOwnedImage) {
    await unlink(path.join(process.cwd(), "public", asset.url.slice(1))).catch(() => undefined);
  }
  return NextResponse.json({ ok: true });
}