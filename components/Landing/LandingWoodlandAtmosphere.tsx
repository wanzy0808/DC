"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

const FOREST = "/assets/landing/atmosphere/forest-silhouette.png";
const CANOPY = "/assets/landing/ornaments/botanical/canopy7.png";

export default function LandingWoodlandAtmosphere() {
  const reduced = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_48%,rgba(255,249,242,0.72),rgba(237,227,216,0.22)_42%,transparent_72%)] dark:bg-[radial-gradient(ellipse_at_50%_44%,rgba(188,126,98,0.14)_0%,rgba(83,39,35,0.12)_40%,rgba(28,13,13,0.18)_72%,rgba(18,8,8,0.34)_100%)]" />

      {/* Keep the middle of the header visually open. Two unequal canopy
          fragments enter from outside the frame so the foliage feels like
          nearby trees caught by the camera instead of a decorative curtain. */}
      <div
        data-landing-canopy
        className="absolute inset-x-0 -top-[clamp(78px,7vw,126px)] h-[clamp(300px,35dvh,455px)] overflow-visible"
      >
        <motion.div
          initial={reduced ? false : { opacity: 0, y: -10 }}
          animate={
            reduced
              ? { opacity: 1 }
              : { opacity: 1, y: [0, -3, 0], rotate: [-0.7, -0.25, -0.7] }
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
          className="absolute -left-[7vw] top-0 h-full w-[61vw] origin-top-left sm:-left-[5vw] sm:w-[50vw] lg:-left-[3vw] lg:w-[44vw]"
        >
          <Image
            src={CANOPY}
            alt=""
            fill
            priority
            sizes="(max-width: 640px) 61vw, (max-width: 1024px) 50vw, 44vw"
            className="object-contain object-left-top opacity-[0.38] brightness-[1.03] saturate-[0.70] contrast-[0.98] drop-shadow-[0_16px_28px_rgba(93,62,48,0.03)] dark:opacity-[0.20] dark:brightness-[0.66] dark:saturate-[0.90] dark:contrast-[1.18] dark:mix-blend-multiply"
          />
        </motion.div>

        <motion.div
          initial={reduced ? false : { opacity: 0, y: -6 }}
          animate={
            reduced
              ? { opacity: 1 }
              : { opacity: 1, y: [0, -2, 0], rotate: [0.8, 0.35, 0.8] }
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
          className="absolute -right-[10vw] top-[clamp(18px,2vw,34px)] h-[88%] w-[49vw] origin-top-right sm:-right-[6vw] sm:w-[40vw] lg:-right-[3vw] lg:w-[35vw]"
        >
          <Image
            src={CANOPY}
            alt=""
            fill
            priority
            sizes="(max-width: 640px) 49vw, (max-width: 1024px) 40vw, 35vw"
            className="-scale-x-100 object-contain object-right-top opacity-[0.25] brightness-[1.02] saturate-[0.66] contrast-[0.96] dark:opacity-[0.13] dark:brightness-[0.62] dark:saturate-[0.88] dark:contrast-[1.22] dark:mix-blend-multiply"
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
          className="object-contain object-bottom opacity-[0.78] brightness-[0.88] saturate-[0.82] lg:object-cover lg:[mask-image:linear-gradient(to_bottom,transparent_0%,black_12%)] dark:opacity-[0.43] dark:brightness-[0.58] dark:saturate-[0.92] dark:contrast-[1.22] dark:mix-blend-multiply"
        />
      </motion.div>

      {/* The glow is intentionally localized behind the doors. In dark mode it
          adds warm depth without whitening the entire forest layer. */}
      <div className="absolute left-1/2 top-[31%] h-[38%] w-[46%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(255,248,235,0.58),rgba(225,196,157,0.16)_48%,transparent_74%)] blur-2xl dark:bg-[radial-gradient(ellipse_at_center,rgba(214,179,140,0.16),rgba(122,71,54,0.055)_48%,transparent_73%)]" />

      <div className="absolute inset-x-[22%] bottom-[7%] h-[16%] rounded-[50%] bg-[#D6B38C]/10 blur-3xl dark:bg-[rgba(214,179,140,0.035)]" />
    </div>
  );
}
