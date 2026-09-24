import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasPaidDigitalInvitation } from "@/lib/packages/access";
import { hasInvitationAccess } from "@/lib/invitations/password";
import { parseInvitationSections } from "@/lib/templates/sections";
import { checkPublicRateLimit, getClientIp } from "@/lib/security/public-rate-limit";

const NO_STORE = { "Cache-Control": "private, no-store" };
const NAME_LIMIT = 80;
const MESSAGE_LIMIT = 600;

async function getPublicWishesInvitation(slug: string) {
  if (!slug || slug.length > 200) return null;
  const invitation = await prisma.invitation.findUnique({
    where: { slug },
    select: {
      id: true,
      templateKey: true,
      eventConfigured: true,
      isPublished: true,
      passwordProtected: true,
      payment: { select: { packageKey: true, status: true } },
    },
  });
  if (
    !invitation ||
    !invitation.eventConfigured ||
    !invitation.isPublished ||
    !invitation.templateKey.trim() ||
    !hasPaidDigitalInvitation(invitation.payment) ||
    parseInvitationSections(invitation.templateKey).wishes === false
  ) return null;

  // Use the same signed password-access cookie as the invitation page.
  if (invitation.passwordProtected && !(await hasInvitationAccess(slug))) return null;
  return invitation;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const invitation = await getPublicWishesInvitation(slug);
    if (!invitation) return NextResponse.json({ error: "Undangan tidak ditemukan." }, { status: 404, headers: NO_STORE });

    const wishes = await prisma.guestWish.findMany({
      where: { invitationId: invitation.id },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: 30,
      select: { id: true, authorName: true, message: true, createdAt: true },
    });
    return NextResponse.json({ wishes }, { headers: NO_STORE });
  } catch (error) {
    console.error("GET /api/invite/[slug]/wishes failed", error);
    return NextResponse.json({ error: "Ucapan belum dapat dimuat." }, { status: 500, headers: NO_STORE });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const invitation = await getPublicWishesInvitation(slug);
    if (!invitation) return NextResponse.json({ error: "Undangan tidak ditemukan." }, { status: 404, headers: NO_STORE });

    if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
      return NextResponse.json({ error: "Format ucapan tidak valid." }, { status: 415, headers: NO_STORE });
    }
    const size = Number(request.headers.get("content-length") || 0);
    if (size > 4096) return NextResponse.json({ error: "Ucapan terlalu panjang." }, { status: 413, headers: NO_STORE });

    const limit = checkPublicRateLimit(`wishes:${invitation.id}:${getClientIp(request)}`, 3, 10 * 60_000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Terlalu banyak ucapan dikirim. Silakan coba lagi nanti." },
        { status: 429, headers: { ...NO_STORE, "Retry-After": String(limit.retryAfterSeconds) } },
      );
    }

    const raw = await request.text();
    if (raw.length > 4096) return NextResponse.json({ error: "Ucapan terlalu panjang." }, { status: 413, headers: NO_STORE });
    let body: unknown;
    try { body = JSON.parse(raw); }
    catch { return NextResponse.json({ error: "Format ucapan tidak valid." }, { status: 400, headers: NO_STORE }); }
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Format ucapan tidak valid." }, { status: 400, headers: NO_STORE });
    }

    const { name, message } = body as Record<string, unknown>;
    if (typeof name !== "string" || typeof message !== "string") {
      return NextResponse.json({ error: "Nama dan ucapan wajib diisi." }, { status: 400, headers: NO_STORE });
    }
    const authorName = name.trim();
    const wishMessage = message.trim();
    if (!authorName || authorName.length > NAME_LIMIT || !wishMessage || wishMessage.length > MESSAGE_LIMIT) {
      return NextResponse.json(
        { error: `Nama maksimal ${NAME_LIMIT} karakter dan ucapan maksimal ${MESSAGE_LIMIT} karakter; keduanya wajib diisi.` },
        { status: 400, headers: NO_STORE },
      );
    }

    // This creates a wish, never a canonical Guest or an RSVP response.
    const wish = await prisma.guestWish.create({
      data: { invitationId: invitation.id, authorName, message: wishMessage },
      select: { id: true, authorName: true, message: true, createdAt: true },
    });
    return NextResponse.json({ wish }, { status: 201, headers: NO_STORE });
  } catch (error) {
    console.error("POST /api/invite/[slug]/wishes failed", error);
    return NextResponse.json({ error: "Ucapan belum dapat dikirim." }, { status: 500, headers: NO_STORE });
  }
}
