import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPackageEntitlements } from "@/lib/packages/access";

const nicknameCookie = "dc_dashboard_nickname";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });

  let invitation = await prisma.invitation.findFirst({
    where: { ownerId: user.id, type: "WEDDING" },
    include: { payment: true },
    orderBy: { createdAt: "asc" },
  });

  if (!invitation) {
    invitation = await prisma.invitation.create({
      data: {
        ownerId: user.id,
        slug: `${user.firstName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "wedding"}-moment-${user.id.slice(-6)}`,
        type: "WEDDING",
        templateKey: "",
        title: "Rio & Lyvia",
        groomName: "Rio",
        brideName: "Lyvia",
        venue: "Gedung Pernikahan",
        timezone: "Asia/Jakarta",
        eventDate: new Date("2026-09-26T09:00:00.000Z"),
        description: "Dengan penuh kebahagiaan, kami mengundang Anda untuk hadir di hari istimewa kami.",
      },
      include: { payment: true },
    });
  }

  const [invitations, guestCount, rsvpCount] = await Promise.all([
    prisma.invitation.findMany({
      where: { ownerId: user.id },
      select: { templateKey: true },
    }),
    prisma.guest.count({ where: { invitation: { ownerId: user.id } } }),
    prisma.guest.count({
      where: {
        invitation: { ownerId: user.id },
        rsvpStatus: { not: "PENDING" },
      },
    }),
  ]);

  const nickname = (await cookies()).get(nicknameCookie)?.value?.trim() || user.firstName;
  const entitlements = getPackageEntitlements(invitation.payment);
  const invitationsCreated = invitations.filter(item => item.templateKey.trim().length > 0).length;

  return NextResponse.json({
    profile: {
      displayName: nickname,
      email: user.email,
    },
    wedding: {
      invitationId: invitation.id,
      groomName: invitation.groomName,
      brideName: invitation.brideName,
      title: invitation.title,
      venue: invitation.venue,
      address: invitation.address,
      mapUrl: invitation.mapUrl,
      timezone: invitation.timezone,
      eventDate: invitation.eventDate,
      ceremonyTime: invitation.ceremonyTime,
      receptionTime: invitation.receptionTime,
      description: invitation.description,
    },
    package: invitation.payment
      ? {
          key: invitation.payment.packageKey,
          status: invitation.payment.status,
        }
      : { key: null, status: "UNPAID" },
    entitlements,
    overview: {
      invitationsCreated,
      invitationsLimit: 2,
      totalRsvp: rsvpCount,
      totalGuests: guestCount,
      invitationsShared: invitation.viewCount ?? 0,
      invitationPublished: Boolean(invitation.isPublished),
    },
  });
}
