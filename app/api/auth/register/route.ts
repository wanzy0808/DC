import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createToken } from "@/lib/auth";
import { checkPublicRateLimit, getClientIp } from "@/lib/security/public-rate-limit";
import { sendEmail } from "@/lib/notifications/email";

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

    const verifyUrl = `${process.env.APP_URL ?? "http://localhost:3000"}/api/auth/verify-email?token=${token}`;
    const mail = await sendEmail({
      to: email,
      subject: "Verifikasi email — DC Organizer",
      html: `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#21191c;line-height:1.6"><h2>DC Organizer</h2><p>Selamat datang. Verifikasi email untuk mengaktifkan akunmu.</p><p><a href="${verifyUrl}">Verifikasi email</a></p><p>Link berlaku 24 jam dan hanya dapat digunakan sekali.</p></body></html>`,
    });
    if (!mail.sent && process.env.NODE_ENV !== "production") console.info(`[DEV] Verify ${email}: ${verifyUrl}`);
    return NextResponse.json({ message: "Akun dibuat. Cek email untuk verifikasi." }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Tidak dapat membuat akun." }, { status: 500 });
  }
}
