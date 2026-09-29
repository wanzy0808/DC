"use client";

import { motion, useReducedMotion } from "motion/react";
import FallingLeaves from "@/components/Layout/FallingLeaves";

const sprigs = [
  { x: 82, y: 653, angle: -39, scale: 1.2 },
  { x: 122, y: 565, angle: 24, scale: 1.02 },
  { x: 164, y: 478, angle: -34, scale: 1.13 },
  { x: 212, y: 394, angle: 30, scale: 0.9 },
  { x: 259, y: 315, angle: -29, scale: 1 },
  { x: 305, y: 245, angle: 36, scale: 0.82 },
  { x: 352, y: 169, angle: -20, scale: 0.72 },
];

function FoliageDrawing() {
  return (
    <svg viewBox="0 0 470 760" fill="none" aria-hidden="true" className="h-full w-full overflow-visible">
      <defs>
        <linearGradient id="planner-leaf" x1="0" y1="1" x2="1" y2="0">
          <stop stopColor="#704A39" />
          <stop offset="0.52" stopColor="#A77D54" />
          <stop offset="1" stopColor="#D6B38C" />
        </linearGradient>
      </defs>
      <path d="M-24 782 C62 665 72 551 182 440 S292 259 395 52 M-19 744 C18 682 70 667 157 638 M47 620 C92 577 159 577 214 543" stroke="#966F51" strokeWidth="3" strokeLinecap="round" />
      {sprigs.map(({ x, y, angle, scale }, index) => (
        <g key={index} transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale})`}>
          <path d="M0 0 Q48 -36 104 -68" stroke="#98704F" strokeWidth="2" />
          <path d="M18 -12 C-3 -42 3 -67 24 -84 C41 -62 42 -37 18 -12 Z M43 -28 C28 -64 42 -91 66 -100 C77 -73 70 -48 43 -28 Z M66 -44 C65 -77 88 -97 108 -98 C110 -72 96 -52 66 -44 Z M80 -53 C96 -91 123 -96 147 -84 C134 -62 112 -51 80 -53 Z" fill="url(#planner-leaf)" stroke="#805D45" strokeWidth="1" />
          <path d="M-8 4 C-30 -8 -44 -29 -37 -49 C-7 -45 9 -25 -8 4 Z M32 -23 C28 -44 18 -60 1 -67 M57 -37 C59 -60 57 -79 48 -90" stroke="#BE996F" strokeWidth="1" />
        </g>
      ))}
      <g transform="translate(150 586) rotate(-25)">
        <path d="M0 90 Q17 5 62 -58" stroke="#966F51" strokeWidth="3" />
        <path d="M60 -55 C14 -70 -7 -104 -24 -142 C21 -136 51 -111 65 -77 C76 -124 108 -146 148 -157 C126 -108 100 -81 71 -66 C117 -82 148 -74 177 -53 C127 -43 94 -42 67 -61 C101 -26 104 1 94 30 C65 5 57 -23 60 -55 Z" fill="url(#planner-leaf)" stroke="#805D45" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

function BotanicalLayer({ className, x, y, duration, flipped = false }: { className: string; x: number; y: number; duration: number; flipped?: boolean }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={`pointer-events-none absolute ${className}`}
      animate={reduced ? undefined : { x: [0, x, 0], y: [0, -y, 0], rotate: [0, x > 0 ? 1 : -1, 0] }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className={flipped ? "h-full w-full rotate-180" : "h-full w-full"}><FoliageDrawing /></div>
    </motion.div>
  );
}

export default function EventPlannerBotanicalAtmosphere() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[12] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_8%_72%,rgba(178,139,94,0.13),transparent_48%),radial-gradient(ellipse_at_90%_25%,rgba(112,59,59,0.12),transparent_48%)] dark:bg-[radial-gradient(ellipse_at_8%_72%,rgba(214,179,140,0.10),transparent_48%),radial-gradient(ellipse_at_90%_25%,rgba(214,179,140,0.08),transparent_48%)]" />
      <BotanicalLayer className="-bottom-[20%] -left-[5%] h-[115%] w-[37%] min-w-[250px] max-w-[650px] opacity-[0.38] dark:opacity-[0.31]" x={7} y={12} duration={18} />
      <BotanicalLayer className="-right-[6%] -top-[24%] h-[105%] w-[37%] min-w-[250px] max-w-[650px] opacity-[0.34] dark:opacity-[0.28]" x={-6} y={9} duration={21} flipped />
      <BotanicalLayer className="bottom-[1%] right-[13%] hidden h-[46%] w-[19%] opacity-[0.14] lg:block dark:opacity-[0.12]" x={-5} y={14} duration={16} />
      <FallingLeaves embedded variety="forest" className="opacity-85" />
    </div>
  );
}
