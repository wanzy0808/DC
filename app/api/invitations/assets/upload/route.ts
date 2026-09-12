import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { getCurrentUser } from "@/lib/auth";
import { hasPaidDigitalInvitation } from "@/lib/packages/access";
import { prisma } from "@/lib/prisma";

const maxAudioSize = 10 * 1024 * 1024;
const maxImageSize = 15 * 1024 * 1024;
const maxImages = 30;
const maxAudio = 1;
const allowedAudioTypes = new Set(["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/aac", "audio/mp4", "audio/x-m4a"]);
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
    } else if (!allowedAudioTypes.has(file.type) || file.size > maxAudioSize) {
      return NextResponse.json({ error: "Gunakan audio MP3, WAV, OGG, AAC, atau M4A maksimal 10 MB." }, { status: 400 });
    }

    const invitation = await prisma.invitation.findFirst({
      where: { id: invitationId, ownerId: user.id },
      include: { payment: true },
    });
    if (!invitation) return NextResponse.json({ error: "Undangan tidak ditemukan." }, { status: 404 });

    if (!hasPaidDigitalInvitation(invitation.payment)) {
      return NextResponse.json({ error: "Custom asset tersedia setelah paket Digital Invitation aktif." }, { status: 402 });
    }

    const assetCount = await prisma.invitationAsset.count({ where: { invitationId, type } });
    if (type === "IMAGE" && assetCount >= maxImages) {
      return NextResponse.json({ error: `Maksimal ${maxImages} foto per undangan.` }, { status: 400 });
    }
    if (type === "AUDIO" && assetCount >= maxAudio) {
      return NextResponse.json({ error: "Maksimal 1 musik custom per undangan." }, { status: 400 });
    }

    const originalBuffer = Buffer.from(await file.arrayBuffer());
    let outputBuffer: Buffer;
    let fileName: string;
    let uploadDirectory: string;
    let url: string;
    let title = file.name;

    if (type === "IMAGE") {
      outputBuffer = await sharp(originalBuffer)
        .rotate()
        .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer();
      fileName = `${randomUUID()}.webp`;
      uploadDirectory = path.join(process.cwd(), "public", "uploads", "images");
      url = `/uploads/images/${fileName}`;
      title = path.basename(file.name, path.extname(file.name)) + ".webp";
    } else {
      outputBuffer = originalBuffer;
      const extension = path.extname(file.name).toLowerCase() || ".mp3";
      fileName = `${randomUUID()}${extension}`;
      uploadDirectory = path.join(process.cwd(), "public", "uploads", "music");
      url = `/uploads/music/${fileName}`;
    }

    await mkdir(uploadDirectory, { recursive: true });
    savedPath = path.join(uploadDirectory, fileName);
    await writeFile(savedPath, outputBuffer);

    try {
      const asset = await prisma.invitationAsset.create({
        data: { invitationId, ownerId: user.id, type, url, title },
      });
      return NextResponse.json({ asset, optimized: type === "IMAGE", bytes: outputBuffer.byteLength }, { status: 201 });
    } catch (error) {
      await unlink(savedPath).catch(() => undefined);
      savedPath = null;
      throw error;
    }
  } catch {
    if (savedPath) await unlink(savedPath).catch(() => undefined);
    return NextResponse.json({ error: "File belum dapat diunggah." }, { status: 500 });
  }
}
