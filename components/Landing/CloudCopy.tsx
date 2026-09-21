"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { useLanguage } from "@/components/I18n/LanguageProvider";

export default function CloudCopy({ corner }: { corner: "top" | "bottom" }) {
  const { locale } = useLanguage();
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<"rest" | "depart" | "return">("rest");
  useEffect(() => {
    if (phase !== "depart") return;
    const timer = window.setTimeout(() => setPhase("return"), 1050);
    return () => window.clearTimeout(timer);
  }, [phase]);
  useEffect(() => {
    if (phase !== "return") return;
    const timer = window.setTimeout(() => setPhase("rest"), 1250);
    return () => window.clearTimeout(timer);
  }, [phase]);
  const top = corner === "top";
  return (
    <motion.div
      onPointerEnter={(event) => { if (event.pointerType === "mouse" && !reduced && phase === "rest") setPhase("depart"); }}
      onPointerDown={() => { if (!reduced && phase === "rest") setPhase("depart"); }}
      initial={reduced ? false : { opacity: 0, y: 14 }}
      animate={phase === "depart"
        ? { opacity: 0, x: top ? -440 : 440, y: top ? -130 : 130, rotate: top ? -11 : 11, scale: 0.85 }
        : phase === "return" ? { opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }
        : { opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
      transition={phase === "depart"
        ? { duration: 0.95, ease: [0.32, 0, 0.65, 1] }
        : { duration: phase === "return" ? 1.2 : 0.85, ease: [0.22, 1, 0.36, 1] }}
      style={{ pointerEvents: phase === "rest" ? "auto" : "none" }}
      className={top
        ? "absolute left-2 top-4 z-20 w-[min(78vw,340px)] sm:left-7 sm:top-8 lg:left-[5%] lg:top-[12%] lg:w-[min(28vw,410px)]"
        : "absolute bottom-5 right-2 z-20 w-[min(69vw,285px)] sm:bottom-9 sm:right-8 lg:bottom-[12%] lg:w-[min(24vw,335px)]"}
    >
      <div className="relative isolate px-7 py-7 text-center sm:px-9 sm:py-9">
        {/* Multiple overlapping soft lobes create a cloud silhouette rather than a rounded card. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-[5%] inset-y-[13%] -z-10 rounded-[48%] border border-primary/10 bg-background/90 shadow-[0_12px_40px_rgba(192,122,132,0.10)] backdrop-blur-md" />
        <div aria-hidden="true" className="pointer-events-none absolute -top-[8%] left-[17%] -z-10 h-[76%] w-[43%] rounded-full bg-background/95" />
        <div aria-hidden="true" className="pointer-events-none absolute -top-[13%] right-[14%] -z-10 h-[86%] w-[47%] rounded-full bg-background/95" />
        <div aria-hidden="true" className="pointer-events-none absolute bottom-[1%] left-[5%] -z-10 h-[65%] w-[42%] rounded-full bg-background/95" />
        <div aria-hidden="true" className="pointer-events-none absolute bottom-[1%] right-[4%] -z-10 h-[69%] w-[43%] rounded-full bg-background/95" />
        {top ? (
          <>
            <p className="font-[family-name:var(--font-dc-mono)] text-[9px] uppercase tracking-[0.13em] text-foreground/55 sm:text-[10px]">{locale === "en" ? "For moments worth remembering" : "Untuk momen yang ingin dikenang"}</p>
            <h1 className="mt-2 font-[family-name:var(--font-dc-heading)] text-xl leading-tight text-primary sm:text-2xl lg:text-[clamp(1.4rem,2.2vw,2.4rem)]">{locale === "en" ? <>Every story<br />begins somewhere.</> : <>Setiap cerita<br />punya awalnya.</>}</h1>
          </>
        ) : (
          <>
            <p className="font-[family-name:var(--font-dc-heading)] text-base leading-snug text-primary sm:text-xl">{locale === "en" ? "The next chapter is yours." : "Bab berikutnya milikmu."}</p>
            <p className="mt-2 text-[11px] leading-relaxed text-foreground/70 sm:text-xs">{locale === "en" ? "Open a door. Make the moment yours." : "Buka satu pintu. Jadikan momennya milikmu."}</p>
          </>
        )}
      </div>
    </motion.div>
  );
}
