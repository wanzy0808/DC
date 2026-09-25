"use client";

import { AlignCenter, AlignLeft, AlignRight, RotateCcw } from "lucide-react";
import {
  MAX_RSVP_CUSTOM_FIELDS,
  type InvitationRsvpConfig,
  type RsvpElementAlign,
  type RsvpElementStyle,
} from "@/lib/templates/rsvp-config";

const names = {
  title: { id: "Judul RSVP", en: "RSVP title" },
  inputs: { id: "Input RSVP", en: "RSVP inputs" },
  button: { id: "Button RSVP", en: "RSVP button" },
} as const;

export default function RsvpElementInspector({
  locale,
  elementKey,
  config,
  eventCategory,
  onConfig,
  onAddRsvpField,
  onUpdateRsvpField,
  onRemoveRsvpField,
  onClose,
}: {
  locale: string;
  elementKey: string;
  config: InvitationRsvpConfig;
  eventCategory: string;
  onConfig: (patch: Partial<InvitationRsvpConfig>) => void;
  onAddRsvpField: () => void;
  onUpdateRsvpField: (id: string, patch: { label?: string; required?: boolean }) => void;
  onRemoveRsvpField: (id: string) => void;
  onClose: () => void;
}) {
  const en = locale === "en";
  const displayName = elementKey === "inputs"
    ? (en ? names.inputs.en : names.inputs.id)
    : elementKey === "button"
      ? (en ? names.button.en : names.button.id)
      : (en ? names.title.en : names.title.id);
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

  const colorControl = (
    label: string,
    value: string | undefined,
    property: "background" | "color" | "borderColor",
    fallback: string,
  ) => (
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
          Default
        </button>
      </div>
    </div>
  );

  const alignments: { value: RsvpElementAlign; label: string; Icon: typeof AlignLeft }[] = [
    { value: "left", label: en ? "Align left" : "Rata kiri", Icon: AlignLeft },
    { value: "center", label: en ? "Align center" : "Rata tengah", Icon: AlignCenter },
    { value: "right", label: en ? "Align right" : "Rata kanan", Icon: AlignRight },
  ];

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

      {numeric(en ? "Width" : "Lebar", style.width, "100", 30, 100, "%", "width")}
      {numeric(en ? "Text size" : "Ukuran teks", style.fontSize, en ? "Template" : "Template", 10, 72, "px", "fontSize")}

      <div className="dc-studio-section-field">
        <span>{en ? "Alignment" : "Perataan"}</span>
        <div className="dc-studio-align-icons" role="group" aria-label={en ? "Alignment" : "Perataan"}>
          {alignments.map(({ value, label, Icon }) => (
            <button
              key={value}
              type="button"
              aria-pressed={style.align === value}
              aria-label={label}
              title={label}
              onClick={() => updateStyle({ align: value })}
            >
              <Icon size={15} />
            </button>
          ))}
        </div>
      </div>

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

      {elementKey === "inputs" && (
        <div className="dc-studio-rsvp-config">
          <div className="dc-studio-rsvp-config-title">
            <span>{en ? "RSVP fields" : "Field RSVP"}</span>
            {eventCategory !== "WEDDING" && <small>{en ? "Event choices are mainly used for weddings." : "Pilihan acara terutama dipakai untuk wedding."}</small>}
          </div>

          <label className="dc-studio-rsvp-switch">
            <span>{en ? "Wedding Ceremony" : "Upacara Nikah"}</span>
            <input type="checkbox" checked={config.ceremony} onChange={(event) => onConfig({ ceremony: event.target.checked })} />
          </label>
          <label className="dc-studio-rsvp-switch">
            <span>{en ? "Reception" : "Resepsi"}</span>
            <input type="checkbox" checked={config.reception} onChange={(event) => onConfig({ reception: event.target.checked })} />
          </label>
          <label className="dc-studio-rsvp-switch">
            <span>{en ? "Attend all" : "Hadir Semua Acara"}</span>
            <input
              type="checkbox"
              checked={config.attendAll}
              disabled={!(config.ceremony && config.reception)}
              onChange={(event) => onConfig({ attendAll: event.target.checked })}
            />
          </label>

          <div className="dc-studio-rsvp-fields">
            <div className="dc-studio-rsvp-fields-head">
              <span>{en ? "Columns" : "Kolom"}</span>
              <small>{config.customFields.length}/{MAX_RSVP_CUSTOM_FIELDS}</small>
            </div>
            <div className="dc-studio-rsvp-core-fields">
              <small>{en ? "Name" : "Nama"}</small>
              <small>WhatsApp</small>
              <small>{en ? "Attendance" : "Kehadiran"}</small>
              <small>{en ? "Companions" : "Pendamping"}</small>
            </div>
            {config.customFields.map((field) => (
              <div className="dc-studio-rsvp-custom-field" key={field.id}>
                <input
                  type="text"
                  value={field.label}
                  maxLength={60}
                  aria-label={en ? "Custom RSVP field label" : "Label field RSVP tambahan"}
                  onChange={(event) => onUpdateRsvpField(field.id, { label: event.target.value })}
                />
                <label title={en ? "Required field" : "Wajib diisi"}>
                  <input type="checkbox" checked={field.required} onChange={(event) => onUpdateRsvpField(field.id, { required: event.target.checked })} />
                  <span>{en ? "Req" : "Wajib"}</span>
                </label>
                <button type="button" onClick={() => onRemoveRsvpField(field.id)} aria-label={en ? "Remove custom field" : "Hapus field tambahan"} title={en ? "Remove field" : "Hapus field"}>×</button>
              </div>
            ))}
            <button
              type="button"
              className="dc-studio-rsvp-add"
              disabled={config.customFields.length >= MAX_RSVP_CUSTOM_FIELDS}
              onClick={onAddRsvpField}
            >
              + {en ? "Add column" : "Tambah Kolom"}
            </button>
          </div>
        </div>
      )}

      <button type="button" className="dc-studio-section-reset" onClick={reset}>
        <RotateCcw size={14} />
        {en ? "Reset component" : "Reset komponen"}
      </button>
    </aside>
  );
}
