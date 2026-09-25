"use client";

import { Play } from "lucide-react";
import type { EditableInvitationCopyField } from "@/lib/templates/editable-copy";
import type {
  EditableCopyMotion,
  EditableCopyMotionUnit,
} from "@/lib/templates/editable-copy-motion";
import {
  getSectionAnimationPreset,
  sectionAnimationGroups,
  sectionAnimationPresets,
  type InvitationSectionAnimation,
} from "@/lib/templates/section-animations";

export default function CopyMotionControls({
  locale,
  field,
  motion,
  onUpdate,
}: {
  locale: string;
  field: EditableInvitationCopyField;
  motion: EditableCopyMotion | undefined;
  onUpdate: (patch: Partial<EditableCopyMotion>) => void;
}) {
  const en = locale === "en";
  const preset = getSectionAnimationPreset(motion?.animation);

  return (
    <>
      <label className="dc-studio-section-field">
        <span>{en ? "Animation" : "Animasi"}</span>
        <select
          value={motion?.animation && motion.animation !== "none" ? motion.animation : ""}
          onChange={(event) => {
            const animation = event.target.value as InvitationSectionAnimation | "";
            onUpdate(animation
              ? { animation, animationDuration: undefined }
              : { animation: undefined, animationDuration: undefined, animationDelay: undefined, unit: undefined, stagger: undefined });
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
                `[data-studio-copy-field="${CSS.escape(field)}"]`,
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
            <label className="dc-studio-section-field">
              <span>{en ? "Duration" : "Durasi"}</span>
              <span className="dc-studio-section-number">
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
            <label className="dc-studio-section-field">
              <span>{en ? "Delay" : "Jeda"}</span>
              <span className="dc-studio-section-number">
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

          <label className="dc-studio-section-field">
            <span>{en ? "Text motion" : "Gerak teks"}</span>
            <select
              value={motion.unit ?? "whole"}
              onChange={(event) => {
                const unit = event.target.value as EditableCopyMotionUnit;
                onUpdate({
                  unit: unit === "whole" ? undefined : unit,
                  stagger: unit === "whole" ? undefined : motion.stagger,
                });
              }}
            >
              <option value="whole">{en ? "Whole block" : "Satu blok"}</option>
              <option value="word">{en ? "By word" : "Per kata"}</option>
              <option value="character">{en ? "By character" : "Per huruf"}</option>
              <option value="line">{en ? "By line" : "Per baris"}</option>
            </select>
          </label>

          {motion.unit ? (
            <label className="dc-studio-section-field">
              <span>{en ? "Stagger" : "Jarak gerak"}</span>
              <span className="dc-studio-section-number">
                <input
                  type="number"
                  min="0.01"
                  max="0.15"
                  step="0.01"
                  value={motion.stagger ?? (motion.unit === "character" ? 0.025 : motion.unit === "line" ? 0.1 : 0.06)}
                  onChange={(event) => {
                    const next = event.currentTarget.valueAsNumber;
                    if (Number.isFinite(next)) onUpdate({ stagger: Math.min(0.15, Math.max(0.01, next)) });
                  }}
                />
                <small>s</small>
              </span>
            </label>
          ) : null}
        </>
      ) : null}
    </>
  );
}
