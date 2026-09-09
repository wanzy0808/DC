import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { cookies } from "next/headers";

const nicknameCookie = "dc_dashboard_nickname";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });
  const value = (await cookies()).get(nicknameCookie)?.value ?? "";
  return NextResponse.json({ nickname: value });
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });
  const body = await request.json();
  const nickname = String(body.nickname ?? "").trim();
  if (!nickname) return NextResponse.json({ error: "Nama panggilan wajib diisi." }, { status: 400 });
  if (nickname.length > 40) return NextResponse.json({ error: "Nama panggilan maksimal 40 karakter." }, { status: 400 });

  const response = NextResponse.json({ nickname });
  response.cookies.set(nicknameCookie, nickname, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}
