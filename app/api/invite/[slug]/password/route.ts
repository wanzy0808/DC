import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  setInvitationAccessCookie,
  verifyInvitationPassword,
} from "@/lib/invitation-password";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const invitation = await prisma.invitation.findUnique({
      where: { slug },
      select: { id: true, passwordProtected: true, passwordHash: true, isPublished: true },
    });

    if (!invitation || !invitation.isPublished || !invitation.passwordProtected || !invitation.passwordHash) {
      return NextResponse.json({ error: "Perlindungan password tidak aktif." }, { status: 400 });
    }

    const body = await request.json();
    const password = typeof body.password === "string" ? body.password : "";
    if (!password || !(await verifyInvitationPassword(password, invitation.passwordHash))) {
      return NextResponse.json({ error: "Password salah." }, { status: 401 });
    }

    await setInvitationAccessCookie(slug);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/invite/[slug]/password failed", error);
    return NextResponse.json({ error: "Password belum dapat diverifikasi." }, { status: 500 });
  }
}
