"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  animate,
  motion,
  type MotionValue,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { useTheme } from "@/components/Theme/ThemeProvider";

type DoorValue = 1 | 2 | 3 | null;

type PintuSecBaruProps = {
  activeDoor: DoorValue;
  setActiveDoor: React.Dispatch<React.SetStateAction<DoorValue>>;
};

type Door = {
  id: 1 | 2 | 3;
  title: string;
  href: string;
  bgImage: string;
  tags: string[];
  desc: string;
};

const LOOP_DURATION = 11;
const LOOP_RADIUS_X = 280;
const LOOP_RADIUS_Y = 82;
const LOOP_PHASES = 3;
const FRONT_PHASE = 0.25;
const FRONT_SCALE = 1;
const BACK_SCALE = 0.68;

const doors: Door[] = [
  {
    id: 1,
    title: "Event Planner",
    href: "/event-planner",
    bgImage: "wo.png",
    tags: ["STAFF", "EVENT RUNDOWN", "VENDOR"],
    desc: "Perencanaan dan koordinasi untuk wedding, anniversary, baby shower, dan celebration lainnya.",
  },
  {
    id: 2,
    title: "Digital Invitation",
    href: "/d-invitation",
    bgImage: "hp-digital.png",
    tags: ["UNDANGAN", "RSVP", "GUEST MANAGEMENT"],
    desc: "Undangan digital per acara dengan template, RSVP, dan manajemen tamu.",
  },
  {
    id: 3,
    title: "Guestbook",
    href: "/guestbook",
    bgImage: "bukutamu.png",
    tags: ["BUKU TAMU", "QR CHECK-IN", "KEHADIRAN"],
    desc: "Operasional kehadiran tamu dan QR check-in untuk hari acara.",
  },
];

function circularDistance(a: number, b: number) {
  const difference = Math.abs(a - b);
  return Math.min(difference, 1 - difference);
}

function getFrontDoor(progress: number) {
  let closestIndex = 0;
  let closestDistance = Number.POSITIVE_INFINITY;

  for (let index = 0; index < LOOP_PHASES; index += 1) {
    const phase = (index / LOOP_PHASES + progress) % 1;
    const distance = circularDistance(phase, FRONT_PHASE);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  }

  return closestIndex + 1;
}

function DoorLeaf({
  side,
  open,
  reducedMotion,
}: {
  side: "left" | "right";
  open: boolean;
  reducedMotion: boolean | null;
}) {
  const isLeft = side === "left";

  return (
    <motion.div
      initial={false}
      animate={{
        rotateY: open ? (isLeft ? -68 : 68) : 0,
        x: open ? (isLeft ? -4 : 4) : 0,
      }}
      transition={{
        duration: reducedMotion ? 0.12 : 0.72,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{
        transformOrigin: isLeft ? "left center" : "right center",
        transformStyle: "preserve-3d",
        backfaceVisibility: "hidden",
      }}
      className={`absolute bottom-[9px] top-[9px] z-30 w-[calc(50%-9px)] overflow-hidden border-white/20 bg-[linear-gradient(135deg,#cf919a_0%,#b86572_52%,#95505c_100%)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14),0_16px_28px_rgba(30,8,15,0.18)] ${isLeft ? "left-[9px] rounded-tl-[132px] border-r" : "right-[9px] rounded-tr-[132px] border-l"}`}
    >
      <div className="absolute inset-[9px] rounded-t-[118px] border border-white/20" />
      <div className="absolute inset-x-4 top-[36%] h-px bg-white/14" />
      <div className="absolute inset-x-4 top-[64%] h-px bg-black/12" />
      <div
        className={`absolute top-1/2 h-9 w-[3px] -translate-y-1/2 rounded-full bg-white/80 shadow-[0_0_10px_rgba(255,255,255,0.55)] ${isLeft ? "right-2.5" : "left-2.5"}`}
      />
      <div
        className={`absolute inset-y-0 w-3 opacity-45 ${isLeft ? "right-0 bg-gradient-to-l from-black/25 to-transparent" : "left-0 bg-gradient-to-r from-black/25 to-transparent"}`}
      />
    </motion.div>
  );
}

function PintuCardBaru({
  door,
  active,
  reducedMotion,
}: {
  door: Door;
  active: boolean;
  reducedMotion: boolean | null;
}) {
  const { isDarkMode } = useTheme();

  return (
    <Link href={door.href} className="block">
      <motion.div
        whileHover={reducedMotion ? undefined : { y: -6, scale: active ? 1.018 : 1.012 }}
        whileTap={reducedMotion ? undefined : { scale: 0.985 }}
        transition={{ type: "spring", stiffness: 360, damping: 26 }}
        className="relative h-[356px] w-[208px] md:h-[clamp(430px,54vh,535px)] md:w-[clamp(255px,18vw,322px)] [perspective:1200px] [transform-style:preserve-3d]"
      >
        <motion.div
          animate={{
            opacity: active ? 0.58 : 0.24,
            scaleX: active ? 1.12 : 0.9,
            scaleY: active ? 0.78 : 0.56,
          }}
          transition={{ duration: reducedMotion ? 0.12 : 0.55 }}
          className="absolute -bottom-5 left-[10%] right-[10%] h-10 rounded-[50%] bg-black/50 blur-xl"
          aria-hidden="true"
        />

        <motion.div
          initial={false}
          animate={{
            opacity: active ? 0.82 : 0,
            scale: active ? 1.08 : 0.9,
          }}
          transition={{ duration: reducedMotion ? 0.12 : 0.55 }}
          className="pointer-events-none absolute -inset-5 rounded-t-[170px] bg-[radial-gradient(ellipse_at_50%_45%,rgba(255,238,240,0.75),rgba(192,122,132,0.25)_42%,transparent_72%)] blur-2xl"
          aria-hidden="true"
        />

        <div
          className="absolute inset-[8px] rounded-t-[138px] rounded-b-[18px] bg-[#6f3b45]/55 shadow-[0_24px_42px_rgba(31,9,17,0.26)]"
          style={{ transform: "translateZ(-18px)" }}
          aria-hidden="true"
        />
        <div
          className="absolute bottom-[16px] left-[-2px] top-[36px] w-[13px] rounded-l-lg bg-[linear-gradient(to_right,#6b3942,#b56b77)]"
          style={{ transform: "rotateY(76deg) translateZ(4px)", transformOrigin: "right center" }}
          aria-hidden="true"
        />
        <div
          className="absolute bottom-[16px] right-[-2px] top-[36px] w-[13px] rounded-r-lg bg-[linear-gradient(to_left,#6b3942,#b56b77)]"
          style={{ transform: "rotateY(-76deg) translateZ(4px)", transformOrigin: "left center" }}
          aria-hidden="true"
        />

        <div className="absolute inset-0 overflow-hidden rounded-t-[146px] rounded-b-[20px] border border-white/55 bg-[linear-gradient(145deg,#e7b5bb_0%,#b96f7a_34%,#7e4650_100%)] p-[9px] shadow-[inset_0_1px_0_rgba(255,255,255,0.6),inset_0_-8px_24px_rgba(74,26,38,0.2),0_22px_46px_rgba(55,20,29,0.2)]">
          <div className="relative h-full overflow-hidden rounded-t-[132px] rounded-b-[13px] bg-[#120d10]">
            <motion.div
              initial={false}
              animate={{ scale: active ? 1.06 : 1, filter: active ? "saturate(1)" : "saturate(0.76)" }}
              transition={{ duration: reducedMotion ? 0.12 : 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              <Image
                src={`/${door.bgImage}`}
                alt=""
                fill
                sizes="(max-width: 767px) 416px, 644px"
                quality={100}
                className="object-cover object-center"
                priority={active}
              />
            </motion.div>

            <div
              className={`absolute inset-0 ${isDarkMode ? "bg-[linear-gradient(to_top,rgba(8,7,10,0.9),rgba(8,7,10,0.18)_55%,rgba(255,255,255,0.04))]" : "bg-[linear-gradient(to_top,rgba(20,13,16,0.86),rgba(20,13,16,0.12)_55%,rgba(255,255,255,0.08))]"}`}
            />
            <motion.div
              initial={false}
              animate={{ opacity: active ? 1 : 0 }}
              transition={{ duration: reducedMotion ? 0.12 : 0.48 }}
              className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_18%,rgba(255,255,255,0.28),transparent_36%)]"
              aria-hidden="true"
            />

            <motion.div
              initial={false}
              animate={{
                opacity: active ? 1 : 0,
                y: active ? 0 : 18,
              }}
              transition={{ duration: reducedMotion ? 0.12 : 0.42, delay: reducedMotion ? 0 : 0.12 }}
              className="absolute inset-x-0 bottom-0 z-20 p-4 text-white sm:p-5 md:p-6"
            >
              <div className="mb-2 flex flex-wrap gap-1.5">
                {door.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded border border-white/35 bg-black/18 px-1.5 py-0.5 font-[family-name:var(--font-dc-mono)] text-[9px] uppercase leading-tight text-white backdrop-blur-sm sm:text-[10px]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h4 className="font-[family-name:var(--font-dc-heading)] text-lg font-bold leading-tight text-white sm:text-xl md:text-[1.35rem]">
                {door.title}
              </h4>
              <p className="mt-1.5 text-[11px] leading-relaxed text-white/78 sm:text-xs md:text-[13px]">
                {door.desc}
              </p>
              <div className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white sm:text-[11px]">
                Masuk <ArrowUpRight className="h-3.5 w-3.5" />
              </div>
            </motion.div>

            <DoorLeaf side="left" open={active} reducedMotion={reducedMotion} />
            <DoorLeaf side="right" open={active} reducedMotion={reducedMotion} />

            <motion.div
              initial={false}
              animate={{
                opacity: active ? 0 : 0.9,
                y: active ? -8 : 0,
                scale: active ? 0.94 : 1,
              }}
              transition={{ duration: reducedMotion ? 0.12 : 0.28 }}
              className="pointer-events-none absolute inset-x-0 top-3 z-40 flex justify-center"
              aria-hidden="true"
            >
              <svg width="76" height="30" viewBox="0 0 100 40" fill="none" stroke="white" strokeWidth="1.5">
                <path d="M50 35 C 30 35, 20 15, 5 20 C 20 20, 30 10, 50 25 C 70 10, 80 20, 95 20 C 80 15, 70 35, 50 35 Z" fill="rgba(255,255,255,0.16)" />
                <circle cx="50" cy="22" r="3" fill="white" />
                <circle cx="35" cy="20" r="2" fill="white" />
                <circle cx="65" cy="20" r="2" fill="white" />
              </svg>
            </motion.div>

            <motion.div
              initial={false}
              animate={{ opacity: active ? 0 : 1, y: active ? 8 : 0 }}
              transition={{ duration: reducedMotion ? 0.12 : 0.32 }}
              className="pointer-events-none absolute inset-x-0 bottom-0 z-40 bg-gradient-to-t from-black/70 via-black/10 to-transparent p-5 pt-16 text-center"
            >
              <h3 className="font-[family-name:var(--font-dc-heading)] text-lg font-bold leading-tight tracking-wide text-white sm:text-xl md:text-[1.35rem]">
                {door.title}
              </h3>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

function LoopingPintuBaru({
  door,
  index,
  progress,
  reducedMotion,
  active,
  onHover,
}: {
  door: Door;
  index: number;
  progress: MotionValue<number>;
  reducedMotion: boolean | null;
  active: boolean;
  onHover: (door: DoorValue) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const phase = (offset: number) =>
    ((index / LOOP_PHASES + offset) % 1) * Math.PI * 2;

  const x = useTransform(progress, (offset) =>
    Math.cos(phase(offset)) * LOOP_RADIUS_X,
  );
  const y = useTransform(progress, (offset) =>
    Math.sin(phase(offset)) * LOOP_RADIUS_Y,
  );
  const z = useTransform(progress, (offset) => Math.sin(phase(offset)) * 120);
  const scale = useTransform(progress, (offset) => {
    const depth = (Math.sin(phase(offset)) + 1) / 2;
    return BACK_SCALE + depth * (FRONT_SCALE - BACK_SCALE);
  });
  const rotateY = useTransform(
    progress,
    (offset) => Math.cos(phase(offset)) * -10,
  );
  const stackOrder = useTransform(
    progress,
    (offset) => Math.round(Math.sin(phase(offset)) * 100) + 100,
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <motion.div
      onMouseEnter={() => onHover(door.id)}
      style={mounted ? { x, y, z, scale, rotateY, zIndex: stackOrder } : undefined}
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer [transform-style:preserve-3d]"
    >
      <PintuCardBaru door={door} active={active} reducedMotion={reducedMotion} />
    </motion.div>
  );
}

export default function PintuSecBaru({
  activeDoor,
  setActiveDoor,
}: PintuSecBaruProps) {
  const reduced = useReducedMotion();
  const [isPaused, setIsPaused] = useState(false);
  const progress = useMotionValue(2 / 3);
  const animationRef = useRef<ReturnType<typeof animate> | null>(null);
  const lastFrontRef = useRef<DoorValue>(2);

  useEffect(() => {
    if (reduced || isPaused) {
      animationRef.current?.stop();
      animationRef.current = null;
      return;
    }

    animationRef.current?.stop();
    animationRef.current = animate(progress, progress.get() + 1, {
      repeat: Infinity,
      repeatType: "loop",
      repeatDelay: 0.9,
      ease: [0.42, 0, 0.58, 1],
      duration: LOOP_DURATION,
    });

    return () => {
      animationRef.current?.stop();
      animationRef.current = null;
    };
  }, [isPaused, progress, reduced]);

  useEffect(() => {
    if (reduced) return;

    const unsubscribe = progress.on("change", (value) => {
      const nextDoor = getFrontDoor(((value % 1) + 1) % 1) as DoorValue;

      if (nextDoor !== lastFrontRef.current) {
        lastFrontRef.current = nextDoor;
        setActiveDoor(nextDoor);
      }
    });

    return unsubscribe;
  }, [progress, reduced, setActiveDoor]);

  const pauseLoop = (door: DoorValue) => {
    setIsPaused(true);
    setActiveDoor(door);
  };

  return (
    <div className="relative -my-2 flex w-full flex-col items-center justify-center overflow-visible">
      <div
        onMouseLeave={() => setIsPaused(false)}
        className="relative flex h-[410px] w-full items-center justify-center overflow-visible [perspective:1350px] sm:h-[490px] md:h-[575px] xl:h-[610px]"
      >
        <div
          className="pointer-events-none absolute bottom-[7%] left-[8%] right-[8%] h-[20%] rounded-[50%] bg-[radial-gradient(ellipse,rgba(55,20,29,0.12),transparent_68%)] blur-xl"
          aria-hidden="true"
        />
        {doors.map((door, index) => (
          <LoopingPintuBaru
            key={door.id}
            door={door}
            index={index}
            progress={progress}
            reducedMotion={reduced}
            active={activeDoor === door.id}
            onHover={pauseLoop}
          />
        ))}
      </div>
    </div>
  );
}
