"use client";

import { useEffect, useMemo, useState } from "react";
import { Circle, ImagePlus, Minus, RefreshCcw, Search, Square, Upload } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { InvitationAssetLayer, InvitationShapeKind } from "@/lib/templates/asset-layers";
import { MAX_ASSET_LAYERS } from "@/lib/templates/asset-layers";
import type { DesignerLibraryAsset } from "@/components/InvitationStudio/designer-persistence";
import { useLanguage } from "@/components/I18n/LanguageProvider";

type Asset = { src: string; name: string; folder: string };
type AssetLoadError = { kind: "network" | "response"; message?: string };
type AssetApiResponse = { assets?: unknown; limited?: unknown; error?: unknown };

function isAsset(value: unknown): value is Asset {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<Asset>;
  return typeof item.src === "string" && typeof item.name === "string" && typeof item.folder === "string";
}

export default function AssetPanel({
  layers,
  templateKey,
  onDragAssetStart,
  onDragAssetEnd,
  onAddShape,
  libraryAssets = [],
  onUploadLibraryAsset,
  maxLayers = MAX_ASSET_LAYERS,
}: {
  layers: InvitationAssetLayer[];
  templateKey: string;
  onDragAssetStart: (src: string) => void;
  onDragAssetEnd: () => void;
  onAddShape: (shape: InvitationShapeKind) => void;
  libraryAssets?: DesignerLibraryAsset[];
  onUploadLibraryAsset?: (file: File) => Promise<void>;
  maxLayers?: number;
}) {
  const { locale } = useLanguage();
  const en = locale === "en";
  const [assets, setAssets] = useState<Asset[]>([]);
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(40);
  const [error, setError] = useState<AssetLoadError | null>(null);
  const [loading, setLoading] = useState(true);
  const [assetLoadVersion, setAssetLoadVersion] = useState(0);
  const [limited, setLimited] = useState(false);
  const [uploadingLibrary, setUploadingLibrary] = useState(false);
  const [libraryError, setLibraryError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    void (async () => {
      try {
        const response = await fetch("/api/templates/assets", { cache: "no-store", signal: controller.signal });
        const raw = await response.text();
        let data: AssetApiResponse | null = null;
        if (raw) {
          try {
            data = JSON.parse(raw) as AssetApiResponse;
          } catch {
            data = null;
          }
        }

        if (!response.ok) {
          const message = typeof data?.error === "string" ? data.error : undefined;
          throw new Error(message || `HTTP ${response.status}`);
        }
        if (!data || !Array.isArray(data.assets)) {
          setError({ kind: "response" });
          return;
        }

        setAssets(data.assets.filter(isAsset));
        setLimited(data.limited === true);
      } catch (reason: unknown) {
        if (controller.signal.aborted) return;
        if (reason instanceof TypeError) {
          setError({ kind: "network" });
        } else {
          setError({ kind: "response", message: reason instanceof Error ? reason.message : undefined });
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [assetLoadVersion]);

  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("id");
    const theme = templateKey.replace(/[-_ ]/g, "").toLocaleLowerCase("id");
    return assets
      .filter((asset) => `${asset.name} ${asset.folder}`.toLocaleLowerCase("id").includes(term))
      .sort((a, b) => Number(b.folder.replace(/[-_ ]/g, "").toLocaleLowerCase("id").includes(theme)) - Number(a.folder.replace(/[-_ ]/g, "").toLocaleLowerCase("id").includes(theme)));
  }, [assets, search, templateKey]);

  return (
    <div className="space-y-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-[family-name:var(--font-undara-heading)] text-lg font-semibold text-primary">{en ? "Assets" : "Aset"}</h2>
        <span className="text-xs text-muted-foreground" aria-label={en ? "Assets used" : "Aset digunakan"}>{layers.length}/{maxLayers}</span>
      </div>

      {onUploadLibraryAsset && (
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-primary">{en ? "My library" : "Library Saya"}</h3>
            </div>
          </div>
          <label className={buttonVariants({ variant: "outline", size: "sm", className: `flex min-h-11 cursor-pointer justify-center text-sm ${uploadingLibrary ? "pointer-events-none opacity-50" : ""}` })}>
            <Upload size={15} />
            {uploadingLibrary ? (en ? "Uploading…" : "Mengunggah…") : (en ? "Upload artwork" : "Unggah aset")}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              disabled={uploadingLibrary}
              onChange={(event) => {
                const file = event.currentTarget.files?.[0];
                event.currentTarget.value = "";
                if (!file) return;
                setLibraryError("");
                setUploadingLibrary(true);
                void onUploadLibraryAsset(file)
                  .catch((reason: unknown) => setLibraryError(reason instanceof Error ? reason.message : (en ? "Upload failed." : "Upload gagal.")))
                  .finally(() => setUploadingLibrary(false));
              }}
            />
          </label>
          {libraryError && <p role="alert" className="text-xs text-destructive">{libraryError}</p>}
          {libraryAssets.length === 0 ? (
            <p className="text-sm text-muted-foreground">{en ? "No artwork yet." : "Belum ada aset."}</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {libraryAssets.map((asset) => (
                <div
                  key={asset.id}
                  draggable={layers.length < maxLayers}
                  aria-disabled={layers.length >= maxLayers}
                  onDragStart={(event) => {
                    event.dataTransfer.effectAllowed = "copy";
                    event.dataTransfer.setData("text/plain", asset.url);
                    onDragAssetStart(asset.url);
                  }}
                  onDragEnd={onDragAssetEnd}
                  title={`${en ? "Drag to canvas" : "Seret ke canvas"}: ${asset.title}`}
                  className={`min-w-0 rounded-[var(--undara-control-radius)] border border-primary/25 bg-background p-2 text-left transition hover:border-primary hover:bg-primary/5 ${layers.length >= maxLayers ? "cursor-not-allowed opacity-40" : "cursor-grab active:cursor-grabbing"}`}
                >
                  <span className="grid h-24 place-items-center overflow-hidden rounded-lg bg-primary/5">
                    <img src={asset.url} alt="" loading="lazy" className="max-h-full max-w-full object-contain" />
                  </span>
                  <span className="mt-2 block truncate text-sm text-foreground">{asset.title.replace(/\.webp$/i, "")}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-primary">{en ? "Basic shapes" : "Bentuk Dasar"}</h3>
        <div className="grid grid-cols-3 gap-2">
          {([
            ["rectangle", en ? "Rectangle" : "Kotak", Square],
            ["circle", en ? "Circle" : "Lingkaran", Circle],
            ["line", en ? "Line" : "Garis", Minus],
          ] as const).map(([shape, label, Icon]) => {
            const ShapeIcon = Icon as typeof Square;
            return (
              <button
                key={shape}
                type="button"
                disabled={layers.length >= maxLayers}
                onClick={() => onAddShape(shape as InvitationShapeKind)}
                className="grid min-h-20 place-items-center gap-1 rounded-[var(--undara-control-radius)] border border-primary/25 bg-background px-2 py-3 text-sm text-foreground transition hover:border-primary hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ShapeIcon size={24} strokeWidth={1.5} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </section>

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
        {error && (
          <div role="alert" className="space-y-2 rounded-[var(--undara-control-radius)] border border-destructive/30 bg-destructive/5 p-3">
            <p className="text-sm text-destructive">
              {error.kind === "network"
                ? (en ? "The asset library could not reach the Studio service." : "Library aset tidak dapat terhubung ke layanan Studio.")
                : (error.message || (en ? "The asset library returned an invalid response." : "Library aset mengembalikan respons yang tidak valid."))}
            </p>
            <Button type="button" size="sm" variant="outline" disabled={loading} onClick={() => setAssetLoadVersion((value) => value + 1)}>
              <RefreshCcw className="h-4 w-4" />
              {en ? "Try again" : "Coba lagi"}
            </Button>
          </div>
        )}
        {!loading && !error && filtered.length === 0 && <p className="text-sm text-muted-foreground">{en ? "No images found." : "Gambar tidak ditemukan."}</p>}
        {limited && <p className="text-xs text-muted-foreground">{en ? "First 500 images." : "500 gambar pertama."}</p>}

        <div className="grid grid-cols-2 gap-2">
          {filtered.slice(0, visibleCount).map((asset) => (
            <div
              key={asset.src}
              draggable={layers.length < maxLayers}
              aria-disabled={layers.length >= maxLayers}
              onDragStart={(event) => {
                event.dataTransfer.effectAllowed = "copy";
                event.dataTransfer.setData("text/plain", asset.src);
                onDragAssetStart(asset.src);
              }}
              onDragEnd={onDragAssetEnd}
              title={`${en ? "Drag to canvas" : "Seret ke canvas"}: ${asset.folder} / ${asset.name}`}
              className={`min-w-0 rounded-[var(--undara-control-radius)] border border-primary/25 bg-background p-2 text-left transition hover:border-primary hover:bg-primary/5 ${layers.length >= maxLayers ? "cursor-not-allowed opacity-40" : "cursor-grab active:cursor-grabbing"}`}
            >
              <span className="grid h-24 place-items-center overflow-hidden rounded-lg bg-primary/5">
                <img src={asset.src} alt="" loading="lazy" className="max-h-full max-w-full object-contain" />
              </span>
              <span className="mt-2 block truncate text-sm text-foreground">{asset.name}</span>
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
