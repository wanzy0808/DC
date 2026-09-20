"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { animate, useMotionValue, useReducedMotion } from "motion/react";
import { useTheme } from "@/components/Theme/ThemeProvider";
import PintuSectionJiplak from "./PintuSectionJiplak";
import type { PortalId } from "./three-portal-engine";

type ThreePortalSceneProps = {
  activeDoor: PortalId | null;
  setActiveDoor: (door: PortalId) => void;
};

const routes: Record<PortalId, string> = {
  1: "/event-planner",
  2: "/d-invitation",
  3: "/guestbook",
};

export default function ThreePortalScene({
  activeDoor,
  setActiveDoor,
}: ThreePortalSceneProps) {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const reducedMotion = useReducedMotion();
  // Same three-door orbital formula and 10 s timing as the original
  // Motion carousel, only the geometry renderer changes.
  const orbit = useMotionValue(11 / 12);
  const lastFrontRef = useRef<PortalId>(2);
  const orbitAnimationRef = useRef<ReturnType<typeof animate> | null>(null);
  const [paused, setPaused] = useState(false);
  const [orbitRestart, setOrbitRestart] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<PortalId>(activeDoor ?? 2);
  const darkRef = useRef(isDarkMode);
  const chooseRef = useRef(setActiveDoor);
  const enterRef = useRef((door: PortalId) => router.push(routes[door]));
  const [ready, setReady] = useState(false);
  const [unsupported, setUnsupported] = useState(false);

  activeRef.current = activeDoor ?? 2;
  darkRef.current = isDarkMode;
  chooseRef.current = setActiveDoor;
  enterRef.current = (door: PortalId) => router.push(routes[door]);

  useEffect(() => {
    if (!ready || paused || reducedMotion) {
      orbitAnimationRef.current?.stop();
      orbitAnimationRef.current = null;
      return;
    }

    const subscription = orbit.on("change", (value) => {
      const progress = ((value % 1) + 1) % 1;
      let nearest: PortalId = 1;
      let distance = Infinity;
      for (let index = 0; index < 3; index += 1) {
        const phase = (index / 3 + progress) % 1;
        const diff = Math.abs(phase - 0.25);
        const circular = Math.min(diff, 1 - diff);
        if (circular < distance) {
          distance = circular;
          nearest = (index + 1) as PortalId;
        }
      }
      if (nearest !== lastFrontRef.current) {
        lastFrontRef.current = nearest;
        chooseRef.current(nearest);
      }
    });
    const animation = animate(orbit, orbit.get() + 1, {
      duration: 10,
      ease: [0.42, 0, 0.58, 1],
      repeat: Infinity,
      repeatType: "loop",
      repeatDelay: 0.8,
    });
    orbitAnimationRef.current = animation;
    return () => {
      subscription();
      animation.stop();
      if (orbitAnimationRef.current === animation) orbitAnimationRef.current = null;
    };
  }, [ready, paused, reducedMotion, orbit, orbitRestart]);

  useEffect(() => {
    if (!ready || paused || reducedMotion) return;
    const selected = activeDoor ?? 2;
    if (selected === lastFrontRef.current) return;
    // Selector clicks reposition the same orbit instead of freezing cards.
    orbitAnimationRef.current?.stop();
    const target = ((0.25 - (selected - 1) / 3) % 1 + 1) % 1;
    lastFrontRef.current = selected;
    orbit.set(target);
    setOrbitRestart((count) => count + 1);
  }, [activeDoor, ready, paused, reducedMotion, orbit]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    let canceled = false;
    let dispose: (() => void) | undefined;

    async function start() {
      try {
        // WebGL2/Three is never loaded by the main landing: this import only
        // happens after the temporary /jiplak canvas has mounted.
        const { mountThreePortals } = await import("./three-portal-engine");
        if (canceled || !node) return;

        const cleanup = await mountThreePortals(node, {
          getActiveDoor: () => activeRef.current,
          getDarkMode: () => darkRef.current,
          onChoose: (door) => chooseRef.current(door),
          onEnter: (door) => enterRef.current(door),
          getOrbit: () => orbit.get(),
          onHover: (door) => {
            setPaused(true);
            chooseRef.current(door);
          },
          onLeave: () => setPaused(false),
          reducedMotion: Boolean(reducedMotion),
        });
        if (canceled) {
          cleanup();
          return;
        }
        dispose = cleanup;
        setReady(true);
        setUnsupported(false);
      } catch {
        if (!canceled) {
          setReady(false);
          setUnsupported(true);
        }
      }
    }

    void start();

    return () => {
      canceled = true;
      dispose?.();
    };
  }, [reducedMotion, orbit]);

  return (
    <div className="relative h-[420px] w-full overflow-visible sm:h-[510px] md:h-[580px] xl:h-[630px]">
      {!ready && (
        <div className="absolute inset-0 z-0 flex items-center justify-center">
          <PintuSectionJiplak
            activeDoor={activeDoor}
            setActiveDoor={setActiveDoor}
          />
        </div>
      )}

      {!unsupported && (
        <div
          ref={containerRef}
          className={`absolute inset-0 z-10 rounded-[40px] transition-opacity duration-700 ${
            ready ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
          }`}
          role="img"
          aria-label="Tiga portal tiga dimensi. Pilih pintu melalui tombol pilihan di sebelahnya, atau klik pintu untuk membukanya."
        />
      )}
    </div>
  );
}
