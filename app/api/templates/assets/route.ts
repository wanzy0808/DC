import { readdir } from "node:fs/promises";
import type { Dirent } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PublicAsset = { src: string; name: string; folder: string };
const allowed = /\.(?:png|jpe?g|webp|gif|avif)$/i;
const MAX_ITEMS = 500;
const roots = ["template", "templates"] as const;

/** Only shipped, browser-public derivatives; never expose private template masters. */
export async function GET() {
  let user: Awaited<ReturnType<typeof getCurrentUser>>;
  try {
    user = await getCurrentUser();
  } catch (error) {
    console.error("Studio template asset auth failed", error);
    return NextResponse.json({ error: "Sesi Studio belum dapat diverifikasi." }, { status: 500 });
  }
  if (!user) return NextResponse.json({ error: "Masuk untuk membuka Studio." }, { status: 401 });

  const assets: PublicAsset[] = [];
  const failedRoots: string[] = [];

  async function walk(folder: string, parts: string[], depth: number): Promise<void> {
    if (depth > 4 || assets.length >= MAX_ITEMS) return;
    let entries: Dirent[];
    try {
      entries = await readdir(folder, { withFileTypes: true });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return;
      throw error;
    }

    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name, "id"))) {
      if (assets.length >= MAX_ITEMS || entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) {
        await walk(path.join(folder, entry.name), [...parts, entry.name], depth + 1);
      } else if (entry.isFile() && allowed.test(entry.name)) {
        const segments = [...parts, entry.name];
        assets.push({
          src: "/" + segments.map(encodeURIComponent).join("/"),
          name: entry.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
          folder: parts.join(" / "),
        });
      }
    }
  }

  for (const root of roots) {
    const publicRoot = path.join(process.cwd(), "public", root);
    try {
      const before = assets.length;
      await walk(publicRoot, [root], 0);
      if (assets.length === before) {
        // An empty shipped folder is valid and should not fail Studio.
      }
    } catch (error) {
      failedRoots.push(root);
      console.error(`Studio template asset scan failed for public/${root}`, error);
    }
  }

  if (failedRoots.length === roots.length) {
    return NextResponse.json({ error: "Library aset template belum dapat dimuat." }, { status: 500 });
  }

  return NextResponse.json(
    { assets, limited: assets.length === MAX_ITEMS, partial: failedRoots.length > 0 },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
