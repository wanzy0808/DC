import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hasAccountDigitalInvitation } from "@/lib/packages/server-access";
import { hasInvitationAccess } from "@/lib/invitation-password";
import { slugifyEvent } from "@/lib/invitation-slug";
import PublicInvitation, { InvitationLockedState } from "@/components/PublicInvitation/PublicInvitation";
import InvitationPasswordGate from "@/components/PublicInvitation/InvitationPasswordGate";

export default async function EventInvitationPage({
  params,
}: {
  params: Promise<{ slug: string; eventSlug: string }>;
}) {
  const { slug, eventSlug } = await params;
  const mainInvitation = await prisma.invitation.findUnique({
    where: { slug },
    include: { payment: true },
  });
  if (!mainInvitation) notFound();

  const eventInvitations = await prisma.invitation.findMany({
    where: {
      ownerId: mainInvitation.ownerId,
      type: "ADAT_AKAD",
      eventConfigured: true,
    },
    include: { payment: true, assets: true },
    orderBy: { createdAt: "asc" },
    take: 2,
  });

  const invitation = eventInvitations.find(
    (item) => slugifyEvent(item.title || "event") === eventSlug,
  );

  if (!invitation) notFound();
  if (
    !invitation.isPublished ||
    !(await hasAccountDigitalInvitation(mainInvitation.ownerId, mainInvitation.payment))
  ) {
    return <InvitationLockedState />;
  }
  if (mainInvitation.passwordProtected && !(await hasInvitationAccess(slug))) {
    return <InvitationPasswordGate slug={slug} />;
  }

  await prisma.invitation.update({
    where: { id: invitation.id },
    data: { viewCount: { increment: 1 } },
  });

  return <PublicInvitation invitation={invitation} eventKind="special" />;
}