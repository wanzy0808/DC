"use client";

import { CalendarDays, ChevronDown } from "lucide-react";

export type EventScopeOption = {
  id: string;
  title: string;
  venue: string;
  eventDate: string;
  isPublished: boolean;
};

type Props = {
  events: EventScopeOption[];
  value: string;
  onChange: (id: string) => void;
  disabled?: boolean;
};

export default function EventScopePicker({ events, value, onChange, disabled = false }: Props) {
  if (!events.length) {
    return (
      <div className="rounded-xl border border-border/80 bg-foreground/[0.018] p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/[0.08] text-primary">
            <CalendarDays className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
              Acara aktif
            </p>
            <p className="mt-1 text-sm text-foreground">Silakan buat rangkaian acara dulu.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <label className="block rounded-xl border border-border/80 bg-foreground/[0.018] p-3 sm:max-w-xl">
      <span className="mb-1.5 block font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
        Acara aktif
      </span>
      <span className="relative block">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          aria-label="Pilih acara"
          className="h-11 w-full appearance-none rounded-[10px] border border-border bg-background px-3 pr-10 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed"
        >
          {events.map((event, index) => (
            <option key={event.id} value={event.id}>
              {event.title.trim() || `Rangkaian ${index + 1}`}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
      </span>
    </label>
  );
}