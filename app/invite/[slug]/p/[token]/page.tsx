import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { redactWeddingInvitationForGuest } from "@/lib/events/wedding-sessions";
import { hasPaidDigitalInvitation } from "@/lib/packages/access";
import { hasInvitationAccess } from "@/lib/invitations/password";
import PublicInvitation, {
  InvitationLockedState,
} from "@/components/PublicInvitation/PublicInvitation";
import ClassicInvitationTemplate from "@/components/PublicInvitation/ClassicInvitationTemplate";
import PersonalInvitationPasswordGate from "@/components/PublicInvitation/PersonalInvitationPasswordGate";

export default async function PersonalInvitationPage({
  params,
}: {
  params: Promise<{ slug: string; token: string }>;
}) {
  const { slug, token } = await params;
  const invitation = await prisma.invitation.findUnique({
    where: { slug },
    include: { payment: true, assets: true },
  });
  if (!invitation) notFound();

  const guest = await prisma.guest.findFirst({
    where: {
      invitationId: invitation.id,
      personalToken: token,
    },
  });
  if (!guest) notFound();

  if (!guest.personalPublished || !invitation.eventConfigured || !invitation.isPublished || !invitation.templateKey.trim() || !hasPaidDigitalInvitation(invitation.payment)) {
    return <InvitationLockedState />;
  }

  if (
    guest.personalPasswordProtected &&
    !(await hasInvitationAccess(`personal-${token}`))
  ) {
    return (
      <PersonalInvitationPasswordGate
        slug={slug}
        token={token}
        guestName={guest.name}
      />
    );
  }

  await prisma.guest.update({
    where: { id: guest.id },
    data: { personalViewCount: { increment: 1 } },
  });

  const visibleInvitation = redactWeddingInvitationForGuest(invitation, guest.weddingSessionAccess);
  if (!visibleInvitation) return <InvitationLockedState />;
  const templateKey = invitation.templateKey.split("::")[0];
  const content =
    templateKey === "eternal-blossom" ? (
      <ClassicInvitationTemplate invitation={visibleInvitation} />
    ) : (
      <PublicInvitation invitation={visibleInvitation} />
    );

  return (
    <>
      <div className="border-b border-primary/15 bg-primary/[0.045] px-4 py-3 text-center font-[family-name:var(--font-fauna)] text-sm text-foreground">
        Undangan khusus untuk <strong>{guest.name}</strong>
      </div>
      {content}
    </>
  );
}
