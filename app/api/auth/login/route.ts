import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { checkPublicRateLimit, getClientIp } from "@/lib/security/public-rate-limit";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const ipLimit = checkPublicRateLimit(`auth:login:ip:${ip}`, 10, 15 * 60_000);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: "Terlalu banyak percobaan login. Coba lagi nanti." },
        { status: 429, headers: { "Retry-After": String(ipLimit.retryAfterSeconds) } },
      );
    }

    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!email || !password) {
      return NextResponse.json({ error: "Email dan password wajib diisi." }, { status: 400 });
    }

    const accountLimit = checkPublicRateLimit(
      `auth:login:account:${ip}:${email}`,
      5,
      15 * 60_000,
    );
    if (!accountLimit.allowed) {
      return NextResponse.json(
        { error: "Terlalu banyak percobaan login. Coba lagi nanti." },
        { status: 429, headers: { "Retry-After": String(accountLimit.retryAfterSeconds) } },
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return NextResponse.json({ error: "Email atau password salah." }, { status: 401 });
    }
    if (!user.emailVerifiedAt) {
      return NextResponse.json({ error: "Email belum diverifikasi." }, { status: 403 });
    }
    await createSession(user.id);
    return NextResponse.json({ user: { id: user.id, name: user.firstName, role: user.role } });
  } catch {
    return NextResponse.json({ error: "Server login belum siap. Periksa koneksi database." }, { status: 500 });
  }
}
