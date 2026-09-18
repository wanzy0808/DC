"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { useTheme } from "@/components/Theme/ThemeContext";

type PintuCardProps = {
  title: string;
  bgImage: string;
  innerDetails?: {
    tags?: string[];
    desc?: string;
  };
  isActive: boolean;
  reducedMotion?: boolean | null;
  compact?: boolean;
  onHover?: () => void;
  href?: string;
};

export default function PintuCard({
  title,
  bgImage,
  innerDetails,
  isActive,
  reducedMotion = false,
  compact = false,
  onHover,
  href = "#",
}: PintuCardProps) {
  const { isDarkMode } = useTheme();

  return (
    <Link href={href} className="block rounded-t-[94px] rounded-b-[18px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-4 focus-visible:ring-offset-background md:rounded-t-[150px]">
      <motion.div
        onMouseEnter={onHover}
        whileHover={reducedMotion ? undefined : { y: -4, scale: isActive ? 1.018 : 1.008 }}
        whileTap={reducedMotion ? undefined : { scale: 0.985 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={`group relative cursor-pointer overflow-hidden rounded-t-[94px] rounded-b-[18px] border border-primary/32 bg-background [transform-style:preserve-3d] md:rounded-t-[150px] ${
          compact
            ? "h-[285px] w-[164px]"
            : "h-[340px] w-[196px] md:h-[clamp(410px,52vh,520px)] md:w-[clamp(240px,17vw,315px)]"
        } ${
          isActive
            ? "shadow-[0_24px_70px_rgba(192,122,132,0.18),0_0_0_1px_rgba(192,122,132,0.14)] dark:shadow-[0_24px_70px_rgba(0,0,0,0.48),0_0_34px_rgba(192,122,132,0.14)]"
            : "shadow-[0_18px_48px_rgba(17,17,17,0.12)] dark:shadow-[0_18px_48px_rgba(0,0,0,0.38)]"
        }`}
      >
        <div className="absolute inset-[5px] z-30 rounded-t-[88px] rounded-b-[14px] border border-white/18 md:rounded-t-[144px]" aria-hidden="true" />
        <div className="absolute inset-x-[12%] bottom-0 h-px bg-white/40" aria-hidden="true" />

        <div className="absolute inset-0 overflow-hidden">
          <Image
            src={`/${bgImage}`}
            alt=""
            fill
            sizes="(max-width: 767px) 328px, 630px"
            quality={100}
            className={`object-cover object-center transition duration-700 ${
              isActive ? "scale-[1.015] grayscale-0" : "scale-100 grayscale"
            }`}
            priority={isActive}
          />
        </div>

        <div
          className={`absolute inset-0 ${
            isDarkMode
              ? "bg-gradient-to-t from-[rgba(8,7,10,0.96)] via-[rgba(8,7,10,0.34)] to-transparent"
              : "bg-gradient-to-t from-[rgba(20,18,18,0.92)] via-[rgba(20,18,18,0.18)] to-transparent"
          }`}
          aria-hidden="true"
        />

        <motion.div
          initial={false}
          animate={
            reducedMotion
              ? { y: 0, opacity: isActive ? 1 : 0 }
              : { y: isActive ? 0 : 14, opacity: isActive ? 1 : 0 }
          }
          transition={{ duration: reducedMotion ? 0.1 : 0.35, ease: [0.22, 1, 0.36, 1] }}
          className={`absolute inset-x-0 bottom-0 z-20 min-w-0 text-white ${
            compact ? "p-3.5" : "p-4 sm:p-5 md:p-6"
          }`}
        >
          <div className="mb-2 flex min-w-0 flex-wrap gap-1.5">
            {innerDetails?.tags?.slice(0, compact ? 2 : 3).map((tag) => (
              <span
                key={tag}
                className="max-w-full break-words rounded border border-white/30 bg-black/10 px-1.5 py-0.5 font-[family-name:var(--font-dc-mono)] text-[8px] uppercase leading-tight text-white/88 backdrop-blur-[2px] sm:text-[9px]"
              >
                {tag}
              </span>
            ))}
          </div>
          <h4 className={`mb-1.5 max-w-full break-words font-[family-name:var(--font-dc-heading)] font-bold leading-tight text-white ${
            compact ? "text-[15px]" : "text-lg sm:text-xl md:text-[1.35rem]"
          }`}>
            {title}
          </h4>
          {!compact && (
            <p className="mb-2.5 max-w-full break-words text-[11px] leading-relaxed text-white/72 sm:text-xs md:text-[13px]">
              {innerDetails?.desc}
            </p>
          )}
          <div className="flex items-center gap-1 font-[family-name:var(--font-dc-mono)] text-[9px] font-semibold uppercase tracking-[0.12em] text-white sm:text-[10px]">
            MASUK <span aria-hidden="true">→</span>
          </div>
        </motion.div>

        <motion.div
          animate={{ x: isActive ? "-100%" : "0%" }}
          transition={{ duration: reducedMotion ? 0.1 : 0.62, ease: [0.22, 1, 0.36, 1] }}
          className="absolute bottom-0 left-0 top-0 z-10 flex w-1/2 items-center justify-end border-r border-white/25 bg-[var(--primary)] pr-[3px]"
        >
          <div className="h-9 w-[2px] rounded-l-sm bg-white/90 shadow-[0_0_8px_rgba(255,255,255,.7)]" />
        </motion.div>

        <motion.div
          animate={{ x: isActive ? "100%" : "0%" }}
          transition={{ duration: reducedMotion ? 0.1 : 0.62, ease: [0.22, 1, 0.36, 1] }}
          className="absolute bottom-0 right-0 top-0 z-10 flex w-1/2 items-center justify-start border-l border-white/25 bg-[var(--primary)] pl-[3px]"
        >
          <div className="h-9 w-[2px] rounded-r-sm bg-white/90 shadow-[0_0_8px_rgba(255,255,255,.7)]" />
        </motion.div>

        <div className="pointer-events-none absolute left-0 right-0 top-3 z-20 flex justify-center opacity-75">
          <svg width={compact ? "54" : "70"} height={compact ? "22" : "28"} viewBox="0 0 100 40" fill="none" stroke="white" strokeWidth="1.35">
            <path d="M50 35 C 30 35, 20 15, 5 20 C 20 20, 30 10, 50 25 C 70 10, 80 20, 95 20 C 80 15, 70 35, 50 35 Z" fill="rgba(255,255,255,0.10)" />
            <circle cx="50" cy="22" r="3" fill="white" />
            <circle cx="35" cy="20" r="2" fill="white" />
            <circle cx="65" cy="20" r="2" fill="white" />
          </svg>
        </div>

        <motion.div
          animate={{ opacity: isActive ? 0 : 1, y: isActive ? 8 : 0 }}
          transition={{ duration: reducedMotion ? 0.1 : 0.3, ease: [0.22, 1, 0.36, 1] }}
          className={`pointer-events-none absolute inset-0 z-20 flex flex-col justify-end bg-gradient-to-t from-black/78 via-black/16 to-transparent text-center ${
            compact ? "p-3.5" : "p-4 sm:p-5 md:p-6"
          }`}
        >
          <h3 className={`break-words font-[family-name:var(--font-dc-heading)] font-bold leading-tight tracking-wide text-white ${
            compact ? "text-[15px]" : "text-lg sm:text-xl md:text-[1.35rem]"
          }`}>
            {title}
          </h3>
        </motion.div>
      </motion.div>
    </Link>
  );
}
