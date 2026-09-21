"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";

type DoorId = 1 | 2 | 3;
type OrbitalControls = {
  pause: (paused: boolean) => void;
  resume: () => void;
  select: (id: DoorId) => void;
  enter: (id: DoorId) => boolean;
  cancel: () => void;
  dispose: () => void;
};
const DESTINATIONS = [
  { id: 1, label: "Perencana Acara", href: "/event-planner" },
  { id: 2, label: "Undangan Digital", href: "/d-invitation" },
  { id: 3, label: "Buku Tamu Digital", href: "/guestbook" },
] as const;

export default function ReferenceDoorOrbitalPreview() {
  const mount = useRef<HTMLDivElement>(null);
  const controls = useRef<OrbitalControls | null>(null);
  const navigateRef = useRef<(id: DoorId) => void>(() => undefined);
  const [active, setActive] = useState<DoorId>(2);
  const [status, setStatus] = useState<"loading" | "ready" | "recovering" | "fallback">("loading");
  const [entering, setEntering] = useState(false);
  const [pinned, setPinned] = useState(false);
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const current = DESTINATIONS[active - 1];

  function navigate(id: DoorId) {
    const destination = DESTINATIONS[id - 1].href;
    try {
      if (!reducedMotion) window.sessionStorage.setItem("dc.portal.arrival", destination);
    } catch {
      // Safari private mode and restrictive browsers still navigate normally.
    }
    router.push(destination);
  }
  navigateRef.current = navigate;

  useEffect(() => {
    const target = mount.current;
    if (!target) return;
    let cancelled = false;
    let instance: OrbitalControls | null = null;

    async function start() {
      try {
        const { mountOrbitalDoors } = await import("./reference-door-orbital-engine");
        if (cancelled || !target) return;
        const engine = await mountOrbitalDoors(target, {
          reducedMotion: Boolean(reducedMotion),
          onActiveDoor: (id: DoorId) => { if (!cancelled) setActive(id); },
          onEntered: (id: DoorId) => { if (!cancelled) navigateRef.current(id); },
          onContextChange: (state: "lost" | "restored") => {
            if (!cancelled) setStatus(state === "lost" ? "recovering" : "ready");
          },
        });
        if (cancelled) { engine.dispose(); return; }
        instance = engine;
        controls.current = engine;
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("fallback");
      }
    }
    void start();
    return () => {
      cancelled = true;
      controls.current = null;
      instance?.dispose();
    };
  }, [reducedMotion]);

  useEffect(() => {
    router.prefetch(current.href);
  }, [current.href, router]);

  useEffect(() => {
    if (!entering) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        controls.current?.cancel();
        setEntering(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [entering]);

  function chooseDoor(id: DoorId) {
    if (entering) return;
    controls.current?.select(id);
    setActive(id);
    setPinned(true);
  }

  function resumeOrbit() {
    controls.current?.resume();
    setPinned(false);
  }

  function enterDoor() {
    if (status !== "ready" || entering) return;
    if (reducedMotion) { navigate(active); return; }
    setEntering(controls.current?.enter(active) ?? false);
  }

  return (
    <section className="mx-auto flex w-full max-w-[1200px] flex-col items-center gap-5">
      <div className="relative w-full overflow-hidden rounded-2xl border border-primary/20 bg-[linear-gradient(140deg,#fffaf7,#f5e9e7)] shadow-lg dark:bg-[linear-gradient(140deg,#282025,#100d11)]">
        <div className="pointer-events-none absolute inset-x-0 top-3 z-10 text-center font-[family-name:var(--font-dc-mono)] text-xs text-foreground/70">
          {status === "ready" ? "Three.js · tiga pintu dalam satu scene" :
            status === "recovering" ? "Memulihkan tampilan 3D…" :
              status === "loading" ? "Menyiapkan tiga pintu 3D…" : "Mode navigasi ringan"}
        </div>
        <div
          ref={mount}
          role="img"
          aria-label="Tiga pintu berukir dalam satu ruang tiga dimensi, berputar mengelilingi pusat."
          className="h-[min(72dvh,730px)] min-h-[410px] w-full sm:min-h-[530px]"
          onPointerEnter={() => controls.current?.pause(true)}
          onPointerLeave={() => controls.current?.pause(false)}
        />
        {status === "fallback" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/90 p-7 text-center">
            <p className="max-w-md text-sm text-foreground/75">
              Perangkat ini tidak dapat menjalankan scene WebGL. Semua layanan tetap bisa dibuka melalui tautan biasa.
            </p>
            {DESTINATIONS.map((door) => (
              <Button key={door.id} asChild size="lg"><Link href={door.href}>{door.label}</Link></Button>
            ))}
          </div>
        )}
        {status === "recovering" && (
          <p role="status" className="absolute inset-0 flex items-center justify-center bg-background/70 text-sm">
            Menyambungkan kembali WebGL. Tautan layanan di bawah tetap tersedia.
          </p>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-xs text-foreground/65">
          {entering ? "Pintu membuka · kamera memasuki ruang…" :
            pinned ? "Pilihan tetap di depan sampai kamu memilih Putar lagi." :
              "Pilih layanan untuk memusatkan pintu."}
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Pilih pintu layanan">
        {DESTINATIONS.map((door) => (
          <Button
            key={door.id}
            type="button"
            disabled={entering || status !== "ready"}
            aria-pressed={active === door.id}
            onClick={() => chooseDoor(door.id)}
          >{door.label}</Button>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {pinned && !reducedMotion && (
          <Button type="button" disabled={entering || status !== "ready"} onClick={resumeOrbit}>
            Putar lagi
          </Button>
        )}
        <Button type="button" disabled={entering || status !== "ready"} onClick={enterDoor}>
          Masuk · {current.label}
        </Button>
        <Link className="text-sm text-foreground underline underline-offset-4" href={current.href}>
          Buka halaman tanpa animasi
        </Link>
        {entering && (
          <Button type="button" onClick={() => {
            controls.current?.cancel();
            setEntering(false);
          }}>Batal</Button>
        )}
      </div>
      <p role="status" aria-live="polite" className="text-center text-sm text-foreground/65">
        {entering ? "Tekan Esc atau Batal untuk menghentikan animasi." :
          "Mode pratinjau: bentuk setiap pintu memakai mesh Pintu 1 dengan palet Rose berbeda."}
      </p>
    </section>
  );
}
