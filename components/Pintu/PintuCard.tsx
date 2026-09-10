"use client";

import React from "react";
import Link from "next/link";
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
  onHover?: () => void;
  href?: string;
};

export default function PintuCard({
  number,
  title,
  bgImage,
  innerDetails,
  isActive,
  onHover,
  href = "#",
}: PintuCardProps) {
  const { isDarkMode } = useTheme();

  return (
    <Link href={href}>
      <div
        onMouseEnter={onHover}
        className={`group relative w-64 h-[410px] rounded-t-[130px] rounded-b-2xl overflow-hidden cursor-pointer shadow-2xl transition-all duration-700 border-2 border-white/80 hover:border-white ${
          isActive
            ? "shadow-[0_0_40px_rgba(255,255,255,0.6)] scale-105"
            : "hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
        }`}
      >
        <div
          className={`absolute inset-0 bg-cover bg-center transition-all duration-700 scale-105 flex flex-col justify-end p-5 ${
            isActive ? "grayscale-0" : "grayscale"
          }`}
          style={{
            backgroundImage: isDarkMode
              ? `linear-gradient(to top, rgba(8,7,10,0.95), rgba(8,7,10,0.3)), url('${bgImage}')`
              : `linear-gradient(to top, rgba(26,26,26,0.95), rgba(26,26,26,0.2)), url('${bgImage}')`,
          }}
        >
          <div className={`transition-all duration-500 transform text-white ${isActive ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
            <div className="flex gap-1.5 mb-2 flex-wrap">
              {innerDetails?.tags?.map((tag, idx) => (
                <span key={idx} className="text-[9px] px-2 py-0.5 rounded font-mono uppercase border bg-white/20 border-white/40 text-white">
                  {tag}
                </span>
              ))}
            </div>
            <h4 className="font-[family-name:var(--font-dc-heading)] text-lg font-bold mb-1 leading-snug">{title}</h4>
            <p className="text-[11px] text-gray-300 leading-relaxed mb-3">{innerDetails?.desc}</p>
            <div className="text-[10px] font-semibold tracking-wider flex items-center gap-1 uppercase text-white">MASUK <span>→</span></div>
          </div>
        </div>

        <div
          className={`absolute top-0 bottom-0 left-0 w-1/2 transition-transform duration-700 ease-in-out z-10 flex items-center justify-end pr-[3px] border-r border-white/40 bg-[var(--primary)] ${isActive ? "-translate-x-full" : "translate-x-0"}`}
        >
          <div className={`w-[3px] h-10 rounded-l-sm bg-white shadow-[0_0_8px_#ffffff] transition-opacity ${isActive ? "opacity-0" : "opacity-90"}`} />
        </div>

        <div
          className={`absolute top-0 bottom-0 right-0 w-1/2 transition-transform duration-700 ease-in-out z-10 flex items-center justify-start pl-[3px] border-l border-white/40 bg-[var(--primary)] ${isActive ? "translate-x-full" : "translate-x-0"}`}
        >
          <div className={`w-[3px] h-10 rounded-r-sm bg-white shadow-[0_0_8px_#ffffff] transition-opacity ${isActive ? "opacity-0" : "opacity-90"}`} />
        </div>

        <div className="absolute top-2 left-0 right-0 z-20 flex justify-center pointer-events-none opacity-80">
          <svg width="70" height="28" viewBox="0 0 100 40" fill="none" stroke="white" strokeWidth="1.5">
            <path d="M50 35 C 30 35, 20 15, 5 20 C 20 20, 30 10, 50 25 C 70 10, 80 20, 95 20 C 80 15, 70 35, 50 35 Z" fill="rgba(255,255,255,0.15)" />
            <circle cx="50" cy="22" r="3" fill="white" />
            <circle cx="35" cy="20" r="2" fill="white" />
            <circle cx="65" cy="20" r="2" fill="white" />
          </svg>
        </div>

        <div className={`absolute inset-0 z-20 flex flex-col justify-end p-5 text-center pointer-events-none transition-opacity duration-500 bg-gradient-to-t from-black/80 via-black/20 to-transparent ${isActive ? "opacity-0" : "opacity-100"}`}>
          <span className="text-[10px] tracking-widest uppercase mb-1 font-semibold text-white/80 font-mono">{number}</span>
          <h3 className="font-[family-name:var(--font-dc-heading)] text-base font-bold text-white tracking-wide">{title}</h3>
        </div>
      </div>
    </Link>
  );
}
