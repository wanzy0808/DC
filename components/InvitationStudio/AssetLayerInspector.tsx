"use client";

import { Eye, EyeOff, Lock, Unlock } from "lucide-react";
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
  onPosition: (id: string, position: "front" | "forward" | "backward" | "back") => void;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function LayerStackIcon({ action }: { action: "front" | "forward" | "backward" | "back" }) {
  const up = action === "front" || action === "forward";
  const edge = action === "front" || action === "back";
  return (
    <svg viewBox="0 0 24 24" width="19" height="19" fill="none" aria-hidden="true">
      <rect x="3.5" y="8.5" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" opacity={action === "back" ? 1 : 0.38} />
      <rect x="6.5" y="5.5" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" opacity={action === "forward" || action === "backward" ? 1 : 0.58} />
      <rect x="9.5" y="2.5" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" opacity={action === "front" ? 1 : 0.78} />
      <path
        d={up ? "M18.5 18.5v-5m0 0-2 2m2-2 2 2" : "M18.5 13.5v5m0 0-2-2m2 2 2-2"}
        stroke="currentColor"
        strokeWidth={edge ? 1.8 : 1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {edge && <path d={up ? "M16 11.5h5" : "M16 20.5h5"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />}
    </svg>
  );
}

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

      <label className="dc-studio-layer-field">
        <span>{en ? "Layer name" : "Nama layer"}</span>
        <input
          type="text"
          maxLength={60}
          value={selectedAssetLayer.name ?? ""}
          placeholder={en ? "Optional" : "Opsional"}
          onChange={(event) => onUpdate(selectedAssetLayer.id, { name: event.target.value || undefined })}
          className="h-10 rounded-[var(--dc-control-radius)] border border-primary/30 bg-background px-3 text-xs outline-none focus:border-primary"
        />
      </label>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          className="flex min-h-10 items-center justify-center gap-2 rounded-[var(--dc-control-radius)] border border-primary/40 px-2 text-xs font-medium text-primary hover:bg-primary/10"
          aria-pressed={Boolean(selectedAssetLayer.locked)}
          onClick={() => onUpdate(selectedAssetLayer.id, { locked: selectedAssetLayer.locked ? undefined : true })}
          title={selectedAssetLayer.locked ? (en ? "Unlock layer" : "Buka kunci layer") : (en ? "Lock layer" : "Kunci layer")}
        >
          {selectedAssetLayer.locked ? <Lock size={14} /> : <Unlock size={14} />}
          {selectedAssetLayer.locked ? (en ? "Locked" : "Terkunci") : (en ? "Lock" : "Kunci")}
        </button>
        <button
          type="button"
          className="flex min-h-10 items-center justify-center gap-2 rounded-[var(--dc-control-radius)] border border-primary/40 px-2 text-xs font-medium text-primary hover:bg-primary/10"
          aria-pressed={!selectedAssetLayer.hidden}
          onClick={() => onUpdate(selectedAssetLayer.id, { hidden: selectedAssetLayer.hidden ? undefined : true })}
          title={selectedAssetLayer.hidden ? (en ? "Show layer" : "Tampilkan layer") : (en ? "Hide layer" : "Sembunyikan layer")}
        >
          {selectedAssetLayer.hidden ? <EyeOff size={14} /> : <Eye size={14} />}
          {selectedAssetLayer.hidden ? (en ? "Hidden" : "Tersembunyi") : (en ? "Visible" : "Terlihat")}
        </button>
      </div>

      <fieldset disabled={Boolean(selectedAssetLayer.locked)} className="contents disabled:opacity-55">
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

      <div className="dc-studio-layer-field">
        <span>{en ? "Quick position" : "Posisi cepat"}</span>
        <div className="grid grid-cols-3 gap-1.5">
          <button type="button" className="min-h-9 rounded-lg border border-primary/30 px-2 text-[10px] hover:bg-primary/10" onClick={() => onUpdate(selectedAssetLayer.id, { x: 50 })}>{en ? "Center X" : "Tengah X"}</button>
          <button type="button" className="min-h-9 rounded-lg border border-primary/30 px-2 text-[10px] hover:bg-primary/10" onClick={() => onUpdate(selectedAssetLayer.id, { y: 50 })}>{en ? "Center Y" : "Tengah Y"}</button>
          <button type="button" className="min-h-9 rounded-lg border border-primary/30 px-2 text-[10px] hover:bg-primary/10" onClick={() => onUpdate(selectedAssetLayer.id, { x: 50, y: 50 })}>{en ? "Center" : "Tengah"}</button>
        </div>
      </div>

      <div className="dc-studio-layer-field">
        <span>{en ? "Flip" : "Balik"}</span>
        <div className="grid grid-cols-2 gap-1.5">
          <button type="button" className="min-h-9 rounded-lg border border-primary/30 px-2 text-[10px] hover:bg-primary/10" aria-pressed={Boolean(selectedAssetLayer.flipX)} onClick={() => onUpdate(selectedAssetLayer.id, { flipX: selectedAssetLayer.flipX ? undefined : true })}>{en ? "Horizontal" : "Horizontal"}</button>
          <button type="button" className="min-h-9 rounded-lg border border-primary/30 px-2 text-[10px] hover:bg-primary/10" aria-pressed={Boolean(selectedAssetLayer.flipY)} onClick={() => onUpdate(selectedAssetLayer.id, { flipY: selectedAssetLayer.flipY ? undefined : true })}>{en ? "Vertical" : "Vertikal"}</button>
        </div>
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

      <div className="dc-studio-layer-field">
        <span>{en ? "Layer order" : "Urutan layer"}</span>
        <div className="dc-studio-layer-order" role="group" aria-label={en ? "Layer order" : "Urutan layer"}>
          <button
            type="button"
            onClick={() => onPosition(selectedAssetLayer.id, "front")}
            disabled={selectedAssetIndex === layerCount - 1}
            aria-label={en ? "Bring to front" : "Paling depan"}
            title={en ? "Bring to Front" : "Paling depan"}
          >
            <LayerStackIcon action="front" />
          </button>
          <button
            type="button"
            onClick={() => onPosition(selectedAssetLayer.id, "forward")}
            disabled={selectedAssetIndex === layerCount - 1}
            aria-label={en ? "Bring forward one layer" : "Naik 1 layer"}
            title={en ? "Bring Forward" : "Naik 1 layer"}
          >
            <LayerStackIcon action="forward" />
          </button>
          <button
            type="button"
            onClick={() => onPosition(selectedAssetLayer.id, "backward")}
            disabled={selectedAssetIndex === 0}
            aria-label={en ? "Send backward one layer" : "Turun 1 layer"}
            title={en ? "Send Backward" : "Turun 1 layer"}
          >
            <LayerStackIcon action="backward" />
          </button>
          <button
            type="button"
            onClick={() => onPosition(selectedAssetLayer.id, "back")}
            disabled={selectedAssetIndex === 0}
            aria-label={en ? "Send to back" : "Paling belakang"}
            title={en ? "Send to Back" : "Paling belakang"}
          >
            <LayerStackIcon action="back" />
          </button>
        </div>
      </div>
      </fieldset>
    </aside>
  );
}
