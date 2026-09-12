import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hasPaidDigitalInvitation } from "@/lib/packages/access";
import PublicInvitation, { InvitationLockedState } from "@/components/PublicInvitation/PublicInvitation";

export default async function SpecialInvitationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const mainInvitation = await prisma.invitation.findUnique({ where: { slug }, select: { ownerId: true } });
  if (!mainInvitation) notFound();

  const invitation = await prisma.invitation.findFirst({
    where: { ownerId: mainInvitation.ownerId, type: "ADAT_AKAD" },
    include: { payment: true },
    orderBy: { createdAt: "asc" },
  });

  if (!invitation) notFound();
  if (!invitation.isPublished || !hasPaidDigitalInvitation(invitation.payment)) return <InvitationLockedState />;

  return <PublicInvitation invitation={invitation} eventKind="special" />;
}
