"use client";

import { ArrowDown, ArrowUp, ClipboardPaste, Copy, Trash2 } from "lucide-react";
import type { InvitationAssetLayer } from "@/lib/templates/asset-layers";
import { MAX_ASSET_LAYERS } from "@/lib/templates/asset-layers";

type AssetLayerInspectorProps = {
  locale: string;
  selectedAssetLayer: InvitationAssetLayer | undefined;
  selectedAssetIndex: number;
  copiedAssetLayer: InvitationAssetLayer | null;
  layerCount: number;
  onDeselect: () => void;
  onUpdate: (id: string, patch: Partial<InvitationAssetLayer>) => void;
  onReorder: (id: string, direction: -1 | 1) => void;
  onCopy: () => void;
  onRemove: (id: string) => void;
  onPaste: () => void;
};

/** Contextual Cover illustration controls. All persisted state remains in InvitationDesigner. */
export default function AssetLayerInspector({
  locale, selectedAssetLayer, selectedAssetIndex, copiedAssetLayer, layerCount,
  onDeselect, onUpdate, onReorder, onCopy, onRemove, onPaste,
}: AssetLayerInspectorProps) {
  if (!selectedAssetLayer && !copiedAssetLayer) return null;

  return (
    <aside className="dc-studio-layer-side" aria-label={locale === "en" ? "Illustration layer tools" : "Alat layer ilustrasi"}>
    <div className="flex items-center justify-between gap-2">
    <span className="text-sm font-semibold text-primary">{locale === "en" ? "Layer" : "Layer"} {selectedAssetLayer ? `${selectedAssetIndex + 1}/${layerCount}` : ""}</span>
    {selectedAssetLayer && <button type="button" onClick={() => onDeselect()} aria-label={locale === "en" ? "Deselect layer" : "Batalkan pilihan layer"} className="text-xs text-primary hover:underline">✕</button>}
    </div>
    {selectedAssetLayer && <>
    <label className="mt-3 block space-y-2 text-xs text-foreground">
    <span className="flex justify-between gap-2"><span>{locale === "en" ? "Opacity" : "Opasitas"}</span><output>{Math.round(selectedAssetLayer.opacity * 100)}%</output></span>
    <input type="range" min="0" max="1" step="0.05" value={selectedAssetLayer.opacity} aria-label={locale === "en" ? "Layer opacity" : "Opasitas layer"} className="w-full accent-primary" onChange={(event) => onUpdate(selectedAssetLayer.id, { opacity: Number(event.target.value) })} />
    </label>
    <div className="mt-3 grid grid-cols-2 gap-2">
    <button type="button" className="dc-studio-layer-action" disabled={selectedAssetIndex === 0} onClick={() => onReorder(selectedAssetLayer.id, -1)} title={locale === "en" ? "Send backward" : "Ke belakang"}><ArrowDown size={16} />{locale === "en" ? "Back" : "Belakang"}</button>
    <button type="button" className="dc-studio-layer-action" disabled={selectedAssetIndex === layerCount - 1} onClick={() => onReorder(selectedAssetLayer.id, 1)} title={locale === "en" ? "Bring forward" : "Ke depan"}><ArrowUp size={16} />{locale === "en" ? "Front" : "Depan"}</button>
    <button type="button" className="dc-studio-layer-action" onClick={onCopy} title="Ctrl/Cmd+C"><Copy size={16} />{locale === "en" ? "Copy" : "Salin"}</button>
    <button type="button" className="dc-studio-layer-action" onClick={() => onRemove(selectedAssetLayer.id)} title="Delete / Del"><Trash2 size={16} />{locale === "en" ? "Delete" : "Hapus"}</button>
    </div>
    </>}
    {copiedAssetLayer && <button type="button" className="dc-studio-layer-action mt-2 w-full" disabled={layerCount >= MAX_ASSET_LAYERS} onClick={onPaste} title="Ctrl/Cmd+V"><ClipboardPaste size={16} />{locale === "en" ? "Paste layer" : "Tempel layer"}</button>}
    <p className="mt-3 text-[11px] leading-5 text-muted-foreground">{locale === "en" ? "Del: delete · Ctrl/Cmd+C: copy · Ctrl/Cmd+V: paste" : "Del: hapus · Ctrl/Cmd+C: salin · Ctrl/Cmd+V: tempel"}</p>
    </aside>
  );
}
