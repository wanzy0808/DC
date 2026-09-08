import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Token tidak ditemukan." }, { status: 400 });

  const tokenHash = (await import("node:crypto")).createHash("sha256").update(token).digest("hex");
  const record = await prisma.emailVerificationToken.findUnique({ where: { tokenHash } });
  if (!record || record.expiresAt < new Date()) {
    return NextResponse.json({ error: "Token tidak valid atau sudah kedaluwarsa." }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { emailVerifiedAt: new Date() } }),
    prisma.emailVerificationToken.delete({ where: { id: record.id } }),
  ]);
  return NextResponse.json({ message: "Email berhasil diverifikasi. Silakan login." });
}
