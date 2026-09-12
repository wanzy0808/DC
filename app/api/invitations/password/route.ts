import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPaidDigitalInvitation } from "@/lib/packages/access";
import { hashInvitationPassword } from "@/lib/invitation-password";

async function getMainInvitation(userId: string) {
  return prisma.invitation.findFirst({
    where: { ownerId: userId, type: "WEDDING" },
    include: { payment: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });

  const invitation = await getMainInvitation(user.id);
  if (!invitation) return NextResponse.json({ error: "Undangan belum tersedia." }, { status: 404 });
  if (!hasPaidDigitalInvitation(invitation.payment)) {
    return NextResponse.json({ error: "Fitur ini membutuhkan paket Undangan Digital." }, { status: 403 });
  }

  return NextResponse.json({
    passwordProtected: invitation.passwordProtected,
    hasPassword: Boolean(invitation.passwordHash),
  });
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });

  try {
    const body = await request.json();
    const invitation = await getMainInvitation(user.id);
    if (!invitation) return NextResponse.json({ error: "Undangan belum tersedia." }, { status: 404 });
    if (!hasPaidDigitalInvitation(invitation.payment)) {
      return NextResponse.json({ error: "Fitur ini membutuhkan paket Undangan Digital." }, { status: 403 });
    }

    const enabled = Boolean(body.enabled);
    const password = typeof body.password === "string" ? body.password.trim() : "";

    if (enabled && password.length < 6 && !invitation.passwordHash) {
      return NextResponse.json({ error: "Password minimal 6 karakter." }, { status: 400 });
    }

    if (enabled && password && password.length < 6) {
      return NextResponse.json({ error: "Password minimal 6 karakter." }, { status: 400 });
    }

    const passwordHash = enabled
      ? password
        ? await hashInvitationPassword(password)
        : invitation.passwordHash
      : null;

    if (enabled && !passwordHash) {
      return NextResponse.json({ error: "Password wajib diisi." }, { status: 400 });
    }

    const updated = await prisma.invitation.update({
      where: { id: invitation.id },
      data: { passwordProtected: enabled, passwordHash },
    });

    return NextResponse.json({
      passwordProtected: updated.passwordProtected,
      hasPassword: Boolean(updated.passwordHash),
    });
  } catch (error) {
    console.error("PUT /api/invitations/password failed", error);
    return NextResponse.json({ error: "Pengaturan password belum dapat disimpan." }, { status: 500 });
  }
}
