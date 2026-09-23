import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { invitationQrTarget } from "@/lib/invitations/qr";
import { hasPaidDigitalInvitation } from "@/lib/packages/access";

const PRIVATE_HEADERS = { "Cache-Control": "private, no-store" };

/**
 * Generate/download exactly one deterministic QR per owned, paid invitation.
 * It encodes an app-hosted permanent invitation ID redirect, NOT a guest's
 * signed QR ticket. The existing QR image service sees only this public URL.
 */
export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Belum login." }, { status: 401, headers: PRIVATE_HEADERS });
  }

  const url = new URL(request.url);
  const invitationId = url.searchParams.get("invitationId")?.trim() ?? "";
  if (!/^[a-zA-Z0-9_-]{1,128}$/.test(invitationId)) {
    return NextResponse.json({ error: "Undangan belum dipilih." }, { status: 400, headers: PRIVATE_HEADERS });
  }

  try {
    const invitation = await prisma.invitation.findFirst({
      where: { id: invitationId, ownerId: user.id },
      select: { id: true, payment: { select: { packageKey: true, status: true } } },
    });
    if (!invitation) {
      return NextResponse.json({ error: "Undangan tidak ditemukan." }, { status: 404, headers: PRIVATE_HEADERS });
    }
    if (!hasPaidDigitalInvitation(invitation.payment)) {
      return NextResponse.json(
        { error: "QR undangan tersedia setelah pembayaran paket Undangan Digital berhasil." },
        { status: 402, headers: PRIVATE_HEADERS },
      );
    }

    // APP_URL is the canonical, publicly reachable application origin in
    // production. During local development fall back to the current request.
    const appOrigin = process.env.APP_URL?.trim() || url.origin;
    const qrTarget = invitationQrTarget(appOrigin, invitation.id);
    const providerUrl = new URL("https://quickchart.io/qr");
    providerUrl.searchParams.set("text", qrTarget);
    providerUrl.searchParams.set("size", "640");
    providerUrl.searchParams.set("margin", "3");
    const provider = await fetch(providerUrl, {
      cache: "no-store",
      signal: AbortSignal.timeout(12000),
    });
    if (!provider.ok || !provider.headers.get("content-type")?.includes("image/png")) {
      return NextResponse.json(
        { error: "Gambar QR belum dapat dibuat. Coba lagi." },
        { status: 502, headers: PRIVATE_HEADERS },
      );
    }

    const bytes = await provider.arrayBuffer();
    if (!bytes.byteLength || bytes.byteLength > 2_000_000) {
      return NextResponse.json(
        { error: "Gambar QR tidak valid. Coba lagi." },
        { status: 502, headers: PRIVATE_HEADERS },
      );
    }
    const download = url.searchParams.get("download") === "1";
    return new Response(bytes, {
      status: 200,
      headers: {
        ...PRIVATE_HEADERS,
        "Content-Type": "image/png",
        "Content-Disposition": `${download ? "attachment" : "inline"}; filename="dc-organizer-undangan-${invitation.id}-qr.png"`,
        "Content-Length": String(bytes.byteLength),
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("GET /api/invitations/qr failed", error);
    return NextResponse.json(
      { error: "QR belum dapat dibuat. Periksa koneksi dan coba lagi." },
      { status: 503, headers: PRIVATE_HEADERS },
    );
  }
}
