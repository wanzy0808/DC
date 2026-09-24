import { readdir } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PublicAsset = { src: string; name: string; folder: string };
const allowed = /\.(?:png|jpe?g|webp|gif|avif)$/i;
const MAX_ITEMS = 500;

/** Only shipped, browser-public derivatives; never expose private template masters. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Masuk untuk membuka Studio." }, { status: 401 });
  const assets: PublicAsset[] = [];
  for (const root of ["template", "templates"]) {
    const publicRoot = path.join(process.cwd(), "public", root);
    async function walk(folder: string, parts: string[], depth: number): Promise<void> {
      if (depth > 4 || assets.length >= MAX_ITEMS) return;
      let entries;
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
            src: "/" + [root, ...segments].map(encodeURIComponent).join("/"),
            name: entry.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
            folder: parts.join(" / ") || root,
          });
        }
      }
    }
    await walk(publicRoot, [], 0);
  }
  return NextResponse.json({ assets, limited: assets.length === MAX_ITEMS }, { headers: { "Cache-Control": "private, no-store" } });
}
