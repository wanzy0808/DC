"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode, RefObject } from "react";

/**
 * Reusable reveal for Event Planner sections inside its own scrolling frame.
 * Exiting the frame resets this visual-only effect; re-entry plays it again.
 */
export default function ScrollReveal({
  children,
  scrollRoot,
}: {
  children: ReactNode;
  scrollRoot: RefObject<HTMLElement | null>;
}) {
  const reducedMotion = useReducedMotion();
  if (reducedMotion) return <div>{children}</div>;

  return (
    <motion.div
      className="[&_h1]:text-primary [&_h2]:text-primary [&_h3]:text-primary"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ root: scrollRoot, once: false, amount: 0.06 }}
      transition={{ duration: 0.68, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
