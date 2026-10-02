import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { isTrustedMutationOrigin } from "@/lib/security/request-origin";

/** Binary uploads enforce Sharp conversion and the per-invitation music limits. */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });
  if (!isTrustedMutationOrigin(request)) {
    return NextResponse.json({ error: "Origin permintaan tidak valid." }, { status: 403 });
  }
  return NextResponse.json({ error: "Unggah file melalui Studio. Foto otomatis menjadi WebP; musik maksimal 2 file, masing-masing 3 MB." }, { status: 400 });
}
