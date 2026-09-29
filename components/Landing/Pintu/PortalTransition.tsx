"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useReducedMotion } from "motion/react";
import { isMarketingPath } from "@/lib/marketing-paths";
import { useMarketingTransitionAudio } from "@/components/Layout/MarketingAudio";

const COVER_MS = 1120;
const DOOR_COVER_MS = 1360;
const REVEAL_MS = 1180;
const STALLED_ROUTE_MS = 8000;
type Phase = "idle" | "cover" | "hold" | "reveal";
type PendingRoute = { path: string; href: string };

/**
 * One persistent woodland passage for both a door entry and ordinary marketing links.
 * Foliage closes toward the viewer, the route commits behind it, then the plants
 * part again so the destination reads like a new clearing.
 * Dashboard/auth/checkout/external links are not intercepted.
 */
export default function PortalTransition() {
  const pathname = usePathname();
  const router = useRouter();
  const reducedMotion = Boolean(useReducedMotion());
  const { primeTransitionSound, playTransitionSound } = useMarketingTransitionAudio();
  const primeRef = useRef(primeTransitionSound);
  const playRef = useRef(playTransitionSound);
  primeRef.current = primeTransitionSound;
  playRef.current = playTransitionSound;

  const [phase, setPhase] = useState<Phase>("idle");
  const [coverDuration, setCoverDuration] = useState(COVER_MS);
  const pending = useRef<PendingRoute | null>(null);
  const timers = useRef<number[]>([]);
  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  const reset = () => {
    clearTimers();
    pending.current = null;
    delete document.documentElement.dataset.undaraMarketingTransition;
    setPhase("idle");
  };

  useEffect(() => {
    const begin = (href: string, viaDoor: boolean) => {
      if (pending.current) return;
      const url = new URL(href, window.location.origin);
      pending.current = { path: url.pathname, href: url.pathname + url.search + url.hash };
      if (reducedMotion) {
        if (!viaDoor) router.push(pending.current.href);
        pending.current = null;
        return;
      }
      document.documentElement.dataset.undaraMarketingTransition = "1";
      playRef.current();
      const cover = viaDoor ? DOOR_COVER_MS : COVER_MS;
      setCoverDuration(cover);
      setPhase("cover");
      timers.current.push(window.setTimeout(() => setPhase("hold"), cover));
      // The 3D door owns its camera zoom and router.push; ordinary links navigate after cover.
      if (!viaDoor) {
        timers.current.push(window.setTimeout(() => {
          if (pending.current) router.push(pending.current.href);
        }, cover + 35));
      }
      // Never leave an opaque veil blocking navigation if a route fails to commit.
      timers.current.push(window.setTimeout(() => {
        if (pending.current) reset();
      }, STALLED_ROUTE_MS));
    };

    const onMarketingLink = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (!isMarketingPath(window.location.pathname)) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor || anchor.hasAttribute("download") || (anchor.target && anchor.target !== "_self")) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin || !isMarketingPath(url.pathname)) return;
      if (url.pathname === window.location.pathname) return; // Keep in-page links and same-page actions native.
      event.preventDefault();
      primeRef.current();
      begin(url.pathname + url.search + url.hash, false);
    };

    const onDoorPrime = () => primeRef.current();
    const onDoorStart = (event: Event) => {
      const href = (event as CustomEvent<{ href: string }>).detail?.href;
      if (href) begin(href, true);
    };

    document.addEventListener("click", onMarketingLink, true);
    window.addEventListener("undara-portal-prime", onDoorPrime);
    window.addEventListener("undara-portal-start", onDoorStart);
    return () => {
      document.removeEventListener("click", onMarketingLink, true);
      window.removeEventListener("undara-portal-prime", onDoorPrime);
      window.removeEventListener("undara-portal-start", onDoorStart);
      clearTimers();
      delete document.documentElement.dataset.undaraMarketingTransition;
    };
  }, [router, reducedMotion]);

  useEffect(() => {
    if (!pending.current || pending.current.path !== pathname || phase !== "hold") return;
    const timer = window.setTimeout(() => {
      document.documentElement.dataset.undaraMarketingTransition = "reveal";
      setPhase("reveal");
      // Destination sections begin assembling in sync with the opening veil.
      window.dispatchEvent(new Event("undara-marketing-reveal"));
      timers.current.push(window.setTimeout(reset, REVEAL_MS + 80));
    }, 90);
    return () => clearTimeout(timer);
  }, [pathname, phase]);

  if (phase === "idle" || reducedMotion) return null;
  return (
    <div
      aria-hidden="true"
      className="undara-portal-transition"
      data-phase={phase}
      style={{
        "--undara-portal-cover-ms": `${coverDuration}ms`,
        "--undara-portal-reveal-ms": `${REVEAL_MS}ms`,
      } as CSSProperties}
    >
      <div className="undara-portal-transition__landscape" />
      <div className="undara-portal-transition__mist undara-portal-transition__mist--back" />

      <div className="undara-branch-gate undara-branch-gate--left-1" />
      <div className="undara-branch-gate undara-branch-gate--right-1" />
      <div className="undara-branch-gate undara-branch-gate--left-2" />
      <div className="undara-branch-gate undara-branch-gate--right-2" />
      <div className="undara-branch-gate undara-branch-gate--left-3" />
      <div className="undara-branch-gate undara-branch-gate--right-3" />
      <div className="undara-branch-gate undara-branch-gate--left-4" />
      <div className="undara-branch-gate undara-branch-gate--right-4" />
      <div className="undara-branch-gate undara-branch-gate--left-5" />
      <div className="undara-branch-gate undara-branch-gate--right-5" />

      <div className="undara-branch-gate undara-branch-gate--top-left" />
      <div className="undara-branch-gate undara-branch-gate--top-right" />
      <div className="undara-branch-gate undara-branch-gate--top-mid-left" />
      <div className="undara-branch-gate undara-branch-gate--top-mid-right" />
      <div className="undara-branch-gate undara-branch-gate--bottom-left" />
      <div className="undara-branch-gate undara-branch-gate--bottom-right" />
      <div className="undara-branch-gate undara-branch-gate--brush" />

      <div className="undara-portal-transition__mist undara-portal-transition__mist--front" />
      <div className="undara-branch-gate undara-branch-gate--near-left" />
      <div className="undara-branch-gate undara-branch-gate--near-right" />
      <div className="undara-branch-gate undara-branch-gate--cross-left" />
      <div className="undara-branch-gate undara-branch-gate--cross-right" />
      <div className="undara-portal-transition__vignette" />
    </div>
  );
}
