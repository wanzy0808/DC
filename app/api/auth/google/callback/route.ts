import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { completeGoogleSignIn } from "@/lib/google-auth";

const stateCookie = "google_oauth_state";

function loginUrl(error: string) {
  return new URL(`/login?error=${encodeURIComponent(error)}`, process.env.APP_URL ?? "http://localhost:3000");
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieStore = await cookies();
  const savedState = cookieStore.get(stateCookie)?.value;
  cookieStore.delete(stateCookie);

  if (!code || !state || !savedState || state !== savedState) {
    return NextResponse.redirect(loginUrl("google_state"));
  }

  try {
    await completeGoogleSignIn(code);
    return NextResponse.redirect(new URL("/dashboard", process.env.APP_URL ?? "http://localhost:3000"));
  } catch (error) {
    console.error("Google OAuth callback error", error);
    return NextResponse.redirect(loginUrl("google_failed"));
  }
}
