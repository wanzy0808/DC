"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { useLanguage } from "@/components/I18n/LanguageProvider";

function LetterLine({ text, active, delay = 0 }: { text: string; active: boolean; delay?: number }) {
  return <span aria-label={text} className="inline-block">{Array.from(text).map((letter, index) =>
    <motion.span key={index} aria-hidden="true" className="inline-block whitespace-pre"
      initial={false}
      animate={{ opacity: active ? 1 : 0, y: active ? 0 : 7, scale: active ? 1 : 0.88 }}
      transition={{ duration: 0.22, delay: active ? delay + index * 0.026 : 0 }}>
      {letter}
    </motion.span>
  )}</span>;
}

export default function CloudCopy({ corner }: { corner: "top" | "bottom" }) {
  const { locale } = useLanguage();
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<"rest" | "depart" | "pause" | "return">("rest");
  useEffect(() => {
    if (phase !== "depart") return;
    const timer = window.setTimeout(() => setPhase("pause"), 1050);
    return () => window.clearTimeout(timer);
  }, [phase]);
  useEffect(() => {
    if (phase !== "pause") return;
    const timer = window.setTimeout(() => setPhase("return"), 550);
    return () => window.clearTimeout(timer);
  }, [phase]);
  useEffect(() => {
    if (phase !== "return") return;
    const timer = window.setTimeout(() => setPhase("rest"), 5600);
    return () => window.clearTimeout(timer);
  }, [phase]);
  const top = corner === "top";
  const textVisible = phase === "rest" || phase === "return";
  const assemble = phase === "return";
  const cloudVisible = phase === "rest" || phase === "depart" || phase === "return";
  return (
    <motion.div
      onPointerEnter={(event) => { if (event.pointerType === "mouse" && !reduced && phase === "rest") setPhase("depart"); }}
      onPointerDown={() => { if (!reduced && phase === "rest") setPhase("depart"); }}
      initial={reduced ? false : { opacity: 0, y: 14 }}
      animate={phase === "depart"
        ? { opacity: 0, x: top ? -440 : 440, y: top ? -130 : 130, rotate: top ? -11 : 11, scale: 0.85 }
        : phase === "pause" ? { opacity: 0, x: 0, y: 0, rotate: 0, scale: 1 }
        : { opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
      transition={phase === "depart"
        ? { duration: 0.95, ease: [0.32, 0, 0.65, 1] }
        : phase === "return" ? { duration: 0 }
        : { duration: 0 }}
      style={{ pointerEvents: phase === "rest" ? "auto" : "none" }}
      className={top
        ? "absolute left-1/2 top-[clamp(78px,12dvh,135px)] z-20 w-[min(88%,390px)] -translate-x-1/2 sm:left-[3%] sm:top-2 sm:translate-x-0 lg:left-[2%] lg:top-[3%] lg:w-[min(31vw,510px)]"
         : "absolute bottom-[clamp(55px,9dvh,110px)] right-1/2 z-20 w-[min(78%,320px)] translate-x-1/2 sm:bottom-[5%] sm:right-[8%] sm:translate-x-0 lg:bottom-[6%] lg:right-[11%] lg:w-[min(25vw,420px)]"}
    >
      <div className={top ? "relative isolate px-5 py-6 text-center sm:px-12 sm:py-12 lg:px-14" : "relative isolate px-5 py-5 text-center sm:px-10 sm:py-10 lg:px-12"}>
        {/* A single alpha silhouette keeps the rose outline outside the cloud only. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          {/* A single translucent cloud silhouette prevents overlapping circles in dark mode. */}
          <motion.svg viewBox="0 0 400 300" preserveAspectRatio="none" className="absolute -inset-[5%] h-[110%] w-[110%] overflow-visible text-background/30 dark:text-[#241b20]/80" aria-hidden="true" initial={false} animate={{ opacity: cloudVisible ? 1 : 0 }} transition={{ duration: 0.2 }}>
            <path d="M70 251 C36 249 22 221 30 193 C8 166 20 130 51 117 C52 83 80 60 112 65 C133 28 178 21 208 43 C242 8 298 24 307 66 C346 66 369 95 367 126 C399 148 400 185 374 208 C377 240 344 262 311 249 C282 271 251 260 230 250 C202 263 170 255 153 248 C122 269 88 263 70 251 Z" fill="currentColor" />
          </motion.svg>
          {/* One continuous rose outline around the filled cloud. */}
          <motion.svg viewBox="0 0 400 300" preserveAspectRatio="none" className="absolute -inset-[5%] h-[110%] w-[110%] overflow-visible text-primary/85" fill="none" aria-hidden="true" initial={false} animate={{ opacity: cloudVisible ? 1 : 0 }} transition={{ duration: 0.15 }}>
            <motion.path initial={false} animate={{ pathLength: assemble ? [0, 0, 1] : cloudVisible ? 1 : 0 }} transition={{ duration: assemble ? 1.3 : 0.15, times: [0, 0.5, 1], ease: "easeOut" }} d="M70 251 C36 249 22 221 30 193 C8 166 20 130 51 117 C52 83 80 60 112 65 C133 28 178 21 208 43 C242 8 298 24 307 66 C346 66 369 95 367 126 C399 148 400 185 374 208 C377 240 344 262 311 249 C282 271 251 260 230 250 C202 263 170 255 153 248 C122 269 88 263 70 251 Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          </motion.svg>
        </div>
        <motion.div className="relative z-10" initial={false} animate={{ opacity: textVisible ? 1 : 0 }} transition={{ duration: 0.1, delay: assemble ? 1.05 : 0 }}>
        {top ? (
          <>
            <p className="font-[family-name:var(--font-dc-mono)] text-[10px] uppercase tracking-[0.10em] text-neutral-700 dark:text-white/85 sm:text-[11px]"><LetterLine text={locale === "en" ? "For moments worth remembering" : "Untuk momen yang ingin dikenang"} active={textVisible} delay={assemble ? 1.1 : 0} /></p>
            <h1 className="mt-2 font-[family-name:var(--font-dc-heading)] text-[20px] leading-[1.16] text-primary sm:text-[30px] lg:text-[clamp(1.85rem,2vw,2.1rem)]"><LetterLine text={locale === "en" ? "Every story" : "Setiap cerita"} active={textVisible} delay={assemble ? 1.55 : 0} /><br /><LetterLine text={locale === "en" ? "begins somewhere." : "punya awalnya."} active={textVisible} delay={assemble ? 1.85 : 0} /></h1>
            <p className="mx-auto mt-3 max-w-[39ch] text-[11px] leading-[1.45] text-neutral-800 dark:text-white/90 sm:text-[13px] lg:text-[14px]"><LetterLine text={locale === "en" ? "A celebration, a gathering, or a small moment with the people who matter. Choose the door that feels like your story." : "Perayaan, pertemuan, atau momen sederhana bersama orang-orang terdekat. Pilih pintu yang paling menggambarkan ceritamu."} active={textVisible} delay={assemble ? 2.2 : 0} /></p>
          </>
        ) : (
          <>
            <p className="font-[family-name:var(--font-dc-heading)] text-[17px] leading-[1.2] text-primary sm:text-[23px] lg:text-[24px]"><LetterLine text={locale === "en" ? "The next chapter is yours." : "Bab berikutnya milikmu."} active={textVisible} delay={assemble ? 1.1 : 0} /></p>
            <p className="mt-2 text-[11px] leading-[1.4] text-neutral-800 dark:text-white/90 sm:text-[13px]"><LetterLine text={locale === "en" ? "Open a door. Make the moment yours." : "Buka satu pintu. Jadikan momennya milikmu."} active={textVisible} delay={assemble ? 1.65 : 0} /></p>
            <p className="mx-auto mt-2 max-w-[37ch] text-[12px] leading-[1.5] text-neutral-800 dark:text-white/90 sm:text-[13px]"><LetterLine text={locale === "en" ? "From the first invitation to the last warm farewell, let every detail feel personal and worth remembering." : "Dari undangan pertama hingga salam perpisahan yang hangat, biarkan setiap detail terasa personal dan layak dikenang."} active={textVisible} delay={assemble ? 2.05 : 0} /></p>
          </>
        )}
        </motion.div>
      </div>
    </motion.div>
  );
}
