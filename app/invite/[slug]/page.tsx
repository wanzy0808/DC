import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hasWeddingSessions } from "@/lib/events/wedding-sessions";
import { hasPaidDigitalInvitation } from "@/lib/packages/access";
import { hasInvitationAccess } from "@/lib/invitations/password";
import PublicInvitation, {
  InvitationLockedState,
} from "@/components/PublicInvitation/PublicInvitation";
import ClassicInvitationTemplate from "@/components/PublicInvitation/ClassicInvitationTemplate";
import InvitationPasswordGate from "@/components/PublicInvitation/InvitationPasswordGate";

export default async function PublicInvitationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const invitation = await prisma.invitation.findUnique({
    where: { slug },
    include: { payment: true, assets: true },
  });

  if (!invitation) notFound();
  if (
    !invitation.eventConfigured ||
    !invitation.templateKey.trim() ||
    !invitation.isPublished ||
    !hasPaidDigitalInvitation(invitation.payment)
  ) {
    return <InvitationLockedState />;
  }
  if (invitation.eventCategory === "WEDDING" && hasWeddingSessions(invitation)) return <InvitationLockedState />;
  if (invitation.passwordProtected && !(await hasInvitationAccess(slug))) {
    return <InvitationPasswordGate slug={slug} />;
  }

  await prisma.invitation.update({
    where: { id: invitation.id },
    data: { viewCount: { increment: 1 } },
  });

  const templateKey = invitation.templateKey.split("::")[0];

  // The existing Eternal Blossom key remains the compatibility slot for this design.
  if (templateKey === "eternal-blossom") {
    return <ClassicInvitationTemplate invitation={invitation} />;
  }

  return <PublicInvitation invitation={invitation} />;
}
