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
    const timer = window.setTimeout(() => setPhase("rest"), 2600);
    return () => window.clearTimeout(timer);
  }, [phase]);
  const top = corner === "top";
  const textVisible = phase === "rest" || phase === "return";
  const assemble = phase === "return";
  return (
    <motion.div
      onPointerEnter={(event) => { if (event.pointerType === "mouse" && !reduced && phase === "rest") setPhase("depart"); }}
      onPointerDown={() => { if (!reduced && phase === "rest") setPhase("depart"); }}
      initial={reduced ? false : { opacity: 0, y: 14 }}
      animate={phase === "depart"
        ? { opacity: 0, x: top ? -440 : 440, y: top ? -130 : 130, rotate: top ? -11 : 11, scale: 0.85 }
        : phase === "pause" ? { opacity: 0, x: top ? -440 : 440, y: top ? -130 : 130, rotate: top ? -11 : 11, scale: 0.85 }
        : { opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
      transition={phase === "depart"
        ? { duration: 0.95, ease: [0.32, 0, 0.65, 1] }
        : phase === "return" ? { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
        : { duration: 0 }}
      style={{ pointerEvents: phase === "rest" ? "auto" : "none" }}
      className={top
        ? "absolute left-2 top-4 z-20 w-[min(78vw,340px)] sm:left-7 sm:top-8 lg:left-[5%] lg:top-[12%] lg:w-[min(30vw,440px)]"
        : "absolute bottom-5 right-2 z-20 w-[min(69vw,285px)] sm:bottom-9 sm:right-8 lg:bottom-[12%] lg:w-[min(26vw,370px)]"}
    >
      <div className="relative isolate px-7 py-9 text-center sm:px-9 sm:py-11">
        {/* Multiple overlapping soft lobes create a cloud silhouette rather than a rounded card. */}
        <motion.div initial={false} animate={{ opacity: phase === "return" ? 1 : 1, scale: assemble ? [0.82, 1.06, 1] : 1 }} transition={{ duration: 0.75 }} aria-hidden="true" className="pointer-events-none absolute inset-x-[5%] inset-y-[13%] -z-10 rounded-[48%] border-2 border-primary/65 bg-background/90 shadow-[0_12px_40px_rgba(192,122,132,0.10)] backdrop-blur-md" />
        <div aria-hidden="true" className="pointer-events-none absolute -top-[8%] left-[17%] -z-10 h-[76%] w-[43%] rounded-full border border-primary/50 bg-background/95" />
        <div aria-hidden="true" className="pointer-events-none absolute -top-[13%] right-[14%] -z-10 h-[86%] w-[47%] rounded-full bg-background/95" />
        <div aria-hidden="true" className="pointer-events-none absolute bottom-[1%] left-[5%] -z-10 h-[65%] w-[42%] rounded-full bg-background/95" />
        <div aria-hidden="true" className="pointer-events-none absolute bottom-[1%] right-[4%] -z-10 h-[69%] w-[43%] rounded-full bg-background/95" />
        <motion.div initial={false} animate={{ opacity: textVisible ? 1 : 0 }} transition={{ duration: 0.1, delay: assemble ? 0.65 : 0 }}>
        {top ? (
          <>
            <p className="font-[family-name:var(--font-dc-mono)] text-[9px] uppercase tracking-[0.13em] text-foreground/55 sm:text-[10px]"><LetterLine text={locale === "en" ? "For moments worth remembering" : "Untuk momen yang ingin dikenang"} active={textVisible} delay={assemble ? 0.7 : 0} /></p>
            <h1 className="mt-2 font-[family-name:var(--font-dc-heading)] text-xl leading-tight text-primary sm:text-2xl lg:text-[clamp(1.4rem,2.2vw,2.4rem)]"><LetterLine text={locale === "en" ? "Every story" : "Setiap cerita"} active={textVisible} delay={assemble ? 1.15 : 0} /><br /><LetterLine text={locale === "en" ? "begins somewhere." : "punya awalnya."} active={textVisible} delay={assemble ? 1.45 : 0} /></h1>
            <p className="mx-auto mt-3 max-w-[29ch] text-[11px] leading-relaxed text-foreground/75 sm:text-xs"><LetterLine text={locale === "en" ? "A celebration, a gathering, or a small moment with the people who matter. Choose the door that feels like your story." : "Perayaan, pertemuan, atau momen sederhana bersama orang-orang terdekat. Pilih pintu yang paling menggambarkan ceritamu."} active={textVisible} delay={assemble ? 1.8 : 0} /></p>
          </>
        ) : (
          <>
            <p className="font-[family-name:var(--font-dc-heading)] text-base leading-snug text-primary sm:text-xl"><LetterLine text={locale === "en" ? "The next chapter is yours." : "Bab berikutnya milikmu."} active={textVisible} delay={assemble ? 0.75 : 0} /></p>
            <p className="mt-2 text-[11px] leading-relaxed text-foreground/70 sm:text-xs"><LetterLine text={locale === "en" ? "Open a door. Make the moment yours." : "Buka satu pintu. Jadikan momennya milikmu."} active={textVisible} delay={assemble ? 1.25 : 0} /></p>
            <p className="mx-auto mt-2 max-w-[29ch] text-[11px] leading-relaxed text-foreground/75 sm:text-xs"><LetterLine text={locale === "en" ? "From the first invitation to the last warm farewell, let every detail feel personal and worth remembering." : "Dari undangan pertama hingga salam perpisahan yang hangat, biarkan setiap detail terasa personal dan layak dikenang."} active={textVisible} delay={assemble ? 1.65 : 0} /></p>
          </>
        )}
        </motion.div>
      </div>
    </motion.div>
  );
}
