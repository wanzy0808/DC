"use client";

import React, { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import PintuCard from "@/components/Pintu/PintuCard";
import { Button } from "@/components/ui/button";

type DoorValue = 1 | 2 | 3 | null;

type PintuSectionProps = {
  activeDoor: DoorValue;
  setActiveDoor: React.Dispatch<React.SetStateAction<DoorValue>>;
};

const LOOP_INTERVAL = 4200;

type Door = {
  id: 1 | 2 | 3;
  title: string;
  href: string;
  bgImage: string;
  tags: string[];
  desc: string;
};

export default function PintuSection({ activeDoor, setActiveDoor }: PintuSectionProps) {
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const loopTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reduced = useReducedMotion();
  const currentSelected = activeDoor === null ? 1 : activeDoor;

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

  const advanceLoop = () => {
    setActiveDoor((prev) => {
      const current = prev ?? 1;
      return current === 3 ? 1 : ((current + 1) as DoorValue);
    });
  };

  useEffect(() => {
    if (reduced) return;

    loopTimerRef.current = setInterval(advanceLoop, LOOP_INTERVAL);
    return () => {
      if (loopTimerRef.current) clearInterval(loopTimerRef.current);
    };
  }, [reduced]);

  const pauseLoop = () => {
    if (loopTimerRef.current) {
      clearInterval(loopTimerRef.current);
      loopTimerRef.current = null;
    }
  };

  const resumeLoop = () => {
    if (reduced || loopTimerRef.current) return;
    loopTimerRef.current = setInterval(advanceLoop, LOOP_INTERVAL);
  };

  const handleDoorHover = (doorNumber: DoorValue) => {
    pauseLoop();
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => setActiveDoor(doorNumber), 180);
  };

  const handleMouseLeaveSection = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setActiveDoor(null);
    resumeLoop();
  };

  const toggleNext = () => {
    pauseLoop();
    advanceLoop();
    resumeLoop();
  };

  const togglePrev = () => {
    pauseLoop();
    setActiveDoor((prev) => {
      const current = prev ?? 1;
      return current === 1 ? 3 : ((current - 1) as DoorValue);
    });
    resumeLoop();
  };

  const getDoorTransform = (doorId: number) => {
    if (currentSelected === doorId) {
      return {
        x: 0,
        z: 140,
        rotateY: 0,
        scale: 1.08,
        zIndex: 30,
        opacity: 1,
        filter: "blur(0px)",
      };
    }

    const isLeft =
      (currentSelected === 1 && doorId === 3) ||
      (currentSelected === 2 && doorId === 1) ||
      (currentSelected === 3 && doorId === 2);

    return isLeft
      ? {
          x: -175,
          z: -80,
          rotateY: 32,
          scale: 0.82,
          zIndex: 10,
          opacity: 0.62,
          filter: "blur(0.5px)",
        }
      : {
          x: 175,
          z: -80,
          rotateY: -32,
          scale: 0.82,
          zIndex: 10,
          opacity: 0.62,
          filter: "blur(0.5px)",
        };
  };

  return (
    <div className="relative -my-1 flex w-full flex-col items-center justify-center overflow-visible">
      <div
        onMouseEnter={pauseLoop}
        onMouseLeave={handleMouseLeaveSection}
        className="relative flex h-[310px] w-full items-center justify-center overflow-visible [perspective:1000px] sm:h-[410px] md:h-[500px]"
      >
        {doors.map((door, index) => {
          const transform = getDoorTransform(door.id);
          return (
            <motion.div
              key={door.id}
              onClick={() => {
                pauseLoop();
                setActiveDoor(door.id);
              }}
              onMouseEnter={() => handleDoorHover(door.id)}
              initial={reduced ? false : { opacity: 0, y: 24, scale: 0.94 }}
              animate={transform}
              transition={
                reduced
                  ? { duration: 0.1 }
                  : {
                      type: "spring",
                      stiffness: 400,
                      damping: 25,
                      mass: 0.75,
                      delay: index * 0.04,
                    }
              }
              whileHover={reduced ? undefined : { y: -6 }}
              className="absolute cursor-pointer"
              style={{ zIndex: transform.zIndex }}
            >
              <PintuCard
                number=""
                title={door.title}
                href={door.href}
                bgImage={door.bgImage}
                innerDetails={{ tags: door.tags, desc: door.desc }}
                isActive={activeDoor === door.id}
                reducedMotion={reduced}
              />
            </motion.div>
          );
        })}
      </div>

      <div className="z-30 -mt-8 flex w-full max-w-[750px] items-center justify-center gap-24 sm:-mt-10 sm:gap-30">
        <Button
          size="icon"
          onClick={togglePrev}
          aria-label="Pintu sebelumnya"
          className="h-11 w-11 shrink-0 cursor-pointer rounded-full border border-primary bg-primary text-primary-foreground shadow-lg transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
        >
          ←
        </Button>
        <Button
          size="icon"
          onClick={toggleNext}
          aria-label="Pintu berikutnya"
          className="h-11 w-11 shrink-0 cursor-pointer rounded-full border border-primary bg-primary text-primary-foreground shadow-lg transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
        >
          →
        </Button>
      </div>
    </div>
  );
}
