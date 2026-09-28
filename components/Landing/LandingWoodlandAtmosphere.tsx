"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

const FOREST = "/assets/landing/atmosphere/forest-silhouette.png";

const cornerBranches = [
  {
    src: "/assets/landing/ornaments/botanical/branch-01.png",
    className:
      "absolute -left-[7%] -top-[7%] h-[40%] w-[42%] max-w-[620px] opacity-[0.62] sm:h-[46%] sm:w-[36%] dark:opacity-[0.30]",
    imageClassName: "object-contain object-left-top",
  },
  {
    src: "/assets/landing/ornaments/botanical/branch-02.png",
    className:
      "absolute -right-[7%] -top-[8%] hidden h-[38%] w-[36%] max-w-[560px] opacity-[0.46] sm:block dark:opacity-[0.24]",
    imageClassName: "object-contain object-right-top",
  },
  {
    src: "/assets/landing/ornaments/botanical/branch-03.png",
    className:
      "absolute -bottom-[11%] -left-[8%] h-[44%] w-[48%] max-w-[700px] opacity-[0.72] sm:h-[50%] sm:w-[41%] dark:opacity-[0.36]",
    imageClassName: "object-contain object-left-bottom",
  },
  {
    src: "/assets/landing/ornaments/botanical/branch-04.png",
    className:
      "absolute -bottom-[12%] -right-[9%] h-[44%] w-[47%] max-w-[700px] opacity-[0.58] sm:h-[49%] sm:w-[40%] dark:opacity-[0.31]",
    imageClassName: "object-contain object-right-bottom",
  },
] as const;

export default function LandingWoodlandAtmosphere() {
  const reduced = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_52%,rgba(255,249,245,0.64),rgba(237,227,216,0.18)_43%,transparent_72%)] dark:bg-[radial-gradient(ellipse_at_50%_50%,rgba(214,179,140,0.16),rgba(112,59,59,0.05)_48%,transparent_74%)]" />

      <motion.div
        initial={reduced ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduced ? 0 : 1.1, ease: "easeOut" }}
        className="absolute inset-x-[4%] bottom-[7%] h-[64%] sm:inset-x-[7%] sm:bottom-[6%] sm:h-[67%]"
      >
        <Image
          src={FOREST}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-contain object-bottom opacity-[0.44] blur-[0.35px] saturate-[0.72] sm:opacity-[0.52] dark:opacity-[0.20] dark:brightness-125 dark:saturate-[0.55]"
        />
      </motion.div>

      <div className="absolute inset-x-[18%] bottom-[6%] h-[19%] rounded-[50%] bg-[#D6B38C]/18 blur-3xl dark:bg-[#EDE3D8]/10" />

      {cornerBranches.map((branch, index) => (
        <motion.div
          key={branch.src}
          initial={reduced ? false : { opacity: 0, scale: 0.985 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: reduced ? 0 : 0.9,
            delay: reduced ? 0 : 0.1 + index * 0.08,
            ease: "easeOut",
          }}
          className={branch.className}
        >
          <Image
            src={branch.src}
            alt=""
            fill
            sizes="(max-width: 640px) 55vw, 42vw"
            className={branch.imageClassName}
          />
        </motion.div>
      ))}

      <div className="absolute inset-x-[5%] bottom-[5.5%] h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent dark:via-[#D6B38C]/18" />
    </div>
  );
}
