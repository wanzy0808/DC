import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createGoogleState, getGoogleAuthorizationUrl } from "@/lib/auth/google";

const stateCookie = "google_oauth_state";
const nextCookie = "google_auth_next";

export async function GET(request: Request) {
  try {
    const state = createGoogleState();
    const requestedNext = new URL(request.url).searchParams.get("next") ?? "/dashboard";
    const next = requestedNext.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/dashboard";
    const cookieStore = await cookies();
    cookieStore.set(stateCookie, state, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 10 * 60 });
    cookieStore.set(nextCookie, next, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 10 * 60 });
    return NextResponse.redirect(getGoogleAuthorizationUrl(state));
  } catch (error) {
    console.error("Google OAuth start error", error);
    return NextResponse.redirect(new URL("/login?error=google_config", process.env.APP_URL ?? "http://localhost:3000"));
  }
}
