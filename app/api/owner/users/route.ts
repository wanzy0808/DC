import { NextResponse } from "next/server";
import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendOwnerAccountActionEmail } from "@/lib/notifications/email";

const roles = ["USER", "DESIGNER", "ADMIN"] as const;

async function requireOwner() {
  const user = await getCurrentUser();
  return user?.role === "OWNER" ? user : null;
}

export async function GET() {
  const owner = await requireOwner();
  if (!owner) return NextResponse.json({ error: "Akses Owner diperlukan." }, { status: 403 });
  const users = await prisma.user.findMany({
    select: { id: true, email: true, firstName: true, lastName: true, role: true, emailVerifiedAt: true, createdAt: true, updatedAt: true, _count: { select: { invitations: true, orders: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ users });
}

export async function POST(request: Request) {
  const owner = await requireOwner();
  if (!owner) return NextResponse.json({ error: "Akses Owner diperlukan." }, { status: 403 });
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const firstName = String(body.firstName ?? "").trim();
    const lastName = String(body.lastName ?? "").trim() || null;
    const role = roles.includes(body.role) ? body.role : "USER";
    const password = String(body.password ?? "");
    if (!email || !firstName || password.length < 8) return NextResponse.json({ error: "Email, nama, dan password minimal 8 karakter wajib diisi." }, { status: 400 });
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return NextResponse.json({ error: "Email sudah terdaftar." }, { status: 409 });
    const user = await prisma.user.create({ data: { email, firstName, lastName, role, passwordHash: await bcrypt.hash(password, 12) }, select: { id: true, email: true, firstName: true, lastName: true, role: true } });
    await prisma.auditLog.create({ data: { actorId: owner.id, action: "ACCOUNT_CREATED", entity: "User", entityId: user.id, metadata: { role, email } } });
    return NextResponse.json({ user }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Akun belum dapat dibuat." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const owner = await requireOwner();
  if (!owner) return NextResponse.json({ error: "Akses Owner diperlukan." }, { status: 403 });
  try {
    const body = await request.json();
    const userId = String(body.userId ?? "");
    const action = String(body.action ?? "PROFILE");
    const target = await prisma.user.findUnique({ where: { id: userId } });
    if (!target) return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });

    if (action === "PASSWORD") {
      const password = String(body.password ?? "");
      if (password.length < 8) return NextResponse.json({ error: "Password minimal 8 karakter." }, { status: 400 });
      const token = randomBytes(32).toString("hex");
      const tokenHash = createHash("sha256").update(token).digest("hex");
      const passwordHash = await bcrypt.hash(password, 12);
      await prisma.accountActionToken.create({ data: { tokenHash, userId: target.id, action: "PASSWORD_CHANGE", payload: { passwordHash }, expiresAt: new Date(Date.now() + 30 * 60 * 1000) } });
      const confirmationEmail = process.env.OWNER_CONFIRMATION_EMAIL ?? owner.email;
      const baseUrl = process.env.APP_URL ?? "http://localhost:3000";
      const confirmationUrl = `${baseUrl}/owner/account-confirmation?token=${encodeURIComponent(token)}`;
      await sendOwnerAccountActionEmail({ to: confirmationEmail, actionLabel: "perubahan password", targetEmail: target.email, confirmationUrl });
      return NextResponse.json({ message: `Konfirmasi perubahan password dikirim ke ${confirmationEmail}.` });
    }

    const firstName = String(body.firstName ?? target.firstName).trim();
    const lastName = String(body.lastName ?? target.lastName ?? "").trim() || null;
    const email = String(body.email ?? target.email).trim().toLowerCase();
    const role = roles.includes(body.role) ? body.role : target.role;
    const updated = await prisma.user.update({ where: { id: target.id }, data: { firstName, lastName, email, role }, select: { id: true, email: true, firstName: true, lastName: true, role: true, emailVerifiedAt: true, createdAt: true } });
    await prisma.auditLog.create({ data: { actorId: owner.id, action: "ACCOUNT_UPDATED", entity: "User", entityId: target.id, metadata: { email, role } } });
    return NextResponse.json({ user: updated });
  } catch {
    return NextResponse.json({ error: "Data akun belum dapat diubah." }, { status: 500 });
  }
}
