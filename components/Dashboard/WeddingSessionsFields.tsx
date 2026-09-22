"use client";

import { EventField, EventTimeField } from "@/components/Dashboard/EventFields";
import type { EventForm } from "@/components/Dashboard/event-panel-types";
import { useDashboardI18n } from "@/components/Dashboard/useDashboardI18n";

export function WeddingSessionsFields({
  form,
  timezoneLabel,
  update,
}: {
  form: EventForm;
  timezoneLabel: string;
  update: <K extends keyof EventForm>(key: K, value: EventForm[K]) => void;
}) {
  const { d } = useDashboardI18n();
  const sessions = [
    { key: "Ceremony" as const, label: d("Upacara Nikah"), enabled: form.weddingCeremonyEnabled },
    { key: "Reception" as const, label: d("Resepsi"), enabled: form.weddingReceptionEnabled },
  ];

  return (
    <div className="mt-5 space-y-4">
      <p className="text-xs leading-5 text-muted-foreground">
        {d("Pilih Upacara Nikah, Resepsi, atau keduanya. Setiap sesi memiliki waktu dan lokasi sendiri pada tanggal acara yang sama. Jika berbeda hari, buat Rangkaian Acara baru dan aktifkan paket undangan terpisah.")}
      </p>
      {sessions.map(({ key, label, enabled }) => {
        const prefix = key === "Ceremony" ? "weddingCeremony" : "weddingReception";
        const startKey = `${prefix}Start` as "weddingCeremonyStart" | "weddingReceptionStart";
        const endKey = `${prefix}End` as "weddingCeremonyEnd" | "weddingReceptionEnd";
        const venueKey = `${prefix}Venue` as "weddingCeremonyVenue" | "weddingReceptionVenue";
        const addressKey = `${prefix}Address` as "weddingCeremonyAddress" | "weddingReceptionAddress";
        const mapKey = `${prefix}MapUrl` as "weddingCeremonyMapUrl" | "weddingReceptionMapUrl";
        const enabledKey = key === "Ceremony" ? "weddingCeremonyEnabled" : "weddingReceptionEnabled";

        return (
          <section key={key} className="rounded-xl border border-border/70 bg-background p-4">
            <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold">
              <input
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={enabled}
                onChange={(event) => update(enabledKey, event.target.checked)}
              />
              {label}
            </label>
            {enabled && (
              <div className="mt-4 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <EventTimeField
                    label={`${d("Mulai")} (${timezoneLabel})`}
                    value={form[startKey]}
                    onChange={(value) => update(startKey, value)}
                  />
                  <EventTimeField
                    label={`${d("Selesai")} (${timezoneLabel}, ${d("opsional")})`}
                    value={form[endKey]}
                    onChange={(value) => update(endKey, value)}
                  />
                </div>
                <EventField label={d("Nama tempat")} value={form[venueKey]} onChange={(value) => update(venueKey, value)} />
                <EventField label={d("Alamat")} value={form[addressKey]} onChange={(value) => update(addressKey, value)} />
                <EventField label={d("Google Maps")} value={form[mapKey]} onChange={(value) => update(mapKey, value)} placeholder="https://maps.google.com/..." />
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
