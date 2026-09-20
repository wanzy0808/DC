"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { useTheme } from "@/components/Theme/ThemeProvider";
import type { AssetDoorValue } from "@/components/Landing/Pintu/AssetDreamPortalScene";

type AssetDreamBackdropProps = {
  activeDoor: AssetDoorValue;
};

const particles = [
  { left: "12%", top: "22%", size: 3, delay: 0.2 },
  { left: "26%", top: "74%", size: 5, delay: 1.4 },
  { left: "48%", top: "16%", size: 3, delay: 2.1 },
  { left: "64%", top: "72%", size: 4, delay: 0.8 },
  { left: "78%", top: "18%", size: 5, delay: 1.9 },
  { left: "90%", top: "58%", size: 3, delay: 3.1 },
];

export default function AssetDreamBackdrop({
}: AssetDreamBackdropProps) {
  const { isDarkMode } = useTheme();
  const reduced = useReducedMotion();


  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div
        className={
          isDarkMode
            ? "absolute inset-0 bg-[linear-gradient(180deg,#09090a_0%,#0d090b_52%,#10090c_100%)]"
            : "absolute inset-0 bg-[linear-gradient(180deg,#ffffff_0%,#fffafb_50%,#fff7f9_100%)]"
        }
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
        <div className="relative h-full w-full">
          <Image
            src="/flower.png"
            alt=""
            fill
            loading="eager"
            sizes="28vw"
            className="object-contain object-left-bottom"
          />
        </div>
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
            loading="eager"
            sizes="28vw"
            className="object-contain object-left-bottom"
          />
        </div>
      </motion.div>

      {particles.map((particle, index) => (
        <motion.span
          key={index}
          className={`absolute rounded-full ${
            isDarkMode ? "bg-white/30" : "bg-primary/15"
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
