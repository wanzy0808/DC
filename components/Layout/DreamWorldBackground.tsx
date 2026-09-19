"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useTheme } from "@/components/Theme/ThemeProvider";
import type { DreamDoorValue } from "@/components/Landing/Pintu/DreamPortalScene";

type DreamWorldBackgroundProps = {
  activeDoor: DreamDoorValue;
};

const worlds = {
  1: {
    light: "rgba(217,163,170,0.19)",
    mid: "rgba(192,122,132,0.11)",
    dark: "rgba(166,94,105,0.13)",
  },
  2: {
    light: "rgba(241,201,206,0.22)",
    mid: "rgba(192,122,132,0.13)",
    dark: "rgba(192,122,132,0.12)",
  },
  3: {
    light: "rgba(217,163,170,0.16)",
    mid: "rgba(166,94,105,0.14)",
    dark: "rgba(120,63,76,0.16)",
  },
} as const;

const dust = [
  ["8%", "18%", 3, 0.3],
  ["15%", "68%", 5, 1.5],
  ["27%", "29%", 2, 2.8],
  ["43%", "12%", 4, 0.9],
  ["58%", "76%", 3, 3.4],
  ["67%", "24%", 5, 2.1],
  ["78%", "14%", 2, 4.2],
  ["86%", "58%", 4, 1.1],
  ["94%", "34%", 3, 2.7],
] as const;

function FloatingVeil({
  className,
  reverse = false,
}: {
  className: string;
  reverse?: boolean;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      animate={
        reducedMotion
          ? undefined
          : {
              x: reverse ? [0, -22, 0] : [0, 22, 0],
              y: [0, -10, 0],
              rotate: reverse ? [0, -2, 0] : [0, 2, 0],
            }
      }
      transition={{
        duration: reverse ? 13 : 16,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={className}
    />
  );
}

export default function DreamWorldBackground({
  activeDoor,
}: DreamWorldBackgroundProps) {
  const { isDarkMode } = useTheme();
  const reducedMotion = useReducedMotion();
  const world = worlds[activeDoor];

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div
        className={
          isDarkMode
            ? "absolute inset-0 bg-[linear-gradient(180deg,#09090a_0%,#0e0a0c_48%,#120b0e_100%)]"
            : "absolute inset-0 bg-[linear-gradient(180deg,#ffffff_0%,#fffafb_46%,#fff6f8_100%)]"
        }
      />

      <AnimatePresence mode="sync" initial={false}>
        <motion.div
          key={activeDoor}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0.12 : 0.9 }}
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle at 74% 28%, ${world.light}, transparent 25%),
              radial-gradient(circle at 62% 64%, ${world.mid}, transparent 30%),
              radial-gradient(circle at 18% 76%, ${world.dark}, transparent 30%)
            `,
          }}
        />
      </AnimatePresence>

      <div
        className={`absolute left-1/2 top-[7%] h-[74vh] w-[62vw] -translate-x-1/2 rounded-[50%] border ${
          isDarkMode ? "border-white/[0.045]" : "border-primary/[0.07]"
        }`}
      />
      <div
        className={`absolute left-1/2 top-[13%] h-[62vh] w-[50vw] -translate-x-1/2 rounded-[50%] border ${
          isDarkMode ? "border-white/[0.035]" : "border-primary/[0.05]"
        }`}
      />

      <FloatingVeil
        className={`absolute -left-[12vw] top-[14vh] h-[54vh] w-[46vw] rotate-[-14deg] rounded-[48%] blur-3xl ${
          isDarkMode ? "bg-white/[0.018]" : "bg-white/70"
        }`}
      />
      <FloatingVeil
        reverse
        className={`absolute -right-[12vw] top-[18vh] h-[58vh] w-[48vw] rotate-[17deg] rounded-[48%] blur-3xl ${
          isDarkMode ? "bg-primary/[0.03]" : "bg-primary/[0.045]"
        }`}
      />

      <motion.div
        animate={
          reducedMotion
            ? undefined
            : {
                opacity: [0.35, 0.7, 0.35],
                scaleX: [0.96, 1.04, 0.96],
              }
        }
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={`absolute left-1/2 top-[-6vh] h-[84vh] w-[30vw] -translate-x-1/2 -skew-x-12 bg-[linear-gradient(100deg,transparent_12%,rgba(255,255,255,0.24)_49%,transparent_82%)] blur-2xl ${
          isDarkMode ? "opacity-15" : "opacity-50"
        }`}
      />

      <div
        className={`absolute inset-x-0 bottom-[8vh] h-px ${
          isDarkMode
            ? "bg-gradient-to-r from-transparent via-primary/20 to-transparent"
            : "bg-gradient-to-r from-transparent via-primary/14 to-transparent"
        }`}
      />

      <div
        className={`absolute -bottom-[16vh] left-1/2 h-[34vh] w-[88vw] -translate-x-1/2 rounded-[50%] ${
          isDarkMode
            ? "bg-[radial-gradient(ellipse,rgba(192,122,132,0.08),transparent_62%)]"
            : "bg-[radial-gradient(ellipse,rgba(192,122,132,0.08),transparent_65%)]"
        }`}
      />

      {dust.map(([left, top, size, delay], index) => (
        <motion.span
          key={index}
          className={`absolute rounded-full ${
            isDarkMode
              ? "bg-white/30 shadow-[0_0_14px_rgba(217,163,170,0.18)]"
              : "bg-primary/20 shadow-[0_0_16px_rgba(192,122,132,0.13)]"
          }`}
          style={{
            left,
            top,
            width: size,
            height: size,
          }}
          animate={
            reducedMotion
              ? undefined
              : {
                  y: [0, -12, 0],
                  opacity: [0.2, 0.75, 0.2],
                  scale: [0.8, 1.25, 0.8],
                }
          }
          transition={{
            duration: 5.5 + (index % 4),
            delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      <svg
        viewBox="0 0 900 420"
        className={`absolute bottom-[-5%] left-1/2 w-[92vw] -translate-x-1/2 ${
          isDarkMode ? "text-white/[0.035]" : "text-primary/[0.055]"
        }`}
        fill="none"
      >
        <path d="M0 360C160 300 235 392 382 326C530 258 648 344 900 274" stroke="currentColor" strokeWidth="1.2" />
        <path d="M0 392C180 332 284 414 450 346C612 280 732 360 900 328" stroke="currentColor" strokeWidth="0.9" />
        <path d="M138 420C168 324 164 232 118 152C186 186 222 246 230 334" stroke="currentColor" strokeWidth="1.1" />
        <path d="M758 420C730 330 738 238 784 158C716 194 682 254 676 340" stroke="currentColor" strokeWidth="1.1" />
        <path d="M127 244C88 234 58 244 36 274C77 282 108 270 127 244Z" stroke="currentColor" strokeWidth="0.9" />
        <path d="M773 248C812 236 842 246 866 274C824 284 794 273 773 248Z" stroke="currentColor" strokeWidth="0.9" />
      </svg>
    </div>
  );
}
