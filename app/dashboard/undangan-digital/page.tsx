import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPaidDigitalInvitation } from "@/lib/packages/access";
import InvitationManagementPanel from "@/components/Dashboard/InvitationManagementPanel";

export const dynamic = "force-dynamic";

export default async function DigitalInvitationWorkspacePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const invitation = await prisma.invitation.findFirst({
    where: { ownerId: user.id, type: "WEDDING" },
    include: { payment: true },
    orderBy: { createdAt: "asc" },
  });
  const paid = hasPaidDigitalInvitation(invitation?.payment);

  return (
    <main className="min-h-screen bg-background text-foreground font-[family-name:var(--font-fauna)]">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center gap-3 px-5 sm:px-8">
          <Link
            href="/dashboard"
            aria-label="Kembali ke dashboard"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <span className="h-5 w-px bg-border" />
          <Sparkles className="h-4 w-4 text-primary" />
          <div className="min-w-0">
            <p className="font-[family-name:var(--font-cinzel)] text-xs font-semibold uppercase tracking-[0.16em]">DC Organizer</p>
            <p className="truncate text-xs text-muted-foreground">Digital Invitation</p>
          </div>
        </div>
      </header>

      <InvitationManagementPanel paid={paid} />
    </main>
  );
}
