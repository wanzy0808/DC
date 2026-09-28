"use client";

import { motion, useReducedMotion } from "motion/react";

const LIGHT_GARDEN = "/assets/landing/atmosphere/lightbg.webp";
const DARK_LANTERN_GARDEN = "/assets/landing/atmosphere/darkbg.webp";

const BODY_MASK =
  "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.28) 7%, black 16%, black 84%, rgba(0,0,0,0.30) 93%, transparent 100%)";

export default function LandingWoodlandAtmosphere() {
  const reduced = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-11 top-[72px] z-0 overflow-hidden sm:bottom-12 sm:top-[88px] lg:top-[96px]"
    >
      {/* Light and dark intentionally use separate artwork.
          Both are limited to the body and dissolve into the header/footer
          instead of ending on a hard horizontal edge. */}
      <div className="absolute inset-0 opacity-100 transition-opacity duration-700 dark:opacity-0">
        <motion.div
          initial={reduced ? false : { opacity: 0, scale: 1.018 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: reduced ? 0 : 1.05, ease: "easeOut" }}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url("${LIGHT_GARDEN}")`,
            WebkitMaskImage: BODY_MASK,
            maskImage: BODY_MASK,
          }}
        />

        {/* Fog bridges the body artwork into the clean light header/footer. */}
        <div className="absolute inset-x-0 top-0 h-[clamp(82px,11dvh,138px)] bg-[linear-gradient(to_bottom,#EDE3D8_0%,rgba(237,227,216,0.92)_18%,rgba(237,227,216,0.60)_43%,rgba(237,227,216,0.20)_72%,transparent_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-[clamp(76px,10dvh,128px)] bg-[linear-gradient(to_top,#EDE3D8_0%,rgba(237,227,216,0.90)_18%,rgba(237,227,216,0.56)_44%,rgba(237,227,216,0.18)_72%,transparent_100%)]" />

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_48%,rgba(255,249,242,0.12)_0%,transparent_58%)]" />
      </div>

      <div className="absolute inset-0 opacity-0 transition-opacity duration-700 dark:opacity-100">
        <motion.div
          initial={reduced ? false : { opacity: 0, scale: 1.018 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: reduced ? 0 : 1.08, ease: "easeOut" }}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url("${DARK_LANTERN_GARDEN}")`,
            WebkitMaskImage: BODY_MASK,
            maskImage: BODY_MASK,
          }}
        />

        {/* Brown fog keeps the lamp-lit forest inside the body while visually
            continuing the #281414 frame through header and footer. */}
        <div className="absolute inset-x-0 top-0 h-[clamp(86px,11.5dvh,144px)] bg-[linear-gradient(to_bottom,#281414_0%,rgba(40,20,20,0.94)_18%,rgba(40,20,20,0.62)_44%,rgba(40,20,20,0.20)_73%,transparent_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-[clamp(80px,10.5dvh,136px)] bg-[linear-gradient(to_top,#281414_0%,rgba(40,20,20,0.94)_18%,rgba(40,20,20,0.60)_44%,rgba(40,20,20,0.19)_73%,transparent_100%)]" />

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_48%,rgba(214,179,140,0.07)_0%,rgba(112,59,59,0.025)_40%,transparent_70%)]" />
        <div className="absolute inset-0 shadow-[inset_0_0_130px_rgba(18,7,7,0.20)]" />
      </div>
    </div>
  );
}
