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

      {/* Overhead woodland canopy spans roughly the whole door orbit.
          The hanging center layer stays dominant, while left/right tree
          masses make it feel like a real crown above the viewer instead of a
          single narrow decoration. */}
      <div
        data-landing-canopy
        className="absolute inset-x-0 -top-[clamp(68px,7vw,126px)] h-[clamp(320px,39dvh,500px)] overflow-visible"
      >
        <motion.div
          initial={reduced ? false : { opacity: 0, y: -10 }}
          animate={reduced ? { opacity: 1 } : { opacity: 1, y: [0, -3, 0], rotate: [0, 0.14, 0] }}
          transition={
            reduced
              ? { duration: 0 }
              : {
                  opacity: { duration: 1.05, ease: "easeOut" },
                  y: { duration: 18, repeat: Infinity, ease: "easeInOut" },
                  rotate: { duration: 24, repeat: Infinity, ease: "easeInOut" },
                }
          }
          className="absolute left-1/2 top-0 h-full w-[118vw] max-w-[1960px] -translate-x-1/2 origin-top sm:w-[108vw] lg:w-[92vw]"
        >
          <Image
            src="/assets/landing/ornaments/botanical/canopy2.png"
            alt=""
            fill
            priority
            sizes="(max-width: 640px) 118vw, (max-width: 1024px) 108vw, 92vw"
            className="object-contain object-top opacity-[0.82] brightness-[0.95] saturate-[0.86] drop-shadow-[0_20px_34px_rgba(93,62,48,0.075)] dark:opacity-[0.62] dark:brightness-[0.76] dark:saturate-[0.64]"
          />
        </motion.div>

        <motion.div
          initial={reduced ? false : { opacity: 0, x: -14 }}
          animate={reduced ? { opacity: 1 } : { opacity: 1, x: [0, -3, 0], y: [0, -2, 0] }}
          transition={
            reduced
              ? { duration: 0 }
              : {
                  opacity: { duration: 1.15, ease: "easeOut" },
                  x: { duration: 23, repeat: Infinity, ease: "easeInOut" },
                  y: { duration: 19, repeat: Infinity, ease: "easeInOut" },
                }
          }
          className="absolute -left-[15vw] -top-[8%] h-[118%] w-[58vw] max-w-[920px] origin-top-left sm:-left-[11vw] lg:-left-[7vw] lg:w-[46vw]"
        >
          <Image
            src="/assets/landing/ornaments/botanical/canopy1.png"
            alt=""
            fill
            priority
            sizes="(max-width: 640px) 58vw, 46vw"
            className="object-contain object-left-top opacity-[0.46] brightness-[0.90] saturate-[0.78] dark:opacity-[0.32] dark:brightness-[0.68] dark:saturate-[0.56]"
          />
        </motion.div>

        <motion.div
          initial={reduced ? false : { opacity: 0, x: 14 }}
          animate={reduced ? { opacity: 1 } : { opacity: 1, x: [0, 3, 0], y: [0, -2, 0] }}
          transition={
            reduced
              ? { duration: 0 }
              : {
                  opacity: { duration: 1.15, ease: "easeOut" },
                  x: { duration: 25, repeat: Infinity, ease: "easeInOut" },
                  y: { duration: 21, repeat: Infinity, ease: "easeInOut" },
                }
          }
          className="absolute -right-[15vw] -top-[8%] h-[118%] w-[58vw] max-w-[920px] origin-top-right sm:-right-[11vw] lg:-right-[7vw] lg:w-[46vw]"
        >
          <Image
            src="/assets/landing/ornaments/botanical/canopy33.png"
            alt=""
            fill
            priority
            sizes="(max-width: 640px) 58vw, 46vw"
            className="object-contain object-right-top opacity-[0.44] brightness-[0.90] saturate-[0.78] dark:opacity-[0.31] dark:brightness-[0.68] dark:saturate-[0.56]"
          />
        </motion.div>

        {/* Soft readability pockets only; the tree mass remains continuous. */}
        <div className="absolute left-[1%] top-[clamp(74px,8vw,128px)] h-[104px] w-[25%] rounded-[50%] bg-background/38 blur-2xl sm:w-[19%]" />
        <div className="absolute right-[1%] top-[clamp(74px,8vw,128px)] h-[104px] w-[24%] rounded-[50%] bg-background/35 blur-2xl sm:w-[18%]" />
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
