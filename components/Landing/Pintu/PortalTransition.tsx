"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const COVER_MS = 2100;
const REVEAL_MS = 1750;

/** Stays mounted across routes; never reveal the old door during the transition. */
export default function PortalTransition() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<"idle" | "cover" | "hold" | "reveal">("idle");
  const destination = useRef<string | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => {
    const start = (event: Event) => {
      const href = (event as CustomEvent<{ href: string }>).detail?.href;
      if (!href || destination.current) return;
      destination.current = href;
      setPhase("cover");
      timers.current.push(setTimeout(() => setPhase("hold"), COVER_MS));
    };
    window.addEventListener("dc-portal-start", start);
    return () => {
      window.removeEventListener("dc-portal-start", start);
      timers.current.forEach(clearTimeout);
    };
  }, []);
  useEffect(() => {
    if (!destination.current || pathname !== destination.current || phase !== "hold") return;
    const frame = requestAnimationFrame(() => {
      timers.current.push(setTimeout(() => {
        setPhase("reveal");
        timers.current.push(setTimeout(() => {
          destination.current = null;
          setPhase("idle");
        }, REVEAL_MS + 120));
      }, 400));
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname, phase]);
  if (phase === "idle") return null;
  return <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden">
    <div className="absolute inset-0 bg-[#f9e9ee] dark:bg-[#241b20]"
      style={{ opacity: phase === "reveal" ? 0 : 1, transition: phase === "reveal" ? `opacity ${REVEAL_MS}ms ease-in-out` : "none" }} />
    <div className="absolute aspect-square w-[min(80vw,80vh)] max-w-[1100px] rounded-full"
      style={{
        background: "radial-gradient(circle, #fff9fb 0%, #ffe3ed 38%, #f3a1bd 74%, #d8799b 100%)",
        boxShadow: "0 0 100px 65px rgba(247,171,201,.65)",
        transform: phase === "cover" ? "scale(1)" : phase === "reveal" ? "scale(0)" : "scale(1)",
        opacity: phase === "reveal" ? 0 : 1,
        animation: phase === "cover" ? `dc-portal-grow ${COVER_MS}ms cubic-bezier(.22,1,.36,1) both` : undefined,
        transition: phase === "reveal" ? `transform ${REVEAL_MS}ms cubic-bezier(.22,1,.36,1), opacity ${REVEAL_MS}ms ease-in` : "none",
      }} />
  </div>;
}
