"use client";

import React, { useRef } from "react";
import PintuCard from "@/components/Pintu/PintuCard";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/Theme/ThemeContext";

type DoorValue = 1 | 2 | 3 | null;

type PintuSectionProps = {
  activeDoor: DoorValue;
  setActiveDoor: React.Dispatch<React.SetStateAction<DoorValue>>;
};

export default function PintuSection({ activeDoor, setActiveDoor }: PintuSectionProps) {
  const { isDarkMode } = useTheme();
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Jika belum ada pintu yang dipilih/hover, default posisi terdepan adalah Pintu 1
  const currentSelected = activeDoor === null ? 1 : activeDoor;

  // Fungsi Hover dengan Delay (Debounce) agar kursor lewat tidak langsung memicu perputaran
  const handleDoorHover = (doorNumber: DoorValue) => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);

    hoverTimerRef.current = setTimeout(() => {
      setActiveDoor(doorNumber);
    }, 180); // jeda 180ms
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

  // Menentukan Style Transformasi 3D berdasarkan pintu mana yang sedang berada di posisi DEPAN
  const getDoorTransform = (doorId: number) => {
    // 1. Pintu berada di DEPAN (Center Focus) -> DIBESARKAN KE scale(1.18)
    if (currentSelected === doorId) {
      return {
        transform: "translateX(0px) translateZ(140px) rotateY(0deg) scale(1.18)",
        zIndex: 30,
        opacity: 1,
        filter: "blur(0px)",
      };
    }

    // 2. Pintu berada di KIRI Belakang -> JARAK DIJAUHKAN KE -220px
    const isLeft =
      (currentSelected === 1 && doorId === 3) ||
      (currentSelected === 2 && doorId === 1) ||
      (currentSelected === 3 && doorId === 2);

    if (isLeft) {
      return {
        transform: "translateX(-220px) translateZ(-120px) rotateY(28deg) scale(0.85)",
        zIndex: 10,
        opacity: 0.65,
        filter: "blur(0.5px)",
      };
    }

    // 3. Pintu berada di KANAN Belakang -> JARAK DIJAUHKAN KE 220px
    return {
      transform: "translateX(220px) translateZ(-120px) rotateY(-28deg) scale(0.85)",
      zIndex: 10,
      opacity: 0.65,
      filter: "blur(0.5px)",
    };
  };

  return (
    <div className="w-full flex flex-col items-center justify-center relative my-4">
      {/* Container 3D Carousel Orbit */}
      <div
        onMouseLeave={handleMouseLeaveSection}
        className="relative w-full h-[480px] md:h-[520px] flex items-center justify-center [perspective:1000px]"
      >
        {/* PINTU 01 - Wedding Organizer */}
        <div
          onClick={() => setActiveDoor(1)}
          onMouseEnter={() => handleDoorHover(1)}
          style={getDoorTransform(1)}
          className="absolute transition-all duration-700 ease-in-out cursor-pointer"
        >
          <PintuCard
            number=""
            title="Perencana Pernikahan"
            href="/wedding-planner"
            bgImage="wo.png"
            innerDetails={{
              tags: ["STAFF", "EVENT RUNDOWN", "VENDOR"],
              desc: "Perencanaan dan koordinasi pernikahan.",
            }}
            isActive={activeDoor === 1}
          />
        </div>

        {/* PINTU 02 - Digital Wedding */}
        <div
          onClick={() => setActiveDoor(2)}
          onMouseEnter={() => handleDoorHover(2)}
          style={getDoorTransform(2)}
          className="absolute transition-all duration-700 ease-in-out cursor-pointer"
        >
          <PintuCard
            number=" "
            title="Undangan Digital"
            href="/d-invitation"
            bgImage="hp-digital.png"
            innerDetails={{
              tags: ["UNDANGAN", "RSVP"],
              desc: "Undangan digital untuk acara pernikahan.",
            }}
            isActive={activeDoor === 2}
          />
        </div>

        {/* PINTU 03 - Buku Tamu Digital */}
        <div
          onClick={() => setActiveDoor(3)}
          onMouseEnter={() => handleDoorHover(3)}
          style={getDoorTransform(3)}
          className="absolute transition-all duration-700 ease-in-out cursor-pointer"
        >
          <PintuCard
            number=" "
            title="Buku Tamu Digital"
            href="/guestbook"
            bgImage="bukutamu.png"
            innerDetails={{
              tags: ["BUKU TAMU", "QR CHECK-IN", "KEHADIRAN"],
              desc: "Automasi kehadiran tamu dengan QR code.",
            }}
            isActive={activeDoor === 3}
          />
        </div>
      </div>

<div className="flex items-center justify-between w-full max-w-[320px] z-30 mt-10">
  <Button
    size="icon"
    onClick={togglePrev}
    className={`rounded-full w-12 h-12 border-2 border-white/80 transition-all duration-300 backdrop-blur-md shadow-xl cursor-pointer hover:border-white hover:scale-110 active:scale-95 ${
      isDarkMode
        ? "bg-[#C26B70]/80 text-white shadow-[0_0_20px_rgba(194,107,112,0.4)] hover:shadow-[0_0_30px_rgba(255,255,255,0.6)]"
        : "bg-[#7A1C25]/80 text-white shadow-[0_0_20px_rgba(122,28,37,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.6)]"
    }`}
  >
    ←
  </Button>

  <Button
    size="icon"
    onClick={toggleNext}
    className={`rounded-full w-12 h-12 border-2 border-white/80 transition-all duration-300 backdrop-blur-md shadow-xl cursor-pointer hover:border-white hover:scale-110 active:scale-95 ${
      isDarkMode
        ? "bg-[#C26B70]/80 text-white shadow-[0_0_20px_rgba(194,107,112,0.4)] hover:shadow-[0_0_30px_rgba(255,255,255,0.6)]"
        : "bg-[#7A1C25]/80 text-white shadow-[0_0_20px_rgba(122,28,37,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.6)]"
    }`}
  >
    →
  </Button>
</div>
    </div>
  );
}
