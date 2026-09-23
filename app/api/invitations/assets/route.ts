import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

/** Binary uploads enforce Sharp conversion and the per-invitation music limits. */
export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });
  return NextResponse.json({ error: "Unggah file melalui Studio. Foto otomatis menjadi WebP; musik maksimal 2 file, masing-masing 3 MB." }, { status: 400 });
}
