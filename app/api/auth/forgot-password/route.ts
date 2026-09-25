import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createToken } from "@/lib/auth";
import { checkPublicRateLimit, getClientIp } from "@/lib/security/public-rate-limit";

const action = "PASSWORD_RESET";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limit = checkPublicRateLimit(`auth:forgot-password:ip:${ip}`, 5, 60 * 60_000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Terlalu banyak permintaan. Coba lagi nanti." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
      );
    }

    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    if (!email) return NextResponse.json({ error: "Email wajib diisi." }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (user) {
      await prisma.accountActionToken.deleteMany({ where: { userId: user.id, action } });
      const { token, tokenHash } = createToken();
      await prisma.accountActionToken.create({
        data: {
          userId: user.id,
          action,
          tokenHash,
          payload: {},
          expiresAt: new Date(Date.now() + 30 * 60_000),
        },
      });
      const resetUrl = `${process.env.APP_URL ?? "http://localhost:3000"}/reset-password?token=${token}`;
      console.info(`[DEV] Reset password ${email}: ${resetUrl}`);
    }

    // Deliberately identical for known/unknown email to avoid account enumeration.
    return NextResponse.json({ message: "Jika email terdaftar, tautan reset akan dikirim." });
  } catch {
    return NextResponse.json({ error: "Permintaan reset belum dapat diproses." }, { status: 500 });
  }
}
