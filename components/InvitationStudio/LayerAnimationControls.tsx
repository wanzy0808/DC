"use client";

import type { InvitationAssetLayer } from "@/lib/templates/asset-layers";
import {
  getSectionAnimationPreset,
  sectionAnimationGroups,
  sectionAnimationPresets,
  type InvitationSectionAnimation,
} from "@/lib/templates/section-animations";

export default function LayerAnimationControls({
  locale,
  layer,
  onUpdate,
}: {
  locale: string;
  layer: InvitationAssetLayer;
  onUpdate: (id: string, patch: Partial<InvitationAssetLayer>) => void;
}) {
  const en = locale === "en";
  const preset = getSectionAnimationPreset(layer.animation);

  return (
    <>
      <label className="dc-studio-layer-select">
        <span>{en ? "Animation" : "Animasi"}</span>
        <select
          value={layer.animation && layer.animation !== "none" ? layer.animation : ""}
          onChange={(event) => {
            const value = event.target.value as InvitationSectionAnimation | "";
            onUpdate(layer.id, value
              ? { animation: value, animationDuration: undefined }
              : { animation: undefined, animationDuration: undefined, animationDelay: undefined });
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

      {layer.animation && layer.animation !== "none" ? (
        <div className="dc-studio-layer-grid">
          <label className="dc-studio-layer-field">
            <span>{en ? "Duration" : "Durasi"}</span>
            <span className="dc-studio-layer-number">
              <input
                type="number"
                min="0.2"
                max="2.5"
                step="0.1"
                value={layer.animationDuration ?? preset?.duration ?? 0.7}
                onChange={(event) => {
                  const next = event.currentTarget.valueAsNumber;
                  if (Number.isFinite(next)) {
                    onUpdate(layer.id, { animationDuration: Math.min(2.5, Math.max(0.2, next)) });
                  }
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
                value={layer.animationDelay ?? 0}
                onChange={(event) => {
                  const next = event.currentTarget.valueAsNumber;
                  if (Number.isFinite(next)) {
                    onUpdate(layer.id, { animationDelay: Math.min(2, Math.max(0, next)) });
                  }
                }}
              />
              <small>s</small>
            </span>
          </label>
        </div>
      ) : null}
    </>
  );
}
