import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";

export function getGoogleRedirectUri() {
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  return `${appUrl.replace(/\/$/, "")}/api/auth/google/callback`;
}

export function createGoogleState() {
  return randomBytes(32).toString("hex");
}

export function getGoogleAuthorizationUrl(state: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error("GOOGLE_CLIENT_ID belum dikonfigurasi.");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getGoogleRedirectUri(),
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export async function completeGoogleSignIn(code: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth belum dikonfigurasi di environment.");
  }

  const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: getGoogleRedirectUri(),
      grant_type: "authorization_code",
    }),
    cache: "no-store",
  });

  if (!tokenResponse.ok) throw new Error("Gagal menukar kode Google.");
  const tokens = (await tokenResponse.json()) as { access_token?: string };
  if (!tokens.access_token) throw new Error("Google tidak mengembalikan access token.");

  const profileResponse = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
    cache: "no-store",
  });

  if (!profileResponse.ok) throw new Error("Gagal mengambil profil Google.");
  const profile = (await profileResponse.json()) as {
    email?: string;
    email_verified?: boolean;
    given_name?: string;
    family_name?: string;
  };

  const email = profile.email?.trim().toLowerCase();
  if (!email || !profile.email_verified) {
    throw new Error("Email Google tidak terverifikasi.");
  }

  let user = await prisma.user.findUnique({ where: { email } });
  const firstName = profile.given_name?.trim() || email.split("@")[0];
  const lastName = profile.family_name?.trim() || null;

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        passwordHash: await bcrypt.hash(randomBytes(32).toString("hex"), 12),
        emailVerifiedAt: new Date(),
        role: "USER",
      },
    });
  } else if (!user.emailVerifiedAt) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { emailVerifiedAt: new Date() },
    });
  }

  await createSession(user.id);
  return user;
}
