"use client";

import { ArrowDown, ArrowUp, ClipboardPaste, Copy, Trash2 } from "lucide-react";
import type { InvitationAssetLayer } from "@/lib/templates/asset-layers";
import { MAX_ASSET_LAYERS, studioObjectSections, type StudioObjectSection } from "@/lib/templates/asset-layers";
import { invitationSectionItems, type InvitationSections } from "@/lib/templates/sections";

type AssetLayerInspectorProps = {
  locale: string;
  selectedAssetLayer: InvitationAssetLayer | undefined;
  selectedAssetIndex: number;
  copiedAssetLayer: InvitationAssetLayer | null;
  layerCount: number;
  sections: InvitationSections;
  onDeselect: () => void;
  onUpdate: (id: string, patch: Partial<InvitationAssetLayer>) => void;
  onReorder: (id: string, direction: -1 | 1) => void;
  onCopy: () => void;
  onRemove: (id: string) => void;
  onPaste: () => void;
};

/** Contextual Cover illustration controls. All persisted state remains in InvitationDesigner. */
export default function AssetLayerInspector({
  locale, selectedAssetLayer, selectedAssetIndex, copiedAssetLayer, layerCount, sections,
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
    <label className="mt-3 block space-y-1.5 text-xs text-foreground">
      <span>{locale === "en" ? "Section" : "Bagian"}</span>
      <select className="min-h-9 w-full rounded-[var(--dc-control-radius)] border border-primary/40 bg-background px-1.5 text-xs text-foreground"
        value={selectedAssetLayer.section ?? "cover"}
        onChange={(event) => onUpdate(selectedAssetLayer.id, { section: event.target.value as StudioObjectSection })}>
        {invitationSectionItems.filter((item) => studioObjectSections.includes(item.key as StudioObjectSection) && (sections[item.key] !== false || item.key === (selectedAssetLayer.section ?? "cover"))).map((item) => <option key={item.key} value={item.key}>{item.title}</option>)}
      </select>
    </label>
    {selectedAssetLayer.kind === "text" && <>
      <label className="mt-3 block space-y-1.5 text-xs text-foreground"><span>{locale === "en" ? "Decorative text" : "Teks dekoratif"}</span>
        <textarea rows={3} maxLength={180} value={selectedAssetLayer.text ?? ""} onChange={(event) => onUpdate(selectedAssetLayer.id, { text: event.target.value })}
          className="w-full resize-y rounded-[var(--dc-control-radius)] border border-primary/40 bg-background p-2 text-sm text-foreground" />
      </label>
      <label className="mt-3 block space-y-1.5 text-xs text-foreground"><span>{locale === "en" ? "Font role" : "Tipografi"}</span>
        <select value={selectedAssetLayer.fontRole ?? "heading"} onChange={(event) => onUpdate(selectedAssetLayer.id, { fontRole: event.target.value as "heading" | "body" })}
          className="min-h-9 w-full rounded-[var(--dc-control-radius)] border border-primary/40 bg-background px-1.5 text-xs text-foreground">
          <option value="heading">{locale === "en" ? "Theme heading" : "Judul tema"}</option><option value="body">{locale === "en" ? "Theme body" : "Isi tema"}</option>
        </select>
      </label>
      <label className="mt-3 flex items-center justify-between gap-2 text-xs text-foreground"><span>{locale === "en" ? "Text color" : "Warna teks"}</span>
        <input type="color" aria-label={locale === "en" ? "Text color" : "Warna teks"} value={selectedAssetLayer.color ?? "#C07A84"} onChange={(event) => onUpdate(selectedAssetLayer.id, { color: event.target.value })} />
      </label>
      <label className="mt-3 block space-y-1.5 text-xs text-foreground"><span>{locale === "en" ? "Text size" : "Ukuran teks"} · {selectedAssetLayer.fontSize ?? 24}px</span>
        <input className="w-full accent-primary" type="range" min="10" max="72" value={selectedAssetLayer.fontSize ?? 24} onChange={(event) => onUpdate(selectedAssetLayer.id, { fontSize: Number(event.target.value) })} />
      </label>
    </>}
    <label className="mt-3 block space-y-1.5 text-xs text-foreground"><span>{locale === "en" ? "Object width" : "Lebar objek"} · {selectedAssetLayer.width}%</span>
      <input className="w-full accent-primary" type="range" min="5" max="85" value={selectedAssetLayer.width} onChange={(event) => onUpdate(selectedAssetLayer.id, { width: Number(event.target.value) })} />
    </label>
    {selectedAssetLayer.height !== undefined && <label className="mt-3 block space-y-1.5 text-xs text-foreground">
      <span>{locale === "en" ? "Object height" : "Tinggi objek"} · {selectedAssetLayer.height}%</span>
      <input className="w-full accent-primary" type="range" min="3" max="200" step="0.1" value={selectedAssetLayer.height} onChange={(event) => onUpdate(selectedAssetLayer.id, { height: Number(event.target.value) })} />
    </label>}
    {selectedAssetLayer.height !== undefined && <button className="mt-2 text-xs text-primary underline-offset-2 hover:underline" type="button" onClick={() => onUpdate(selectedAssetLayer.id, { height: undefined })}>{locale === "en" ? "Restore original image proportions" : "Kembalikan proporsi asli"}</button>}
    <div className="mt-3 space-y-2 text-xs text-foreground">
      <label className="flex items-center justify-between gap-2" htmlFor="dc-studio-rotation-degrees"><span>{locale === "en" ? "Rotation" : "Rotasi"}</span><span className="flex items-center gap-1"><input id="dc-studio-rotation-degrees" type="number" min="-180" max="180" step="1" value={selectedAssetLayer.rotation ?? 0} onFocus={(event) => event.currentTarget.select()} onChange={(event) => { const angle = event.currentTarget.valueAsNumber; if (Number.isFinite(angle)) onUpdate(selectedAssetLayer.id, { rotation: Math.min(180, Math.max(-180, angle)) }); }} aria-label={locale === "en" ? "Exact rotation in degrees" : "Rotasi tepat dalam derajat"} className="w-16 rounded-[var(--dc-control-radius)] border border-primary/50 bg-background px-2 py-1 text-right text-xs text-foreground" />°</span></label>
      <input aria-label={locale === "en" ? "Rotation slider" : "Slider rotasi"} className="w-full accent-primary" type="range" min="-180" max="180" value={selectedAssetLayer.rotation ?? 0} onChange={(event) => onUpdate(selectedAssetLayer.id, { rotation: Number(event.target.value) })} />
    </div>
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
