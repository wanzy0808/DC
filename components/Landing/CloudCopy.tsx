"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { useLanguage } from "@/components/I18n/LanguageProvider";

export default function CloudCopy({ corner }: { corner: "top" | "bottom" }) {
  const { locale } = useLanguage();
  const reduced = useReducedMotion();
  const [flying, setFlying] = useState(false);
  useEffect(() => {
    if (!flying) return;
    const timer = window.setTimeout(() => setFlying(false), 1450);
    return () => window.clearTimeout(timer);
  }, [flying]);
  const top = corner === "top";
  return (
    <motion.div
      onPointerEnter={(event) => { if (event.pointerType === "mouse" && !reduced) setFlying(true); }}
      onPointerDown={() => { if (!reduced) setFlying(true); }}
      initial={reduced ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: flying ? 0.35 : 1, x: flying ? (top ? -105 : 105) : 0, y: flying ? (top ? -65 : 65) : 0, rotate: flying ? (top ? -8 : 8) : 0, scale: flying ? 0.84 : 1 }}
      transition={{ type: "spring", stiffness: flying ? 95 : 65, damping: 18, delay: flying ? 0 : top ? 0.2 : 0.7 }}
      className={top
        ? "pointer-events-auto absolute left-2 top-4 z-20 w-[min(78vw,340px)] sm:left-7 sm:top-8 lg:left-[5%] lg:top-[12%] lg:w-[min(28vw,410px)]"
        : "pointer-events-auto absolute bottom-5 right-2 z-20 w-[min(69vw,285px)] sm:bottom-9 sm:right-8 lg:bottom-[12%] lg:right-[5%] lg:w-[min(24vw,335px)]"}
    >
      <div className="relative isolate px-7 py-6 text-center sm:px-9 sm:py-8">
        <div aria-hidden="true" className="absolute inset-0 -z-10 rounded-[48%_52%_47%_53%/52%_48%_52%_48%] border border-primary/10 bg-background/75 shadow-[0_14px_45px_rgba(192,122,132,0.09)] backdrop-blur-md" />
        <div aria-hidden="true" className="absolute -bottom-2 left-[19%] -z-20 size-12 rounded-full bg-background/70 blur-[2px]" />
        <div aria-hidden="true" className="absolute -top-2 right-[17%] -z-20 size-14 rounded-full bg-background/70 blur-[2px]" />
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
