import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
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
    <main className="min-h-screen bg-[#FAF7F2] text-[#2D2222] font-[family-name:var(--font-fauna)] dark:bg-[#0B0A0E] dark:text-[#F8F1EB]">
      <header className="sticky top-0 z-40 flex min-h-16 items-center gap-3 border-b border-[#ddd0c8] bg-[#FAF7F2]/95 px-4 backdrop-blur dark:border-white/10 dark:bg-[#0B0A0E]/95 sm:px-7">
        <Link href="/dashboard" aria-label="Kembali ke dashboard" className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-[#7A1C25] hover:bg-[#7A1C25]/10 dark:text-[#E8A5AE] dark:hover:bg-white/5">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <Mail className="h-5 w-5 text-[#7A1C25] dark:text-[#E8A5AE]" />
        <div>
          <p className="font-[family-name:var(--font-cinzel)] text-sm font-semibold">Undangan Digital</p>
          <p className="text-xs text-[#5A4545] dark:text-white/70">Main Wedding & Event Khusus</p>
        </div>
      </header>
      <InvitationManagementPanel accent="text-[#7A1C25] dark:text-[#E8A5AE]" button="bg-[#7A1C25] hover:bg-[#5E141C] dark:bg-[#C26B70] dark:hover:bg-[#A9565C]" paid={paid} />
    </main>
  );
}
