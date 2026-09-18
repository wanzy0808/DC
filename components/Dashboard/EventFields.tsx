"use client";

import { useRef, useState } from "react";
import { CalendarDays, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDashboardI18n } from "@/components/Dashboard/useDashboardI18n";
import {
  displayDateToIso,
  formatDateInput,
  formatTimeInput,
  isValidTime24,
  isoDateToDisplay,
} from "@/components/Dashboard/event-panel-helpers";
import {
  weddingParentLine,
  type WeddingChildKind,
} from "@/lib/events/parents";

const timeHours = Array.from({ length: 24 }, (_, index) =>
  String(index).padStart(2, "0"),
);

const timeMinutes = Array.from({ length: 60 }, (_, index) =>
  String(index).padStart(2, "0"),
);

export function WeddingFamilyFields({
  title,
  kind,
  father,
  mother,
  order,
  onFather,
  onMother,
  onOrder,
}: {
  title: string;
  kind: WeddingChildKind;
  father: string;
  mother: string;
  order: string;
  onFather: (value: string) => void;
  onMother: (value: string) => void;
  onOrder: (value: string) => void;
}) {
  const { d } = useDashboardI18n();
  const parsedOrder = order.trim() ? Number(order) : null;
  const familyLine = weddingParentLine(
    father,
    mother,
    Number.isInteger(parsedOrder) ? parsedOrder : null,
    kind,
  );

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold">{title}</p>
      <ChildOrderField value={order} onChange={onOrder} />
      <EventField label={d("Nama bapak")} value={father} onChange={onFather} />
      <EventField label={d("Nama ibu")} value={mother} onChange={onMother} />
      {familyLine && (
        <p className="rounded-lg border border-border/70 bg-background px-3 py-2 text-[11px] leading-5 text-muted-foreground">
          {familyLine}
        </p>
      )}
    </div>
  );
}

function ChildOrderField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { d } = useDashboardI18n();

  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold">
        {d("Anak keberapa")} ({d("opsional")})
      </span>
      <Input
        type="number"
        min={1}
        step={1}
        inputMode="numeric"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={d("Contoh: 1")}
      />
    </label>
  );
}

export function EventDateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const { d } = useDashboardI18n();
  const pickerRef = useRef<HTMLInputElement | null>(null);
  const isoValue = displayDateToIso(value);

  function openCalendar() {
    const picker = pickerRef.current;
    if (!picker) return;
    if (typeof picker.showPicker === "function") picker.showPicker();
    else picker.click();
  }

  return (
    <div>
      <span className="mb-1.5 block text-xs font-semibold">{label}</span>
      <div className="relative flex gap-2">
        <Input
          inputMode="numeric"
          maxLength={10}
          value={value}
          onChange={(event) => onChange(formatDateInput(event.target.value))}
          placeholder="dd/mm/yyyy"
        />
        <Button
          type="button"
          size="icon"
          onClick={openCalendar}
          aria-label={d("Pilih tanggal")}
        >
          <CalendarDays className="h-4 w-4" />
        </Button>
        <input
          ref={pickerRef}
          type="date"
          value={isoValue}
          onChange={(event) => onChange(isoDateToDisplay(event.target.value))}
          className="pointer-events-none absolute right-0 top-0 h-11 w-11 opacity-0"
          tabIndex={-1}
        />
      </div>
    </div>
  );
}

export function EventTimeField({
  label,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const { d } = useDashboardI18n();
  const [open, setOpen] = useState(false);
  const [hour, minute] = isValidTime24(value)
    ? value.split(":")
    : ["00", "00"];

  return (
    <div className="relative">
      <span className="mb-1.5 block text-xs font-semibold">{label}</span>
      <div className="flex gap-2">
        <Input
          disabled={disabled}
          inputMode="numeric"
          maxLength={5}
          value={value}
          onChange={(event) => onChange(formatTimeInput(event.target.value))}
          placeholder="00:00"
          className="font-[family-name:var(--font-dc-mono)]"
        />
        <Button
          type="button"
          size="icon"
          disabled={disabled}
          onClick={() => setOpen((current) => !current)}
          aria-label={d("Pilih waktu")}
        >
          <Clock3 className="h-4 w-4" />
        </Button>
      </div>

      {open && !disabled && (
        <div className="absolute right-0 z-40 mt-2 grid w-full min-w-52 grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-xl border border-border bg-background p-3 shadow-xl">
          <select
            value={hour}
            onChange={(event) =>
              onChange(`${event.target.value}:${minute}`)
            }
            className="h-11 rounded-[10px] border border-border bg-background px-2 text-sm"
          >
            {timeHours.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <span>:</span>
          <select
            value={minute}
            onChange={(event) =>
              onChange(`${hour}:${event.target.value}`)
            }
            className="h-11 rounded-[10px] border border-border bg-background px-2 text-sm"
          >
            {timeMinutes.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <Button
            type="button"
            size="sm"
            className="col-span-3"
            onClick={() => setOpen(false)}
          >
            {d("Selesai memilih")}
          </Button>
        </div>
      )}
    </div>
  );
}

export function EventField({
  label,
  value,
  onChange,
  placeholder = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold">{label}</span>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

export function EventTextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        className="w-full resize-y rounded-[10px] border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}
