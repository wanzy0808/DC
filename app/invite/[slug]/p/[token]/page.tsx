import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hasPaidDigitalInvitation } from "@/lib/packages/access";
import { hasInvitationAccess } from "@/lib/invitations/password";
import { InvitationLockedState } from "@/components/PublicInvitation/PublicInvitation";
import PublicInvitationRenderer from "@/components/PublicInvitation/PublicInvitationRenderer";
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

  if (!invitation.isPublished || !guest.personalPublished || !hasPaidDigitalInvitation(invitation.payment)) {
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
        guestName={guest.personalAddressee || guest.name}
      />
    );
  }

  await prisma.guest.update({
    where: { id: guest.id },
    data: { personalViewCount: { increment: 1 } },
  });

  const content = <PublicInvitationRenderer invitation={invitation} personalGuest={{ id: guest.id, name: guest.name, token, invitedPax: guest.invitedPax }} />;

  return (
    <>
      <div className="border-b border-primary/15 bg-primary/[0.045] px-4 py-3 text-center font-[family-name:var(--font-fauna)] text-sm text-foreground">
        Undangan khusus untuk <strong>{guest.personalAddressee || guest.name}</strong>
        {guest.personalGreeting && (
          <p className="mx-auto mt-2 max-w-xl whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{guest.personalGreeting}</p>
        )}
      </div>
      {content}
    </>
  );
}
