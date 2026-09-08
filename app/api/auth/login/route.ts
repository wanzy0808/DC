import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
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
