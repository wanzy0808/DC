import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  setInvitationAccessCookie,
  verifyInvitationPassword,
} from "@/lib/invitations/password";
import { checkPublicRateLimit, getClientIp } from "@/lib/security/public-rate-limit";

const NO_STORE = { "Cache-Control": "private, no-store" };
const PASSWORD_ATTEMPTS = 5;
const PASSWORD_WINDOW_MS = 15 * 60_000;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    if (!slug || slug.length > 200) {
      return NextResponse.json({ error: "Undangan tidak ditemukan." }, { status: 404, headers: NO_STORE });
    }

    const limit = checkPublicRateLimit(
      `invite-password:${slug}:${getClientIp(request)}`,
      PASSWORD_ATTEMPTS,
      PASSWORD_WINDOW_MS,
    );
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Terlalu banyak percobaan password. Silakan coba lagi nanti." },
        {
          status: 429,
          headers: {
            ...NO_STORE,
            "Retry-After": String(limit.retryAfterSeconds),
            "X-RateLimit-Limit": String(PASSWORD_ATTEMPTS),
            "X-RateLimit-Remaining": "0",
          },
        },
      );
    }

    const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
    if (!contentType.startsWith("application/json")) {
      return NextResponse.json({ error: "Format permintaan tidak valid." }, { status: 415, headers: NO_STORE });
    }
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > 2048) {
      return NextResponse.json({ error: "Permintaan terlalu besar." }, { status: 413, headers: NO_STORE });
    }

    const invitation = await prisma.invitation.findUnique({
      where: { slug },
      select: {
        id: true,
        passwordProtected: true,
        passwordHash: true,
        isPublished: true,
      },
    });

    if (
      !invitation ||
      !invitation.isPublished ||
      !invitation.passwordProtected ||
      !invitation.passwordHash
    ) {
      return NextResponse.json(
        { error: "Perlindungan password tidak aktif." },
        { status: 400, headers: NO_STORE },
      );
    }

    const raw = await request.text();
    if (raw.length > 2048) {
      return NextResponse.json({ error: "Permintaan terlalu besar." }, { status: 413, headers: NO_STORE });
    }
    let body: unknown;
    try {
      body = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: "Format permintaan tidak valid." }, { status: 400, headers: NO_STORE });
    }

    const password =
      body && typeof body === "object" && !Array.isArray(body) && typeof (body as Record<string, unknown>).password === "string"
        ? (body as Record<string, string>).password
        : "";
    if (!password || password.length > 256 || !(await verifyInvitationPassword(password, invitation.passwordHash))) {
      return NextResponse.json(
        { error: "Password salah." },
        {
          status: 401,
          headers: {
            ...NO_STORE,
            "X-RateLimit-Limit": String(PASSWORD_ATTEMPTS),
            "X-RateLimit-Remaining": String(limit.remaining),
          },
        },
      );
    }

    await setInvitationAccessCookie(slug, "/");
    return NextResponse.json(
      { ok: true },
      {
        headers: {
          ...NO_STORE,
          "X-RateLimit-Limit": String(PASSWORD_ATTEMPTS),
          "X-RateLimit-Remaining": String(limit.remaining),
        },
      },
    );
  } catch (error) {
    console.error("POST /api/invite/[slug]/password failed", error);
    return NextResponse.json(
      { error: "Password belum dapat diverifikasi." },
      { status: 500, headers: NO_STORE },
    );
  }
}
