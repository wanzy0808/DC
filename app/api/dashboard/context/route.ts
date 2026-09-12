import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPackageEntitlements } from "@/lib/packages/access";

const nicknameCookie = "dc_dashboard_nickname";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });

  const [invitation, invitations, guestCount, rsvpCount] = await Promise.all([
    prisma.invitation.findFirst({
      where: { ownerId: user.id },
      include: { payment: true },
      orderBy: { createdAt: "asc" },
    }),
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
  const entitlements = getPackageEntitlements(invitation?.payment);
  const invitationsCreated = invitations.filter(item => item.templateKey.trim().length > 0).length;

  return NextResponse.json({
    profile: {
      displayName: nickname,
      email: user.email,
    },
    wedding: invitation
      ? {
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
        }
      : null,
    package: invitation?.payment
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
      invitationsShared: invitation?.viewCount ?? 0,
      invitationPublished: Boolean(invitation?.isPublished),
    },
  });
}
