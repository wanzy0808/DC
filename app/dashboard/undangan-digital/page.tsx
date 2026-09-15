import Link from "next/link";
import { ArrowLeft, Check, Sparkles } from "lucide-react";
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
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 w-[min(92vw,1400px)] min-w-0 items-center gap-3 px-1">
          <Link href="/dashboard" aria-label="Kembali ke dashboard" className={buttonVariants({ variant: "ghost", size: "icon" })}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <span className="h-5 w-px shrink-0 bg-border" />
          <Sparkles className="h-4 w-4 shrink-0 text-primary" />
          <div className="min-w-0">
            <p className="truncate font-[family-name:var(--font-cinzel)] text-xs font-semibold uppercase tracking-[0.16em]">DC Organizer</p>
            <p className="truncate text-xs text-muted-foreground">Digital Invitation</p>
          </div>
          <div className="ml-auto hidden items-center gap-2 text-[10px] text-muted-foreground sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {paid ? "Package active" : "Draft workspace"}
          </div>
        </div>
      </header>

      <section className="border-b border-border bg-background">
        <div className="mx-auto grid w-[min(92vw,1400px)] gap-8 px-1 py-10 sm:py-14 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="min-w-0">
            <div className="flex items-center gap-2 font-[family-name:var(--font-dm-mono)] text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              <span className="text-primary">Workspace</span><span>/</span><span>Digital Invitation</span>
            </div>
            <h1 className="mt-4 max-w-4xl font-[family-name:var(--font-cinzel)] text-3xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Buat undangan yang terasa seperti kalian.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              Atur desain, isi acara, privasi, dan publikasi dari satu tempat. Semua perubahan tetap mengikuti data undangan yang tersimpan di database.
            </p>
          </div>
          <div className="flex items-center gap-3 border-t border-border pt-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <div className="grid h-10 w-10 shrink-0 place-items-center border border-border bg-background text-primary">
              <Check className="h-4 w-4" />
            </div>
            <div>
              <p className="font-[family-name:var(--font-dm-mono)] text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Status</p>
              <p className="mt-1 text-sm font-medium">{paid ? "Digital Invitation aktif" : "Siap disiapkan"}</p>
            </div>
          </div>
        </div>
      </section>

      <InvitationManagementPanel paid={paid} />
    </main>
  );
}
