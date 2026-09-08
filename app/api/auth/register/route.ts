import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const firstName = String(body.firstName ?? "").trim();
    const lastName = String(body.lastName ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!firstName || !email || password.length < 8) {
      return NextResponse.json({ error: "Nama, email, dan password minimal 8 karakter wajib diisi." }, { status: 400 });
    }
    if (await prisma.user.findUnique({ where: { email } })) {
      return NextResponse.json({ error: "Email sudah terdaftar." }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName: lastName || null,
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
