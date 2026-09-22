"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { isMarketingPath } from "@/lib/marketing-paths";
import { useMarketingTransitionAudio } from "@/components/Layout/MarketingAudio";

const COVER_MS = 780;
const DOOR_COVER_MS = 950;
const REVEAL_MS = 900;
const STALLED_ROUTE_MS = 8000;
type Phase = "idle" | "cover" | "hold" | "reveal";
type PendingRoute = { path: string; href: string };

/**
 * One persistent rose veil for both a door entry and ordinary marketing links.
 * Cover -> route commit -> reveal. Dashboard/auth/checkout/external links are not intercepted.
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
    delete document.documentElement.dataset.dcMarketingTransition;
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
      document.documentElement.dataset.dcMarketingTransition = "1";
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
    window.addEventListener("dc-portal-prime", onDoorPrime);
    window.addEventListener("dc-portal-start", onDoorStart);
    return () => {
      document.removeEventListener("click", onMarketingLink, true);
      window.removeEventListener("dc-portal-prime", onDoorPrime);
      window.removeEventListener("dc-portal-start", onDoorStart);
      clearTimers();
      delete document.documentElement.dataset.dcMarketingTransition;
    };
  }, [router, reducedMotion]);

  useEffect(() => {
    if (!pending.current || pending.current.path !== pathname || phase !== "hold") return;
    const timer = window.setTimeout(() => {
      document.documentElement.dataset.dcMarketingTransition = "reveal";
      setPhase("reveal");
      // Destination sections begin assembling in sync with the opening veil.
      window.dispatchEvent(new Event("dc-marketing-reveal"));
      timers.current.push(window.setTimeout(reset, REVEAL_MS + 80));
    }, 90);
    return () => clearTimeout(timer);
  }, [pathname, phase]);

  if (phase === "idle" || reducedMotion) return null;
  return (
    <div aria-hidden="true" className="pointer-events-auto fixed inset-0 z-[9999] overflow-hidden">
      <div
        className="absolute inset-0 bg-[#fae9ef] dark:bg-[#251b21]"
        style={{
          clipPath: "circle(155% at 50% 50%)",
          animation: phase === "cover"
            ? `dc-marketing-veil-in ${coverDuration}ms cubic-bezier(.22,1,.36,1) both`
            : phase === "reveal"
              ? `dc-marketing-veil-out ${REVEAL_MS}ms cubic-bezier(.22,1,.36,1) both`
              : undefined,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,248,252,.94)_0%,rgba(246,186,206,.76)_25%,rgba(192,122,132,.18)_57%,transparent_78%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(255,234,242,.9)_0%,rgba(211,137,158,.56)_30%,rgba(192,122,132,.13)_65%,transparent_85%)]"
        style={{ animation: phase === "cover" ? "dc-marketing-glow-in 780ms ease-out both" : phase === "reveal" ? "dc-marketing-glow-out 700ms ease-in both" : undefined, opacity: phase === "hold" ? 1 : undefined }}
      />
    </div>
  );
}
