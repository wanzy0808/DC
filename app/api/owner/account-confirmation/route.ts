import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  if (!token) return NextResponse.json({ error: "Token konfirmasi tidak ditemukan." }, { status: 400 });
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const action = await prisma.accountActionToken.findUnique({ where: { tokenHash } });
  if (!action || action.expiresAt < new Date() || action.action !== "PASSWORD_CHANGE") return NextResponse.json({ error: "Link konfirmasi tidak valid atau sudah kedaluwarsa." }, { status: 400 });
  const payload = action.payload as { passwordHash?: string };
  if (!payload.passwordHash) return NextResponse.json({ error: "Data perubahan tidak valid." }, { status: 400 });
  await prisma.$transaction([
    prisma.user.update({ where: { id: action.userId }, data: { passwordHash: payload.passwordHash } }),
    prisma.accountActionToken.delete({ where: { id: action.id } }),
  ]);
  return NextResponse.json({ ok: true, message: "Password akun berhasil diperbarui." });
}
