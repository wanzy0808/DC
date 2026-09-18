"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  type MotionValue,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import PintuCard from "@/components/Pintu/PintuCard";

type DoorValue = 1 | 2 | 3 | null;

type PintuSectionProps = {
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

const LOOP_DURATION = 10;
const LOOP_PHASES = 3;
const FRONT_PHASE = 0.25;

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

function LoopingPintu({
  door,
  index,
  progress,
  reducedMotion,
  compact,
  active,
  onHover,
}: {
  door: Door;
  index: number;
  progress: MotionValue<number>;
  reducedMotion: boolean | null;
  compact: boolean;
  active: boolean;
  onHover: (door: DoorValue) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const phase = (offset: number) =>
    ((index / LOOP_PHASES + offset) % 1) * Math.PI * 2;

  const radiusX = compact ? 122 : 275;
  const radiusY = compact ? 38 : 82;
  const frontScale = compact ? 0.88 : 0.99;
  const backScale = compact ? 0.68 : 0.7;

  const x = useTransform(progress, (offset) =>
    Math.cos(phase(offset)) * radiusX,
  );
  const y = useTransform(progress, (offset) =>
    Math.sin(phase(offset)) * radiusY,
  );
  const z = useTransform(progress, (offset) =>
    Math.sin(phase(offset)) * (compact ? 50 : 95),
  );
  const scale = useTransform(progress, (offset) => {
    const depth = (Math.sin(phase(offset)) + 1) / 2;
    return backScale + depth * (frontScale - backScale);
  });
  const rotateY = useTransform(
    progress,
    (offset) => Math.cos(phase(offset)) * (compact ? -5 : -9),
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
      onFocus={() => onHover(door.id)}
      style={mounted ? { x, y, z, scale, rotateY, zIndex: stackOrder } : undefined}
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer [transform-style:preserve-3d]"
    >
      <PintuCard
        title={door.title}
        href={door.href}
        bgImage={door.bgImage}
        innerDetails={{ tags: door.tags, desc: door.desc }}
        isActive={active}
        reducedMotion={reducedMotion}
        compact={compact}
      />
    </motion.div>
  );
}

export default function PintuSection({
  activeDoor,
  setActiveDoor,
}: PintuSectionProps) {
  const reduced = useReducedMotion();
  const [isPaused, setIsPaused] = useState(false);
  const [compact, setCompact] = useState(false);
  const progress = useMotionValue(2 / 3);
  const animationRef = useRef<ReturnType<typeof animate> | null>(null);
  const lastFrontRef = useRef<DoorValue>(2);

  useEffect(() => {
    const sync = () => setCompact(window.innerWidth < 768);
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

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
      repeatDelay: 0.8,
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

  const resumeLoop = () => {
    setIsPaused(false);
  };

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col items-center justify-center overflow-visible">
      <div
        onMouseLeave={resumeLoop}
        className="relative flex h-[clamp(300px,46dvh,540px)] w-full items-center justify-center overflow-visible [perspective:1100px] md:h-[clamp(430px,58dvh,570px)]"
      >
        {doors.map((door, index) => (
          <LoopingPintu
            key={door.id}
            door={door}
            index={index}
            progress={progress}
            reducedMotion={reduced}
            compact={compact}
            active={activeDoor === door.id}
            onHover={pauseLoop}
          />
        ))}
      </div>
    </div>
  );
}
