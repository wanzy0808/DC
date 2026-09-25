import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkPublicRateLimit, getClientIp } from "@/lib/security/public-rate-limit";

const action = "PASSWORD_RESET";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limit = checkPublicRateLimit(`auth:reset-password:ip:${ip}`, 10, 60 * 60_000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Terlalu banyak percobaan. Coba lagi nanti." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
      );
    }

    const body = await request.json();
    const token = String(body.token ?? "");
    const password = String(body.password ?? "");
    if (!token || password.length < 8) {
      return NextResponse.json({ error: "Token dan kata sandi minimal 8 karakter wajib diisi." }, { status: 400 });
    }

    const tokenHash = createHash("sha256").update(token).digest("hex");
    const record = await prisma.accountActionToken.findUnique({ where: { tokenHash } });
    if (!record || record.action !== action || record.expiresAt < new Date()) {
      return NextResponse.json({ error: "Tautan reset tidak valid atau sudah kedaluwarsa." }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash: await bcrypt.hash(password, 12) },
      }),
      prisma.session.deleteMany({ where: { userId: record.userId } }),
      prisma.accountActionToken.deleteMany({ where: { userId: record.userId, action } }),
    ]);

    return NextResponse.json({ message: "Kata sandi berhasil diubah. Silakan masuk kembali." });
  } catch {
    return NextResponse.json({ error: "Kata sandi belum dapat diubah." }, { status: 500 });
  }
}
