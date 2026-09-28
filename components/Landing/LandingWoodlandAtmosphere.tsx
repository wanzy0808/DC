"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

const FOREST = "/assets/landing/atmosphere/forest-silhouette.png";

export default function LandingWoodlandAtmosphere() {
  const reduced = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_48%,rgba(255,249,242,0.72),rgba(237,227,216,0.22)_42%,transparent_72%)] dark:bg-[radial-gradient(ellipse_at_50%_46%,rgba(214,179,140,0.18),rgba(112,59,59,0.055)_48%,transparent_75%)]" />

      {/* Canopy7 hangs from just outside the frame and nearly spans the
          visual gap between the left brand block and the right controls.
          Its foliage stays intentionally soft so it reads as distant woodland,
          not a hard decorative strip across the header. */}
      <div
        data-landing-canopy
        className="absolute inset-x-0 -top-[clamp(72px,7vw,128px)] h-[clamp(330px,39dvh,500px)] overflow-visible"
      >
        <motion.div
          initial={reduced ? false : { opacity: 0, y: -10 }}
          animate={reduced ? { opacity: 1 } : { opacity: 1, y: [0, -3, 0], rotate: [0, 0.1, 0] }}
          transition={
            reduced
              ? { duration: 0 }
              : {
                  opacity: { duration: 1.05, ease: "easeOut" },
                  y: { duration: 19, repeat: Infinity, ease: "easeInOut" },
                  rotate: { duration: 26, repeat: Infinity, ease: "easeInOut" },
                }
          }
          className="absolute left-1/2 top-0 h-full w-[92vw] -translate-x-1/2 origin-top sm:w-[78vw] lg:w-[68vw] lg:max-w-[1240px]"
        >
          <Image
            src="/assets/landing/ornaments/botanical/canopy7.png"
            alt=""
            fill
            priority
            sizes="(max-width: 640px) 92vw, (max-width: 1024px) 78vw, min(68vw, 1240px)"
            className="object-contain object-top opacity-[0.48] brightness-[1.04] saturate-[0.62] contrast-[0.93] drop-shadow-[0_16px_28px_rgba(93,62,48,0.035)] dark:opacity-[0.34] dark:brightness-[0.88] dark:saturate-[0.48] dark:contrast-[0.90]"
          />
        </motion.div>
      </div>

      <motion.div
        initial={reduced ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduced ? 0 : 1.1, ease: "easeOut" }}
        className="absolute inset-x-3 top-[88px] bottom-[10%] sm:inset-x-[38px] sm:top-[100px] sm:bottom-[8%]"
      >
        <Image
          src={FOREST}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-contain object-bottom opacity-[0.78] brightness-[0.88] saturate-[0.82] lg:object-cover lg:[mask-image:linear-gradient(to_bottom,transparent_0%,black_12%)] dark:opacity-[0.58] dark:brightness-[0.82] dark:saturate-[0.58]"
        />
      </motion.div>

      {/* The visual source of the backlight lives inside the forest opening,
          not in front of the doors. */}
      <div className="absolute left-1/2 top-[31%] h-[38%] w-[46%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(255,248,235,0.58),rgba(225,196,157,0.16)_48%,transparent_74%)] blur-2xl dark:bg-[radial-gradient(ellipse_at_center,rgba(214,179,140,0.20),rgba(112,59,59,0.06)_52%,transparent_76%)]" />

      <div className="absolute inset-x-[22%] bottom-[7%] h-[16%] rounded-[50%] bg-[#D6B38C]/10 blur-3xl dark:bg-[#EDE3D8]/6" />
      <div className="absolute inset-x-[5%] bottom-[5.5%] h-px bg-gradient-to-r from-transparent via-primary/12 to-transparent dark:via-[#D6B38C]/14" />
    </div>
  );
}
