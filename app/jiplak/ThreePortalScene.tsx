"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useReducedMotion } from "motion/react";
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
  }, [reducedMotion]);

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
