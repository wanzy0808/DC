import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { audioUploadError, MAX_AUDIO_FILES } from "@/lib/invitations/audio-limits";

class AssetLimitError extends Error {}
const maxImageSize = 15 * 1024 * 1024;
const maxImages = 30;
const allowedImageTypes = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });

  let savedPath: string | null = null;

  try {
    const formData = await request.formData();
    const invitationId = String(formData.get("invitationId") ?? "");
    const type = String(formData.get("type") ?? "").toUpperCase() === "IMAGE" ? "IMAGE" : "AUDIO";
    const file = formData.get("file");

    if (!(file instanceof File) || !invitationId) {
      return NextResponse.json({ error: type === "IMAGE" ? "File gambar dan undangan wajib diisi." : "File musik dan undangan wajib diisi." }, { status: 400 });
    }

    if (type === "IMAGE") {
      if (!allowedImageTypes.has(file.type) || file.size > maxImageSize) {
        return NextResponse.json({ error: "Gunakan JPG, PNG, atau WebP maksimal 15 MB." }, { status: 400 });
      }
    } else {
      const error = audioUploadError(file, 0);
      if (error) return NextResponse.json({ error }, { status: 400 });
    }

    const invitation = await prisma.invitation.findFirst({
      where: { id: invitationId, ownerId: user.id },
      select: { id: true, eventConfigured: true },
    });
    if (!invitation) return NextResponse.json({ error: "Undangan tidak ditemukan." }, { status: 404 });
    if (!invitation.eventConfigured) {
      return NextResponse.json({ error: "Lengkapi acara sebelum mengunggah aset." }, { status: 400 });
    }

    const assetCount = await prisma.invitationAsset.count({ where: { invitationId, type } });
    if (type === "IMAGE" && assetCount >= maxImages) {
      return NextResponse.json({ error: `Maksimal ${maxImages} foto per undangan.` }, { status: 400 });
    }
    if (type === "AUDIO" && assetCount >= MAX_AUDIO_FILES) {
      return NextResponse.json({ error: "Maksimal 2 musik per undangan. Hapus salah satu untuk menggantinya." }, { status: 400 });
    }

    const originalBuffer = Buffer.from(await file.arrayBuffer());
    let outputBuffer: Buffer;
    let fileName: string;
    let uploadDirectory: string;
    let url: string;
    let title = file.name;

    if (type === "IMAGE") {
      // Decode and transcode actual image bytes; never just rename an uploaded file.
      outputBuffer = await sharp(originalBuffer, { limitInputPixels: 40_000_000 })
        .rotate()
        .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 82, effort: 4 })
        .toBuffer();
      fileName = `${randomUUID()}.webp`;
      // Keep new user uploads event-scoped; legacy URLs continue to work.
      uploadDirectory = path.join(process.cwd(), "public", "uploads", "images", invitation.id);
      savedPath = path.join(uploadDirectory, fileName);
      url = `/uploads/images/${invitation.id}/${fileName}`;
      title = path.basename(file.name, path.extname(file.name)) + ".webp";
    } else {
      outputBuffer = originalBuffer;
      const extension = ({ "audio/mpeg": ".mp3", "audio/mp3": ".mp3", "audio/wav": ".wav", "audio/ogg": ".ogg", "audio/aac": ".aac", "audio/mp4": ".m4a", "audio/x-m4a": ".m4a" } as Record<string, string>)[file.type];
      fileName = `${randomUUID()}${extension}`;
      uploadDirectory = path.join(process.cwd(), "public", "uploads", "music");
      savedPath = path.join(process.cwd(), "public", "uploads", "music", fileName);
      url = `/uploads/music/${fileName}`;
    }

    await mkdir(uploadDirectory, { recursive: true });
    await writeFile(savedPath, outputBuffer);

    try {
      const asset = await prisma.$transaction(async (tx) => {
        // Serialize uploads for this invitation, including simultaneous requests.
        await tx.$queryRaw`SELECT "id" FROM "Invitation" WHERE "id" = ${invitationId} FOR UPDATE`;
        const count = await tx.invitationAsset.count({ where: { invitationId, type } });
        const limit = type === "AUDIO" ? MAX_AUDIO_FILES : maxImages;
        if (count >= limit) throw new AssetLimitError(type === "AUDIO"
          ? "Maksimal 2 musik per undangan. Hapus salah satu untuk menggantinya."
          : `Maksimal ${maxImages} foto per undangan.`);
        return tx.invitationAsset.create({ data: { invitationId, ownerId: user.id, type, url, title } });
      });
      return NextResponse.json({ asset, optimized: type === "IMAGE", bytes: outputBuffer.byteLength }, { status: 201 });
    } catch (error) {
      await unlink(savedPath).catch(() => undefined);
      savedPath = null;
      throw error;
    }
  } catch (error) {
    if (savedPath) await unlink(savedPath).catch(() => undefined);
    if (error instanceof AssetLimitError) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ error: "File belum dapat diunggah." }, { status: 500 });
  }
}
