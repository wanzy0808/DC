"use client";

import { motion, useReducedMotion } from "motion/react";
import { useTheme } from "@/components/Theme/ThemeContext";

export default function LandingRoomScene() {
  const { isDarkMode } = useTheme();
  const reduced = useReducedMotion();

  const wall = isDarkMode ? "#111012" : "#F8F3F1";
  const wallSoft = isDarkMode ? "#171316" : "#FFFDFC";
  const line = isDarkMode ? "rgba(217,163,170,.18)" : "rgba(166,94,105,.14)";
  const floor = isDarkMode ? "#0D0B0D" : "#F7F2F0";
  const floor2 = isDarkMode ? "#171115" : "#FFFDFC";
  const window = isDarkMode ? "#28171F" : "#EAF4FA";
  const windowGlow = isDarkMode ? "#C07A84" : "#E9C3C8";

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <svg
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <linearGradient id="wall" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={wallSoft} />
            <stop offset="0.52" stopColor={wall} />
            <stop offset="1" stopColor={isDarkMode ? "#0D0C0E" : "#F1E8E5"} />
          </linearGradient>
          <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={floor2} />
            <stop offset="1" stopColor={floor} />
          </linearGradient>
          <radialGradient id="roseGlow" cx="67%" cy="42%" r="44%">
            <stop offset="0" stopColor={windowGlow} stopOpacity={isDarkMode ? ".24" : ".22"} />
            <stop offset=".56" stopColor="#C07A84" stopOpacity={isDarkMode ? ".08" : ".055"} />
            <stop offset="1" stopColor="#C07A84" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="windowPane" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={isDarkMode ? "#4B2E3B" : "#DDEEF7"} />
            <stop offset=".5" stopColor={window} />
            <stop offset="1" stopColor={isDarkMode ? "#171119" : "#F5E7E4"} />
          </linearGradient>
          <linearGradient id="beam" x1="0" y1="0" x2="1" y2=".6">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity={isDarkMode ? ".05" : ".28"} />
            <stop offset=".55" stopColor="#C07A84" stopOpacity={isDarkMode ? ".11" : ".09"} />
            <stop offset="1" stopColor="#C07A84" stopOpacity="0" />
          </linearGradient>
          <filter id="blur24">
            <feGaussianBlur stdDeviation="24" />
          </filter>
        </defs>

        <rect width="1600" height="900" fill="url(#wall)" />

        {/* left editorial wall */}
        <path d="M0 0H575V900H0Z" fill={isDarkMode ? "#0F0E10" : "#FFFEFD"} fillOpacity={isDarkMode ? ".94" : ".9"} />
        <path d="M575 0V900" stroke={line} strokeWidth="2" />

        {/* tall window between copy and portals */}
        <path
          d="M598 650V218C598 104 664 40 743 40C822 40 888 104 888 218V650Z"
          fill="url(#windowPane)"
          stroke={line}
          strokeWidth="3"
        />
        <path d="M743 44V650" stroke={isDarkMode ? "rgba(255,255,255,.08)" : "rgba(17,17,17,.09)"} strokeWidth="3" />
        <path d="M604 292H882" stroke={isDarkMode ? "rgba(255,255,255,.07)" : "rgba(17,17,17,.08)"} strokeWidth="3" />
        <path d="M604 446H882" stroke={isDarkMode ? "rgba(255,255,255,.06)" : "rgba(17,17,17,.07)"} strokeWidth="3" />

        {/* monumental arch behind portals */}
        <path
          d="M760 660V250C760 74 895 0 1115 0C1335 0 1470 74 1470 250V660"
          fill="none"
          stroke={isDarkMode ? "rgba(217,163,170,.12)" : "rgba(166,94,105,.12)"}
          strokeWidth="28"
        />
        <path
          d="M790 660V266C790 115 910 44 1115 44C1320 44 1440 115 1440 266V660"
          fill="none"
          stroke={isDarkMode ? "rgba(255,255,255,.045)" : "rgba(255,255,255,.72)"}
          strokeWidth="4"
        />

        {/* wall moulding */}
        <path d="M930 92V640M1360 92V640" stroke={line} strokeWidth="2" />
        <path d="M900 122H1390" stroke={line} strokeWidth="2" />

        {/* light beam / window shadow */}
        <path d="M915 55L1300 0L1515 500L1155 445Z" fill="url(#beam)" />
        <path d="M1000 35L1032 35L1260 470L1228 470Z" fill={isDarkMode ? "rgba(192,122,132,.035)" : "rgba(17,17,17,.035)"} />
        <path d="M1090 15L1126 15L1355 445L1320 445Z" fill={isDarkMode ? "rgba(192,122,132,.03)" : "rgba(17,17,17,.03)"} />

        {/* floor */}
        <path d="M0 662H1600V900H0Z" fill="url(#floor)" />
        <path d="M0 662H1600" stroke={line} strokeWidth="2" />
        <path d="M575 900L930 662M910 900L1082 662M1250 900L1240 662M1540 900L1398 662" stroke={line} strokeWidth="1.5" />
        <path d="M0 750H1600M0 835H1600" stroke={line} strokeWidth="1.2" />

        {/* reflection pool */}
        <ellipse cx="1155" cy="720" rx="420" ry="82" fill="#C07A84" fillOpacity={isDarkMode ? ".08" : ".055"} filter="url(#blur24)" />
        <rect width="1600" height="900" fill="url(#roseGlow)" />
      </svg>

      <motion.div
        animate={
          reduced
            ? undefined
            : { opacity: [0.42, 0.68, 0.42], x: [0, -10, 0] }
        }
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[2%] top-[8%] h-[62%] w-[48%] bg-[radial-gradient(ellipse_at_center,rgba(192,122,132,.12),transparent_67%)] blur-2xl dark:bg-[radial-gradient(ellipse_at_center,rgba(192,122,132,.16),transparent_68%)]"
      />

      <div className="absolute inset-x-0 bottom-0 h-[25%] bg-[linear-gradient(to_top,rgba(192,122,132,.035),transparent)] dark:bg-[linear-gradient(to_top,rgba(192,122,132,.06),transparent)]" />
    </div>
  );
}
