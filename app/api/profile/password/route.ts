import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createSession, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkPublicRateLimit } from "@/lib/security/public-rate-limit";
import { isTrustedMutationOrigin } from "@/lib/security/request-origin";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });
  if (!isTrustedMutationOrigin(request)) return NextResponse.json({ error: "Origin permintaan tidak valid." }, { status: 403 });

  const limit = checkPublicRateLimit("profile-password:" + user.id, 5, 15 * 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak percobaan perubahan password. Coba lagi nanti." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  try {
    const body = await request.json();
    const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword : "";
    const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";
    if (!currentPassword || newPassword.length < 8 || Buffer.byteLength(newPassword, "utf8") > 72) {
      return NextResponse.json({ error: "Isi password saat ini dan password baru 8–72 byte." }, { status: 400 });
    }
    if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
      return NextResponse.json({ error: "Password saat ini salah." }, { status: 403 });
    }
    if (await bcrypt.compare(newPassword, user.passwordHash)) {
      return NextResponse.json({ error: "Password baru harus berbeda." }, { status: 400 });
    }
    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(newPassword, 12) } }),
      prisma.session.deleteMany({ where: { userId: user.id } }),
    ]);
    await createSession(user.id);
    return NextResponse.json({ message: "Password diperbarui." });
  } catch {
    return NextResponse.json({ error: "Password belum dapat diganti." }, { status: 500 });
  }
}
