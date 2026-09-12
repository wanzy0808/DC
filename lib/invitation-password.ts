import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

const COOKIE_PREFIX = "dc_invite_access_";
const ACCESS_TTL_SECONDS = 60 * 60 * 12;

function getSecret() {
  const secret = process.env.INVITATION_PASSWORD_SECRET || process.env.QR_SIGNING_SECRET;
  if (!secret) throw new Error("Invitation password secret is not configured.");
  return secret;
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("hex");
}

function cookieName(slug: string) {
  return `${COOKIE_PREFIX}${slug}`;
}

export async function hashInvitationPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyInvitationPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function createInvitationAccessToken(slug: string, expiresAt: number) {
  const payload = `${slug}.${expiresAt}`;
  return `${payload}.${sign(payload)}`;
}

function verifyInvitationAccessToken(token: string, slug: string) {
  const [tokenSlug, expiresAtText, signature] = token.split(".");
  if (!tokenSlug || !expiresAtText || !signature || tokenSlug !== slug) return false;
  const expiresAt = Number(expiresAtText);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000)) return false;

  const expected = sign(`${tokenSlug}.${expiresAtText}`);
  const actualBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

export async function hasInvitationAccess(slug: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName(slug))?.value;
  return Boolean(token && verifyInvitationAccessToken(token, slug));
}

export function setInvitationAccessCookie(slug: string) {
  const expiresAt = Math.floor(Date.now() / 1000) + ACCESS_TTL_SECONDS;
  const token = createInvitationAccessToken(slug, expiresAt);
  return cookies().then((cookieStore) => {
    cookieStore.set(cookieName(slug), token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: `/invite/${slug}`,
      maxAge: ACCESS_TTL_SECONDS,
    });
  });
}
