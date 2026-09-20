"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";

type Side = "left" | "right";

const EASE = [0.22, 1, 0.36, 1] as const;
const ROSE_FACE =
  "bg-[linear-gradient(130deg,#d9a3aa_0%,#c07a84_26%,#ac6974_65%,#8d4d59_100%)]";
const ROSE_EDGE =
  "bg-[linear-gradient(90deg,#67313d_0%,#9c5864_45%,#c98c95_100%)]";

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
    ? "left-[3.7%] origin-left"
    : "right-[3.7%] origin-right";
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
      className={`absolute bottom-[3.7%] top-[3.7%] w-[46.3%] ${outer}`}
      aria-hidden="true"
    >
      {/* The front and back remain separate visible faces after 90 degrees. */}
      <div
        style={{
          transform: "translateZ(9px)",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
        }}
        className={`absolute inset-0 overflow-hidden border border-[#f4dce0]/55 ${ROSE_FACE} shadow-[inset_0_0_0_3px_rgba(93,41,51,0.23),inset_0_0_26px_rgba(85,36,45,0.18),0_8px_18px_rgba(34,13,18,0.20)]`}
      >
        {/* All raised rails and the handle are children of the hinged leaf. */}
        <div className="absolute inset-[6%] border-[3px] border-[#edc7cd]/65 shadow-[inset_0_0_0_2px_rgba(101,43,54,0.3),0_0_0_1px_rgba(89,36,47,0.45)]" />
        <div className="absolute inset-x-[12%] top-[12%] h-[32%] border-2 border-[#e5b1b9]/75 bg-[linear-gradient(145deg,rgba(255,255,255,0.16),rgba(80,28,39,0.10))] shadow-[inset_3px_4px_8px_rgba(76,27,38,0.20)]" />
        <div className="absolute inset-x-[12%] bottom-[10%] h-[36%] border-2 border-[#e5b1b9]/75 bg-[linear-gradient(145deg,rgba(255,255,255,0.13),rgba(80,28,39,0.12))] shadow-[inset_3px_4px_9px_rgba(76,27,38,0.20)]" />
        <div className={`absolute inset-y-[5%] w-[3px] bg-[#f2cbd0]/70 shadow-[1px_0_3px_rgba(72,26,36,0.45)] ${rail}`} />
        <div className={`absolute top-[47%] h-[7%] w-[7%] min-w-[7px] rounded-sm border border-[#f0d4d8]/80 bg-[linear-gradient(90deg,#73404a,#e0b2b9,#a0646e)] shadow-[0_1px_4px_rgba(55,23,30,0.5)] ${handle}`} />
      </div>

      <div
        style={{
          transform: "rotateY(180deg) translateZ(9px)",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
        }}
        className={`absolute inset-0 border border-[#e7bac1]/50 ${ROSE_FACE} shadow-[inset_0_0_0_5px_rgba(75,32,42,0.25)]`}
      >
        <div className="absolute inset-[8%] border-[3px] border-[#dca7b0]/65" />
        <div className="absolute inset-x-[14%] top-[14%] h-[30%] border border-[#eac5ca]/45" />
        <div className="absolute inset-x-[14%] bottom-[13%] h-[35%] border border-[#eac5ca]/45" />
      </div>

      <div
        style={{ transform: "rotateY(90deg) translateZ(8px)" }}
        className={`absolute inset-y-0 right-0 w-[18px] origin-right ${ROSE_EDGE}`}
      />
      <div
        style={{ transform: "rotateY(-90deg) translateZ(8px)" }}
        className={`absolute inset-y-0 left-0 w-[18px] origin-left ${ROSE_EDGE}`}
      />
    </motion.div>
  );
}

function DoorFrame({ open }: { open: boolean }) {
  return (
    <>
      {/* The opening and all jamb parts stay fixed while the leaves swing. */}
      <div className="absolute inset-[3%] overflow-hidden bg-[#261b20] shadow-[inset_0_0_0_9px_rgba(9,7,9,0.45),inset_0_0_38px_13px_rgba(8,7,9,0.72)]">
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
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[4.3%] bg-[linear-gradient(#efc8ce,#c07a84_55%,#874b56)] shadow-[0_5px_7px_rgba(40,15,23,0.26),inset_0_2px_1px_rgba(255,255,255,0.6)]" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[4%] bg-[linear-gradient(90deg,#76424d,#c07a84_55%,#e9bfc5)] shadow-[5px_0_8px_rgba(39,15,23,0.3)]" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-[4%] bg-[linear-gradient(270deg,#76424d,#c07a84_55%,#e9bfc5)] shadow-[-5px_0_8px_rgba(39,15,23,0.3)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[3.4%] bg-[linear-gradient(#a2636e,#d6a0a8_48%,#74444e)] shadow-[0_4px_7px_rgba(40,15,23,0.22)]" />

      {(["left", "right"] as const).map((side) => (
        <div
          key={side}
          className={`pointer-events-none absolute top-[3%] bottom-[3%] w-[1.6%] ${side === "left" ? "left-[2.7%]" : "right-[2.7%]"}`}
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
  const reducedMotion = useReducedMotion();

  return (
    <div className="flex w-full flex-col items-center gap-8">
      <div className="relative flex min-h-[min(75vh,750px)] w-full items-center justify-center overflow-visible py-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[4%] h-[9%] w-[min(73vw,610px)] rounded-[50%] bg-black/20 blur-2xl dark:bg-black/50"
        />
        <div
          className="relative aspect-[0.72] w-[min(65vw,480px)] shrink-0 [perspective:1550px]"
          role="img"
          aria-label={open ? "Pintu dua daun terbuka sepenuhnya; kusen diam." : "Pintu dua daun tertutup; kusen diam."}
        >
          <div className="absolute inset-0 [transform-style:preserve-3d]">
            <DoorFrame open={open} />
            <HingedLeaf side="left" open={open} reducedMotion={reducedMotion} />
            <HingedLeaf side="right" open={open} reducedMotion={reducedMotion} />
          </div>
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
        <p className="max-w-lg text-sm leading-6 text-foreground/65">
          Periksa kedua daun, tepi dan bagian belakangnya saat terbuka. Seluruh kusen tetap diam.
          Detail ukiran dan bunga akan ditambahkan setelah gerakan dasar ini disetujui.
        </p>
      </div>
    </div>
  );
}
