"use client";

import { AlignCenter, AlignLeft, AlignRight, RotateCcw } from "lucide-react";
import type { InvitationSectionKey } from "@/lib/templates/sections";
import {
  makeSectionElementKey,
  type StudioSectionElementAlign,
  type StudioSectionElementKind,
  type StudioSectionElementStyle,
  type StudioSectionElementStyles,
} from "@/lib/templates/section-element-styles";

const sectionLabels: Partial<Record<InvitationSectionKey, { id: string; en: string }>> = {
  location: { id: "Lokasi", en: "Location" },
  wishes: { id: "Ucapan Tamu", en: "Guest Wishes" },
  gift: { id: "Hadiah / E-Angpao", en: "Gift / E-Angpao" },
};

export default function SectionElementInspector({
  locale,
  section,
  kind,
  styles,
  onChange,
  onClose,
}: {
  locale: string;
  section: InvitationSectionKey;
  kind: StudioSectionElementKind;
  styles: StudioSectionElementStyles;
  onChange: (styles: StudioSectionElementStyles) => void;
  onClose: () => void;
}) {
  const en = locale === "en";
  const key = makeSectionElementKey(section, kind);
  const style = styles[key] ?? {};
  const sectionName = en ? sectionLabels[section]?.en ?? section : sectionLabels[section]?.id ?? section;
  const title = `${sectionName} · ${kind === "input" ? "Input" : "Button"}`;

  function update(patch: Partial<StudioSectionElementStyle>) {
    const next = { ...style, ...patch };
    for (const [property, value] of Object.entries(next)) {
      if (value === undefined) delete (next as Record<string, unknown>)[property];
    }
    const all = { ...styles };
    if (Object.keys(next).length) all[key] = next;
    else delete all[key];
    onChange(all);
  }

  function reset() {
    const all = { ...styles };
    delete all[key];
    onChange(all);
  }

  const numeric = (
    label: string,
    value: number | undefined,
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
          placeholder={property === "width" ? "100" : "Template"}
          onChange={(event) => {
            if (!event.currentTarget.value) return update({ [property]: undefined });
            const next = event.currentTarget.valueAsNumber;
            if (Number.isFinite(next)) update({ [property]: Math.min(max, Math.max(min, next)) });
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
        <input type="color" value={value ?? fallback} aria-label={label} onChange={(event) => update({ [property]: event.target.value })} />
        <button type="button" onClick={() => update({ [property]: undefined })}>Default</button>
      </div>
    </div>
  );

  const aligns: { value: StudioSectionElementAlign; label: string; Icon: typeof AlignLeft }[] = [
    { value: "left", label: en ? "Align left" : "Rata kiri", Icon: AlignLeft },
    { value: "center", label: en ? "Align center" : "Rata tengah", Icon: AlignCenter },
    { value: "right", label: en ? "Align right" : "Rata kanan", Icon: AlignRight },
  ];

  return (
    <aside className="dc-studio-section-side" aria-label={en ? "Component properties" : "Properti komponen"}>
      <div className="dc-studio-section-side-head">
        <div className="min-w-0">
          <strong title={title}>{title}</strong>
        </div>
        <button type="button" onClick={onClose} aria-label={en ? "Close component properties" : "Tutup properti komponen"} title={en ? "Close" : "Tutup"}>×</button>
      </div>

      {numeric(en ? "Width" : "Lebar", style.width, 30, 100, "%", "width")}
      {numeric(en ? "Text size" : "Ukuran teks", style.fontSize, 10, 72, "px", "fontSize")}

      <div className="dc-studio-section-field">
        <span>{en ? "Alignment" : "Perataan"}</span>
        <div className="dc-studio-align-icons" role="group" aria-label={en ? "Alignment" : "Perataan"}>
          {aligns.map(({ value, label, Icon }) => (
            <button key={value} type="button" aria-pressed={style.align === value} aria-label={label} title={label} onClick={() => update({ align: value })}>
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
        <input type="range" min="0.2" max="1" step="0.05" value={style.opacity ?? 1} onChange={(event) => update({ opacity: Number(event.target.value) })} />
      </label>

      {colorControl(en ? "Background" : "Latar", style.background, "background", "#ffffff")}
      {colorControl(en ? "Text" : "Teks", style.color, "color", "#222222")}
      {colorControl(en ? "Border" : "Garis", style.borderColor, "borderColor", "#c07a84")}

      <button type="button" className="dc-studio-section-reset" onClick={reset}>
        <RotateCcw size={14} />
        Reset
      </button>
    </aside>
  );
}
