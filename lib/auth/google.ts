import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";

// Stable, non-sensitive codes for the existing login dialog.
export type GoogleOAuthErrorCode = "google_config" | "google_token" | "google_profile" | "google_database";

export class GoogleOAuthError extends Error {
  constructor(public readonly code: GoogleOAuthErrorCode, message: string) {
    super(message);
    this.name = "GoogleOAuthError";
  }
}

export function getGoogleRedirectUri() {
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  return `${appUrl.replace(/\/$/, "")}/api/auth/google/callback`;
}

export function createGoogleState() {
  return randomBytes(32).toString("hex");
}

export function getGoogleAuthorizationUrl(state: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  if (!clientId || !process.env.GOOGLE_CLIENT_SECRET?.trim()) {
    throw new GoogleOAuthError("google_config", "GOOGLE_CLIENT_ID atau GOOGLE_CLIENT_SECRET belum dikonfigurasi.");
  }

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
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    throw new GoogleOAuthError("google_config", "GOOGLE_CLIENT_ID atau GOOGLE_CLIENT_SECRET belum dikonfigurasi.");
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

  if (!tokenResponse.ok) throw new GoogleOAuthError("google_token", `Google token exchange failed (HTTP ${tokenResponse.status}). Check client credentials and exact redirect URI.`);
  const tokens = (await tokenResponse.json()) as { access_token?: string };
  if (!tokens.access_token) throw new GoogleOAuthError("google_token", "Google tidak mengembalikan access token.");

  const profileResponse = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
    cache: "no-store",
  });

  if (!profileResponse.ok) throw new GoogleOAuthError("google_profile", `Google userinfo request failed (HTTP ${profileResponse.status}).`);
  const profile = (await profileResponse.json()) as {
    email?: string;
    email_verified?: boolean;
    given_name?: string;
    family_name?: string;
  };

  const email = profile.email?.trim().toLowerCase();
  if (!email || !profile.email_verified) {
    throw new GoogleOAuthError("google_profile", "Email Google tidak tersedia atau belum terverifikasi.");
  }

  try {
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
  } catch (error) {
    // A database/session failure is distinct from a Google configuration issue.
    console.error("Google account/session creation failed", error);
    throw new GoogleOAuthError("google_database", "Tidak dapat menyimpan akun atau sesi Google.");
  }
}
