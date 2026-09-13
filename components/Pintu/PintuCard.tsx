"use client";

import React from "react";
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
    <Link href={href}>
      <motion.div
        onMouseEnter={onHover}
        whileHover={reducedMotion ? undefined : { y: -4, scale: isActive ? 1.02 : 1.01 }}
        whileTap={reducedMotion ? undefined : { scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={`group relative h-[330px] w-[170px] cursor-pointer overflow-hidden rounded-t-[90px] rounded-b-2xl border-2 border-white/80 md:h-[clamp(370px,52vh,500px)] md:w-[clamp(220px,17vw,280px)] md:rounded-t-[130px] ${
          isActive
            ? "shadow-[0_0_40px_rgba(255,255,255,0.6)]"
            : "shadow-2xl hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
        }`}
      >
        <motion.div
          animate={
            reducedMotion
              ? { scale: 1.05 }
              : { scale: isActive ? 1.08 : 1.05 }
          }
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className={`absolute inset-0 flex scale-105 flex-col justify-end bg-cover bg-center p-5 ${
            isActive ? "grayscale-0" : "grayscale"
          }`}
          style={{
            backgroundImage: isDarkMode
              ? `linear-gradient(to top, rgba(8,7,10,0.95), rgba(8,7,10,0.3)), url('${bgImage}')`
              : `linear-gradient(to top, rgba(26,26,26,0.95), rgba(26,26,26,0.2)), url('${bgImage}')`,
          }}
        >
          <motion.div
            initial={false}
            animate={
              reducedMotion
                ? { y: 0, opacity: isActive ? 1 : 0 }
                : { y: isActive ? 0 : 16, opacity: isActive ? 1 : 0 }
            }
            transition={{ duration: reducedMotion ? 0.1 : 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="text-white"
          >
            <div className="mb-2 flex flex-wrap gap-1.5">
              {innerDetails?.tags?.map((tag, idx) => (
                <span key={idx} className="rounded border border-white/40 bg-white/20 px-2 py-0.5 font-[family-name:var(--font-dc-mono)] text-[9px] uppercase text-white">
                  {tag}
                </span>
              ))}
            </div>
            <h4 className="mb-1 font-[family-name:var(--font-dc-heading)] text-lg font-bold leading-snug">{title}</h4>
            <p className="mb-3 text-[11px] leading-relaxed text-gray-300">{innerDetails?.desc}</p>
            <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-white">
              MASUK <span>→</span>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          animate={
            reducedMotion
              ? { x: isActive ? "-100%" : "0%" }
              : { x: isActive ? "-100%" : "0%" }
          }
          transition={{ duration: reducedMotion ? 0.1 : 0.62, ease: [0.22, 1, 0.36, 1] }}
          className="absolute bottom-0 left-0 top-0 z-10 flex w-1/2 items-center justify-end border-r border-white/40 bg-[var(--primary)] pr-[3px]"
        >
          <div className="h-10 w-[3px] rounded-l-sm bg-white shadow-[0_0_8px_#ffffff]" />
        </motion.div>

        <motion.div
          animate={
            reducedMotion
              ? { x: isActive ? "100%" : "0%" }
              : { x: isActive ? "100%" : "0%" }
          }
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
          className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-5 text-center"
        >
          <span className="mb-1 font-[family-name:var(--font-dc-mono)] text-[10px] font-semibold uppercase tracking-widest text-white/80">{number}</span>
          <h3 className="font-[family-name:var(--font-dc-heading)] text-base font-bold tracking-wide text-white">{title}</h3>
        </motion.div>
      </motion.div>
    </Link>
  );
}
