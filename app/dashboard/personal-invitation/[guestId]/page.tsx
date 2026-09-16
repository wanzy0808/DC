import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PublicInvitation from "@/components/PublicInvitation/PublicInvitation";
import FigmaClassicTemplate from "@/components/PublicInvitation/FigmaClassicTemplate";
import { buttonVariants } from "@/components/ui/button";

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
      invitation: { ownerId: user.id },
    },
    include: {
      invitation: { include: { payment: true, assets: true } },
    },
  });
  if (!guest) notFound();

  const invitation = guest.invitation;
  const templateKey = invitation.templateKey.split("::")[0];
  const content =
    templateKey === "eternal-blossom" ? (
      <FigmaClassicTemplate invitation={invitation} />
    ) : (
      <PublicInvitation invitation={invitation} />
    );

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="sticky top-0 z-50 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
        <Link href="/dashboard" className={buttonVariants({ size: "sm" })}>
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Link>
        <div className="min-w-0">
          <p className="font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
            Pratinjau Personal Invitation
          </p>
          <p className="truncate text-sm font-medium">Untuk {guest.name}</p>
        </div>
      </div>
      <div className="border-b border-primary/15 bg-primary/[0.045] px-4 py-3 text-center font-[family-name:var(--font-fauna)] text-sm">
        Undangan khusus untuk <strong>{guest.name}</strong>
      </div>
      {content}
    </main>
  );
}
