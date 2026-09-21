"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import type { ReferenceDoorControls } from "./reference-door-engine";

type Angle = 0 | 45 | 90 | 110;
type View = "front" | "left" | "right";
const VIEWS: Record<View, number> = { front: 0, left: -25, right: 25 };
const ANGLES: Angle[] = [0, 45, 90, 110];

/**
 * Three.js preview replaces only the isolated /pintu-lab experiment.
 * Old CSS demo is retained at /pintu-lab/css for visual comparison.
 */
export default function ReferenceDoorPreview() {
  const mountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<ReferenceDoorControls | null>(null);
  const latestRef = useRef({ angle: 0, view: 0 });
  const [angle, setAngle] = useState<Angle>(0);
  const [view, setView] = useState<View>("front");
  const [travel, setTravel] = useState<"outside" | "entering" | "inside" | "leaving">("outside");
  const [status, setStatus] = useState<"loading" | "ready" | "recovering" | "unsupported">("loading");
  const [captureError, setCaptureError] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let cancelled = false;
    let instance: ReferenceDoorControls | null = null;
    async function start() {
      try {
        // Only the lab route downloads Three.js; the public landing stays as-is.
        const { mountReferenceDoor } = await import("./reference-door-engine");
        if (cancelled || !mount) return;
        const controller = await mountReferenceDoor(mount, {
          reducedMotion: Boolean(reducedMotion),
          onApproachSettled: (inside) => {
            if (!cancelled) setTravel(inside ? "inside" : "outside");
          },
          onContextChange: (state) => {
            if (!cancelled) setStatus(state === "lost" ? "recovering" : "ready");
          },
        });
        if (cancelled) { controller.dispose(); return; }
        instance = controller;
        engineRef.current = controller;
        controller.setAngle(latestRef.current.angle);
        controller.setView(latestRef.current.view);
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("unsupported");
      }
    }
    void start();
    return () => {
      cancelled = true;
      engineRef.current = null;
      instance?.dispose();
    };
  }, [reducedMotion]);

  function savePreview() {
    if (status !== "ready") return;
    try {
      const png = engineRef.current?.capturePng();
      if (!png) { setCaptureError(true); return; }
      const anchor = document.createElement("a");
      anchor.href = png;
      anchor.download = `pintu1-${angle}deg-${view}-${travel}.png`;
      anchor.click();
      setCaptureError(false);
    } catch {
      setCaptureError(true);
    }
  }

  function enterFoyer() {
    if (status !== "ready" || travel !== "outside") return;
    chooseAngle(110);
    chooseView("front");
    setTravel("entering");
    engineRef.current?.setApproach(1);
  }

  function leaveFoyer() {
    if (status !== "ready" || travel !== "inside") return;
    setTravel("leaving");
    engineRef.current?.setApproach(0);
  }

  function chooseAngle(next: Angle) {
    latestRef.current.angle = next;
    setAngle(next);
    engineRef.current?.setAngle(next);
  }

  function chooseView(next: View) {
    latestRef.current.view = VIEWS[next];
    setView(next);
    engineRef.current?.setView(VIEWS[next]);
  }

  return (
    <section className="w-full space-y-4">
      <div className="grid w-full items-stretch gap-4 lg:grid-cols-2">
        <div className="order-2 min-w-0 rounded-xl border border-rose-200/60 bg-[#fbf7f4] p-2 dark:border-white/10 dark:bg-[#242024] lg:order-1">
          <p className="mb-1 px-2 text-sm font-semibold text-foreground">Referensi asli · pintu1.png</p>
          <div className="relative mx-auto h-[min(73dvh,710px)] min-h-[370px] w-full overflow-hidden rounded-lg sm:min-h-[410px]">
            <Image
              src="/pintu1.png"
              alt="Referensi Pintu 1 dengan kusen klasik bermahkota, ukiran acanthus rose-gold, dan dua daun berpanel."
              fill
              sizes="(max-width: 1024px) 90vw, 40vw"
              className="object-contain"
              priority
            />
          </div>
          <p className="mt-1 px-2 text-sm leading-6 text-foreground/80">
            Perhatikan siluet mahkota, proporsi panel, dan ukiran tipis pada kusen.
          </p>
        </div>

        <div className="order-1 min-w-0 rounded-xl border border-rose-200/60 bg-[#f7f1ed] p-2 dark:border-white/10 dark:bg-[#242024] lg:order-2">
          <div className="mb-1 flex items-center justify-between gap-3 px-2 text-sm font-semibold text-foreground/85">
            <span>Model Three.js · revisi referensi</span>
            <span>{status === "ready" ? "3D aktif" : status === "loading" ? "Memuat…" :
              status === "recovering" ? "Memulihkan WebGL…" : "WebGL tidak tersedia"}</span>
          </div>
          <div className="relative h-[min(73dvh,710px)] min-h-[370px] w-full overflow-hidden rounded-lg sm:min-h-[410px]">
            <div
              ref={mountRef}
              className="absolute inset-0"
              role="img"
              aria-label={`Model geometri tiga dimensi pintu dua daun, bukaan ${angle} derajat, sudut pandang ${view}.`}
            />
            {status === "loading" && (
              <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-foreground/65">
                Menyiapkan geometri pintu…
              </p>
            )}
            {status === "recovering" && (
              <p role="status" className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background/70 px-4 text-center text-sm text-foreground">
                Koneksi grafis terputus. Menyambungkan kembali…
              </p>
            )}
            {status === "unsupported" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center text-sm text-foreground">
                <p>Preview Three.js tidak dapat dibuka di browser ini.</p>
                <Link className="underline underline-offset-4" href="/pintu-lab/css">Lihat preview CSS sebelumnya</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 text-center">
        <Button
          type="button"
          disabled={status !== "ready" || travel !== "outside"}
          onClick={() => chooseAngle(angle === 110 ? 0 : 110)}
        >
          {angle === 110 ? "Tutup kedua daun" : "Buka seluruh pintu"}
        </Button>
        <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Sudut bukaan">
          {ANGLES.map((next) => (
            <Button
              key={next}
              type="button"
              disabled={status !== "ready" || travel !== "outside"}
              aria-pressed={angle === next}
              onClick={() => chooseAngle(next)}
            >{next}°</Button>
          ))}
        </div>
        <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Sudut pandang">
          {(["front", "left", "right"] as View[]).map((next) => (
            <Button
              key={next}
              type="button"
              disabled={status !== "ready" || travel !== "outside"}
              aria-pressed={view === next}
              onClick={() => chooseView(next)}
            >
              {next === "front" ? "Depan" : next === "left" ? "Sudut kiri" : "Sudut kanan"}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2" role="group" aria-label="Uji kamera masuk ke foyer">
          <Button
            type="button"
            disabled={status !== "ready" || travel !== "outside"}
            onClick={enterFoyer}
          >Uji masuk ruang</Button>
          <Button
            type="button"
            disabled={status !== "ready" || travel !== "inside"}
            onClick={leaveFoyer}
          >Kembali ke depan</Button>
        </div>
        <Button type="button" disabled={status !== "ready"} onClick={savePreview}>
          Simpan gambar sudut ini
        </Button>
        {captureError && <p role="alert" className="text-sm text-destructive">Gambar belum dapat disimpan. Gunakan tangkapan layar perangkat.</p>}
        <p role="status" aria-live="polite" className="text-sm text-foreground/70">
          {travel === "entering" ? "Pintu membuka, kamera mendekati ruang…" :
            travel === "inside" ? "Kamera berada di dalam foyer 3D." :
            travel === "leaving" ? "Kamera kembali ke depan…" :
            "Uji gerak masuk hanya di lab; belum berpindah halaman."}
        </p>
        <p className="max-w-xl text-sm leading-6 text-foreground/65">
          Bandingkan mahkota, tiga panel, kusen, dan kedalaman ukiran dengan referensi pada ukuran yang sebanding.
          Uji bukaan 0°–110° dari depan dan samping. Model ini masih perlu pemeriksaan visual sebelum dipakai di landing.
        </p>
        <Link className="text-sm underline underline-offset-4" href="/pintu-lab/css">
          Bandingkan dengan eksperimen CSS lama
        </Link>
      </div>
    </section>
  );
}
