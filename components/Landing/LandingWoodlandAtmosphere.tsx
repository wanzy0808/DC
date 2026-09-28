"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

const FOREST = "/assets/landing/atmosphere/forest-silhouette.webp";
const CANOPY = "/assets/landing/ornaments/botanical/canopy7.webp";
const DARK_LANTERN_GARDEN = "/assets/landing/atmosphere/bgdarkmode.webp";

export default function LandingWoodlandAtmosphere() {
  const reduced = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-11 top-[72px] z-0 overflow-hidden sm:bottom-12 sm:top-[88px] lg:top-[96px]"
    >
      {/* Light mode keeps the airy woodland composition. */}
      <div className="absolute inset-0 opacity-100 transition-opacity duration-700 dark:opacity-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_48%,rgba(255,249,242,0.72),rgba(237,227,216,0.22)_42%,transparent_72%)]" />

        <div
          data-landing-canopy
          className="absolute inset-x-0 top-[clamp(8px,1.3vw,22px)] h-[clamp(300px,35dvh,455px)] overflow-hidden"
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
            className="absolute left-[2vw] top-0 h-full w-[56vw] origin-top-left sm:left-[7vw] sm:w-[45vw] lg:left-[13vw] lg:w-[36vw]"
          >
            <Image
              src={CANOPY}
              alt=""
              fill
              priority
              sizes="(max-width: 640px) 61vw, (max-width: 1024px) 50vw, 44vw"
              className="object-contain object-left-top opacity-[0.38] [filter:sepia(0.58)_saturate(0.72)_hue-rotate(-10deg)_brightness(1.02)_contrast(0.96)] drop-shadow-[0_16px_28px_rgba(93,62,48,0.03)]"
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
              className="-scale-x-100 object-contain object-right-top opacity-[0.25] [filter:sepia(0.58)_saturate(0.70)_hue-rotate(-10deg)_brightness(1.01)_contrast(0.95)]"
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
            className="object-contain object-bottom opacity-[0.78] brightness-[0.88] saturate-[0.82] lg:object-cover lg:[mask-image:linear-gradient(to_bottom,transparent_0%,black_12%)]"
          />
        </motion.div>

        <div className="absolute left-1/2 top-[31%] h-[38%] w-[46%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(255,248,235,0.58),rgba(225,196,157,0.16)_48%,transparent_74%)] blur-2xl" />
        <div className="absolute inset-x-[22%] bottom-[7%] h-[16%] rounded-[50%] bg-[#D6B38C]/10 blur-3xl" />
      </div>

      {/* Dark mode is a separate scene instead of a tinted version of light mode.
          The artwork is built around Undara's brown family with restrained
          champagne-gold lantern light, keeping the center clear for the doors. */}
      <div className="absolute inset-0 overflow-hidden bg-[#241111] opacity-0 transition-opacity duration-700 dark:opacity-100">
        <motion.div
          initial={reduced ? false : { opacity: 0, scale: 1.025 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: reduced ? 0 : 1.15, ease: "easeOut" }}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url("${DARK_LANTERN_GARDEN}")` }}
        />

        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(26,11,11,0.20)_0%,transparent_24%,transparent_65%,rgba(30,13,13,0.18)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_48%,rgba(214,179,140,0.10)_0%,rgba(112,59,59,0.055)_36%,transparent_66%)]" />
        <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(18,7,7,0.38)]" />

        <motion.div
          animate={
            reduced
              ? undefined
              : {
                  opacity: [0.42, 0.72, 0.42],
                  scale: [0.96, 1.04, 0.96],
                }
          }
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-[18%] top-[18%] h-24 w-24 rounded-full bg-[#E4B86A]/10 blur-3xl"
        />
        <motion.div
          animate={
            reduced
              ? undefined
              : {
                  opacity: [0.36, 0.64, 0.36],
                  scale: [1.03, 0.96, 1.03],
                }
          }
          transition={{
            duration: 8.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.8,
          }}
          className="absolute right-[15%] top-[20%] h-28 w-28 rounded-full bg-[#E4B86A]/10 blur-3xl"
        />
      </div>
    </div>
  );
}
