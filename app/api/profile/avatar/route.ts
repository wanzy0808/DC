import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
const maxBytes = 5 * 1024 * 1024;
const accepted = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });

  let newPath: string | null = null;
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || !accepted.has(file.type) || file.size < 1 || file.size > maxBytes) {
      return NextResponse.json({ error: "Pilih foto JPG, PNG, atau WebP maksimal 5 MB." }, { status: 400 });
    }

    // Decode bytes with Sharp; uploaded bytes are never served as executable content.
    const optimized = await sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 20_000_000 })
      .rotate()
      .resize(512, 512, { fit: "cover", position: "attention" })
      .webp({ quality: 82 })
      .toBuffer();
    const folder = path.join(process.cwd(), "public", "uploads", "avatars", user.id);
    const name = `${randomUUID()}.webp`;
    newPath = path.join(folder, name);
    const avatarUrl = `/uploads/avatars/${user.id}/${name}`;
    await mkdir(folder, { recursive: true });
    await writeFile(newPath, optimized);
    try {
      await prisma.user.update({ where: { id: user.id }, data: { avatarUrl } });
    } catch (error) {
      await unlink(newPath).catch(() => undefined);
      newPath = null;
      throw error;
    }

    // Delete only a previous avatar path owned by this user.
    const previous = user.avatarUrl;
    const prefix = `/uploads/avatars/${user.id}/`;
    if (previous?.startsWith(prefix) && /^[a-f0-9-]+\.webp$/i.test(previous.slice(prefix.length))) {
      await unlink(path.join(folder, previous.slice(prefix.length))).catch(() => undefined);
    }
    return NextResponse.json({ avatarUrl });
  } catch {
    if (newPath) await unlink(newPath).catch(() => undefined);
    return NextResponse.json({ error: "Foto profil belum dapat diunggah." }, { status: 500 });
  }
}
