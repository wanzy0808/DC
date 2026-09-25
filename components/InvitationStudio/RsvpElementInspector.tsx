"use client";

import { RotateCcw } from "lucide-react";
import type {
  InvitationRsvpConfig,
  RsvpElementAlign,
  RsvpElementStyle,
} from "@/lib/templates/rsvp-config";

const coreNames: Record<string, { id: string; en: string }> = {
  title: { id: "Judul RSVP", en: "RSVP title" },
  name: { id: "Input Nama", en: "Name input" },
  phone: { id: "Input WhatsApp", en: "WhatsApp input" },
  events: { id: "Pilihan Acara", en: "Event choice" },
  status: { id: "Status Kehadiran", en: "Attendance status" },
  companions: { id: "Jumlah Pendamping", en: "Companions" },
  submit: { id: "Tombol Submit", en: "Submit button" },
};

export default function RsvpElementInspector({
  locale,
  elementKey,
  config,
  onConfig,
  onUpdateField,
  onClose,
}: {
  locale: string;
  elementKey: string;
  config: InvitationRsvpConfig;
  onConfig: (patch: Partial<InvitationRsvpConfig>) => void;
  onUpdateField: (id: string, patch: { label?: string; required?: boolean }) => void;
  onClose: () => void;
}) {
  const en = locale === "en";
  const customId = elementKey.startsWith("custom:") ? elementKey.slice(7) : "";
  const customField = customId ? config.customFields.find((field) => field.id === customId) : undefined;
  const displayName = customField?.label || (en ? coreNames[elementKey]?.en : coreNames[elementKey]?.id) || elementKey;
  const style = config.elementStyles[elementKey] ?? {};

  function updateStyle(patch: Partial<RsvpElementStyle>) {
    const next = { ...style, ...patch };
    for (const [key, value] of Object.entries(next)) {
      if (value === undefined) delete (next as Record<string, unknown>)[key];
    }
    const elementStyles = { ...config.elementStyles };
    if (Object.keys(next).length) elementStyles[elementKey] = next;
    else delete elementStyles[elementKey];
    onConfig({ elementStyles });
  }

  function reset() {
    const elementStyles = { ...config.elementStyles };
    delete elementStyles[elementKey];
    onConfig({
      elementStyles,
      ...(elementKey === "title" ? { title: undefined } : {}),
    });
  }

  const numeric = (
    label: string,
    value: number | undefined,
    placeholder: string,
    min: number,
    max: number,
    suffix: string,
    property: "width" | "fontSize",
  ) => (
    <label className="dc-studio-section-field">
      <span>{label}</span>
      <span className="dc-studio-section-number">
        <input
          type="number"
          min={min}
          max={max}
          value={value ?? ""}
          placeholder={placeholder}
          onChange={(event) => {
            if (!event.currentTarget.value) return updateStyle({ [property]: undefined });
            const next = event.currentTarget.valueAsNumber;
            if (Number.isFinite(next)) updateStyle({ [property]: Math.min(max, Math.max(min, next)) });
          }}
        />
        <small>{suffix}</small>
      </span>
    </label>
  );

  const colorControl = (label: string, value: string | undefined, property: "background" | "color" | "borderColor", fallback: string) => (
    <div className="dc-studio-section-field">
      <span>{label}</span>
      <div className="dc-studio-section-color">
        <input
          type="color"
          value={value ?? fallback}
          aria-label={label}
          onChange={(event) => updateStyle({ [property]: event.target.value })}
        />
        <button type="button" onClick={() => updateStyle({ [property]: undefined })}>
          {en ? "Default" : "Default"}
        </button>
      </div>
    </div>
  );

  return (
    <aside className="dc-studio-section-side dc-studio-rsvp-element-side" aria-label={en ? "RSVP component properties" : "Properti komponen RSVP"}>
      <div className="dc-studio-section-side-head">
        <div className="min-w-0">
          <span>{en ? "RSVP component" : "Komponen RSVP"}</span>
          <strong title={displayName}>{displayName}</strong>
        </div>
        <button type="button" onClick={onClose} aria-label={en ? "Close component properties" : "Tutup properti komponen"} title={en ? "Close" : "Tutup"}>×</button>
      </div>

      {elementKey === "title" && (
        <label className="dc-studio-section-field">
          <span>{en ? "Text" : "Teks"}</span>
          <input
            className="dc-studio-rsvp-text-input"
            value={config.title ?? "Konfirmasi Kehadiran"}
            maxLength={80}
            onChange={(event) => onConfig({ title: event.target.value })}
          />
        </label>
      )}

      {customField && (
        <label className="dc-studio-section-field">
          <span>{en ? "Field label" : "Label field"}</span>
          <input
            className="dc-studio-rsvp-text-input"
            value={customField.label}
            maxLength={60}
            onChange={(event) => onUpdateField(customField.id, { label: event.target.value })}
          />
        </label>
      )}

      {numeric(en ? "Width" : "Lebar", style.width, "100", 30, 100, "%", "width")}
      {numeric(en ? "Text size" : "Ukuran teks", style.fontSize, en ? "Template" : "Template", 10, 72, "px", "fontSize")}

      <label className="dc-studio-section-field">
        <span>{en ? "Alignment" : "Perataan"}</span>
        <select
          value={style.align ?? ""}
          onChange={(event) => updateStyle({ align: (event.target.value || undefined) as RsvpElementAlign | undefined })}
        >
          <option value="">{en ? "Template default" : "Default template"}</option>
          <option value="left">{en ? "Left" : "Kiri"}</option>
          <option value="center">{en ? "Center" : "Tengah"}</option>
          <option value="right">{en ? "Right" : "Kanan"}</option>
        </select>
      </label>

      <label className="dc-studio-section-field">
        <span className="flex items-center justify-between gap-2">
          <span>{en ? "Opacity" : "Opasitas"}</span>
          <output>{Math.round((style.opacity ?? 1) * 100)}%</output>
        </span>
        <input
          type="range"
          min="0.2"
          max="1"
          step="0.05"
          value={style.opacity ?? 1}
          onChange={(event) => updateStyle({ opacity: Number(event.target.value) })}
        />
      </label>

      {colorControl(en ? "Background" : "Latar", style.background, "background", "#ffffff")}
      {colorControl(en ? "Text" : "Teks", style.color, "color", "#222222")}
      {colorControl(en ? "Border" : "Garis", style.borderColor, "borderColor", "#c07a84")}

      <button type="button" className="dc-studio-section-reset" onClick={reset}>
        <RotateCcw size={14} />
        {en ? "Reset component" : "Reset komponen"}
      </button>
    </aside>
  );
}
