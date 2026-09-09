import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createGoogleState, getGoogleAuthorizationUrl } from "@/lib/google-auth";

const stateCookie = "google_oauth_state";

export async function GET() {
  try {
    const state = createGoogleState();
    const cookieStore = await cookies();
    cookieStore.set(stateCookie, state, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 10 * 60,
    });

    return NextResponse.redirect(getGoogleAuthorizationUrl(state));
  } catch (error) {
    console.error("Google OAuth start error", error);
    return NextResponse.redirect(new URL("/login?error=google_config", process.env.APP_URL ?? "http://localhost:3000"));
  }
}
