"use client";

import React, { useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import PintuCard from "@/components/Pintu/PintuCard";
import { Button } from "@/components/ui/button";

type DoorValue = 1 | 2 | 3 | null;

type PintuSectionProps = {
  activeDoor: DoorValue;
  setActiveDoor: React.Dispatch<React.SetStateAction<DoorValue>>;
};

export default function PintuSection({ activeDoor, setActiveDoor }: PintuSectionProps) {
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const reduced = useReducedMotion();
  const currentSelected = activeDoor === null ? 1 : activeDoor;

  const handleDoorHover = (doorNumber: DoorValue) => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => setActiveDoor(doorNumber), 180);
  };

  const handleMouseLeaveSection = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setActiveDoor(null);
  };

  const toggleNext = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setActiveDoor((prev) => (prev === null ? 2 : prev === 3 ? 1 : ((prev + 1) as DoorValue)));
  };

  const togglePrev = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setActiveDoor((prev) => (prev === null ? 3 : prev === 1 ? 3 : ((prev - 1) as DoorValue)));
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
          x: -170,
          z: -120,
          rotateY: 28,
          scale: 0.8,
          zIndex: 10,
          opacity: 0.65,
          filter: "blur(0.5px)",
        }
      : {
          x: 170,
          z: -120,
          rotateY: -28,
          scale: 0.8,
          zIndex: 10,
          opacity: 0.65,
          filter: "blur(0.5px)",
        };
  };

  const doors = [
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

  const currentDoor = doors.find((door) => door.id === currentSelected) ?? doors[0];

  return (
    <div className="relative -my-1 flex w-full flex-col items-center justify-center overflow-visible">
      <div
        onMouseLeave={handleMouseLeaveSection}
        className="relative flex h-[310px] w-full items-center justify-center overflow-visible [perspective:1000px] sm:h-[410px] md:h-[500px]"
      >
        {doors.map((door, index) => {
          const transform = getDoorTransform(door.id);
          return (
            <motion.div
              key={door.id}
              onClick={() => setActiveDoor(door.id as DoorValue)}
              onMouseEnter={() => handleDoorHover(door.id as DoorValue)}
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
          className="h-9 w-9 shrink-0 cursor-pointer rounded-full border border-primary bg-primary text-primary-foreground shadow-lg transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98] sm:h-10 sm:w-10"
        >
          ←
        </Button>
        <motion.span
          key={currentDoor.id}
          initial={reduced ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0.1 : 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="min-w-0 max-w-[210px] text-center font-[family-name:var(--font-dc-heading)] text-xs font-bold leading-tight tracking-wide text-[var(--foreground)] sm:max-w-none sm:text-base"
        >
          {currentDoor.title}
        </motion.span>
        <Button
          size="icon"
          onClick={toggleNext}
          aria-label="Pintu berikutnya"
          className="h-9 w-9 shrink-0 cursor-pointer rounded-full border border-primary bg-primary text-primary-foreground shadow-lg transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98] sm:h-10 sm:w-10"
        >
          →
        </Button>
      </div>
    </div>
  );
}
