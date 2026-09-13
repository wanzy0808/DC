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

const LOOP_DURATION = 7;
const LOOP_RADIUS_X = 235;
const LOOP_RADIUS_Y = 72;
const LOOP_PHASES = 3;
const FRONT_PHASE = 0.25;

const doors: Door[] = [
  {
    id: 1,
    title: "Wedding Planner",
    href: "/wedding-planner",
    bgImage: "wo.png",
    tags: ["STAFF", "EVENT RUNDOWN", "VENDOR"],
    desc: "Perencanaan dan koordinasi pernikahan.",
  },
  {
    id: 2,
    title: "Digital Invitation",
    href: "/d-invitation",
    bgImage: "hp-digital.png",
    tags: ["UNDANGAN", "RSVP"],
    desc: "Undangan digital untuk acara pernikahan.",
  },
  {
    id: 3,
    title: "Guestbook",
    href: "/guestbook",
    bgImage: "bukutamu.png",
    tags: ["BUKU TAMU", "QR CHECK-IN", "KEHADIRAN"],
    desc: "Automasi kehadiran tamu dengan QR code.",
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
  const phase = (offset: number) => ((index / LOOP_PHASES + offset) % 1) * Math.PI * 2;

  const x = useTransform(progress, (offset) => Math.cos(phase(offset)) * LOOP_RADIUS_X);
  const y = useTransform(progress, (offset) => Math.sin(phase(offset)) * LOOP_RADIUS_Y);
  const z = useTransform(progress, (offset) => Math.sin(phase(offset)) * 90);
  const scale = useTransform(progress, (offset) => 0.82 + (Math.sin(phase(offset)) + 1) * 0.12);
  const opacity = useTransform(progress, (offset) => 0.62 + (Math.sin(phase(offset)) + 1) * 0.19);
  const rotateY = useTransform(progress, (offset) => Math.cos(phase(offset)) * -8);

  return (
    <motion.div
      onMouseEnter={() => onHover(door.id)}
      style={{ x, y, z, scale, opacity, rotateY }}
      className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer [transform-style:preserve-3d]"
    >
      <PintuCard
        number=""
        title={door.title}
        href={door.href}
        bgImage={door.bgImage}
        innerDetails={{ tags: door.tags, desc: door.desc }}
        isActive={active}
        reducedMotion={reducedMotion}
      />
    </motion.div>
  );
}

export default function PintuSection({ activeDoor, setActiveDoor }: PintuSectionProps) {
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
    <div className="relative -my-1 flex w-full flex-col items-center justify-center overflow-visible">
      <div
        onMouseLeave={resumeLoop}
        className="relative flex h-[360px] w-full items-center justify-center overflow-visible [perspective:1000px] sm:h-[440px] md:h-[500px]"
      >
        {doors.map((door, index) => (
          <LoopingPintu
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
