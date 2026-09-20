"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";

type Side = "left" | "right";

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

/**
 * Each entire leaf (front, back, thickness and every attached detail) shares
 * ONE hinge pivot. The stationary jamb/portal is outside this animated node.
 */
function HingedLeaf({
  side,
  open,
  reducedMotion,
}: {
  side: Side;
  open: boolean;
  reducedMotion: boolean | null;
}) {
  const left = side === "left";
  const angle = open ? (left ? -110 : 110) : 0;
  const outer = left
    ? "left-[3.65%] origin-left"
    : "right-[3.65%] origin-right";
  const handle = left ? "right-[8%]" : "left-[8%]";
  const rail = left ? "right-[3.5%]" : "left-[3.5%]";

  return (
    <motion.div
      initial={false}
      animate={{ rotateY: angle }}
      transition={{ duration: reducedMotion ? 0.01 : 1.05, ease: EASE }}
      style={{
        transformOrigin: left ? "left center" : "right center",
        transformStyle: "preserve-3d",
      }}
      className={`absolute bottom-[2.8%] top-[3.5%] w-[46%] ${outer}`}
      aria-hidden="true"
    >
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

function DoorFrame({ open }: { open: boolean }) {
  return (
    <>
      {/* The opening and all jamb parts stay fixed while the leaves swing. */}
      <div className="absolute inset-x-[3.6%] bottom-[2.2%] top-[3%] overflow-hidden bg-[#261b20] shadow-[inset_0_0_0_9px_rgba(9,7,9,0.45),inset_0_0_38px_13px_rgba(8,7,9,0.72)]">
        <div className="absolute inset-[5%] bg-[linear-gradient(135deg,#453139_0%,#211c22_48%,#16151a_100%)]" />
        <motion.div
          initial={false}
          animate={{ opacity: open ? 0.5 : 0.05 }}
          transition={{ duration: 0.65 }}
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_38%,rgba(255,239,241,0.8)_0%,rgba(192,122,132,0.17)_45%,transparent_78%)]"
        />
        <div className="absolute inset-x-[10%] bottom-0 h-[28%] bg-[linear-gradient(0deg,rgba(200,156,166,0.21),transparent)] [clip-path:polygon(0_100%,34%_0,66%_0,100%_100%)]" />
      </div>

      {/* Frame is four continuous stationary structural elements, not a card. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[3.5%] bg-[linear-gradient(#efc8ce,#c07a84_55%,#874b56)] shadow-[0_5px_7px_rgba(40,15,23,0.26),inset_0_2px_1px_rgba(255,255,255,0.6)]" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[3.65%] bg-[linear-gradient(90deg,#76424d,#c07a84_55%,#e9bfc5)] shadow-[5px_0_8px_rgba(39,15,23,0.3)]" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-[3.65%] bg-[linear-gradient(270deg,#76424d,#c07a84_55%,#e9bfc5)] shadow-[-5px_0_8px_rgba(39,15,23,0.3)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[2.2%] bg-[linear-gradient(#a2636e,#d6a0a8_48%,#74444e)] shadow-[0_4px_7px_rgba(40,15,23,0.22)]" />

      {(["left", "right"] as const).map((side) => (
        <div
          key={side}
          className={`pointer-events-none absolute top-[3.5%] bottom-[2.8%] w-[1.1%] ${side === "left" ? "left-[3.1%]" : "right-[3.1%]"}`}
        >
          {[18, 50, 82].map((top) => (
            <div
              key={top}
              style={{ top: `${top}%` }}
              className="absolute left-0 h-[7%] w-full -translate-y-1/2 rounded-sm border border-[#74404b]/60 bg-[linear-gradient(90deg,#71404b,#e8bbc1_48%,#8b4d58)] shadow-[0_1px_3px_rgba(40,13,22,0.42)]"
            />
          ))}
        </div>
      ))}
    </>
  );
}

export default function Pintu3DPreview() {
  const [open, setOpen] = useState(false);
  const [angledView, setAngledView] = useState(false);
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
          aria-label={open ? "Pintu dua daun terbuka sepenuhnya; kusen diam." : "Pintu dua daun tertutup; kusen diam."}
        >
          <motion.div
            initial={false}
            animate={{ rotateY: angledView ? -17 : 0 }}
            transition={{ duration: reducedMotion ? 0.01 : 0.7, ease: EASE }}
            className="absolute inset-0 [transform-style:preserve-3d]"
          >
            <DoorFrame open={open} />
            <HingedLeaf side="left" open={open} reducedMotion={reducedMotion} />
            <HingedLeaf side="right" open={open} reducedMotion={reducedMotion} />
          </motion.div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 text-center">
        <Button
          type="button"
          aria-pressed={open}
          onClick={() => setOpen((value) => !value)}
          className="min-w-44"
        >
          {open ? "Tutup pintu" : "Buka seluruh pintu"}
        </Button>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button type="button" aria-pressed={!angledView} onClick={() => setAngledView(false)}>
            Tampak depan
          </Button>
          <Button type="button" aria-pressed={angledView} onClick={() => setAngledView(true)}>
            Tampak miring
          </Button>
        </div>
        <p className="max-w-lg text-sm leading-6 text-foreground/65">
          Buka pintu lalu pilih tampak miring untuk melihat ketebalan, sisi dan bagian belakang kedua daun.
          Material matte Rose terlihat pada muka, belakang dan tepi kedua daun. Kusen tetap diam; ukiran dan ornamen menyusul.
        </p>
      </div>
    </div>
  );
}
