"use client";

import { motion } from "motion/react";

type DoorLightingProps = {
  /** Both leaves share the same opening angle; closed means zero projected light. */
  angleDegrees: 0 | 45 | 90 | 110;
  reducedMotion: boolean | null;
};

const EASE = [0.42, 0, 0.18, 1] as const;

/**
 * A restrained ivory–Rose glow contained by the physical door opening.
 * This layer is fixed at z=-42, just in front of the recessed foyer at z=-44;
 * the rotating door leaves occlude it while the stationary jamb stays above it.
 */
export default function DoorLighting({
  angleDegrees,
  reducedMotion,
}: DoorLightingProps) {
  const openness = angleDegrees / 110;
  const transition = {
    duration: reducedMotion ? 0.01 : 1.1,
    ease: EASE,
  };

  return (
    <>
      <motion.div
        aria-hidden="true"
        initial={false}
        animate={{ opacity: openness === 0 ? 0 : 0.15 + openness * 0.45 }}
        transition={transition}
        className="pointer-events-none absolute inset-x-[4.5%] bottom-[3.1%] top-[4%] overflow-hidden"
        style={{ transform: "translateZ(-42px)" }}
      >
        {/* Local illumination in the foyer, NOT a bright opaque plane hiding
            the room. The opening itself naturally masks this layer. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 58% 51% at 50% 48%, rgba(255,251,237,.42) 0%, rgba(255,235,222,.19) 45%, transparent 100%)",
          }}
        />
        <div
          className="absolute bottom-0 left-[9%] right-[9%] h-[38%]"
          style={{
            background:
              "radial-gradient(ellipse 67% 100% at 50% 100%, rgba(255,245,226,.34), rgba(207,143,153,.14) 56%, transparent 100%)",
          }}
        />
      </motion.div>

      {/* Small floor projection begins at the threshold and fades forward.
          It belongs to the fixed scene, never to either swinging leaf; its
          opacity falls to zero at 0 degrees so closed doors cannot leak light.
          Existing independent contact shadows stay visible underneath. */}
      <motion.div
        aria-hidden="true"
        initial={false}
        animate={{
          opacity: openness === 0 ? 0 : 0.17 + openness * 0.37,
          scaleX: 0.66 + openness * 0.34,
        }}
        transition={transition}
        className="pointer-events-none absolute left-[13%] top-[97.2%] h-[16%] w-[74%] origin-top [transform-style:preserve-3d]"
        style={{ transform: "translateZ(-2px) rotateX(73deg)" }}
      >
        <div
          className="absolute inset-0"
          style={{
            clipPath: "polygon(46% 0,54% 0,100% 100%,0 100%)",
            background:
              "radial-gradient(ellipse 63% 100% at 50% 0%, rgba(255,250,232,.64) 0%, rgba(255,239,225,.37) 37%, rgba(205,137,150,.13) 69%, transparent 100%)",
          }}
        />
        <div
          className="absolute left-[15%] right-[15%] top-0 h-[25%] rounded-[50%] blur-[8px]"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(255,250,236,.34), transparent 77%)",
          }}
        />
      </motion.div>
    </>
  );
}
