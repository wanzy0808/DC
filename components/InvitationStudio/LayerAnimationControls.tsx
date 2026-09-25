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
              : { animation: undefined, animationDuration: undefined, animationDelay: undefined, textAnimationUnit: undefined, animationStagger: undefined });
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
        <>
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

          {layer.kind === "text" ? (
            <>
              <label className="dc-studio-layer-select">
                <span>{en ? "Text motion" : "Gerak teks"}</span>
                <select
                  value={layer.textAnimationUnit ?? "whole"}
                  onChange={(event) => {
                    const unit = event.target.value as "whole" | "word" | "character" | "line";
                    onUpdate(layer.id, {
                      textAnimationUnit: unit === "whole" ? undefined : unit,
                      animationStagger: unit === "whole" ? undefined : layer.animationStagger,
                    });
                  }}
                >
                  <option value="whole">{en ? "Whole box" : "Satu kotak"}</option>
                  <option value="word">{en ? "By word" : "Per kata"}</option>
                  <option value="character">{en ? "By character" : "Per huruf"}</option>
                  <option value="line">{en ? "By line" : "Per baris"}</option>
                </select>
              </label>

              {layer.textAnimationUnit ? (
                <label className="dc-studio-layer-field">
                  <span>{en ? "Stagger" : "Jarak gerak"}</span>
                  <span className="dc-studio-layer-number">
                    <input
                      type="number"
                      min="0.01"
                      max="0.15"
                      step="0.01"
                      value={layer.animationStagger ?? (layer.textAnimationUnit === "character" ? 0.025 : layer.textAnimationUnit === "line" ? 0.1 : 0.06)}
                      onChange={(event) => {
                        const next = event.currentTarget.valueAsNumber;
                        if (Number.isFinite(next)) {
                          onUpdate(layer.id, { animationStagger: Math.min(0.15, Math.max(0.01, next)) });
                        }
                      }}
                    />
                    <small>s</small>
                  </span>
                </label>
              ) : null}
            </>
          ) : null}
        </>
      ) : null}
    </>
  );
}
