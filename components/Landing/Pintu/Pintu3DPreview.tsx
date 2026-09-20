"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import DoorRelief from "@/components/Landing/Pintu/DoorRelief";
import DoorMolding, { FrameMolding } from "@/components/Landing/Pintu/DoorMolding";

type Side = "left" | "right";
type DoorAngle = 0 | 45 | 90 | 110;
const DOOR_ANGLES: readonly DoorAngle[] = [0, 45, 90, 110];
const FULLY_OPEN = 110;

const EASE = [0.22, 1, 0.36, 1] as const;
// Layered opaque gradients simulate satin-painted wood grain without image assets,
// specular shine, expensive filters, or animation of material properties.
const ROSE_FRONT_MATERIAL = [
  "linear-gradient(90deg,rgba(59,23,33,.22) 0%,transparent 9%,transparent 78%,rgba(62,24,34,.19) 100%)",
  "repeating-linear-gradient(89.2deg,transparent 0px,rgba(255,238,241,.13) 2px,transparent 3px,transparent 9px,rgba(79,29,40,.12) 10px,transparent 12px,transparent 21px)",
  "repeating-linear-gradient(91.1deg,transparent 0px,rgba(94,40,49,.09) 1px,transparent 2px,transparent 32px)",
  "linear-gradient(110deg,#d6a0a8 0%,#c3848e 25%,#bb7985 53%,#a96572 81%,#935361 100%)",
].join(",");
const ROSE_BACK_MATERIAL = [
  "linear-gradient(90deg,rgba(42,16,25,.30),transparent 15%,transparent 85%,rgba(42,16,25,.27))",
  "repeating-linear-gradient(89deg,transparent 0px,rgba(235,199,206,.10) 2px,transparent 4px,transparent 13px,rgba(56,20,31,.11) 14px,transparent 16px,transparent 26px)",
  "linear-gradient(115deg,#a96c77 0%,#985b68 42%,#884c59 100%)",
].join(",");
const ROSE_EDGE_MATERIAL = [
  "repeating-linear-gradient(0deg,transparent 0px,rgba(242,199,205,.14) 1px,transparent 2px,transparent 14px,rgba(59,20,30,.10) 16px,transparent 18px,transparent 27px)",
  "linear-gradient(90deg,#623540 0%,#a96b77 32%,#c28a94 50%,#87505c 100%)",
].join(",");
const ROSE_PANEL_MATERIAL = [
  "linear-gradient(130deg,rgba(56,19,30,.19),rgba(255,222,227,.04) 36%,rgba(49,17,27,.13) 100%)",
  "repeating-linear-gradient(90deg,transparent 0px,rgba(244,212,217,.08) 2px,transparent 3px,transparent 17px,rgba(61,20,31,.08) 18px,transparent 20px,transparent 31px)",
  "linear-gradient(105deg,#bb7d87,#b4727e 52%,#a86774)",
].join(",");

// 20 px is the whole thickness of each leaf, not an extra piece of trim.
const HALF_THICKNESS = 10;
// Front face is on the existing z=0 plane, while the fixed jamb returns
// extend *behind* it; the whole frame remains stationary during a door swing.
const FRAME_DEPTH = 44;
const HINGE_POINTS = [18, 50, 82] as const;

function DoorHingeBarrels({
  side,
  moving,
}: {
  side: Side;
  moving: boolean;
}) {
  // The fixed top/bottom barrels attach to the jamb. The central sleeve and
  // the small mounting plate attach to the leaf's own rotating pivot.
  const isLeft = side === "left";
  return (
    <>
      {HINGE_POINTS.map((point) => (
        <div
          key={point}
          className={`pointer-events-none absolute z-10 h-[34px] w-[12px] [transform-style:preserve-3d] ${
            moving
              ? isLeft
                ? "left-0"
                : "left-full"
              : isLeft
                ? "left-[3.65%]"
                : "left-[96.35%]"
          }`}
          style={{
            top: moving ? `${point}%` : `calc(3.5% + ${point * 0.937}%)`,
            transform: "translateX(-50%) translateY(-50%) translateZ(16px)",
          }}
          aria-hidden="true"
        >
          {moving ? (
            <>
              <div
                className={`absolute top-[6px] h-[22px] w-[12px] rounded-[5px] border border-[#6d3b47]/75 bg-[linear-gradient(90deg,#764550,#d9a3aa_43%,#9d626d_72%,#683844)] shadow-[1px_0_3px_rgba(37,15,22,.35)]`}
              />
              <div
                className={`absolute top-[9px] h-[16px] w-[11px] rounded-sm border border-[#9a626e]/70 bg-[#b97a85] ${
                  isLeft ? "left-[9px]" : "right-[9px]"
                }`}
              />
            </>
          ) : (
            <>
              <div
                className={`absolute top-[5px] h-[24px] w-[12px] rounded-sm border border-[#9b616d]/65 bg-[linear-gradient(90deg,#925560,#cb929d,#91515d)] ${
                  isLeft ? "right-[8px]" : "left-[8px]"
                }`}
              />
              {[0, 27].map((offset) => (
                <div
                  key={offset}
                  className="absolute left-0 h-[7px] w-[12px] rounded-[5px] border border-[#6d3b47]/75 bg-[linear-gradient(90deg,#77434e,#edc0c6_40%,#9a5d69_76%,#673841)] shadow-[1px_0_3px_rgba(37,15,22,.3)]"
                  style={{ top: offset }}
                />
              ))}
            </>
          )}
        </div>
      ))}
    </>
  );
}

/**
 * Each entire leaf (front, back, thickness and every attached detail) shares
 * ONE hinge pivot. The stationary jamb/portal is outside this animated node.
 */
function HingedLeaf({
  side,
  angleDegrees,
  reducedMotion,
}: {
  side: Side;
  angleDegrees: DoorAngle;
  reducedMotion: boolean | null;
}) {
  const left = side === "left";
  const angle = left ? -angleDegrees : angleDegrees;
  const outer = left
    ? "left-[3.65%] origin-left"
    : "right-[3.65%] origin-right";
  const handle = left ? "right-[8%]" : "left-[8%]";
  const rail = left ? "right-[3.5%]" : "left-[3.5%]";

  return (
    <motion.div
      initial={false}
      animate={{ rotateY: angle }}
      transition={{ duration: reducedMotion ? 0.01 : 1.1, ease: [0.42, 0, 0.18, 1] }}
      style={{
        transformOrigin: left ? "left center 16px" : "right center 16px",
        transformStyle: "preserve-3d",
      }}
      className={`absolute bottom-[2.8%] top-[3.5%] w-[46%] ${outer}`}
      aria-hidden="true"
    >
      <DoorHingeBarrels side={side} moving />
      {/* The front and back remain separate visible faces after 90 degrees. */}
      <div
        style={{
          transform: `translateZ(${HALF_THICKNESS}px)`,
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          backgroundImage: ROSE_FRONT_MATERIAL,
        }}
        className="absolute inset-0 overflow-hidden border border-[#dfadb6]/65 shadow-[inset_0_0_0_3px_rgba(69,24,34,0.24),inset_0_0_23px_rgba(61,24,35,0.18),0_8px_18px_rgba(34,13,18,0.20)]"
      >
        {/* All raised rails and the handle are children of the hinged leaf. */}
        <div className="absolute inset-[6%] border-[3px] border-[#ca929c]/80 shadow-[inset_2px_2px_2px_rgba(255,225,230,0.15),inset_-2px_-2px_4px_rgba(58,20,30,0.28),0_0_0_1px_rgba(86,37,47,0.38)]" />
        <div style={{ backgroundImage: ROSE_PANEL_MATERIAL }}
          className="absolute inset-x-[12%] top-[12%] h-[32%] border-2 border-[#cc98a1]/75 shadow-[inset_5px_5px_8px_rgba(65,21,34,0.27),inset_-2px_-2px_5px_rgba(247,204,212,0.15),0_1px_1px_rgba(239,193,201,0.24)]" />
        <div style={{ backgroundImage: ROSE_PANEL_MATERIAL }}
          className="absolute inset-x-[12%] bottom-[10%] h-[36%] border-2 border-[#cc98a1]/75 shadow-[inset_5px_5px_9px_rgba(65,21,34,0.28),inset_-2px_-2px_5px_rgba(247,204,212,0.14),0_1px_1px_rgba(239,193,201,0.22)]" />
        {/* Both relief panels belong to the moving FRONT leaf face, never to the stationary frame. */}
        <DoorRelief side={side} />
        <DoorMolding side={side} />
        <div className={`absolute inset-y-[5%] w-[3px] bg-[#f2cbd0]/70 shadow-[1px_0_3px_rgba(72,26,36,0.45)] ${rail}`} />
        <div className={`absolute top-[47%] h-[7%] w-[7%] min-w-[7px] rounded-sm border border-[#f0d4d8]/80 bg-[linear-gradient(90deg,#73404a,#e0b2b9,#a0646e)] shadow-[0_1px_4px_rgba(55,23,30,0.5)] ${handle}`} />
      </div>

      <div
        style={{
          transform: `rotateY(180deg) translateZ(${HALF_THICKNESS}px)`,
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          backgroundImage: ROSE_BACK_MATERIAL,
        }}
        className="absolute inset-0 border border-[#bf8892]/65 shadow-[inset_0_0_0_5px_rgba(75,32,42,0.25)]"
      >
        <div className="absolute inset-[8%] border-[3px] border-[#dca7b0]/65" />
        <div className="absolute inset-x-[14%] top-[14%] h-[30%] border border-[#eac5ca]/45" />
        <div className="absolute inset-x-[14%] bottom-[13%] h-[35%] border border-[#eac5ca]/45" />
      </div>

      {/* Four side faces close the 20 px prism; they follow the same pivot. */}
      <div
        style={{
          left: "100%",
          width: HALF_THICKNESS * 2,
          transform: "translateX(-50%) rotateY(90deg)",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          backgroundImage: ROSE_EDGE_MATERIAL,
        }}
        className="absolute inset-y-0 shadow-[inset_2px_0_4px_rgba(42,15,25,0.30)]"
      />
      <div
        style={{
          left: 0,
          width: HALF_THICKNESS * 2,
          transform: "translateX(-50%) rotateY(-90deg)",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          backgroundImage: ROSE_EDGE_MATERIAL,
        }}
        className="absolute inset-y-0 shadow-[inset_-2px_0_4px_rgba(42,15,25,0.30)]"
      />
      <div
        style={{
          top: 0,
          height: HALF_THICKNESS * 2,
          transform: "translateY(-50%) rotateX(90deg)",
          backgroundImage: ROSE_EDGE_MATERIAL,
        }}
        className="absolute inset-x-0"
      />
      <div
        style={{
          bottom: 0,
          height: HALF_THICKNESS * 2,
          transform: "translateY(50%) rotateX(90deg)",
          backgroundImage: ROSE_EDGE_MATERIAL,
        }}
        className="absolute inset-x-0"
      />
    </motion.div>
  );
}

function DoorFrame({ angleDegrees }: { angleDegrees: DoorAngle }) {
  return (
    <>
      {/* The opening and all jamb parts stay fixed while the leaves swing. */}
      <div
        className="absolute inset-x-[3.6%] bottom-[2.2%] top-[3%] overflow-hidden bg-[#261b20] shadow-[inset_0_0_0_9px_rgba(9,7,9,0.45),inset_0_0_38px_13px_rgba(8,7,9,0.72)]"
        style={{ transform: `translateZ(-${FRAME_DEPTH}px)` }}
      >
        <div className="absolute inset-[5%] bg-[linear-gradient(135deg,#453139_0%,#211c22_48%,#16151a_100%)]" />
        <motion.div
          initial={false}
          animate={{ opacity: 0.05 + (angleDegrees / FULLY_OPEN) * 0.45 }}
          transition={{ duration: 1.1, ease: EASE }}
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_38%,rgba(255,239,241,0.8)_0%,rgba(192,122,132,0.17)_45%,transparent_78%)]"
        />
        <div className="absolute inset-x-[10%] bottom-0 h-[28%] bg-[linear-gradient(0deg,rgba(200,156,166,0.21),transparent)] [clip-path:polygon(0_100%,34%_0,66%_0,100%_100%)]" />
      </div>

      {/* A stationary 44 px-deep architectural jamb. Each return connects
          the front trim (z=0) to the rear opening (z=-44), rather than
          rotating a flat rectangle to imitate a side view. */}
      <div
        className="pointer-events-none absolute inset-x-[3.65%] bottom-[2.2%] top-[3.5%] border-[5px] border-[#6b3946]/85 shadow-[inset_0_0_19px_rgba(0,0,0,.45)]"
        style={{ transform: `translateZ(-${FRAME_DEPTH}px)` }}
        aria-hidden="true"
      />
      {(["left", "right"] as const).map((side) => (
        <div
          key={`jamb-${side}`}
          className="pointer-events-none absolute bottom-[2.2%] top-[3.5%] bg-[linear-gradient(90deg,#70404c_0%,#a46d78_43%,#ba828c_100%)] shadow-[inset_2px_0_6px_rgba(53,19,29,.28)]"
          style={{
            left: side === "left" ? "3.65%" : "96.35%",
            width: FRAME_DEPTH,
            transform: `translateX(-50%) translateZ(-${FRAME_DEPTH / 2}px) rotateY(90deg)`,
            backfaceVisibility: "visible",
          }}
          aria-hidden="true"
        />
      ))}
      <div
        className="pointer-events-none absolute inset-x-[3.65%] top-[3.5%] bg-[linear-gradient(#a8707b,#76424f)] shadow-[inset_0_2px_5px_rgba(49,18,30,.4)]"
        style={{
          height: FRAME_DEPTH,
          transform: `translateY(-50%) translateZ(-${FRAME_DEPTH / 2}px) rotateX(90deg)`,
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-[3.65%] bottom-[2.2%] bg-[linear-gradient(#9d6874,#62313e)]"
        style={{
          height: FRAME_DEPTH,
          transform: `translateY(50%) translateZ(-${FRAME_DEPTH / 2}px) rotateX(90deg)`,
        }}
        aria-hidden="true"
      />

      {/* Frame is four continuous stationary structural elements, not a card. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[3.5%] bg-[linear-gradient(#efc8ce,#c07a84_55%,#874b56)] shadow-[0_5px_7px_rgba(40,15,23,0.26),inset_0_2px_1px_rgba(255,255,255,0.6)]" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[3.65%] bg-[linear-gradient(90deg,#76424d,#c07a84_55%,#e9bfc5)] shadow-[5px_0_8px_rgba(39,15,23,0.3)]" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-[3.65%] bg-[linear-gradient(270deg,#76424d,#c07a84_55%,#e9bfc5)] shadow-[-5px_0_8px_rgba(39,15,23,0.3)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[2.2%] bg-[linear-gradient(#a2636e,#d6a0a8_48%,#74444e)] shadow-[0_4px_7px_rgba(40,15,23,0.22)]" />

      <FrameMolding />
      <DoorHingeBarrels side="left" moving={false} />
      <DoorHingeBarrels side="right" moving={false} />
    </>
  );
}

/**
 * Ground shadows live in the same scene but NOT inside the swinging leaves.
 * Their soft ellipses start at the fixed hinge feet and pivot across the
 * floor as the opening angle changes; frame grounding is handled separately.
 * This is a visual approximation, not a claim of physically-correct lighting.
 */
function DoorGroundShadows({
  angleDegrees,
  reducedMotion,
}: {
  angleDegrees: DoorAngle;
  reducedMotion: boolean | null;
}) {
  const openFraction = angleDegrees / FULLY_OPEN;
  return (
    <div
      className="pointer-events-none absolute -bottom-[10%] left-[-3%] right-[-3%] h-[15%] origin-top [transform:rotateX(74deg)] [transform-style:preserve-3d]"
      aria-hidden="true"
    >
      {(["left", "right"] as const).map((side) => {
        const left = side === "left";
        return (
          <motion.div
            key={side}
            initial={false}
            animate={{
              rotateZ: (left ? -1 : 1) * angleDegrees * 0.72,
              scaleX: 0.88 + openFraction * 0.18,
              opacity: 0.12 + openFraction * 0.22,
            }}
            transition={{ duration: reducedMotion ? 0.01 : 1.1, ease: [0.42, 0, 0.18, 1] }}
            className={`absolute top-[12%] h-[64%] w-[47%] rounded-[50%] bg-[radial-gradient(ellipse_at_35%_50%,rgba(34,13,23,0.75)_0%,rgba(58,25,36,0.38)_42%,transparent_75%)] blur-[8px] ${
              left ? "left-[3%] origin-left" : "right-[3%] origin-right"
            }`}
          />
        );
      })}
    </div>
  );
}

export default function Pintu3DPreview() {
  const [angleDegrees, setAngleDegrees] = useState<DoorAngle>(0);
  const [view, setView] = useState<"front" | "left" | "right">("front");
  const reducedMotion = useReducedMotion();

  return (
    <div className="flex w-full flex-col items-center gap-8">
      <div className="relative flex min-h-[min(82dvh,820px)] w-full items-center justify-center overflow-visible py-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[1%] h-[8%] w-[min(78vw,650px)] rounded-[50%] bg-black/20 blur-2xl dark:bg-black/50"
        />
        <div
          className="relative aspect-[0.65] w-[min(84vw,570px,calc(83dvh*0.65))] shrink-0 [perspective:1650px]"
          role="img"
          aria-label={angleDegrees === 0 ? "Pintu dua daun tertutup; kusen diam." : `Pintu dua daun terbuka ${angleDegrees} derajat; kusen diam.`}
        >
          <motion.div
            initial={false}
            animate={{ rotateY: view === "left" ? -30 : view === "right" ? 30 : 0 }}
            transition={{ duration: reducedMotion ? 0.01 : 0.7, ease: EASE }}
            className="absolute inset-0 [transform-style:preserve-3d]"
          >
            <DoorGroundShadows angleDegrees={angleDegrees} reducedMotion={reducedMotion} />
            <DoorFrame angleDegrees={angleDegrees} />
            <HingedLeaf side="left" angleDegrees={angleDegrees} reducedMotion={reducedMotion} />
            <HingedLeaf side="right" angleDegrees={angleDegrees} reducedMotion={reducedMotion} />
          </motion.div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 text-center">
        <Button
          type="button"
          aria-pressed={angleDegrees === FULLY_OPEN}
          onClick={() => setAngleDegrees((value) => (value === FULLY_OPEN ? 0 : FULLY_OPEN))}
          className="min-w-44"
        >
          {angleDegrees === FULLY_OPEN ? "Tutup pintu" : "Buka seluruh pintu"}
        </Button>
        <div className="flex flex-wrap items-center justify-center gap-2" role="group" aria-label="Sudut bukaan pintu">
          {DOOR_ANGLES.map((angle) => (
            <Button
              key={angle}
              type="button"
              aria-pressed={angleDegrees === angle}
              onClick={() => setAngleDegrees(angle)}
            >
              {angle}°
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3" role="group" aria-label="Sudut pandang">
          <Button type="button" aria-pressed={view === "front"} onClick={() => setView("front")}>
            Tampak depan
          </Button>
          <Button type="button" aria-pressed={view === "left"} onClick={() => setView("left")}>
            Sudut kiri
          </Button>
          <Button type="button" aria-pressed={view === "right"} onClick={() => setView("right")}>
            Sudut kanan
          </Button>
        </div>
        <p className="max-w-lg text-sm leading-6 text-foreground/65">
          Periksa list bertingkat di sekeliling ukiran dan garis pertemuan dua daun saat tertutup.
          Buka hingga 110°, lalu pilih sudut kiri atau kanan: molding pada daun ikut berputar, list kusen tetap diam.
        </p>
      </div>
    </div>
  );
}
