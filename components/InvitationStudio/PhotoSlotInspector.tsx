"use client";

import { Play, RotateCcw } from "lucide-react";
import type { PhotoMotion, PhotoSlot } from "@/lib/templates/photo-slots";
import {
  getSectionAnimationPreset,
  sectionAnimationGroups,
  sectionAnimationPresets,
  type InvitationSectionAnimation,
} from "@/lib/templates/section-animations";

const labels: Record<PhotoSlot, { id: string; en: string }> = {
  cover: { id: "Foto cover", en: "Cover photo" },
  personOne: { id: "Foto mempelai pertama", en: "First portrait" },
  personTwo: { id: "Foto mempelai kedua", en: "Second portrait" },
  gallery: { id: "Galeri foto", en: "Photo gallery" },
};

export default function PhotoSlotInspector({
  locale,
  slot,
  motion,
  onUpdate,
  onReset,
  onClose,
}: {
  locale: string;
  slot: PhotoSlot;
  motion: PhotoMotion | undefined;
  onUpdate: (patch: Partial<PhotoMotion>) => void;
  onReset: () => void;
  onClose: () => void;
}) {
  const en = locale === "en";
  const preset = getSectionAnimationPreset(motion?.animation);

  return (
    <aside className="dc-studio-layer-side" aria-label={en ? "Photo properties" : "Properti foto"}>
      <div className="dc-studio-layer-side-head">
        <strong>{en ? labels[slot].en : labels[slot].id}</strong>
        <button type="button" onClick={onClose} aria-label={en ? "Close photo properties" : "Tutup properti foto"} title={en ? "Close" : "Tutup"}>×</button>
      </div>

      <label className="dc-studio-layer-select">
        <span>{en ? "Animation" : "Animasi"}</span>
        <select
          value={motion?.animation && motion.animation !== "none" ? motion.animation : ""}
          onChange={(event) => {
            const animation = event.target.value as InvitationSectionAnimation | "";
            onUpdate(animation
              ? { animation, animationDuration: undefined }
              : { animation: undefined, animationDuration: undefined, animationDelay: undefined, animationStagger: undefined });
          }}
        >
          <option value="">{en ? "No animation" : "Tanpa animasi"}</option>
          {sectionAnimationGroups.map((group) => (
            <optgroup key={group.key} label={en ? group.labelEn : group.labelId}>
              {sectionAnimationPresets
                .filter((item) => item.group === group.key)
                .map((item) => (
                  <option key={item.key} value={item.key}>
                    {en ? item.labelEn : item.labelId}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
      </label>

      {motion?.animation && motion.animation !== "none" ? (
        <>
          <button
            type="button"
            className="flex min-h-9 items-center justify-center gap-2 rounded-[var(--dc-control-radius)] border border-primary/30 px-3 text-xs font-medium text-primary hover:bg-primary/10"
            onClick={() => {
              document.querySelectorAll<HTMLElement>(
                `[data-invitation-photo-slot="${CSS.escape(slot)}"]`,
              ).forEach((node) => {
                node.getAnimations({ subtree: true }).forEach((animation) => {
                  animation.cancel();
                  animation.play();
                });
              });
            }}
          >
            <Play size={13} aria-hidden="true" />
            {en ? "Preview animation" : "Preview animasi"}
          </button>

          <div className="dc-studio-layer-grid">
            <label className="dc-studio-layer-field">
              <span>{en ? "Duration" : "Durasi"}</span>
              <span className="dc-studio-layer-number">
                <input
                  type="number"
                  min="0.2"
                  max="2.5"
                  step="0.1"
                  value={motion.animationDuration ?? preset?.duration ?? 0.7}
                  onChange={(event) => {
                    const next = event.currentTarget.valueAsNumber;
                    if (Number.isFinite(next)) onUpdate({ animationDuration: Math.min(2.5, Math.max(0.2, next)) });
                  }}
                />
                <small>s</small>
              </span>
            </label>
            <label className="dc-studio-layer-field">
              <span>{en ? "Delay" : "Jeda"}</span>
              <span className="dc-studio-layer-number">
                <input
                  type="number"
                  min="0"
                  max="2"
                  step="0.1"
                  value={motion.animationDelay ?? 0}
                  onChange={(event) => {
                    const next = event.currentTarget.valueAsNumber;
                    if (Number.isFinite(next)) onUpdate({ animationDelay: Math.min(2, Math.max(0, next)) });
                  }}
                />
                <small>s</small>
              </span>
            </label>
          </div>

          {slot === "gallery" ? (
            <label className="dc-studio-layer-field">
              <span>{en ? "Photo stagger" : "Jeda antar foto"}</span>
              <span className="dc-studio-layer-number">
                <input
                  type="number"
                  min="0.01"
                  max="0.2"
                  step="0.01"
                  value={motion.animationStagger ?? 0.08}
                  onChange={(event) => {
                    const next = event.currentTarget.valueAsNumber;
                    if (Number.isFinite(next)) onUpdate({ animationStagger: Math.min(0.2, Math.max(0.01, next)) });
                  }}
                />
                <small>s</small>
              </span>
            </label>
          ) : null}
        </>
      ) : null}

      <label className="dc-studio-layer-opacity">
        <span className="flex items-center justify-between gap-2">
          <span>{en ? "Parallax" : "Parallax"}</span>
          <output>{Math.round(motion?.parallax ?? 0)}px</output>
        </span>
        <input
          type="range"
          min="0"
          max="20"
          step="1"
          value={motion?.parallax ?? 0}
          onChange={(event) => {
            const parallax = Number(event.target.value);
            onUpdate({ parallax: parallax > 0 ? parallax : undefined });
          }}
        />
      </label>

      <button type="button" className="dc-studio-section-reset" onClick={onReset}>
        <RotateCcw size={14} />
        Reset
      </button>
    </aside>
  );
}
