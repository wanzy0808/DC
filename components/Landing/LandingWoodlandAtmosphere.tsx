"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

const FOREST = "/assets/landing/atmosphere/forest-silhouette.png";

const cornerBranches = [
  {
    src: "/assets/landing/ornaments/botanical/branch-01.png",
    className:
      "absolute -left-[6%] -top-[10%] h-[34%] w-[33%] origin-top-left opacity-[0.84] [mask-image:linear-gradient(to_bottom,black_12%,transparent_74%)] dark:opacity-[0.48]",
    imageClassName: "object-contain object-left-top",
  },
  {
    src: "/assets/landing/ornaments/botanical/branch-02.png",
    className:
      "absolute -right-[5%] -top-[9%] hidden h-[34%] w-[31%] origin-top-right opacity-[0.78] sm:block dark:opacity-[0.43]",
    imageClassName: "object-contain object-right-top",
  },
  {
    src: "/assets/landing/ornaments/botanical/branch-03.png",
    className:
      "absolute -bottom-[12%] -left-[7%] h-[44%] w-[44%] origin-bottom-left opacity-[0.85] dark:opacity-[0.46]",
    imageClassName: "object-contain object-left-bottom",
  },
  {
    src: "/assets/landing/ornaments/botanical/branch-04.png",
    className:
      "absolute -bottom-[12%] -right-[7%] h-[44%] w-[43%] origin-bottom-right opacity-[0.82] dark:opacity-[0.44]",
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
        className="absolute -inset-x-[9%] bottom-[9%] h-[78%] sm:-inset-x-[7%] sm:bottom-[8%] sm:h-[80%]"
      >
        <Image
          src={FOREST}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-fill opacity-[0.82] brightness-[0.88] saturate-[0.85] dark:opacity-[0.23] dark:brightness-125 dark:saturate-[0.55]"
        />
      </motion.div>

      <div className="absolute inset-x-[18%] bottom-[6%] h-[19%] rounded-[50%] bg-[#D6B38C]/18 blur-3xl dark:bg-[#EDE3D8]/10" />

      <div className="absolute inset-x-[5%] bottom-[5.5%] h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent dark:via-[#D6B38C]/18" />
    </div>
  );
}

/** Outside the frame clip, but behind its content so the logo and controls stay clear. */
export function LandingOuterBranches() {
  const reduced = useReducedMotion();

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[5] overflow-hidden">
      {cornerBranches.map((branch, index) => (
        <motion.div
          key={branch.src}
          initial={false}
          animate={reduced ? undefined : { rotate: [0, index % 2 ? 0.55 : -0.55, 0], y: [0, -2, 0] }}
          transition={{
            duration: 16 + index * 2,
            delay: index * 0.4,
            repeat: Infinity,
            ease: "easeInOut",
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

    </div>
  );
}
