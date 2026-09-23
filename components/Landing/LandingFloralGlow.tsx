"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { useTheme } from "@/components/Theme/ThemeProvider";

export default function LandingFloralGlow() {
  const { isDarkMode } = useTheme();
  const reduced = useReducedMotion();

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      <motion.div
        animate={
          reduced
            ? undefined
            : {
                y: [0, -12, 0],
                rotate: [-1.2, 0.8, -1.2],
              }
        }
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-[6%] -left-[4%] h-[72vh] w-[24vw] min-w-[210px] opacity-[0.36] sm:opacity-[0.5]"
      >
        <div className="relative h-full w-full">
          <Image
            src="/flower.png"
            alt=""
            width={800}
            height={1200}
            loading="eager"
            sizes="28vw"
            className="absolute inset-0 h-full w-full object-contain object-left-bottom"
          />
        </div>
      </motion.div>

      <motion.div
        animate={
          reduced
            ? undefined
            : {
                y: [0, -9, 0],
                rotate: [1.2, -0.8, 1.2],
              }
        }
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
        className="absolute -bottom-[8%] -right-[5%] h-[66vh] w-[22vw] min-w-[190px] opacity-[0.2] sm:opacity-[0.34]"
      >
        <div className="relative h-full w-full -scale-x-100">
          <Image
            src="/flower.png"
            alt=""
            width={800}
            height={1200}
            loading="eager"
            sizes="26vw"
            className="absolute inset-0 h-full w-full object-contain object-left-bottom"
          />
        </div>
      </motion.div>

      <motion.div
        animate={
          reduced
            ? undefined
            : {
                scale: [0.96, 1.04, 0.96],
                opacity: [0.7, 1, 0.7],
              }
        }
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute right-[1%] top-[12%] h-[52vh] w-[42vw] rounded-[50%] blur-3xl ${
          isDarkMode
            ? "bg-[radial-gradient(ellipse,rgba(192,122,132,0.12),rgba(217,163,170,0.045)_46%,transparent_72%)]"
            : "bg-[radial-gradient(ellipse,rgba(192,122,132,0.14),rgba(217,163,170,0.06)_48%,transparent_72%)]"
        }`}
      />
    </div>
  );
}
