import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hasPaidDigitalInvitation } from "@/lib/packages/access";
import { hasInvitationAccess } from "@/lib/invitation-password";
import PublicInvitation, { InvitationLockedState } from "@/components/PublicInvitation/PublicInvitation";
import InvitationPasswordGate from "@/components/PublicInvitation/InvitationPasswordGate";

export default async function PublicInvitationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const invitation = await prisma.invitation.findUnique({
    where: { slug },
    include: { payment: true },
  });

  if (!invitation) notFound();
  if (!invitation.isPublished || !hasPaidDigitalInvitation(invitation.payment)) return <InvitationLockedState />;
  if (invitation.passwordProtected && !(await hasInvitationAccess(slug))) {
    return <InvitationPasswordGate slug={slug} />;
  }

  return (
    <PublicInvitation
      invitation={invitation}
      eventKind={invitation.type === "ADAT_AKAD" ? "special" : "wedding"}
    />
  );
}
