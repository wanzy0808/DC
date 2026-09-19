import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redactWeddingInvitationForGuest } from "@/lib/events/wedding-sessions";
import PublicInvitation from "@/components/PublicInvitation/PublicInvitation";
import ClassicInvitationTemplate from "@/components/PublicInvitation/ClassicInvitationTemplate";
import { Button } from "@/components/ui/button";

export default async function PersonalInvitationPreviewPage({
  params,
}: {
  params: Promise<{ guestId: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { guestId } = await params;
  const guest = await prisma.guest.findFirst({
    where: {
      id: guestId,
      personalToken: { not: null },
      invitation: { ownerId: user.id, eventConfigured: true },
    },
    include: {
      invitation: { include: { payment: true, assets: true } },
    },
  });
  if (!guest) notFound();

  const invitation = guest.invitation;
  const scopedInvitation = redactWeddingInvitationForGuest(invitation, guest.weddingSessionAccess);
  const visibleInvitation = scopedInvitation ? { ...scopedInvitation, personalGuestId: guest.id, personalGuestToken: guest.personalToken || undefined, personalGuestName: guest.name } : null;
  if (!visibleInvitation) notFound();
  const templateKey = invitation.templateKey.split("::")[0];
  const content =
    templateKey === "eternal-blossom" ? (
      <ClassicInvitationTemplate invitation={visibleInvitation} />
    ) : (
      <PublicInvitation invitation={visibleInvitation} />
    );

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="sticky top-0 z-50 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
        <Button asChild size="sm">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Link>
        </Button>
        <div className="min-w-0">
          <p className="font-[family-name:var(--font-dc-mono)] text-xs uppercase tracking-[0.12em] text-muted-foreground">
            Pratinjau Personal Invitation
          </p>
          <p className="truncate text-sm font-medium">
            {invitation.title || "Acara"} · {guest.name}
          </p>
        </div>
      </div>
      <div className="border-b border-border bg-background px-4 py-3 text-center font-[family-name:var(--font-dc-sans)] text-sm">
        Undangan khusus untuk <strong>{guest.name}</strong>
      </div>
      {content}
    </main>
  );
}
