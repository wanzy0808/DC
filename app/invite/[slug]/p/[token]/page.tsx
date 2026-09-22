import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hasPaidDigitalInvitation } from "@/lib/packages/access";
import { hasInvitationAccess } from "@/lib/invitations/password";
import PublicInvitation, {
  InvitationLockedState,
} from "@/components/PublicInvitation/PublicInvitation";
import ClassicInvitationTemplate from "@/components/PublicInvitation/ClassicInvitationTemplate";
import RomanticRoseTemplate from "@/components/PublicInvitation/RomanticRoseTemplate";
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

  if (!guest.personalPublished || !hasPaidDigitalInvitation(invitation.payment)) {
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

  const templateKey = invitation.templateKey.split("::")[0];
  const content =
    templateKey === "romantic-rose" ? (
      <RomanticRoseTemplate invitation={invitation} />
    ) : templateKey === "eternal-blossom" ? (
      <ClassicInvitationTemplate invitation={invitation} />
    ) : (
      <PublicInvitation invitation={invitation} />
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
