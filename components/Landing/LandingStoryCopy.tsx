"use client";

import { motion, useReducedMotion } from "motion/react";
import { useLanguage } from "@/components/I18n/LanguageProvider";

export default function LandingStoryCopy({ hidden = false }: { hidden?: boolean }) {
  const { locale } = useLanguage();
  const reduced = useReducedMotion();

  const copy =
    locale === "en"
      ? {
          eyebrow: "Every story begins at a doorway",
          title: "Find what you need beyond the door.",
          body: [
            "Everything your celebration needs is here,",
            "so your day can feel more personal, warm, and full of meaning.",
          ],
        }
      : {
          eyebrow: "Setiap cerita dimulai dari sebuah pintu",
          title: "Temukan kebutuhanmu di balik pintu.",
          body: [
            "Seluruh kebutuhan perayaanmu ada di sini,",
            "semoga perayaanmu terasa lebih personal, hangat dan penuh makna.",
          ],
        };

  return (
    <motion.aside
      aria-hidden={hidden}
      initial={reduced ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: hidden ? 0 : 1, y: hidden ? 8 : 0 }}
      transition={{ duration: reduced ? 0 : 0.45, ease: "easeOut" }}
      className="pointer-events-none absolute bottom-[clamp(72px,8dvh,108px)] right-[clamp(18px,5.2vw,88px)] z-20 w-[min(88vw,460px)] text-left sm:w-[min(42vw,520px)] lg:w-[min(31vw,560px)]"
    >
      <div
        aria-hidden="true"
        className="absolute -inset-x-8 -inset-y-7 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(237,227,216,0.90),rgba(237,227,216,0.55)_52%,transparent_76%)] blur-[3px] dark:bg-[radial-gradient(ellipse_at_center,rgba(24,10,10,0.34),rgba(24,10,10,0.14)_55%,transparent_78%)]"
      />

      <p className="font-[family-name:var(--font-undara-body)] text-[10px] font-medium uppercase tracking-[0.17em] text-primary/72 sm:text-[11px] lg:text-[12px] dark:text-[#D6B38C]/78">
        {copy.eyebrow}
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-undara-heading)] text-[clamp(1.35rem,2.05vw,2.05rem)] font-normal leading-[1.08] text-primary dark:text-[#D6B38C]">
        {copy.title}
      </h1>

      <div
        aria-hidden="true"
        className="mt-3 flex h-8 w-[280px] items-center justify-start text-primary/65 sm:w-[350px] lg:w-[430px] dark:text-[#D6B38C]/72"
      >
        <span
          className="block h-full w-full bg-current"
          style={{
            WebkitMaskImage: 'url("/assets/landing/ornaments/botanical/branch-05.webp")',
            maskImage: 'url("/assets/landing/ornaments/botanical/branch-05.webp")',
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskPosition: "left center",
            maskPosition: "left center",
            WebkitMaskSize: "contain",
            maskSize: "contain",
          }}
        />
      </div>

      <p className="mt-1 w-full max-w-none font-[family-name:var(--font-undara-body)] text-[11px] leading-[1.6] text-foreground/78 sm:text-[12px] lg:text-[13px]">
        <span className="block">{copy.body[0]}</span>
        <span className="block">{copy.body[1]}</span>
      </p>
    </motion.aside>
  );
}
