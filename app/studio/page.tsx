import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";

/**
 * Marketing CTA gateway. Studio needs an existing, configured event and its ID;
 * never open the editor without one or create an event as a side effect.
 */
export default async function StudioEntryPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=%2Fstudio");
  if (user.role === "OWNER") redirect("/owner");
  if (user.role === "ADMIN" || user.role === "FINANCE") redirect("/admin");
  if (user.role === "DESIGNER" || user.role === "EDITOR") redirect("/designer");

  const events = await prisma.invitation.findMany({
    where: { ownerId: user.id, eventConfigured: true },
    select: { id: true, title: true, type: true },
    orderBy: { updatedAt: "desc" },
  });

  if (events.length === 1) {
    const event = events[0];
    redirect(`/dashboard/editor?invitationId=${encodeURIComponent(event.id)}&type=${event.type}`);
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-5 py-16 text-foreground">
      <section className="w-full max-w-2xl space-y-7 rounded-[32px] border border-primary/50 bg-card p-6 shadow-[0_18px_60px_rgba(75,35,47,0.08)] sm:p-10">
        <p className="font-[family-name:var(--font-dc-mono)] text-xs uppercase tracking-[0.18em] text-primary">
          Invitation Studio
        </p>
        <h1 className="font-[family-name:var(--font-dc-heading)] text-3xl font-normal text-primary sm:text-4xl">
          {events.length ? "Pilih acara untuk diedit" : "Buat acara sebelum masuk Studio"}
        </h1>
        <p className="text-sm leading-7 text-foreground/65">
          {events.length
            ? "Pilih acara yang ingin kamu lanjutkan di Studio."
            : "Studio menyimpan desain untuk setiap acara. Siapkan satu acara terlebih dahulu agar desainmu tersimpan di tempat yang tepat."}
        </p>
        {events.length ? (
          <div className="space-y-3">
            {events.map((event) => (
              <Button asChild key={event.id} size="lg" className="min-h-12 w-full justify-between whitespace-normal text-left">
                <Link href={`/dashboard/editor?invitationId=${encodeURIComponent(event.id)}&type=${event.type}`}>
                  <span className="truncate">{event.title}</span>
                  <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden />
                </Link>
              </Button>
            ))}
          </div>
        ) : (
          <Button asChild size="lg">
            <Link href="/dashboard">
              Buat acara <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
        )}
      </section>
    </main>
  );
}
