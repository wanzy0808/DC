"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const COVER_MS = 2200;
const REVEAL_MS = 1900;

/** Lives above the router so the door is never visible during destination reveal. */
export default function PortalTransition() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<"idle" | "cover" | "hold" | "reveal">("idle");
  const destination = useRef<string | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const clear = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  useEffect(() => {
    const start = (event: Event) => {
      const href = (event as CustomEvent<{ href: string }>).detail?.href;
      if (!href || destination.current) return;
      destination.current = href;
      setPhase("cover");
      timers.current.push(setTimeout(() => setPhase("hold"), COVER_MS));
    };
    window.addEventListener("dc-portal-start", start);
    return () => { window.removeEventListener("dc-portal-start", start); clear(); };
  }, []);
  useEffect(() => {
    if (!destination.current || pathname !== destination.current || phase !== "hold") return;
    // Wait for destination to commit and paint while the opaque glow hides the old door.
    const frame = requestAnimationFrame(() => {
      timers.current.push(setTimeout(() => {
        setPhase("reveal");
        timers.current.push(setTimeout(() => {
          destination.current = null;
          setPhase("idle");
        }, REVEAL_MS + 120));
      }, 300));
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname, phase]);
  if (phase === "idle") return null;
  return <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[9999]"
    style={{
      background: "radial-gradient(ellipse at 50% 52%, #fff7fa 0%, #ffd8e7 32%, #f3a1bd 72%, #d8799b 100%)",
      opacity: phase === "cover" ? 1 : phase === "hold" ? 1 : 0,
      transition: phase === "cover" ? `opacity ${COVER_MS}ms cubic-bezier(.22,1,.36,1)` : phase === "reveal" ? `opacity ${REVEAL_MS}ms cubic-bezier(.22,1,.36,1)` : "none",
      animation: phase === "cover" ? `dc-portal-cover ${COVER_MS}ms cubic-bezier(.22,1,.36,1) both` : undefined,
    }} />;
}
