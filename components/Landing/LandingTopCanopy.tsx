"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

const CANOPY = "/assets/landing/ornaments/botanical/canopy7.webp";

export default function LandingTopCanopy() {
  const reduced = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      data-landing-canopy
      className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-[clamp(220px,28dvh,360px)] overflow-visible dark:hidden"
    >
      <motion.div
        initial={reduced ? false : { opacity: 0, y: -12 }}
        animate={
          reduced
            ? { opacity: 1 }
            : { opacity: 1, y: [0, -3, 0], rotate: [-0.6, -0.2, -0.6] }
        }
        transition={
          reduced
            ? { duration: 0 }
            : {
                opacity: { duration: 1.05, ease: "easeOut" },
                y: { duration: 20, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: 27, repeat: Infinity, ease: "easeInOut" },
              }
        }
        className="absolute left-[14vw] -top-[clamp(72px,6vw,112px)] h-full w-[52vw] origin-top-left sm:left-[18vw] sm:w-[43vw] lg:left-[22vw] lg:w-[34vw]"
      >
        <Image
          src={CANOPY}
          alt=""
          fill
          priority
          sizes="(max-width: 640px) 52vw, (max-width: 1024px) 43vw, 34vw"
          className="object-contain object-left-top opacity-[0.36] [filter:sepia(0.58)_saturate(0.72)_hue-rotate(-10deg)_brightness(1.02)_contrast(0.96)] drop-shadow-[0_16px_28px_rgba(93,62,48,0.03)]"
        />
      </motion.div>

      <motion.div
        initial={reduced ? false : { opacity: 0, y: -8 }}
        animate={
          reduced
            ? { opacity: 1 }
            : { opacity: 1, y: [0, -2, 0], rotate: [0.7, 0.3, 0.7] }
        }
        transition={
          reduced
            ? { duration: 0 }
            : {
                opacity: { duration: 1.2, ease: "easeOut" },
                y: { duration: 23, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: 31, repeat: Infinity, ease: "easeInOut" },
              }
        }
        className="absolute -right-[7vw] -top-[clamp(48px,4vw,82px)] h-[88%] w-[43vw] origin-top-right sm:-right-[4vw] sm:w-[36vw] lg:-right-[2vw] lg:w-[31vw]"
      >
        <Image
          src={CANOPY}
          alt=""
          fill
          priority
          sizes="(max-width: 640px) 43vw, (max-width: 1024px) 36vw, 31vw"
          className="-scale-x-100 object-contain object-right-top opacity-[0.23] [filter:sepia(0.58)_saturate(0.70)_hue-rotate(-10deg)_brightness(1.01)_contrast(0.95)]"
        />
      </motion.div>
    </div>
  );
}
