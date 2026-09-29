"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode, RefObject } from "react";

/**
 * Reusable reveal for Event Planner sections inside its own scrolling frame.
 * Sections settle once without shifting their position during scrolling.
 */
export default function ScrollReveal({
  children,
  scrollRoot,
}: {
  children: ReactNode;
  scrollRoot: RefObject<HTMLElement | null>;
}) {
  const reducedMotion = useReducedMotion();
  if (reducedMotion) return <div className="[&_h1]:text-primary [&_h2]:text-primary [&_h3]:text-primary">{children}</div>;

  return (
    <motion.div
      className="[&_h1]:text-primary [&_h2]:text-primary [&_h3]:text-primary"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ root: scrollRoot, once: true, amount: 0.06 }}
      transition={{ duration: 0.68, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
