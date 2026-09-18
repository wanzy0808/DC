import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  setInvitationAccessCookie,
  verifyInvitationPassword,
} from "@/lib/invitations/password";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string; token: string }> },
) {
  try {
    const { slug, token } = await params;
    const invitation = await prisma.invitation.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!invitation) {
      return NextResponse.json(
        { error: "Undangan tidak ditemukan." },
        { status: 404 },
      );
    }

    const guest = await prisma.guest.findFirst({
      where: {
        invitationId: invitation.id,
        personalToken: token,
        personalPublished: true,
      },
      select: {
        personalPasswordProtected: true,
        personalPasswordHash: true,
      },
    });

    if (
      !guest ||
      !guest.personalPasswordProtected ||
      !guest.personalPasswordHash
    ) {
      return NextResponse.json(
        { error: "Perlindungan password tidak aktif." },
        { status: 400 },
      );
    }

    const body = await request.json();
    const password = typeof body.password === "string" ? body.password : "";
    if (
      !password ||
      !(await verifyInvitationPassword(password, guest.personalPasswordHash))
    ) {
      return NextResponse.json({ error: "Password salah." }, { status: 401 });
    }

    const accessKey = `personal-${token}`;
    // Personal invitation is visible at `/p/<token>` on the tenant subdomain.
    // Root path keeps the host-only cookie usable after the proxy rewrite.
    await setInvitationAccessCookie(accessKey, "/");
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST personal invitation password failed", error);
    return NextResponse.json(
      { error: "Password belum dapat diverifikasi." },
      { status: 500 },
    );
  }
}
