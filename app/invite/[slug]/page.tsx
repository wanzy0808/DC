import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hasPaidDigitalInvitation } from "@/lib/packages/access";
import { hasInvitationAccess } from "@/lib/invitation-password";
import PublicInvitation, { InvitationLockedState } from "@/components/PublicInvitation/PublicInvitation";
import FigmaClassicTemplate from "@/components/PublicInvitation/FigmaClassicTemplate";
import InvitationPasswordGate from "@/components/PublicInvitation/InvitationPasswordGate";

export default async function PublicInvitationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const invitation = await prisma.invitation.findUnique({
    where: { slug },
    include: { payment: true, assets: true },
  });

  if (!invitation) notFound();
  if (!invitation.isPublished || !hasPaidDigitalInvitation(invitation.payment)) return <InvitationLockedState />;
  if (invitation.passwordProtected && !(await hasInvitationAccess(slug))) {
    return <InvitationPasswordGate slug={slug} />;
  }

  const eventKind = invitation.type === "ADAT_AKAD" ? "special" : "wedding";
  const templateKey = invitation.templateKey.split("::")[0];

  // The existing Eternal Blossom slot is used for the supplied invitation design.
  // No new customer-facing template name/key is introduced.
  if (templateKey === "eternal-blossom") {
    return <FigmaClassicTemplate invitation={invitation} eventKind={eventKind} />;
  }

  return <PublicInvitation invitation={invitation} eventKind={eventKind} />;
}
