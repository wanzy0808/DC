import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createToken } from "@/lib/auth";
import { checkPublicRateLimit, getClientIp } from "@/lib/security/public-rate-limit";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limit = checkPublicRateLimit(`auth:register:ip:${ip}`, 5, 60 * 60_000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Terlalu banyak percobaan pendaftaran. Coba lagi nanti." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
      );
    }

    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!email || password.length < 8) {
      return NextResponse.json({ error: "Email dan password minimal 8 karakter wajib diisi." }, { status: 400 });
    }
    if (await prisma.user.findUnique({ where: { email } })) {
      return NextResponse.json({ error: "Email sudah terdaftar." }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        firstName: "",
        lastName: null,
        email,
        passwordHash: await bcrypt.hash(password, 12),
        role: "USER",
      },
    });
    const { token, tokenHash } = createToken();
    await prisma.emailVerificationToken.create({
      data: { userId: user.id, tokenHash, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) },
    });

    console.info(`[DEV] Verify ${email}: ${process.env.APP_URL ?? "http://localhost:3000"}/api/auth/verify-email?token=${token}`);
    return NextResponse.json({ message: "Akun dibuat. Cek email untuk verifikasi." }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Tidak dapat membuat akun." }, { status: 500 });
  }
}
