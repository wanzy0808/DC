import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const sessionCookie = process.env.SESSION_COOKIE_NAME ?? "doc_session";
const sessionDays = 30;

function hash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  await prisma.session.create({
    data: {
      userId,
      tokenHash: hash(token),
      expiresAt: new Date(Date.now() + sessionDays * 24 * 60 * 60 * 1000),
    },
  });
  const cookieStore = await cookies();
  cookieStore.set(sessionCookie, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: sessionDays * 24 * 60 * 60,
  });
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookie)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hash(token) },
    include: { user: true },
  });
  if (!session || session.expiresAt < new Date()) return null;
  return session.user;
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookie)?.value;
  if (token) await prisma.session.deleteMany({ where: { tokenHash: hash(token) } });
  cookieStore.delete(sessionCookie);
}

export function createToken() {
  const token = randomBytes(32).toString("hex");
  return { token, tokenHash: hash(token) };
}
