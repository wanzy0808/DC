import { MapPin } from "lucide-react";
import type { WeddingSession } from "@/lib/events/wedding-sessions";

export default function WeddingSessionSchedule({
  sessions,
  timezoneLabel,
}: {
  sessions: WeddingSession[];
  timezoneLabel: string;
}) {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-2">
      {sessions.map((session) => (
        <section key={session.key} className="rounded-xl border border-current/15 bg-background/70 p-5 text-center text-foreground">
          <h3 className="font-[family-name:var(--font-dc-heading)] text-xl">{session.label}</h3>
          <p className="mt-3 font-[family-name:var(--font-dc-mono)] text-sm">
            {session.start}{session.end ? `–${session.end}` : ""} {timezoneLabel}
          </p>
          <p className="mt-3 text-sm font-semibold">{session.venue}</p>
          {session.address && <p className="mt-1 text-xs text-muted-foreground">{session.address}</p>}
          {session.mapUrl && (
            <a href={session.mapUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs text-primary underline underline-offset-4">
              <MapPin className="h-3.5 w-3.5" /> Lihat Lokasi
            </a>
          )}
        </section>
      ))}
    </div>
  );
}
