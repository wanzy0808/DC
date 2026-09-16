import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPackageEntitlements } from "@/lib/packages/access";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });

  const [firstInvitation, latestPayment, invitations, guestCount, rsvpCount] =
    await Promise.all([
      prisma.invitation.findFirst({
        where: { ownerId: user.id },
        orderBy: { createdAt: "asc" },
      }),
      prisma.payment.findFirst({
        where: { userId: user.id, status: "PAID" },
        orderBy: { paidAt: "desc" },
      }),
      prisma.invitation.findMany({
        where: { ownerId: user.id, eventConfigured: true },
        select: {
          id: true,
          templateKey: true,
          isPublished: true,
          viewCount: true,
          payment: { select: { packageKey: true, status: true } },
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.guest.count({
        where: { invitation: { ownerId: user.id, eventConfigured: true } },
      }),
      prisma.guest.count({
        where: {
          invitation: { ownerId: user.id, eventConfigured: true },
          rsvpStatus: { not: "PENDING" },
        },
      }),
    ]);

  const entitlements = getPackageEntitlements(latestPayment);
  const invitationsCreated = invitations.length;
  const activeInvitations = invitations.filter(
    (item) => item.payment?.status === "PAID" && item.payment.packageKey === "INVITATION_BASIC",
  ).length;
  const invitationsShared = invitations.reduce(
    (sum, item) => sum + (item.viewCount ?? 0),
    0,
  );
  const invitationPublished = invitations.some((item) => item.isPublished);

  return NextResponse.json({
    profile: { displayName: user.firstName, email: user.email },
    wedding: firstInvitation
      ? {
          invitationId: firstInvitation.id,
          groomName: firstInvitation.groomName,
          brideName: firstInvitation.brideName,
          title: firstInvitation.title,
          venue: firstInvitation.venue,
          address: firstInvitation.address,
          mapUrl: firstInvitation.mapUrl,
          timezone: firstInvitation.timezone,
          eventDate: firstInvitation.eventDate,
          ceremonyTime: firstInvitation.ceremonyTime,
          receptionTime: firstInvitation.receptionTime,
          description: firstInvitation.description,
        }
      : {
          invitationId: null,
          groomName: "",
          brideName: "",
          title: "",
          venue: "",
          address: null,
          mapUrl: null,
          timezone: "Asia/Jakarta",
          eventDate: null,
          ceremonyTime: null,
          receptionTime: null,
          description: null,
        },
    package: latestPayment
      ? { key: latestPayment.packageKey, status: latestPayment.status }
      : { key: null, status: "UNPAID" },
    entitlements,
    overview: {
      invitationsCreated,
      invitationsLimit: null,
      unlimitedInvitations: true,
      activeInvitations,
      totalRsvp: rsvpCount,
      totalGuests: guestCount,
      invitationsShared,
      invitationPublished,
    },
  });
}
