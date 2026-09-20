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
  const [status, setStatus] = useState<"loading" | "ready" | "unsupported">("loading");
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
        const controller = await mountReferenceDoor(mount, { reducedMotion: Boolean(reducedMotion) });
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
      <div className="grid w-full items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div className="rounded-xl border border-rose-200/60 bg-white/55 p-3 dark:border-white/10 dark:bg-black/20">
          <p className="mb-2 text-sm font-semibold text-foreground">Referensi bentuk — jangan diubah</p>
          <div className="relative mx-auto aspect-[.80] w-full max-w-[300px]">
            <Image
              src="/pintu1.png"
              alt="Referensi Pintu 1 dengan kusen klasik bermahkota, ukiran acanthus rose-gold, dan dua daun berpanel."
              fill
              sizes="(max-width: 1024px) 80vw, 300px"
              className="object-contain"
              priority
            />
          </div>
          <p className="mt-2 text-xs leading-5 text-foreground/65">
            Kusen, crown, panel, ukiran, dan pegangan di gambar ini menjadi acuan tahap berikutnya.
            Jangan mengganti bentuk ornamen dengan motif baru.
          </p>
        </div>

        <div className="min-w-0 rounded-xl border border-rose-200/60 bg-[linear-gradient(#fffaf8,#f8eeee)] p-2 dark:border-white/10 dark:bg-[linear-gradient(#282125,#171316)]">
          <div className="mb-1 flex items-center justify-between gap-3 px-2 text-xs text-foreground/65">
            <span>Geometri Three.js · Tahap 3</span>
            <span>{status === "ready" ? "3D aktif" : status === "loading" ? "Memuat…" : "WebGL tidak tersedia"}</span>
          </div>
          <div className="relative h-[min(76dvh,710px)] min-h-[410px] w-full overflow-hidden rounded-lg">
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
          disabled={status !== "ready"}
          onClick={() => chooseAngle(angle === 110 ? 0 : 110)}
        >
          {angle === 110 ? "Tutup kedua daun" : "Buka seluruh pintu"}
        </Button>
        <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Sudut bukaan">
          {ANGLES.map((next) => (
            <Button
              key={next}
              type="button"
              disabled={status !== "ready"}
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
              disabled={status !== "ready"}
              aria-pressed={view === next}
              onClick={() => chooseView(next)}
            >
              {next === "front" ? "Depan" : next === "left" ? "Sudut kiri" : "Sudut kanan"}
            </Button>
          ))}
        </div>
        <p className="max-w-xl text-sm leading-6 text-foreground/65">
          Tahap 3 menyempurnakan dua daun utuh: bevel, celah tengah, ketebalan, tiga panel bertingkat,
          dan profil belakang yang tetap terbaca pada 110°. Ukiran acanthus serta material akhir belum dibuat.
        </p>
        <Link className="text-sm underline underline-offset-4" href="/pintu-lab/css">
          Bandingkan dengan eksperimen CSS lama
        </Link>
      </div>
    </section>
  );
}
