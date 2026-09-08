import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const maxAudioSize = 10 * 1024 * 1024;
const allowedAudioTypes = new Set(["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/aac", "audio/mp4", "audio/x-m4a"]);

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });

  try {
    const formData = await request.formData();
    const invitationId = String(formData.get("invitationId") ?? "");
    const file = formData.get("file");
    if (!(file instanceof File) || !invitationId) return NextResponse.json({ error: "File musik dan undangan wajib diisi." }, { status: 400 });
    if (!allowedAudioTypes.has(file.type) || file.size > maxAudioSize) {
      return NextResponse.json({ error: "Gunakan audio MP3, WAV, OGG, AAC, atau M4A maksimal 10 MB." }, { status: 400 });
    }

    const invitation = await prisma.invitation.findFirst({ where: { id: invitationId, ownerId: user.id } });
    if (!invitation) return NextResponse.json({ error: "Undangan tidak ditemukan." }, { status: 404 });
    const assetCount = await prisma.invitationAsset.count({ where: { invitationId } });
    if (assetCount >= 30) return NextResponse.json({ error: "Maksimal 30 asset per undangan." }, { status: 400 });

    const extension = path.extname(file.name).toLowerCase() || ".mp3";
    const fileName = `${randomUUID()}${extension}`;
    const uploadDirectory = path.join(process.cwd(), "public", "uploads", "music");
    await mkdir(uploadDirectory, { recursive: true });
    await writeFile(path.join(uploadDirectory, fileName), Buffer.from(await file.arrayBuffer()));

    const asset = await prisma.invitationAsset.create({
      data: { invitationId, ownerId: user.id, type: "AUDIO", url: `/uploads/music/${fileName}`, title: file.name },
    });
    return NextResponse.json({ asset }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "File musik belum dapat diunggah." }, { status: 500 });
  }
}