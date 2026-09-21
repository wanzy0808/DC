"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import type { AssetDoorControls } from "./asset-door-engine";

type View = "front" | "left" | "right";
const VIEW_ANGLES: Record<View, number> = { front: 0, left: -27, right: 27 };

export default function AssetDoorPreview() {
  const mountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<AssetDoorControls | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "recovering" | "error">("loading");
  const [view, setView] = useState<View>("front");
  const [modelInfo, setModelInfo] = useState<{ url: string; meshCount: number } | null>(null);
  const [saveFailed, setSaveFailed] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let cancelled = false;
    let controller: AssetDoorControls | null = null;
    async function start() {
      try {
        // Loads only when the lab opens; the canonical landing and orbital
        // keep their current assets until a visual review of this GLB.
        const { mountAssetDoor } = await import("./asset-door-engine");
        if (cancelled) return;
        const instance = await mountAssetDoor(mount, {
          reducedMotion: Boolean(reducedMotion),
          onLoaded: info => { if (!cancelled) setModelInfo(info); },
          onContextChange: state => {
            if (!cancelled) setStatus(state === "lost" ? "recovering" : "ready");
          },
        });
        if (cancelled) { instance?.dispose(); return; }
        if (!instance) { setStatus("error"); return; }
        controller = instance;
        engineRef.current = instance;
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    }
    void start();
    return () => {
      cancelled = true;
      engineRef.current = null;
      controller?.dispose();
    };
  }, [reducedMotion]);

  function changeView(next: View) {
    setView(next);
    engineRef.current?.setView(VIEW_ANGLES[next]);
  }

  function saveImage() {
    try {
      const png = engineRef.current?.capturePng();
      if (!png) { setSaveFailed(true); return; }
      const link = document.createElement("a");
      link.href = png;
      link.download = `pintu-glb-${view}.png`;
      link.click();
      setSaveFailed(false);
    } catch {
      setSaveFailed(true);
    }
  }

  return (
    <section className="w-full space-y-4">
      <div className="grid w-full items-stretch gap-4 lg:grid-cols-2">
        <div className="min-w-0 rounded-xl border border-rose-200/60 bg-[#fbf7f4] p-2 dark:border-white/10 dark:bg-[#242024]">
          <p className="mb-1 px-2 text-sm font-semibold text-foreground">Referensi · pintu1.png</p>
          <div className="relative h-[min(73dvh,710px)] min-h-[370px] w-full overflow-hidden rounded-lg sm:min-h-[410px]">
            <Image
              src="/pintu1.png"
              alt="Foto referensi pintu klasik dengan ornamen mahkota, kusen berukir, dan dua daun pintu."
              fill
              sizes="(max-width: 1024px) 90vw, 40vw"
              className="object-contain"
              priority
            />
          </div>
        </div>
        <div className="min-w-0 rounded-xl border border-rose-200/60 bg-[#faf4ef] p-2 dark:border-white/10 dark:bg-[#242024]">
          <div className="mb-1 flex items-center justify-between gap-3 px-2 text-sm font-semibold text-foreground">
            <span>Model GLB · Rose &amp; ivory</span>
            <span className="text-xs font-normal text-foreground/70">
              {status === "loading" ? "Memuat…" : status === "ready" ? "3D aktif" :
                status === "recovering" ? "Memulihkan WebGL…" : "Tidak dapat dimuat"}
            </span>
          </div>
          <div className="relative h-[min(73dvh,710px)] min-h-[370px] w-full overflow-hidden rounded-lg sm:min-h-[410px]">
            <div
              ref={mountRef}
              className="absolute inset-0"
              role="img"
              aria-label={`Model 3D dari file GLB, tampak ${view}, dengan cahaya lembut di kaki pintu.`}
            />
            {status === "loading" && (
              <p className="pointer-events-none absolute inset-0 flex items-center justify-center px-4 text-center text-sm text-foreground/75">
                Memuat model pintu…
              </p>
            )}
            {status === "recovering" && (
              <p role="status" className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background/70 text-sm">
                Memulihkan tampilan 3D…
              </p>
            )}
            {status === "error" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center text-sm text-foreground">
                <p>Model GLB tidak bisa dibaca. Periksa public/mesh.glb atau public/white_mesh.glb.</p>
                <Link className="underline underline-offset-4" href="/pintu-lab/procedural">
                  Lihat model sebelumnya
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center gap-3">
        <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Sudut pandang pintu GLB">
          {(["front", "left", "right"] as View[]).map(next => (
            <Button
              key={next}
              type="button"
              disabled={status !== "ready"}
              aria-pressed={view === next}
              onClick={() => changeView(next)}
            >
              {next === "front" ? "Depan" : next === "left" ? "Sudut kiri" : "Sudut kanan"}
            </Button>
          ))}
          <Button type="button" disabled={status !== "ready"} onClick={saveImage}>
            Simpan gambar
          </Button>
        </div>
        {saveFailed && <p role="alert" className="text-sm text-destructive">Gambar gagal disimpan. Gunakan tangkapan layar perangkat.</p>}
        <p role="status" className="text-center text-sm text-foreground/75">
          {modelInfo ? `Asset aktif: ${modelInfo.url} · ${modelInfo.meshCount} mesh` : "Menyiapkan pratinjau GLB."}
        </p>
        <p className="max-w-2xl text-center text-sm leading-6 text-foreground/75">
          Material Rose–ivory dan sorot lembut hanya di bawah kaki pintu. GLB saat ini ditampilkan utuh:
          bukaan daun belum diaktifkan sebelum bagian kusen dan daun dapat dipisahkan tanpa merusak ukiran.
        </p>
        <Link className="text-sm underline underline-offset-4" href="/pintu-lab/procedural">
          Lihat model procedural sebelumnya
        </Link>
      </div>
    </section>
  );
}
