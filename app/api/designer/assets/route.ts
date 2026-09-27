import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isTrustedMutationOrigin } from "@/lib/security/request-origin";

const MAX_DESIGNER_ASSETS = 200;
const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
const allowedImageTypes = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireAssetAuthor() {
  const user = await getCurrentUser();
  return user && ["OWNER", "ADMIN", "DESIGNER", "EDITOR"].includes(user.role) ? user : null;
}

function cleanTitle(name: string) {
  const base = path.basename(name, path.extname(name))
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
  return (base || "Artwork") + ".webp";
}

export async function GET() {
  const author = await requireAssetAuthor();
  if (!author) return NextResponse.json({ error: "Akses Designer Asset diperlukan." }, { status: 403 });

  const assets = await prisma.designerAsset.findMany({
    where: { ownerId: author.id },
    orderBy: { createdAt: "desc" },
    take: MAX_DESIGNER_ASSETS,
    select: { id: true, url: true, title: true, createdAt: true },
  });
  return NextResponse.json(
    { assets, limit: MAX_DESIGNER_ASSETS },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}

export async function POST(request: Request) {
  const author = await requireAssetAuthor();
  if (!author) return NextResponse.json({ error: "Akses Designer Asset diperlukan." }, { status: 403 });
  if (!isTrustedMutationOrigin(request)) return NextResponse.json({ error: "Origin permintaan tidak valid." }, { status: 403 });

  let savedPath: string | null = null;
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Pilih file gambar untuk diunggah." }, { status: 400 });
    }
    if (!allowedImageTypes.has(file.type) || file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "Gunakan JPG, PNG, atau WebP maksimal 15 MB." }, { status: 400 });
    }

    const count = await prisma.designerAsset.count({ where: { ownerId: author.id } });
    if (count >= MAX_DESIGNER_ASSETS) {
      return NextResponse.json({ error: `Maksimal ${MAX_DESIGNER_ASSETS} aset di library Designer.` }, { status: 400 });
    }

    const originalBuffer = Buffer.from(await file.arrayBuffer());
    const outputBuffer = await sharp(originalBuffer, { limitInputPixels: 40_000_000 })
      .rotate()
      .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82, effort: 4 })
      .toBuffer();

    const fileName = `${randomUUID()}.webp`;
    const uploadDirectory = path.join(process.cwd(), "public", "uploads", "designer-assets", author.id);
    savedPath = path.join(uploadDirectory, fileName);
    const url = `/uploads/designer-assets/${author.id}/${fileName}`;

    await mkdir(uploadDirectory, { recursive: true });
    await writeFile(savedPath, outputBuffer);

    try {
      const asset = await prisma.$transaction(async (tx) => {
        // Serialize library writes per owner so simultaneous uploads cannot exceed the quota.
        await tx.$queryRaw`SELECT "id" FROM "User" WHERE "id" = ${author.id} FOR UPDATE`;
        const current = await tx.designerAsset.count({ where: { ownerId: author.id } });
        if (current >= MAX_DESIGNER_ASSETS) throw new Error("ASSET_LIMIT");
        return tx.designerAsset.create({
          data: {
            ownerId: author.id,
            url,
            title: cleanTitle(file.name),
          },
          select: { id: true, url: true, title: true, createdAt: true },
        });
      });
      return NextResponse.json({ asset, optimized: true, bytes: outputBuffer.byteLength }, { status: 201 });
    } catch (error) {
      await unlink(savedPath).catch(() => undefined);
      savedPath = null;
      if (error instanceof Error && error.message === "ASSET_LIMIT") {
        return NextResponse.json({ error: `Maksimal ${MAX_DESIGNER_ASSETS} aset di library Designer.` }, { status: 400 });
      }
      throw error;
    }
  } catch (error) {
    if (savedPath) await unlink(savedPath).catch(() => undefined);
    console.error("POST /api/designer/assets failed", error);
    return NextResponse.json({ error: "Aset Designer belum dapat diunggah." }, { status: 500 });
  }
}
