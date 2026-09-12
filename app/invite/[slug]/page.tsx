import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hasPaidDigitalInvitation } from "@/lib/packages/access";
import PublicInvitation, { InvitationLockedState } from "@/components/PublicInvitation/PublicInvitation";

export default async function PublicInvitationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const invitation = await prisma.invitation.findUnique({
    where: { slug },
    include: { payment: true },
  });

  if (!invitation) notFound();
  if (!invitation.isPublished || !hasPaidDigitalInvitation(invitation.payment)) return <InvitationLockedState />;

  return (
    <PublicInvitation
      invitation={invitation}
      eventKind={invitation.type === "ADAT_AKAD" ? "special" : "wedding"}
    />
  );
}
