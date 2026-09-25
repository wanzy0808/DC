"use client";

import type { InvitationAssetLayer } from "@/lib/templates/asset-layers";
import { MAX_ASSET_LAYERS, studioObjectSections, type StudioObjectSection } from "@/lib/templates/asset-layers";
import { invitationSectionItems, type InvitationSections } from "@/lib/templates/sections";

type AssetLayerInspectorProps = {
  locale: string;
  selectedAssetLayer: InvitationAssetLayer | undefined;
  selectedAssetIndex: number;
  layerCount: number;
  sections: InvitationSections;
  onDeselect: () => void;
  onUpdate: (id: string, patch: Partial<InvitationAssetLayer>) => void;
  onPosition: (id: string, position: "front" | "back") => void;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export default function AssetLayerInspector({
  locale,
  selectedAssetLayer,
  selectedAssetIndex,
  layerCount,
  sections,
  onDeselect,
  onUpdate,
  onPosition,
}: AssetLayerInspectorProps) {
  if (!selectedAssetLayer) return null;
  const en = locale === "en";
  const section = selectedAssetLayer.section ?? "cover";

  const numberInput = (
    label: string,
    value: number,
    min: number,
    max: number,
    step: number,
    suffix: string,
    update: (next: number) => void,
  ) => (
    <label className="dc-studio-layer-field">
      <span>{label}</span>
      <span className="dc-studio-layer-number">
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={Number.isInteger(value) ? value : Number(value.toFixed(1))}
          onFocus={(event) => event.currentTarget.select()}
          onChange={(event) => {
            const next = event.currentTarget.valueAsNumber;
            if (Number.isFinite(next)) update(clamp(next, min, max));
          }}
        />
        <small>{suffix}</small>
      </span>
    </label>
  );

  return (
    <aside className="dc-studio-layer-side" aria-label={en ? "Asset properties" : "Properti aset"}>
      <div className="dc-studio-layer-side-head">
        <strong>{en ? "Asset" : "Asset"} {selectedAssetIndex + 1}/{MAX_ASSET_LAYERS}</strong>
        <button type="button" onClick={onDeselect} aria-label={en ? "Close asset properties" : "Tutup properti aset"} title={en ? "Close" : "Tutup"}>×</button>
      </div>

      <label className="dc-studio-layer-select">
        <span>{en ? "Section" : "Bagian"}</span>
        <select
          value={section}
          onChange={(event) => onUpdate(selectedAssetLayer.id, { section: event.target.value as StudioObjectSection })}
        >
          {invitationSectionItems
            .filter((item) => studioObjectSections.includes(item.key as StudioObjectSection) && (sections[item.key] !== false || item.key === section))
            .map((item) => <option key={item.key} value={item.key}>{item.title}</option>)}
        </select>
      </label>

      <div className="dc-studio-layer-grid">
        {numberInput("X", selectedAssetLayer.x, 0, 100, 0.1, "%", (x) => onUpdate(selectedAssetLayer.id, { x }))}
        {numberInput("Y", selectedAssetLayer.y, 0, 100, 0.1, "%", (y) => onUpdate(selectedAssetLayer.id, { y }))}
      </div>

      {numberInput(en ? "Size" : "Size", selectedAssetLayer.width, 5, 85, 0.1, "%", (width) => onUpdate(selectedAssetLayer.id, { width }))}
      {numberInput(en ? "Rotation" : "Rotasi", selectedAssetLayer.rotation ?? 0, -180, 180, 1, "°", (rotation) => onUpdate(selectedAssetLayer.id, { rotation }))}

      <label className="dc-studio-layer-opacity">
        <span>{en ? "Opacity" : "Opasitas"} <output>{Math.round(selectedAssetLayer.opacity * 100)}%</output></span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={selectedAssetLayer.opacity}
          aria-label={en ? "Asset opacity" : "Opasitas aset"}
          onChange={(event) => onUpdate(selectedAssetLayer.id, { opacity: Number(event.target.value) })}
        />
      </label>

      <label className="dc-studio-layer-select">
        <span>{en ? "Layer" : "Layer"}</span>
        <select
          value={selectedAssetIndex === 0 ? "back" : selectedAssetIndex === layerCount - 1 ? "front" : ""}
          onChange={(event) => onPosition(selectedAssetLayer.id, event.target.value as "front" | "back")}
        >
          <option value="" disabled>{en ? "Choose" : "Pilih"}</option>
          <option value="front">{en ? "Front" : "Depan"}</option>
          <option value="back">{en ? "Back" : "Belakang"}</option>
        </select>
      </label>
    </aside>
  );
}
