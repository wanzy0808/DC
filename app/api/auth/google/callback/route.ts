import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { completeGoogleSignIn } from "@/lib/google-auth";

const stateCookie = "google_oauth_state";
const nextCookie = "google_auth_next";

function loginUrl(error: string) {
  return new URL(`/login?error=${encodeURIComponent(error)}`, process.env.APP_URL ?? "http://localhost:3000");
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieStore = await cookies();
  const savedState = cookieStore.get(stateCookie)?.value;
  const next = cookieStore.get(nextCookie)?.value ?? "/dashboard";
  cookieStore.delete(stateCookie);
  cookieStore.delete(nextCookie);

  if (!code || !state || !savedState || state !== savedState) return NextResponse.redirect(loginUrl("google_state"));

  try {
    await completeGoogleSignIn(code);
    const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
    return NextResponse.redirect(new URL(safeNext, process.env.APP_URL ?? "http://localhost:3000"));
  } catch (error) {
    console.error("Google OAuth callback error", error);
    return NextResponse.redirect(loginUrl("google_failed"));
  }
}
