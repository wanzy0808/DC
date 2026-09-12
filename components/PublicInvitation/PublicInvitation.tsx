import Link from "next/link";
import { MapPin, CalendarDays, Clock3, LockKeyhole } from "lucide-react";
import RsvpForm from "@/components/InvitationStudio/RsvpForm";

export type PublicInvitationData = {
  id: string;
  slug: string;
  title: string;
  groomName: string;
  brideName: string;
  venue: string;
  address: string | null;
  mapUrl: string | null;
  timezone: string;
  eventDate: Date;
  ceremonyTime: string | null;
  receptionTime: string | null;
  description: string | null;
};

function formatDate(date: Date, timezone: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "full",
    timeZone: timezone || "Asia/Jakarta",
  }).format(date);
}

export default function PublicInvitation({
  invitation,
  eventKind,
}: {
  invitation: PublicInvitationData;
  eventKind: "wedding" | "special";
}) {
  const time = invitation.ceremonyTime || invitation.receptionTime;

  return (
    <main className="min-h-screen bg-[#f7f0e8] px-5 py-12 text-[#2f2525] dark:bg-[#090708] dark:text-white">
      <div className="mx-auto max-w-4xl">
        <header className="border border-[#7A1C25]/15 bg-[#fffaf5]/90 px-6 py-12 text-center shadow-sm backdrop-blur dark:border-[#e8a5ae]/15 dark:bg-[#120e10]/90 md:px-12 md:py-16">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#7A1C25] dark:text-[#e8a5ae]">
            {eventKind === "special" ? "Special Event Invitation" : "Wedding Invitation"}
          </p>
          <h1 className="mt-5 font-[var(--font-cinzel)] text-4xl tracking-wide md:text-6xl">
            {invitation.groomName} <span className="text-[#7A1C25] dark:text-[#e8a5ae]">&</span> {invitation.brideName}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl font-[var(--font-fauna)] text-sm leading-7 opacity-75">
            {invitation.description || "Dengan penuh kebahagiaan, kami mengundang Anda untuk hadir di hari istimewa kami."}
          </p>

          <div className="mx-auto mt-8 max-w-xl space-y-3 text-sm font-[var(--font-fauna)]">
            <div className="flex items-center justify-center gap-2"><CalendarDays className="h-4 w-4 text-[#7A1C25] dark:text-[#e8a5ae]" />{formatDate(invitation.eventDate, invitation.timezone)}</div>
            {time && <div className="flex items-center justify-center gap-2"><Clock3 className="h-4 w-4 text-[#7A1C25] dark:text-[#e8a5ae]" />{time} WIB</div>}
            <div className="flex items-center justify-center gap-2"><MapPin className="h-4 w-4 text-[#7A1C25] dark:text-[#e8a5ae]" />{invitation.venue}</div>
            {invitation.address && <p className="text-xs opacity-65">{invitation.address}</p>}
            {invitation.mapUrl && <a href={invitation.mapUrl} target="_blank" rel="noreferrer" className="inline-flex text-xs text-[#7A1C25] underline underline-offset-4 dark:text-[#e8a5ae]">Lihat Lokasi</a>}
          </div>
        </header>

        <section className="mt-8 border border-[#7A1C25]/15 bg-[#fffaf5]/90 p-6 shadow-sm dark:border-[#e8a5ae]/15 dark:bg-[#120e10]/90 md:p-10">
          <RsvpForm
            slug={invitation.slug}
            eventDate={invitation.eventDate}
            venue={invitation.venue}
            title={invitation.title}
            start={invitation.ceremonyTime || invitation.receptionTime}
            description={invitation.description}
          />
        </section>

        <footer className="mt-8 flex flex-wrap items-center justify-center gap-4 text-center font-mono text-[9px] uppercase tracking-[0.2em] opacity-55">
          <span>DC Wedding</span>
          <span>•</span>
          <Link href="/" className="hover:opacity-100">Digital Wedding Platform</Link>
        </footer>
      </div>
    </main>
  );
}

export function InvitationLockedState() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f0e8] px-5 text-center dark:bg-[#090708] dark:text-white">
      <div className="max-w-md border border-[#7A1C25]/15 bg-[#fffaf5] p-10 shadow-sm dark:border-[#e8a5ae]/15 dark:bg-[#120e10]">
        <LockKeyhole className="mx-auto h-8 w-8 text-[#7A1C25] dark:text-[#e8a5ae]" />
        <h1 className="mt-5 font-[var(--font-cinzel)] text-3xl">Undangan belum tersedia</h1>
        <p className="mt-3 font-[var(--font-fauna)] text-sm opacity-70">Undangan ini belum dipublikasikan atau belum aktif.</p>
      </div>
    </main>
  );
}
