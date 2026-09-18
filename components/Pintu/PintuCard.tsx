"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, BookOpen, CalendarDays, Mail } from "lucide-react";
import { useTheme } from "@/components/Theme/ThemeContext";

type PintuKind = "planner" | "invitation" | "guestbook";

type PintuCardProps = {
  title: string;
  href: string;
  bgImage: string;
  kind: PintuKind;
  caption: string;
  isActive: boolean;
  featured?: boolean;
  reducedMotion?: boolean | null;
  onActivate: () => void;
};

const icons = {
  planner: CalendarDays,
  invitation: Mail,
  guestbook: BookOpen,
};

export default function PintuCard({
  title,
  href,
  bgImage,
  kind,
  caption,
  isActive,
  featured = false,
  reducedMotion = false,
  onActivate,
}: PintuCardProps) {
  const Icon = icons[kind];
  const { isDarkMode } = useTheme();

  return (
    <motion.div
      initial={false}
      animate={
        reducedMotion
          ? undefined
          : {
              y: isActive ? -9 : 0,
              scale: isActive ? 1.016 : 1,
            }
      }
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="relative flex items-end justify-center"
      onMouseEnter={onActivate}
      onFocus={onActivate}
    >
      <motion.div
        initial={false}
        animate={{
          opacity: isActive ? (isDarkMode ? 0.42 : 0.3) : 0.1,
          scaleX: isActive ? 1 : 0.84,
        }}
        transition={{ duration: reducedMotion ? 0.08 : 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={`pointer-events-none absolute bottom-[-4.5%] left-1/2 -translate-x-1/2 rounded-[50%] bg-primary blur-2xl ${
          featured ? "h-[13%] w-[90%]" : "h-[11%] w-[84%]"
        }`}
        aria-hidden="true"
      />

      <div
        className={`pointer-events-none absolute bottom-[-7%] left-1/2 -translate-x-1/2 rounded-[50%] border border-primary/12 bg-background/20 ${
          featured ? "h-[12%] w-[88%]" : "h-[10%] w-[82%]"
        }`}
        aria-hidden="true"
      />

      <Link
        href={href}
        aria-label={title}
        className={`group relative block overflow-hidden rounded-t-[999px] rounded-b-[24px] border border-primary/42 bg-background/25 outline-none transition-shadow duration-500 focus-visible:ring-2 focus-visible:ring-primary/80 focus-visible:ring-offset-4 focus-visible:ring-offset-background ${
          featured
            ? "h-[clamp(338px,58dvh,598px)] w-[clamp(184px,15.4vw,298px)]"
            : "h-[clamp(292px,49.5dvh,514px)] w-[clamp(154px,12.8vw,246px)]"
        } ${
          isActive
            ? "shadow-[0_34px_90px_rgba(66,28,39,.24),0_0_40px_rgba(192,122,132,.16)] dark:shadow-[0_34px_100px_rgba(0,0,0,.55),0_0_42px_rgba(192,122,132,.2)]"
            : "shadow-[0_24px_65px_rgba(38,24,28,.13)] dark:shadow-[0_26px_72px_rgba(0,0,0,.42)]"
        }`}
      >
        {/* layered Rose/white frame to read as architectural metal + glass */}
        <div className="pointer-events-none absolute inset-0 z-40 rounded-t-[999px] rounded-b-[24px] ring-1 ring-inset ring-white/35 dark:ring-white/14" />
        <div className="pointer-events-none absolute inset-[4px] z-40 rounded-t-[999px] rounded-b-[20px] border border-primary/48 shadow-[inset_0_0_0_1px_rgba(255,255,255,.2)] dark:border-primary/55" />
        <div className="pointer-events-none absolute inset-[9px] z-40 rounded-t-[999px] rounded-b-[16px] border border-white/32 dark:border-white/14" />
        <div
          className={`pointer-events-none absolute inset-[2px] z-30 rounded-t-[999px] rounded-b-[22px] transition-opacity duration-500 ${
            isActive
              ? "opacity-100 shadow-[inset_0_0_28px_rgba(217,163,170,.25),0_0_24px_rgba(192,122,132,.22)]"
              : "opacity-45 shadow-[inset_0_0_18px_rgba(217,163,170,.12)]"
          }`}
        />

        {/* vertical specular highlights */}
        <div className="pointer-events-none absolute bottom-[7%] left-[3.6%] top-[18%] z-40 w-px bg-gradient-to-b from-transparent via-white/75 to-transparent opacity-60" />
        <div className="pointer-events-none absolute bottom-[7%] right-[3.6%] top-[18%] z-40 w-px bg-gradient-to-b from-transparent via-primary/75 to-transparent opacity-70" />

        <Image
          src={`/${bgImage}`}
          alt=""
          fill
          priority={featured}
          sizes={featured ? "(min-width: 1024px) 298px, 190px" : "(min-width: 1024px) 246px, 160px"}
          className={`object-cover transition duration-700 ${
            isActive
              ? "scale-[1.04] saturate-[.9] contrast-[.96]"
              : "scale-[1.015] saturate-[.62] contrast-[.92]"
          }`}
        />

        {/* unifies the three unrelated source images into one Rose-lit world */}
        <div
          className={`absolute inset-0 transition duration-500 ${
            isDarkMode
              ? "bg-[linear-gradient(to_top,rgba(12,8,11,.88),rgba(35,18,27,.25)_54%,rgba(192,122,132,.13))]"
              : "bg-[linear-gradient(to_top,rgba(54,27,36,.62),rgba(255,239,241,.12)_58%,rgba(192,122,132,.09))]"
          }`}
        />
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${
            isActive
              ? "bg-[radial-gradient(circle_at_50%_38%,rgba(244,204,210,.34),transparent_46%)] opacity-100"
              : "bg-[radial-gradient(circle_at_50%_32%,rgba(217,163,170,.16),transparent_52%)] opacity-70"
          }`}
        />

        {/* soft glass veil */}
        <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(255,255,255,.14),transparent_24%,transparent_70%,rgba(217,163,170,.08))] mix-blend-screen opacity-75 dark:opacity-45" />

        {/* opening panels */}
        <motion.div
          initial={false}
          animate={{ x: isActive ? "-103%" : "0%" }}
          transition={{ duration: reducedMotion ? 0.08 : 0.74, ease: [0.22, 1, 0.36, 1] }}
          className={`absolute inset-y-0 left-0 z-10 w-1/2 border-r border-white/22 backdrop-blur-md ${
            isDarkMode
              ? "bg-[linear-gradient(104deg,rgba(62,30,41,.96),rgba(192,122,132,.68))]"
              : "bg-[linear-gradient(104deg,rgba(183,104,116,.94),rgba(218,166,174,.82))]"
          }`}
        >
          <div className="absolute inset-y-0 right-0 w-[12%] bg-gradient-to-l from-black/12 to-transparent" />
          <div className="absolute inset-y-[8%] right-[5px] w-px bg-white/55" />
        </motion.div>
        <motion.div
          initial={false}
          animate={{ x: isActive ? "103%" : "0%" }}
          transition={{ duration: reducedMotion ? 0.08 : 0.74, ease: [0.22, 1, 0.36, 1] }}
          className={`absolute inset-y-0 right-0 z-10 w-1/2 border-l border-white/22 backdrop-blur-md ${
            isDarkMode
              ? "bg-[linear-gradient(256deg,rgba(62,30,41,.96),rgba(192,122,132,.68))]"
              : "bg-[linear-gradient(256deg,rgba(183,104,116,.94),rgba(218,166,174,.82))]"
          }`}
        >
          <div className="absolute inset-y-0 left-0 w-[12%] bg-gradient-to-r from-black/12 to-transparent" />
          <div className="absolute inset-y-[8%] left-[5px] w-px bg-white/55" />
        </motion.div>

        {/* content remains readable in both themes */}
        <motion.div
          initial={false}
          animate={{
            opacity: isActive ? 1 : 0.92,
            y: isActive ? -3 : 0,
          }}
          transition={{ duration: reducedMotion ? 0.08 : 0.35 }}
          className="absolute inset-0 z-20 flex flex-col items-center justify-center px-4 text-center text-white"
        >
          <div
            className={`mb-4 grid place-items-center rounded-full border border-white/38 bg-black/12 shadow-[inset_0_0_18px_rgba(255,255,255,.05)] backdrop-blur-md ${
              featured ? "h-12 w-12" : "h-10 w-10"
            }`}
          >
            <Icon className={featured ? "h-5 w-5" : "h-4 w-4"} strokeWidth={1.45} />
          </div>

          <h3
            className={`max-w-[86%] text-balance font-[family-name:var(--font-dc-heading)] font-medium leading-tight tracking-[-0.02em] text-white ${
              featured ? "text-xl lg:text-[1.7rem]" : "text-base lg:text-[1.28rem]"
            }`}
          >
            {title}
          </h3>

          <span className="my-4 h-px w-9 bg-white/58" />

          <p className="max-w-[80%] font-[family-name:var(--font-dc-mono)] text-[8px] uppercase leading-[1.55] tracking-[0.12em] text-white/78 lg:text-[9px]">
            {caption}
          </p>

          <motion.span
            animate={reducedMotion ? undefined : { x: isActive ? [0, 3, 0] : 0 }}
            transition={{ duration: 1.9, repeat: isActive ? Infinity : 0, ease: "easeInOut" }}
            className="mt-5 grid h-9 w-9 place-items-center rounded-full border border-white/38 bg-black/12 shadow-[0_6px_18px_rgba(0,0,0,.14)] backdrop-blur-md"
          >
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          </motion.span>
        </motion.div>

        {/* base threshold and luminous sill */}
        <div className="absolute inset-x-[9%] bottom-[2.4%] z-40 h-[3px] rounded-full bg-black/12 blur-[1px] dark:bg-black/40" />
        <motion.div
          initial={false}
          animate={{ opacity: isActive ? 0.92 : 0.34, scaleX: isActive ? 1 : 0.78 }}
          transition={{ duration: reducedMotion ? 0.08 : 0.45 }}
          className="absolute inset-x-[14%] bottom-[2.2%] z-40 h-px origin-center bg-white shadow-[0_0_12px_rgba(217,163,170,.85)]"
        />
      </Link>

      {/* physical-looking reflection immediately under each portal */}
      <div
        className={`pointer-events-none absolute left-1/2 top-[99%] -translate-x-1/2 origin-top rounded-b-[48%] bg-gradient-to-b from-primary/22 via-primary/[0.055] to-transparent blur-[2px] ${
          featured ? "h-[76px] w-[78%]" : "h-[62px] w-[72%]"
        } ${isActive ? "opacity-80" : "opacity-35"}`}
        style={{ transform: "translateX(-50%) perspective(320px) rotateX(68deg)" }}
        aria-hidden="true"
      />
    </motion.div>
  );
}
