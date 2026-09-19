"use client";

import { motion, useReducedMotion } from "motion/react";
import { useTheme } from "@/components/Theme/ThemeProvider";

const motes = [
  { left: "8%", top: "18%", size: 14, delay: 0 },
  { left: "18%", top: "72%", size: 9, delay: 1.2 },
  { left: "38%", top: "12%", size: 11, delay: 2.4 },
  { left: "62%", top: "78%", size: 13, delay: 0.8 },
  { left: "79%", top: "20%", size: 8, delay: 1.8 },
  { left: "90%", top: "60%", size: 12, delay: 3.1 },
];

function BotanicalLine({ side }: { side: "left" | "right" }) {
  const right = side === "right";

  return (
    <svg
      viewBox="0 0 260 520"
      className={`absolute bottom-[-7%] h-[68vh] w-auto opacity-[0.14] ${right ? "right-[-3%] -scale-x-100" : "left-[-4%]"}`}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M114 520C114 432 123 345 154 267C174 216 195 173 212 117"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path d="M155 269C126 250 99 246 77 257C99 276 125 281 155 269Z" stroke="currentColor" strokeWidth="1.2" />
      <path d="M174 219C150 190 124 178 98 184C115 212 140 226 174 219Z" stroke="currentColor" strokeWidth="1.2" />
      <path d="M193 169C177 139 155 123 130 124C140 153 162 171 193 169Z" stroke="currentColor" strokeWidth="1.2" />
      <path d="M135 331C104 315 76 316 54 332C80 346 107 347 135 331Z" stroke="currentColor" strokeWidth="1.2" />
      <path d="M124 394C93 385 66 392 47 412C74 420 100 414 124 394Z" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="213" cy="112" r="5" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="84" cy="254" r="3" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export default function JiplakSweetBackground() {
  const { isDarkMode } = useTheme();
  const reduced = useReducedMotion();

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div
        className={`absolute inset-0 transition-colors duration-500 ${
          isDarkMode
            ? "bg-[radial-gradient(circle_at_72%_18%,rgba(192,122,132,0.12),transparent_28%),radial-gradient(circle_at_18%_78%,rgba(217,163,170,0.08),transparent_32%),linear-gradient(180deg,#0B0B0C_0%,#100c0e_100%)]"
            : "bg-[radial-gradient(circle_at_72%_18%,rgba(192,122,132,0.11),transparent_28%),radial-gradient(circle_at_18%_78%,rgba(217,163,170,0.12),transparent_32%),linear-gradient(180deg,#ffffff_0%,#fffafb_100%)]"
        }`}
      />

      <div
        className={`absolute left-[12%] top-[7%] h-[42vh] w-[32vw] rotate-[-10deg] rounded-[48%] blur-3xl ${
          isDarkMode ? "bg-white/[0.018]" : "bg-white/70"
        }`}
      />
      <div
        className={`absolute right-[6%] top-[22%] h-[46vh] w-[36vw] rotate-[14deg] rounded-[50%] blur-3xl ${
          isDarkMode ? "bg-primary/[0.035]" : "bg-primary/[0.055]"
        }`}
      />

      <div
        className={`absolute left-1/2 top-0 h-[72vh] w-[38vw] -translate-x-1/2 bg-[linear-gradient(105deg,transparent_20%,rgba(255,255,255,0.18)_48%,transparent_72%)] blur-2xl ${
          isDarkMode ? "opacity-20" : "opacity-70"
        }`}
      />

      <div className={isDarkMode ? "text-primary/55" : "text-primary/45"}>
        <BotanicalLine side="left" />
        <BotanicalLine side="right" />
      </div>

      {motes.map((mote, index) => (
        <motion.span
          key={index}
          className={`absolute rounded-full border ${
            isDarkMode
              ? "border-white/10 bg-white/[0.035] shadow-[0_0_24px_rgba(192,122,132,0.08)]"
              : "border-primary/10 bg-white/75 shadow-[0_10px_28px_rgba(192,122,132,0.08)]"
          }`}
          style={{
            left: mote.left,
            top: mote.top,
            width: mote.size,
            height: mote.size,
          }}
          animate={
            reduced
              ? undefined
              : {
                  y: [0, -10, 0],
                  x: [0, 5, 0],
                  opacity: [0.35, 0.8, 0.35],
                }
          }
          transition={{
            duration: 7 + (index % 3),
            delay: mote.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      <div
        className={`absolute inset-x-0 bottom-0 h-[22vh] bg-gradient-to-t ${
          isDarkMode ? "from-black/16 to-transparent" : "from-primary/[0.025] to-transparent"
        }`}
      />
    </div>
  );
}
