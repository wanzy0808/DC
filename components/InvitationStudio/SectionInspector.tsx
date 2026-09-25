"use client";

import { AlignCenter, AlignLeft, AlignRight, RotateCcw } from "lucide-react";
import { invitationSectionItems, type InvitationSectionKey } from "@/lib/templates/sections";
import type { InvitationSectionAlign, InvitationSectionStyle } from "@/lib/templates/section-styles";
import {
  getSectionAnimationPreset,
  sectionAnimationGroups,
  sectionAnimationPresets,
  type InvitationSectionAnimation,
} from "@/lib/templates/section-animations";

export default function SectionInspector({
  locale,
  sectionKey,
  style,
  onUpdate,
  onReset,
  onClose,
}: {
  locale: string;
  sectionKey: InvitationSectionKey;
  style: InvitationSectionStyle | undefined;
  onUpdate: (patch: Partial<InvitationSectionStyle>) => void;
  onReset: () => void;
  onClose: () => void;
}) {
  const en = locale === "en";
  const title = invitationSectionItems.find((item) => item.key === sectionKey)?.title ?? sectionKey;
  const selectedAnimationPreset = getSectionAnimationPreset(style?.animation);
  const optionalNumber = (
    label: string,
    value: number | undefined,
    placeholder: string,
    min: number,
    max: number,
    suffix: string,
    key: "paddingY",
  ) => (
    <label className="dc-studio-section-field">
      <span>{label}</span>
      <span className="dc-studio-section-number">
        <input
          type="number"
          min={min}
          max={max}
          step={1}
          value={value ?? ""}
          placeholder={placeholder}
          onChange={(event) => {
            const raw = event.currentTarget.value;
            if (!raw) return onUpdate({ [key]: undefined });
            const next = event.currentTarget.valueAsNumber;
            if (Number.isFinite(next)) onUpdate({ [key]: Math.min(max, Math.max(min, next)) });
          }}
        />
        <small>{suffix}</small>
      </span>
    </label>
  );

  const alignments: { value: InvitationSectionAlign; label: string; Icon: typeof AlignLeft }[] = [
    { value: "left", label: en ? "Align left" : "Rata kiri", Icon: AlignLeft },
    { value: "center", label: en ? "Align center" : "Rata tengah", Icon: AlignCenter },
    { value: "right", label: en ? "Align right" : "Rata kanan", Icon: AlignRight },
  ];

  return (
    <aside className="dc-studio-section-side" aria-label={en ? "Section properties" : "Properti section"}>
      <div className="dc-studio-section-side-head">
        <div className="min-w-0">
          <span>Section</span>
          <strong title={title}>{title}</strong>
        </div>
        <button type="button" onClick={onClose} aria-label={en ? "Close section properties" : "Tutup properti section"} title={en ? "Close" : "Tutup"}>×</button>
      </div>

      <div className="dc-studio-section-field">
        <span>{en ? "Alignment" : "Perataan"}</span>
        <div className="dc-studio-align-icons" role="group" aria-label={en ? "Alignment" : "Perataan"}>
          {alignments.map(({ value, label, Icon }) => (
            <button
              key={value}
              type="button"
              aria-pressed={style?.align === value}
              aria-label={label}
              title={label}
              onClick={() => onUpdate({ align: value })}
            >
              <Icon size={15} />
            </button>
          ))}
        </div>
      </div>

      {optionalNumber(en ? "Vertical space" : "Ruang vertikal", style?.paddingY, en ? "Template" : "Template", 0, 160, "px", "paddingY")}

      <label className="dc-studio-section-field">
        <span className="flex items-center justify-between gap-2">
          <span>{en ? "Opacity" : "Opasitas"}</span>
          <output>{Math.round((style?.opacity ?? 1) * 100)}%</output>
        </span>
        <input
          type="range"
          min="0.2"
          max="1"
          step="0.05"
          value={style?.opacity ?? 1}
          onChange={(event) => onUpdate({ opacity: Number(event.target.value) })}
        />
      </label>

      <div className="dc-studio-section-field">
        <span>{en ? "Animation" : "Animasi"}</span>
        <select
          value={style?.animation ?? ""}
          onChange={(event) => {
            const value = event.target.value as InvitationSectionAnimation | "";
            onUpdate({ animation: value || undefined, animationDuration: undefined });
          }}
        >
          <option value="">{en ? "Follow template" : "Ikuti template"}</option>
          <option value="none">{en ? "Off" : "Mati"}</option>
          {sectionAnimationGroups.map((group) => (
            <optgroup key={group.key} label={en ? group.labelEn : group.labelId}>
              {sectionAnimationPresets
                .filter((preset) => preset.group === group.key)
                .map((preset) => (
                  <option key={preset.key} value={preset.key}>
                    {en ? preset.labelEn : preset.labelId}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
      </div>

      {style?.animation && style.animation !== "none" ? (
        <div className="dc-studio-layer-grid">
          <label className="dc-studio-section-field">
            <span>{en ? "Duration" : "Durasi"}</span>
            <span className="dc-studio-section-number">
              <input
                type="number"
                min="0.2"
                max="2.5"
                step="0.1"
                value={style.animationDuration ?? selectedAnimationPreset?.duration ?? 0.7}
                onChange={(event) => {
                  const next = event.currentTarget.valueAsNumber;
                  if (Number.isFinite(next)) onUpdate({ animationDuration: Math.min(2.5, Math.max(0.2, next)) });
                }}
              />
              <small>s</small>
            </span>
          </label>
          <label className="dc-studio-section-field">
            <span>{en ? "Delay" : "Jeda"}</span>
            <span className="dc-studio-section-number">
              <input
                type="number"
                min="0"
                max="2"
                step="0.1"
                value={style.animationDelay ?? 0}
                onChange={(event) => {
                  const next = event.currentTarget.valueAsNumber;
                  if (Number.isFinite(next)) onUpdate({ animationDelay: Math.min(2, Math.max(0, next)) });
                }}
              />
              <small>s</small>
            </span>
          </label>
        </div>
      ) : null}

      <div className="dc-studio-section-field">
        <span>{en ? "Background" : "Latar"}</span>
        <div className="dc-studio-section-color">
          <input
            type="color"
            value={style?.background ?? "#ffffff"}
            aria-label={en ? "Section background color" : "Warna latar section"}
            title={en ? "Choose section background" : "Pilih warna latar section"}
            onChange={(event) => onUpdate({ background: event.target.value })}
          />
          <output>{style?.background?.toUpperCase() ?? (en ? "Theme" : "Tema")}</output>
        </div>
      </div>

      <button type="button" className="dc-studio-section-reset" onClick={onReset}>
        <RotateCcw size={14} />
        Reset
      </button>
    </aside>
  );
}
