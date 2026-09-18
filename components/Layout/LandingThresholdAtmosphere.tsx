"use client";

import { motion, useReducedMotion } from "motion/react";

const ease = [0.22, 1, 0.36, 1] as const;

export default function LandingThresholdAtmosphere() {
  const reduced = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-background" />

      <div className="absolute inset-y-0 right-0 w-[58%] opacity-80 dark:opacity-95">
        <div className="absolute right-[7%] top-[3%] h-[72%] w-[54%] rounded-t-[48%] border border-primary/10 dark:border-primary/16" />
        <div className="absolute right-[11%] top-[8%] h-[64%] w-[46%] rounded-t-[48%] border border-foreground/[0.055] dark:border-white/[0.07]" />
        <div className="absolute right-[15%] top-[13%] h-[56%] w-[38%] rounded-t-[48%] border border-primary/[0.07] dark:border-primary/[0.12]" />
      </div>

      <motion.div
        {...(reduced
          ? {}
          : {
              animate: { x: [0, -10, 0], opacity: [0.52, 0.68, 0.52] },
              transition: { duration: 11, repeat: Infinity, ease: "easeInOut" },
            })}
        className="absolute -right-[7%] top-[5%] h-[74%] w-[47%] rotate-[-8deg] bg-[linear-gradient(112deg,transparent_18%,rgba(192,122,132,0.025)_38%,rgba(192,122,132,0.08)_53%,transparent_72%)] dark:bg-[linear-gradient(112deg,transparent_18%,rgba(192,122,132,0.035)_38%,rgba(192,122,132,0.13)_53%,transparent_72%)]"
      />

      <div className="absolute inset-x-0 bottom-[18%] h-px bg-gradient-to-r from-transparent via-primary/14 to-transparent dark:via-primary/22" />
      <div className="absolute bottom-[4%] right-[5%] h-[18%] w-[52%] rounded-[50%] bg-primary/[0.035] blur-3xl dark:bg-primary/[0.065]" />

      <svg
        viewBox="0 0 1440 420"
        className="absolute bottom-[-8%] left-0 h-[48%] w-full opacity-70 dark:opacity-90"
        preserveAspectRatio="none"
      >
        <motion.path
          d="M-40 330 C 250 235, 470 375, 720 300 S 1120 205, 1490 265"
          fill="none"
          stroke="var(--primary)"
          strokeWidth="1.15"
          strokeOpacity="0.24"
          initial={reduced ? false : { pathLength: 0.72, opacity: 0.08 }}
          animate={reduced ? undefined : { pathLength: 1, opacity: 0.24 }}
          transition={{ duration: 1.4, ease }}
        />
        <path
          d="M-30 355 C 250 285, 505 410, 770 333 S 1170 250, 1480 305"
          fill="none"
          stroke="currentColor"
          className="text-foreground"
          strokeWidth="0.7"
          strokeOpacity="0.075"
        />
      </svg>

      <div className="absolute left-[7%] top-[14%] h-[1px] w-[16%] bg-gradient-to-r from-primary/30 to-transparent" />
      <div className="absolute left-[7%] top-[14%] h-[18%] w-px bg-gradient-to-b from-primary/26 to-transparent" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_38%,rgba(192,122,132,0.055),transparent_25%)] dark:bg-[radial-gradient(circle_at_76%_38%,rgba(192,122,132,0.10),transparent_25%)]" />
    </div>
  );
}
