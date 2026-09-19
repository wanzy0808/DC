"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useTheme } from "@/components/Theme/ThemeProvider";
import type { AssetDoorValue } from "@/components/Landing/Pintu/AssetDreamPortalScene";

type AssetDreamBackdropProps = {
  activeDoor: AssetDoorValue;
};

const worldGlow = {
  1: {
    light: "rgba(192,122,132,0.19)",
    dark: "rgba(192,122,132,0.12)",
    x: "68%",
    y: "28%",
  },
  2: {
    light: "rgba(217,163,170,0.23)",
    dark: "rgba(217,163,170,0.14)",
    x: "74%",
    y: "24%",
  },
  3: {
    light: "rgba(166,94,105,0.18)",
    dark: "rgba(166,94,105,0.13)",
    x: "72%",
    y: "34%",
  },
} as const;

const particles = [
  { left: "12%", top: "22%", size: 3, delay: 0.2 },
  { left: "26%", top: "74%", size: 5, delay: 1.4 },
  { left: "48%", top: "16%", size: 3, delay: 2.1 },
  { left: "64%", top: "72%", size: 4, delay: 0.8 },
  { left: "78%", top: "18%", size: 5, delay: 1.9 },
  { left: "90%", top: "58%", size: 3, delay: 3.1 },
];

export default function AssetDreamBackdrop({
  activeDoor,
}: AssetDreamBackdropProps) {
  const { isDarkMode } = useTheme();
  const reduced = useReducedMotion();
  const glow = worldGlow[activeDoor];

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div
        className={
          isDarkMode
            ? "absolute inset-0 bg-[linear-gradient(180deg,#09090a_0%,#0d090b_52%,#10090c_100%)]"
            : "absolute inset-0 bg-[linear-gradient(180deg,#ffffff_0%,#fffafb_50%,#fff7f9_100%)]"
        }
      />

      <AnimatePresence mode="sync" initial={false}>
        <motion.div
          key={activeDoor}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0.12 : 0.85 }}
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at ${glow.x} ${glow.y}, ${isDarkMode ? glow.dark : glow.light}, transparent 28%)`,
          }}
        />
      </AnimatePresence>

      <motion.div
        animate={
          reduced
            ? undefined
            : {
                x: [0, 18, 0],
                y: [0, -10, 0],
                scale: [1, 1.04, 1],
              }
        }
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute inset-x-[-12%] bottom-[-8%] top-[10%] rounded-[46%] blur-3xl ${
          isDarkMode
            ? "bg-[radial-gradient(ellipse_at_70%_36%,rgba(217,163,170,0.12),transparent_42%),radial-gradient(ellipse_at_28%_70%,rgba(192,122,132,0.08),transparent_44%)]"
            : "bg-[radial-gradient(ellipse_at_70%_36%,rgba(217,163,170,0.18),transparent_42%),radial-gradient(ellipse_at_28%_70%,rgba(192,122,132,0.10),transparent_44%)]"
        }`}
      />

      <motion.div
        animate={
          reduced
            ? undefined
            : {
                y: [0, -14, 0],
                rotate: [-1.5, 1, -1.5],
              }
        }
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-[5%] -left-[4%] h-[72vh] w-[24vw] min-w-[210px] opacity-[0.38] sm:opacity-[0.5]"
      >
        <Image
          src="/flower.png"
          alt=""
          fill
          sizes="28vw"
          className="object-contain object-left-bottom"
        />
      </motion.div>

      <motion.div
        animate={
          reduced
            ? undefined
            : {
                y: [0, -10, 0],
                rotate: [1.5, -1, 1.5],
              }
        }
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
        className="absolute -bottom-[7%] -right-[5%] h-[68vh] w-[23vw] min-w-[200px] opacity-[0.26] sm:opacity-[0.4]"
      >
        <div className="relative h-full w-full -scale-x-100">
          <Image
            src="/flower.png"
            alt=""
            fill
            sizes="28vw"
            className="object-contain object-left-bottom"
          />
        </div>
      </motion.div>

      <div
        className={`absolute left-[4%] top-[8%] h-[38vh] w-[34vw] rounded-[50%] blur-3xl ${
          isDarkMode ? "bg-white/[0.018]" : "bg-white/80"
        }`}
      />
      <div
        className={`absolute right-[2%] top-[13%] h-[48vh] w-[38vw] rounded-[50%] blur-3xl ${
          isDarkMode ? "bg-primary/[0.035]" : "bg-primary/[0.055]"
        }`}
      />

      {particles.map((particle, index) => (
        <motion.span
          key={index}
          className={`absolute rounded-full ${
            isDarkMode
              ? "bg-white/40 shadow-[0_0_16px_rgba(217,163,170,0.26)]"
              : "bg-white shadow-[0_0_18px_rgba(192,122,132,0.18)]"
          }`}
          style={{
            left: particle.left,
            top: particle.top,
            width: particle.size,
            height: particle.size,
          }}
          animate={
            reduced
              ? undefined
              : {
                  y: [0, -16, 0],
                  opacity: [0.18, 0.9, 0.18],
                  scale: [0.8, 1.35, 0.8],
                }
          }
          transition={{
            duration: 5.8 + (index % 3),
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      <div
        className={`absolute inset-x-0 bottom-0 h-[20vh] bg-gradient-to-t ${
          isDarkMode ? "from-black/20 to-transparent" : "from-white/50 to-transparent"
        }`}
      />
    </div>
  );
}
