import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hasPaidDigitalInvitation } from "@/lib/packages/access";
import { hasInvitationAccess } from "@/lib/invitation-password";
import { slugifyEvent } from "@/lib/invitation-slug";
import PublicInvitation, {
  InvitationLockedState,
} from "@/components/PublicInvitation/PublicInvitation";
import FigmaClassicTemplate from "@/components/PublicInvitation/FigmaClassicTemplate";
import InvitationPasswordGate from "@/components/PublicInvitation/InvitationPasswordGate";

export default async function EventInvitationPage({
  params,
}: {
  params: Promise<{ slug: string; eventSlug: string }>;
}) {
  const { slug, eventSlug } = await params;
  const baseInvitation = await prisma.invitation.findUnique({
    where: { slug },
    select: { id: true, ownerId: true },
  });
  if (!baseInvitation) notFound();

  const eventInvitations = await prisma.invitation.findMany({
    where: {
      ownerId: baseInvitation.ownerId,
      eventConfigured: true,
      id: { not: baseInvitation.id },
    },
    include: { payment: true, assets: true },
    orderBy: { createdAt: "asc" },
  });

  const invitation = eventInvitations.find(
    (item) => slugifyEvent(item.title || "event") === eventSlug,
  );

  if (!invitation) notFound();
  if (!invitation.isPublished || !hasPaidDigitalInvitation(invitation.payment)) {
    return <InvitationLockedState />;
  }
  if (
    invitation.passwordProtected &&
    !(await hasInvitationAccess(invitation.slug))
  ) {
    return <InvitationPasswordGate slug={invitation.slug} />;
  }

  await prisma.invitation.update({
    where: { id: invitation.id },
    data: { viewCount: { increment: 1 } },
  });

  const templateKey = invitation.templateKey.split("::")[0];
  if (templateKey === "eternal-blossom") {
    return <FigmaClassicTemplate invitation={invitation} />;
  }

  return <PublicInvitation invitation={invitation} />;
}
