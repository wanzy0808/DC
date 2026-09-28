"use client";

import { motion, useReducedMotion } from "motion/react";
import { useLanguage } from "@/components/I18n/LanguageProvider";

export default function LandingStoryCopy({ hidden = false }: { hidden?: boolean }) {
  const { locale } = useLanguage();
  const reduced = useReducedMotion();

  const copy =
    locale === "en"
      ? {
          eyebrow: "Every story has its doorway",
          title: "The next chapter is yours.",
          body: "Open one door. From the first invitation to the final farewell, let every detail feel personal and worth remembering.",
        }
      : {
          eyebrow: "Setiap cerita punya pintunya",
          title: "Bab berikutnya milikmu.",
          body: "Buka satu pintu. Dari undangan pertama hingga salam terakhir, biarkan setiap detail terasa personal dan layak dikenang.",
        };

  return (
    <motion.aside
      aria-hidden={hidden}
      initial={reduced ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: hidden ? 0 : 1, y: hidden ? 8 : 0 }}
      transition={{ duration: reduced ? 0 : 0.45, ease: "easeOut" }}
      className="pointer-events-none absolute bottom-[clamp(72px,8dvh,108px)] right-[clamp(18px,5.8vw,96px)] z-20 w-[min(76vw,330px)] text-right sm:w-[min(34vw,350px)] lg:w-[min(23vw,365px)]"
    >
      <div
        aria-hidden="true"
        className="absolute -inset-x-8 -inset-y-7 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(237,227,216,0.90),rgba(237,227,216,0.55)_52%,transparent_76%)] blur-[3px] dark:bg-[radial-gradient(ellipse_at_center,rgba(112,59,59,0.80),rgba(112,59,59,0.46)_55%,transparent_78%)]"
      />

      <p className="font-[family-name:var(--font-undara-body)] text-[9px] font-medium uppercase tracking-[0.18em] text-primary/72 sm:text-[10px] dark:text-[#D6B38C]/78">
        {copy.eyebrow}
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-undara-heading)] text-[clamp(1.15rem,1.7vw,1.65rem)] font-normal leading-[1.08] text-primary dark:text-[#D6B38C]">
        {copy.title}
      </h1>

      <div
        aria-hidden="true"
        className="ml-auto mt-3 h-px w-[150px] bg-gradient-to-l from-primary/45 via-primary/18 to-transparent dark:from-[#D6B38C]/38 dark:via-[#D6B38C]/14 sm:w-[180px]"
      />

      <p className="ml-auto mt-1 max-w-[34ch] font-[family-name:var(--font-undara-body)] text-[10px] leading-[1.55] text-foreground/76 sm:text-[11px] lg:text-[12px]">
        {copy.body}
      </p>
    </motion.aside>
  );
}
