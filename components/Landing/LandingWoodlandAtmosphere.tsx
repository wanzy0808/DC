"use client";

import { motion, useReducedMotion } from "motion/react";

const LIGHT_GARDEN = "/assets/landing/atmosphere/lightbg.webp";
const DARK_LANTERN_GARDEN = "/assets/landing/atmosphere/darkbg.webp";

const VIEWPORT_MASK =
  "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.65) 12%, black 24%, black 78%, rgba(0,0,0,0.65) 90%, transparent 100%)";

export default function LandingWoodlandAtmosphere() {
  const reduced = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      {/* The forest spans the whole page canvas and fades at viewport edges.
          Navbar, body, footer and the area outside the outline share it. */}
      <div className="absolute inset-0 opacity-100 transition-opacity duration-700 dark:opacity-0">
        <motion.div
          initial={reduced ? false : { opacity: 0, scale: 1.018 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: reduced ? 0 : 1.05, ease: "easeOut" }}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url("${LIGHT_GARDEN}")`,
            WebkitMaskImage: VIEWPORT_MASK,
            maskImage: VIEWPORT_MASK,
          }}
        />

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
            WebkitMaskImage: VIEWPORT_MASK,
            maskImage: VIEWPORT_MASK,
          }}
        />

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_48%,rgba(214,179,140,0.07)_0%,rgba(112,59,59,0.025)_40%,transparent_70%)]" />
        <div className="absolute inset-0 shadow-[inset_0_0_130px_rgba(18,7,7,0.20)]" />
      </div>
    </div>
  );
}
