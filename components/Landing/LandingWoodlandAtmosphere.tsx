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

      {/* The canopy now begins inside the header zone. It stays visually light
          behind the brand and controls, then becomes denser toward the middle
          so the header reads as part of the same woodland scene. */}
      <div
        data-landing-canopy
        className="absolute inset-x-0 -top-[2px] h-[36%] overflow-hidden sm:-top-[4px] sm:h-[38%]"
      >
        <motion.div
          initial={reduced ? false : { opacity: 0, y: -8 }}
          animate={reduced ? { opacity: 1 } : { opacity: 1, y: [0, -3, 0] }}
          transition={reduced ? { duration: 0 } : { opacity: { duration: 1 }, y: { duration: 18, repeat: Infinity, ease: "easeInOut" } }}
          className="absolute left-[17%] -top-[27%] h-[146%] w-[43%] [mask-image:linear-gradient(to_bottom,black_0%,black_58%,transparent_100%)] sm:left-[20%] sm:w-[38%]"
        >
          <Image
            src={FOREST}
            alt=""
            fill
            priority
            sizes="45vw"
            className="object-cover object-[16%_4%] opacity-[0.44] brightness-[0.76] saturate-[0.70] dark:opacity-[0.34] dark:brightness-[0.60] dark:saturate-[0.52]"
          />
        </motion.div>

        <motion.div
          initial={reduced ? false : { opacity: 0, y: -8 }}
          animate={reduced ? { opacity: 1 } : { opacity: 1, y: [0, -2, 0] }}
          transition={reduced ? { duration: 0 } : { opacity: { duration: 1.1 }, y: { duration: 20, delay: 1.1, repeat: Infinity, ease: "easeInOut" } }}
          className="absolute right-[17%] -top-[27%] h-[146%] w-[43%] [mask-image:linear-gradient(to_bottom,black_0%,black_58%,transparent_100%)] sm:right-[20%] sm:w-[38%]"
        >
          <Image
            src={FOREST}
            alt=""
            fill
            priority
            sizes="45vw"
            className="scale-x-[-1] object-cover object-[16%_4%] opacity-[0.42] brightness-[0.76] saturate-[0.70] dark:opacity-[0.32] dark:brightness-[0.60] dark:saturate-[0.52]"
          />
        </motion.div>

        <div className="absolute left-1/2 -top-[31%] h-[132%] w-[54%] -translate-x-1/2 [mask-image:radial-gradient(ellipse_at_top,black_0%,black_46%,transparent_78%)]">
          <Image
            src={FOREST}
            alt=""
            fill
            priority
            sizes="56vw"
            className="object-cover object-[50%_2%] opacity-[0.19] brightness-[0.80] saturate-[0.60] dark:opacity-[0.15] dark:brightness-[0.62]"
          />
        </div>

        {/* Header clearance pockets: these are purely visual veils, not
            interactive layers. They keep the Undara wordmark and right-side
            controls crisp while canopy remains visible around them. */}
        <div
          data-canopy-header-clearance="brand"
          className="absolute -left-[2%] top-0 h-[38%] w-[31%] bg-[radial-gradient(ellipse_at_38%_28%,rgba(237,227,216,0.96)_0%,rgba(237,227,216,0.72)_42%,rgba(237,227,216,0.22)_68%,transparent_82%)] blur-[6px] dark:bg-[radial-gradient(ellipse_at_38%_28%,rgba(112,59,59,0.92)_0%,rgba(112,59,59,0.64)_42%,rgba(112,59,59,0.18)_68%,transparent_82%)]"
        />
        <div
          data-canopy-header-clearance="controls"
          className="absolute -right-[2%] top-0 h-[38%] w-[27%] bg-[radial-gradient(ellipse_at_62%_28%,rgba(237,227,216,0.96)_0%,rgba(237,227,216,0.72)_42%,rgba(237,227,216,0.22)_68%,transparent_82%)] blur-[6px] dark:bg-[radial-gradient(ellipse_at_62%_28%,rgba(112,59,59,0.92)_0%,rgba(112,59,59,0.64)_42%,rgba(112,59,59,0.18)_68%,transparent_82%)]"
        />
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
