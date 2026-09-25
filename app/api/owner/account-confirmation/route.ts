import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isTrustedMutationOrigin } from "@/lib/security/request-origin";

const NO_STORE = { "Cache-Control": "private, no-store" };

async function getValidAction(token: string) {
  if (!token || token.length > 256) return null;
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const action = await prisma.accountActionToken.findUnique({ where: { tokenHash } });
  if (!action || action.expiresAt < new Date() || action.action !== "PASSWORD_CHANGE") return null;
  const payload = action.payload as { passwordHash?: string };
  if (!payload.passwordHash) return null;
  return { action, passwordHash: payload.passwordHash };
}

export async function GET(request: Request) {
  const owner = await getCurrentUser();
  if (!owner || owner.role !== "OWNER") {
    return NextResponse.json({ error: "Akses Owner diperlukan." }, { status: 403, headers: NO_STORE });
  }

  const token = new URL(request.url).searchParams.get("token") ?? "";
  const pending = await getValidAction(token);
  if (!pending) {
    return NextResponse.json(
      { valid: false, error: "Link konfirmasi tidak valid atau sudah kedaluwarsa." },
      { status: 400, headers: NO_STORE },
    );
  }

  return NextResponse.json({ valid: true }, { headers: NO_STORE });
}

export async function POST(request: Request) {
  const owner = await getCurrentUser();
  if (!owner || owner.role !== "OWNER") {
    return NextResponse.json({ error: "Akses Owner diperlukan." }, { status: 403, headers: NO_STORE });
  }
  if (!isTrustedMutationOrigin(request)) {
    return NextResponse.json({ error: "Origin permintaan tidak valid." }, { status: 403, headers: NO_STORE });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Format permintaan tidak valid." }, { status: 400, headers: NO_STORE });
  }
  const token =
    body && typeof body === "object" && !Array.isArray(body)
      ? String((body as Record<string, unknown>).token ?? "")
      : "";
  const pending = await getValidAction(token);
  if (!pending) {
    return NextResponse.json(
      { error: "Link konfirmasi tidak valid atau sudah kedaluwarsa." },
      { status: 400, headers: NO_STORE },
    );
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: pending.action.userId },
      data: { passwordHash: pending.passwordHash },
    }),
    prisma.session.deleteMany({ where: { userId: pending.action.userId } }),
    prisma.accountActionToken.deleteMany({
      where: { userId: pending.action.userId, action: "PASSWORD_CHANGE" },
    }),
    prisma.auditLog.create({
      data: {
        actorId: owner.id,
        action: "ACCOUNT_PASSWORD_CHANGE_CONFIRMED",
        entity: "User",
        entityId: pending.action.userId,
      },
    }),
  ]);

  return NextResponse.json(
    { ok: true, message: "Password akun berhasil diperbarui. Semua sesi lama telah dikeluarkan." },
    { headers: NO_STORE },
  );
}
