import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPaidDigitalInvitation, hasPaidGuestbook, hasPaidBundle } from "@/lib/packages/access";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });

  const invitation = await prisma.invitation.findFirst({
    where: { ownerId: user.id },
    include: { payment: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    packageKey: invitation?.payment?.status === "PAID" ? invitation.payment.packageKey : null,
    digitalInvitation: hasPaidDigitalInvitation(invitation?.payment),
    guestbook: hasPaidGuestbook(invitation?.payment),
    bundle: hasPaidBundle(invitation?.payment),
    published: Boolean(invitation?.isPublished),
  });
}
