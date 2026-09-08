"use client";

import React from "react";
import { useTheme } from "@/components/Theme/ThemeContext";

export default function RomanticBackground() {
  const { isDarkMode } = useTheme();
  const petals = Array.from({ length: 20 });

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* CSS Keyframe untuk animasi kelopak bunga gugur */}
      <style jsx>{`
        @keyframes fallingPetals {
          0% {
            transform: translateY(-10vh) rotate(0deg) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.85;
          }
          90% {
            opacity: 0.85;
          }
          100% {
            transform: translateY(105vh) rotate(720deg) translateX(120px);
            opacity: 0;
          }
        }
        .petal {
          animation: fallingPetals linear infinite;
        }
      `}</style>

      {/* 1. GLOW BELAKANG PINTU */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[140px] transition-all duration-1000 ${
          isDarkMode
            ? "bg-[#C26B70]/20"
            : "bg-radial from-[#FFB7B2]/30 via-[#7A1C25]/15 to-transparent"
        }`}
      />

      {/* 2. AMBIENT GLOW SUASANA */}
      <div
        className={`absolute top-[-15%] left-1/2 -translate-x-1/2 w-[1100px] h-[500px] rounded-full blur-[160px] transition-all duration-1000 ${
          isDarkMode ? "bg-[#C26B70]/10" : "bg-[#7A1C25]/10"
        }`}
      />

      {/* 3. EFEK KELOPAK BUNGA (ROSE PETALS) - JATUH SAAT LANDING */}
      {petals.map((_, i) => {
          const left = (i * 5 + (i * 37) % 5) % 100; // Posisi stabil agar hydration tetap konsisten
          const duration = 8 + (i % 5) * 2; // Durasi variatif (8s - 16s)
          // Trik animationDelay negatif agar bunga SUDAH BERADA DI POSISI JATUH saat web dibuka
          const delay = -((i % 10) * 1.5); 
          const size = 10 + (i % 4) * 4;

          return (
            <div
              key={i}
              className="petal absolute rounded-br-[80%] rounded-tl-[80%]"
              style={{
                left: `${left}%`,
                width: `${size}px`,
                height: `${size * 1.3}px`,
                animationDuration: `${duration}s`,
                animationDelay: `${delay}s`,
                background: isDarkMode
                  ? "linear-gradient(135deg, rgba(226,133,138,0.5), rgba(194,107,112,0.15))"
                  : "linear-gradient(135deg, rgba(212,122,129,0.45), rgba(122,28,37,0.2))",
                filter: "blur(0.4px)",
                boxShadow: isDarkMode
                  ? "0 0 10px rgba(194,107,112,0.3)"
                  : "0 0 10px rgba(122,28,37,0.2)",
              }}
            />
          );
      })}
    </div>
  );
}