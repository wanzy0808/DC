"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Layers3, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { InvitationAssetLayer } from "@/lib/templates/asset-layers";
import { MAX_ASSET_LAYERS } from "@/lib/templates/asset-layers";
import { useLanguage } from "@/components/I18n/LanguageProvider";

type Asset = { src: string; name: string; folder: string };

export default function AssetPanel({
  layers, selectedId, templateKey, onAdd, onDragAssetStart, onDragAssetEnd, onSelect, onUpdate, onRemove, onReorder,
}: {
  layers: InvitationAssetLayer[];
  selectedId: string | null;
  templateKey: string;
  onAdd: (src: string) => void;
  onDragAssetStart: (src: string) => void;
  onDragAssetEnd: () => void;
  onSelect: (id: string) => void;
  onUpdate: (id: string, patch: Partial<InvitationAssetLayer>) => void;
  onRemove: (id: string) => void;
  onReorder: (id: string, direction: -1 | 1) => void;
}) {
  const { locale } = useLanguage();
  const en = locale === "en";
  const [assets, setAssets] = useState<Asset[]>([]);
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(40);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [limited, setLimited] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/templates/assets", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Gagal memuat aset.");
        setAssets(data.assets);
        setLimited(Boolean(data.limited));
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Gagal memuat aset.");
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);
  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("id");
    const theme = templateKey.replace(/[-_ ]/g, "").toLocaleLowerCase("id");
    return assets.filter((asset) => `${asset.name} ${asset.folder}`.toLocaleLowerCase("id").includes(term))
      .sort((a, b) => Number(b.folder.replace(/[-_ ]/g, "").toLocaleLowerCase("id").includes(theme)) - Number(a.folder.replace(/[-_ ]/g, "").toLocaleLowerCase("id").includes(theme)));
  }, [assets, search, templateKey]);
  const selected = layers.find((layer) => layer.id === selectedId);
  const selectedIndex = layers.findIndex((layer) => layer.id === selectedId);
  const assetName = (src: string) => {
    const name = src.split("/").at(-1) || src;
    try { return decodeURIComponent(name).replace(/\.[^.]+$/, ""); } catch { return name; }
  };
  function range(label: string, value: number, min: number, max: number, step: number, suffix: string, update: (next: number) => void) {
    return <label className="block space-y-2 text-xs text-foreground">
      <span className="flex justify-between gap-3"><span>{label}</span><output>{Math.round(value * (suffix === "%" && max === 1 ? 100 : 1))}{suffix}</output></span>
      <input className="w-full accent-primary" type="range" min={min} max={max} step={step} value={value} onChange={(event) => update(Number(event.target.value))} />
    </label>;
  }
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-[family-name:var(--font-dc-heading)] text-lg font-semibold text-primary">{en ? "Assets" : "Aset"}</h2>
        <p className="mt-1 text-sm text-foreground/75">{en ? "Drag an image onto the Cover, or click to add it." : "Seret gambar ke Cover, atau klik untuk menambahkannya."}</p>
      </div>
      <div className="space-y-3 border-b border-primary/25 pb-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-primary"><Layers3 size={17} /> {en ? "Layers" : "Layer"} ({layers.length}/{MAX_ASSET_LAYERS})</h3>
          <span className="text-xs text-muted-foreground">{en ? "Cover only" : "Khusus Cover"}</span>
        </div>
        {layers.length === 0 && <p className="text-xs text-muted-foreground">{en ? "No illustrations added yet." : "Belum ada ilustrasi yang ditempel."}</p>}
        <div className="space-y-1.5">
          {[...layers].reverse().map((layer) => (
            <button key={layer.id} type="button" onClick={() => onSelect(layer.id)} aria-pressed={selectedId === layer.id}
              className={`flex w-full items-center gap-2 rounded-[var(--dc-control-radius)] border px-2 py-2 text-left text-xs hover:border-primary ${selectedId === layer.id ? "border-primary bg-primary/10" : "border-primary/20"}`}>
              <img src={layer.src} alt="" loading="lazy" className="h-10 w-10 shrink-0 object-contain" />
              <span className="min-w-0 flex-1 truncate">{assetName(layer.src)}</span>
              <span className="text-muted-foreground">{layers.indexOf(layer) + 1}</span>
            </button>
          ))}
        </div>
        {selected && <div className="space-y-4 rounded-[var(--dc-control-radius)] border border-primary/40 bg-primary/5 p-3">
          <h4 className="truncate text-sm font-semibold text-primary">{assetName(selected.src)}</h4>
          {range(en ? "Opacity" : "Opasitas", selected.opacity, 0, 1, 0.05, "%", (opacity) => onUpdate(selected.id, { opacity }))}
          <p className="text-[11px] text-muted-foreground">{en ? "0% invisible · 100% fully visible" : "0% transparan · 100% terlihat penuh"}</p>
          {range(en ? "Size" : "Ukuran", selected.width, 5, 85, 1, "%", (width) => onUpdate(selected.id, { width }))}
          {range("X", selected.x, 0, 100, 1, "%", (x) => onUpdate(selected.id, { x }))}
          {range("Y", selected.y, 0, 100, 1, "%", (y) => onUpdate(selected.id, { y }))}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" type="button" disabled={selectedIndex === layers.length - 1} onClick={() => onReorder(selected.id, 1)}><ArrowUp size={15} /> {en ? "Front" : "Ke depan"}</Button>
            <Button size="sm" type="button" disabled={selectedIndex === 0} onClick={() => onReorder(selected.id, -1)}><ArrowDown size={15} /> {en ? "Back" : "Ke belakang"}</Button>
            <Button size="sm" type="button" onClick={() => onRemove(selected.id)}><Trash2 size={15} /> {en ? "Delete" : "Hapus"}</Button>
          </div>
        </div>}
      </div>
      <div className="space-y-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-primary"><ImagePlus size={17} /> {en ? "Template images" : "Gambar Template"}</h3>
        <div className="relative"><Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-primary" /><Input className="pl-10" type="search" value={search} onChange={(event) => { setSearch(event.target.value); setVisibleCount(40); }} placeholder={en ? "Search images or folders…" : "Cari gambar atau folder…"} aria-label={en ? "Search template images" : "Cari gambar template"} /></div>
        {loading && <p className="text-sm text-muted-foreground">{en ? "Loading images…" : "Memuat gambar…"}</p>}
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        {!loading && !error && filtered.length === 0 && <p className="text-sm text-muted-foreground">{en ? "No images found." : "Gambar tidak ditemukan."}</p>}
        {limited && <p className="text-xs text-muted-foreground">{en ? "Showing the first 500 images; use search for this list." : "Menampilkan 500 gambar pertama dari folder publik."}</p>}
        <div className="grid grid-cols-2 gap-2">
          {filtered.slice(0, visibleCount).map((asset) => (
            <button key={asset.src} type="button" draggable={layers.length < MAX_ASSET_LAYERS} disabled={layers.length >= MAX_ASSET_LAYERS}
              onDragStart={(event) => {
                event.dataTransfer.effectAllowed = "copy";
                event.dataTransfer.setData("text/plain", asset.src);
                onDragAssetStart(asset.src);
              }}
              onDragEnd={onDragAssetEnd}
              title={asset.folder + " / " + asset.name}
              onClick={() => onAdd(asset.src)}
              className="min-w-0 cursor-grab rounded-[var(--dc-control-radius)] border border-primary/25 bg-background p-2 text-left transition hover:border-primary hover:bg-primary/5 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40">
              <span className="grid h-24 place-items-center overflow-hidden rounded-lg bg-primary/5">
                <img src={asset.src} alt="" loading="lazy" className="max-h-full max-w-full object-contain" />
              </span>
              <span className="mt-2 block truncate text-xs text-foreground">{asset.name}</span>
              <span className="mt-1 block truncate text-[10px] text-muted-foreground">{asset.folder}</span>
            </button>
          ))}
        </div>
        {visibleCount < filtered.length && <Button type="button" size="sm" className="w-full" onClick={() => setVisibleCount((count) => count + 40)}>{en ? "Show more" : "Tampilkan lagi"} ({filtered.length - visibleCount})</Button>}
      </div>
    </div>
  );
}
