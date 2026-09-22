"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode, RefObject } from "react";

type Direction = "left" | "right" | "top" | "bottom";
type Props = {
  children: ReactNode;
  ready: boolean;
  direction?: Direction;
  delay?: number;
  className?: string;
  scrollRoot?: RefObject<HTMLElement | null>;
};

/**
 * Each real UI block is a puzzle piece: it approaches from a different edge,
 * rotates very slightly and settles in its original position. No duplicate DOM,
 * screenshots or fake content, so all buttons/links remain interactive.
 */
export default function PuzzleAssemble({
  children,
  ready,
  direction = "bottom",
  delay = 0,
  className,
  scrollRoot,
}: Props) {
  const reducedMotion = useReducedMotion();
  if (reducedMotion) return <div className={className}>{children}</div>;

  const offset = {
    left: { x: -38, y: 8, rotate: -1.6 },
    right: { x: 38, y: -8, rotate: 1.6 },
    top: { x: -9, y: -29, rotate: -0.9 },
    bottom: { x: 9, y: 29, rotate: 0.9 },
  }[direction];
  const assembled = { opacity: 1, x: 0, y: 0, rotate: 0, scale: 1, filter: "blur(0px)" };
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...offset, scale: 0.965, filter: "blur(4px)" }}
      animate={!scrollRoot && ready ? assembled : undefined}
      whileInView={scrollRoot && ready ? assembled : undefined}
      viewport={scrollRoot ? { root: scrollRoot, once: true, amount: 0.06 } : undefined}
      transition={{ duration: 0.88, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
