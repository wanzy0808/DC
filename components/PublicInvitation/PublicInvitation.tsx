import Link from "next/link";
import { CalendarDays, Clock3, LockKeyhole, MapPin } from "lucide-react";
import RsvpForm from "@/components/InvitationStudio/RsvpForm";
import {
  buildEventTitle,
  getEventCategory,
  getIndonesiaTimezone,
  normalizeEventCategory,
} from "@/lib/events/catalog";

export type PublicInvitationData = {
  id: string;
  slug: string;
  title: string;
  eventCategory: string;
  groomName: string;
  brideName: string;
  groomFatherName?: string | null;
  groomMotherName?: string | null;
  brideFatherName?: string | null;
  brideMotherName?: string | null;
  venue: string;
  address: string | null;
  mapUrl: string | null;
  timezone: string;
  eventDate: Date;
  ceremonyTime: string | null;
  receptionTime: string | null;
  description: string | null;
  eventNotes?: string | null;
  dressCode?: string | null;
  weddingHashtag?: string | null;
  templateKey: string;
  giftBankName: string | null;
  giftAccountName: string | null;
  giftAccountNumber: string | null;
  assets: {
    id: string;
    type: "IMAGE" | "AUDIO";
    url: string;
    title: string | null;
  }[];
};

function formatDate(date: Date, timezone: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "full",
    timeZone: timezone || "Asia/Jakarta",
  }).format(date);
}

function formatTime(value: string) {
  return value;
}

export function weddingParentLine(
  fatherName?: string | null,
  motherName?: string | null,
) {
  const parents = [
    fatherName?.trim() ? `Bapak ${fatherName.trim()}` : "",
    motherName?.trim() ? `Ibu ${motherName.trim()}` : "",
  ].filter(Boolean);

  return parents.length ? `Anak dari ${parents.join(" & ")}` : "";
}

export default function PublicInvitation({
  invitation,
}: {
  invitation: PublicInvitationData;
}) {
  const eventCategory = normalizeEventCategory(invitation.eventCategory);
  const category = getEventCategory(eventCategory);
  const timezone = getIndonesiaTimezone(invitation.timezone);
  const generatedTitle = buildEventTitle(
    eventCategory,
    invitation.groomName,
    invitation.brideName,
    invitation.title,
  );
  const title = invitation.title.trim() || generatedTitle || "Undangan Acara";
  const identity =
    category.nameMode === "couple"
      ? [invitation.groomName, invitation.brideName].filter(Boolean).join(" & ")
      : category.nameMode === "single"
        ? invitation.groomName
        : "";
  const showIdentity = Boolean(identity && identity !== title);
  const groomParents =
    eventCategory === "WEDDING"
      ? weddingParentLine(invitation.groomFatherName, invitation.groomMotherName)
      : "";
  const brideParents =
    eventCategory === "WEDDING"
      ? weddingParentLine(invitation.brideFatherName, invitation.brideMotherName)
      : "";
  const startTime = invitation.ceremonyTime;
  const endTime = invitation.receptionTime;
  const timeLabel = startTime
    ? `${formatTime(startTime)}${endTime ? `–${formatTime(endTime)}` : ""} ${timezone.label}`
    : "";

  return (
    <main className="min-h-screen bg-background px-5 py-12 text-foreground">
      <div className="mx-auto max-w-4xl">
        <header className="rounded-2xl border border-border bg-background px-6 py-12 text-center shadow-sm md:px-12 md:py-16">
          <p className="font-[family-name:var(--font-dm-mono)] text-[10px] uppercase tracking-[0.28em] text-primary">
            {category.label} · Digital Invitation
          </p>
          <h1 className="mt-5 font-[family-name:var(--font-cinzel)] text-4xl tracking-wide md:text-6xl">
            {title}
          </h1>
          {showIdentity && (
            <p className="mt-3 font-[family-name:var(--font-cinzel)] text-lg text-primary md:text-xl">
              {identity}
            </p>
          )}
          {eventCategory === "WEDDING" && (groomParents || brideParents) && (
            <div className="mx-auto mt-4 grid max-w-2xl gap-2 text-xs leading-5 text-muted-foreground sm:grid-cols-2">
              {groomParents && (
                <p>
                  <span className="font-semibold text-foreground">{invitation.groomName}</span>
                  <br />
                  {groomParents}
                </p>
              )}
              {brideParents && (
                <p>
                  <span className="font-semibold text-foreground">{invitation.brideName}</span>
                  <br />
                  {brideParents}
                </p>
              )}
            </div>
          )}
          <p className="mx-auto mt-5 max-w-2xl font-[family-name:var(--font-fauna)] text-sm leading-7 text-muted-foreground">
            {invitation.description ||
              "Kami mengundang Anda untuk hadir dan menjadi bagian dari momen istimewa ini."}
          </p>

          <div className="mx-auto mt-8 max-w-xl space-y-3 font-[family-name:var(--font-fauna)] text-sm">
            <div className="flex items-center justify-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              {formatDate(invitation.eventDate, invitation.timezone)}
            </div>
            {timeLabel && (
              <div className="flex items-center justify-center gap-2">
                <Clock3 className="h-4 w-4 text-primary" />
                {timeLabel}
              </div>
            )}
            <div className="flex items-center justify-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              {invitation.venue}
            </div>
            {invitation.address && (
              <p className="text-xs text-muted-foreground">{invitation.address}</p>
            )}
            {invitation.mapUrl && (
              <a
                href={invitation.mapUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex text-xs text-primary underline underline-offset-4"
              >
                Lihat Lokasi
              </a>
            )}
          </div>
        </header>

        <section className="mt-8 rounded-2xl border border-border bg-background p-6 shadow-sm md:p-10">
          <RsvpForm
            slug={invitation.slug}
            eventDate={invitation.eventDate}
            venue={invitation.venue}
            title={title}
            start={startTime}
            description={invitation.description}
          />
        </section>

        <footer className="mt-8 flex flex-wrap items-center justify-center gap-4 text-center font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
          <span>DC Organizer</span>
          <span>•</span>
          <Link href="/" className="hover:text-primary">
            Digital Event Invitation
          </Link>
        </footer>
      </div>
    </main>
  );
}

export function InvitationLockedState() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 text-center text-foreground">
      <div className="max-w-md rounded-2xl border border-border bg-background p-10 shadow-sm">
        <LockKeyhole className="mx-auto h-8 w-8 text-primary" />
        <h1 className="mt-5 font-[family-name:var(--font-cinzel)] text-3xl">
          Undangan belum tersedia
        </h1>
        <p className="mt-3 font-[family-name:var(--font-fauna)] text-sm text-muted-foreground">
          Undangan ini belum dipublikasikan atau belum aktif.
        </p>
      </div>
    </main>
  );
}
