import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPaidDigitalInvitation } from "@/lib/packages/access";
import { buttonVariants } from "@/components/ui/button";
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
    <main className="min-h-screen overflow-x-clip bg-background font-[family-name:var(--font-fauna)] text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 w-[min(92vw,1400px)] min-w-0 items-center gap-3">
          <Link
            href="/dashboard"
            aria-label="Kembali ke dashboard"
            className={buttonVariants({ variant: "ghost", size: "icon" })}
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <span className="h-5 w-px shrink-0 bg-border" />
          <Sparkles className="h-4 w-4 shrink-0 text-primary" />
          <div className="min-w-0">
            <p className="truncate font-[family-name:var(--font-cinzel)] text-xs font-semibold uppercase tracking-[0.16em]">
              DC Organizer
            </p>
            <p className="truncate text-xs text-muted-foreground">Digital Invitation</p>
          </div>
        </div>
      </header>

      <InvitationManagementPanel paid={paid} />
    </main>
  );
}
