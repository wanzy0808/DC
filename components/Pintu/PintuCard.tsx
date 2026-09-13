"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { useTheme } from "@/components/Theme/ThemeContext";

type PintuCardProps = {
  number: string;
  title: string;
  bgImage: string;
  innerDetails?: {
    tags?: string[];
    desc?: string;
  };
  isActive: boolean;
  reducedMotion?: boolean | null;
  onHover?: () => void;
  href?: string;
};

export default function PintuCard({
  number,
  title,
  bgImage,
  innerDetails,
  isActive,
  reducedMotion = false,
  onHover,
  href = "#",
}: PintuCardProps) {
  const { isDarkMode } = useTheme();

  return (
    <Link href={href} className="block">
      <motion.div
        onMouseEnter={onHover}
        whileHover={reducedMotion ? undefined : { y: -4, scale: isActive ? 1.02 : 1.01 }}
        whileTap={reducedMotion ? undefined : { scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={`group relative h-[330px] w-[190px] cursor-pointer overflow-hidden rounded-t-[90px] rounded-b-2xl border-2 border-white/80 md:h-[clamp(370px,52vh,500px)] md:w-[clamp(220px,17vw,280px)] md:rounded-t-[130px] ${
          isActive
            ? "shadow-[0_0_40px_rgba(255,255,255,0.6)]"
            : "shadow-2xl hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
        }`}
      >
        <div className="absolute inset-0 bg-black/10" aria-hidden="true" />

        <motion.div
          animate={reducedMotion ? { scale: 0.92 } : { scale: isActive ? 0.92 : 0.9 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 flex items-center justify-center overflow-hidden"
        >
          <Image
            src={`/${bgImage}`}
            alt=""
            fill
            sizes="(max-width: 767px) 190px, 280px"
            className={`object-contain object-center ${isActive ? "grayscale-0" : "grayscale"}`}
            priority={isActive}
          />
        </motion.div>

        <div
          className={`absolute inset-0 bg-gradient-to-t ${
            isDarkMode
              ? "from-[rgba(8,7,10,0.95)] via-[rgba(8,7,10,0.35)] to-transparent"
              : "from-[rgba(26,26,26,0.92)] via-[rgba(26,26,26,0.22)] to-transparent"
          }`}
          aria-hidden="true"
        />

        <motion.div
          initial={false}
          animate={
            reducedMotion
              ? { y: 0, opacity: isActive ? 1 : 0 }
              : { y: isActive ? 0 : 16, opacity: isActive ? 1 : 0 }
          }
          transition={{ duration: reducedMotion ? 0.1 : 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-x-0 bottom-0 z-20 min-w-0 p-4 text-white sm:p-5"
        >
          <div className="mb-2 flex min-w-0 flex-wrap gap-1">
            {innerDetails?.tags?.map((tag, idx) => (
              <span
                key={idx}
                className="max-w-full break-words rounded border border-white/40 bg-white/20 px-1.5 py-0.5 font-[family-name:var(--font-dc-mono)] text-[8px] uppercase leading-tight text-white sm:text-[9px]"
              >
                {tag}
              </span>
            ))}
          </div>
          <h4 className="mb-1 max-w-full break-words font-[family-name:var(--font-dc-heading)] text-base font-bold leading-tight sm:text-lg sm:leading-snug">
            {title}
          </h4>
          <p className="mb-2 max-w-full break-words text-[10px] leading-snug text-gray-200 sm:text-[11px] sm:leading-relaxed">
            {innerDetails?.desc}
          </p>
          <div className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-white sm:text-[10px]">
            MASUK <span aria-hidden="true">→</span>
          </div>
        </motion.div>

        <motion.div
          animate={{ x: isActive ? "-100%" : "0%" }}
          transition={{ duration: reducedMotion ? 0.1 : 0.62, ease: [0.22, 1, 0.36, 1] }}
          className="absolute bottom-0 left-0 top-0 z-10 flex w-1/2 items-center justify-end border-r border-white/40 bg-[var(--primary)] pr-[3px]"
        >
          <div className="h-10 w-[3px] rounded-l-sm bg-white shadow-[0_0_8px_#ffffff]" />
        </motion.div>

        <motion.div
          animate={{ x: isActive ? "100%" : "0%" }}
          transition={{ duration: reducedMotion ? 0.1 : 0.62, ease: [0.22, 1, 0.36, 1] }}
          className="absolute bottom-0 right-0 top-0 z-10 flex w-1/2 items-center justify-start border-l border-white/40 bg-[var(--primary)] pl-[3px]"
        >
          <div className="h-10 w-[3px] rounded-r-sm bg-white shadow-[0_0_8px_#ffffff]" />
        </motion.div>

        <div className="pointer-events-none absolute left-0 right-0 top-2 z-20 flex justify-center opacity-80">
          <svg width="70" height="28" viewBox="0 0 100 40" fill="none" stroke="white" strokeWidth="1.5">
            <path d="M50 35 C 30 35, 20 15, 5 20 C 20 20, 30 10, 50 25 C 70 10, 80 20, 95 20 C 80 15, 70 35, 50 35 Z" fill="rgba(255,255,255,0.15)" />
            <circle cx="50" cy="22" r="3" fill="white" />
            <circle cx="35" cy="20" r="2" fill="white" />
            <circle cx="65" cy="20" r="2" fill="white" />
          </svg>
        </div>

        <motion.div
          animate={{ opacity: isActive ? 0 : 1, y: isActive ? 8 : 0 }}
          transition={{ duration: reducedMotion ? 0.1 : 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 text-center sm:p-5"
        >
          <span className="mb-1 font-[family-name:var(--font-dc-mono)] text-[10px] font-semibold uppercase tracking-widest text-white/80">
            {number}
          </span>
          <h3 className="break-words font-[family-name:var(--font-dc-heading)] text-base font-bold leading-tight tracking-wide text-white">
            {title}
          </h3>
        </motion.div>
      </motion.div>
    </Link>
  );
}
