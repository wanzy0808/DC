"use client";

import { useEffect, useMemo, useState } from "react";
import { ImagePlus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { InvitationAssetLayer } from "@/lib/templates/asset-layers";
import { MAX_ASSET_LAYERS } from "@/lib/templates/asset-layers";
import { useLanguage } from "@/components/I18n/LanguageProvider";

type Asset = { src: string; name: string; folder: string };

export default function AssetPanel({
  layers,
  templateKey,
  onDragAssetStart,
  onDragAssetEnd,
}: {
  layers: InvitationAssetLayer[];
  templateKey: string;
  onDragAssetStart: (src: string) => void;
  onDragAssetEnd: () => void;
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
    return assets
      .filter((asset) => `${asset.name} ${asset.folder}`.toLocaleLowerCase("id").includes(term))
      .sort((a, b) => Number(b.folder.replace(/[-_ ]/g, "").toLocaleLowerCase("id").includes(theme)) - Number(a.folder.replace(/[-_ ]/g, "").toLocaleLowerCase("id").includes(theme)));
  }, [assets, search, templateKey]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-[family-name:var(--font-dc-heading)] text-lg font-semibold text-primary">{en ? "Assets" : "Aset"}</h2>
        <p className="mt-1 text-sm text-foreground/75">
          {en ? "Drag an image onto the invitation section where you want to place it." : "Seret gambar ke section undangan tempat kamu ingin meletakkannya."}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">{en ? `${layers.length}/${MAX_ASSET_LAYERS} assets used` : `${layers.length}/${MAX_ASSET_LAYERS} asset digunakan`}</p>
      </div>

      <div className="space-y-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-primary"><ImagePlus size={17} /> {en ? "Template images" : "Gambar Template"}</h3>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-primary" />
          <Input
            className="pl-10"
            type="search"
            value={search}
            onChange={(event) => { setSearch(event.target.value); setVisibleCount(40); }}
            placeholder={en ? "Search images or folders…" : "Cari gambar atau folder…"}
            aria-label={en ? "Search template images" : "Cari gambar template"}
          />
        </div>

        {loading && <p className="text-sm text-muted-foreground">{en ? "Loading images…" : "Memuat gambar…"}</p>}
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        {!loading && !error && filtered.length === 0 && <p className="text-sm text-muted-foreground">{en ? "No images found." : "Gambar tidak ditemukan."}</p>}
        {limited && <p className="text-xs text-muted-foreground">{en ? "Showing the first 500 images; use search to narrow the list." : "Menampilkan 500 gambar pertama; gunakan pencarian untuk mempersempit daftar."}</p>}

        <div className="grid grid-cols-2 gap-2">
          {filtered.slice(0, visibleCount).map((asset) => (
            <div
              key={asset.src}
              draggable={layers.length < MAX_ASSET_LAYERS}
              aria-disabled={layers.length >= MAX_ASSET_LAYERS}
              onDragStart={(event) => {
                event.dataTransfer.effectAllowed = "copy";
                event.dataTransfer.setData("text/plain", asset.src);
                onDragAssetStart(asset.src);
              }}
              onDragEnd={onDragAssetEnd}
              title={asset.folder + " / " + asset.name}
              className={`min-w-0 rounded-[var(--dc-control-radius)] border border-primary/25 bg-background p-2 text-left transition hover:border-primary hover:bg-primary/5 ${layers.length >= MAX_ASSET_LAYERS ? "cursor-not-allowed opacity-40" : "cursor-grab active:cursor-grabbing"}`}
            >
              <span className="grid h-24 place-items-center overflow-hidden rounded-lg bg-primary/5">
                <img src={asset.src} alt="" loading="lazy" className="max-h-full max-w-full object-contain" />
              </span>
              <span className="mt-2 block truncate text-xs text-foreground">{asset.name}</span>
              <span className="mt-1 block truncate text-[10px] text-muted-foreground">{asset.folder}</span>
            </div>
          ))}
        </div>

        {visibleCount < filtered.length && (
          <Button type="button" size="sm" className="w-full" onClick={() => setVisibleCount((count) => count + 40)}>
            {en ? "Show more" : "Tampilkan lagi"} ({filtered.length - visibleCount})
          </Button>
        )}
      </div>
    </div>
  );
}
