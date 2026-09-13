"use client";

import React from "react";
import { useTheme } from "@/components/Theme/ThemeContext";

export default function RomanticBackground() {
  const { isDarkMode } = useTheme();
  const petals = Array.from({ length: 20 });

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
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

      {/* Ambient background: layered light, not circular pink blobs. */}
      <div
        className={`absolute inset-0 transition-all duration-1000 ${
          isDarkMode
            ? "bg-[radial-gradient(ellipse_at_72%_18%,rgba(226,133,138,0.08),transparent_34%),linear-gradient(125deg,transparent_0%,rgba(226,133,138,0.025)_48%,transparent_78%)]"
            : "bg-[radial-gradient(ellipse_at_74%_14%,rgba(140,74,86,0.07),transparent_32%),linear-gradient(125deg,rgba(255,255,255,0.35)_0%,transparent_42%,rgba(232,180,184,0.08)_76%,transparent_100%)]"
        }`}
      />
      <div
        className={`absolute -right-[18%] top-[8%] h-[52vh] w-[48vw] rotate-[-14deg] blur-3xl transition-all duration-1000 ${
          isDarkMode ? "bg-[#C26B70]/[0.045]" : "bg-[#8C4A56]/[0.035]"
        }`}
      />

      {/* ROSE PETALS — intentionally unchanged. */}
      {petals.map((_, i) => {
        const left = (i * 5 + (i * 37) % 5) % 100;
        const duration = 8 + (i % 5) * 2;
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
