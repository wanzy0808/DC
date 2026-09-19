"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { Sparkles } from "lucide-react";
import { useTheme } from "@/components/Theme/ThemeProvider";

export type DreamDoorValue = 1 | 2 | 3;

type DreamPortalSceneProps = {
  activeDoor: DreamDoorValue;
  setActiveDoor: (door: DreamDoorValue) => void;
};

type DreamDoor = {
  id: DreamDoorValue;
  title: string;
  caption: string;
  href: string;
  image: string;
};

const doors: DreamDoor[] = [
  {
    id: 1,
    title: "Event Planner",
    caption: "A world shaped around your celebration",
    href: "/event-planner",
    image: "/wo.png",
  },
  {
    id: 2,
    title: "Digital Invitation",
    caption: "A doorway guests can carry anywhere",
    href: "/d-invitation",
    image: "/hp-digital.png",
  },
  {
    id: 3,
    title: "Guestbook",
    caption: "A calmer arrival for every guest",
    href: "/guestbook",
    image: "/bukutamu.png",
  },
];

function getPlacement(id: DreamDoorValue, activeDoor: DreamDoorValue) {
  if (id === activeDoor) {
    return {
      x: "0%",
      y: "0%",
      scale: 1,
      rotateY: 0,
      rotateZ: 0,
      opacity: 1,
      zIndex: 30,
    };
  }

  const relative = (id - activeDoor + 3) % 3;
  const isRight = relative === 1;

  return {
    x: isRight ? "78%" : "-78%",
    y: "9%",
    scale: 0.72,
    rotateY: isRight ? -18 : 18,
    rotateZ: isRight ? 2.2 : -2.2,
    opacity: 0.72,
    zIndex: 10,
  };
}

function DoorPanels({
  open,
  reducedMotion,
}: {
  open: boolean;
  reducedMotion: boolean | null;
}) {
  const transition = {
    duration: reducedMotion ? 0.12 : 0.9,
    ease: [0.22, 1, 0.36, 1] as const,
  };

  return (
    <>
      <motion.div
        initial={false}
        animate={{ rotateY: open ? -78 : 0 }}
        transition={transition}
        style={{
          transformOrigin: "left center",
          transformStyle: "preserve-3d",
          backfaceVisibility: "hidden",
        }}
        className="absolute bottom-[3.5%] left-[3.4%] top-[3.4%] z-30 w-[46.8%] overflow-hidden rounded-tl-[47%] border-r border-white/25 bg-[linear-gradient(135deg,#dba7ae_0%,#c07a84_44%,#9f5965_100%)] shadow-[inset_-8px_0_18px_rgba(71,24,34,0.18),inset_0_1px_0_rgba(255,255,255,0.34)]"
      >
        <div className="absolute inset-[8%] rounded-tl-[44%] border border-white/15" />
        <div className="absolute inset-x-[13%] top-[36%] h-px bg-white/20" />
        <div className="absolute inset-x-[13%] top-[64%] h-px bg-black/10" />
        <div className="absolute right-[6%] top-1/2 h-9 w-[3px] -translate-y-1/2 rounded-full bg-white/85 shadow-[0_0_12px_rgba(255,255,255,0.55)]" />
      </motion.div>

      <motion.div
        initial={false}
        animate={{ rotateY: open ? 78 : 0 }}
        transition={transition}
        style={{
          transformOrigin: "right center",
          transformStyle: "preserve-3d",
          backfaceVisibility: "hidden",
        }}
        className="absolute bottom-[3.5%] right-[3.4%] top-[3.4%] z-30 w-[46.8%] overflow-hidden rounded-tr-[47%] border-l border-white/25 bg-[linear-gradient(225deg,#dba7ae_0%,#c07a84_44%,#9f5965_100%)] shadow-[inset_8px_0_18px_rgba(71,24,34,0.18),inset_0_1px_0_rgba(255,255,255,0.34)]"
      >
        <div className="absolute inset-[8%] rounded-tr-[44%] border border-white/15" />
        <div className="absolute inset-x-[13%] top-[36%] h-px bg-white/20" />
        <div className="absolute inset-x-[13%] top-[64%] h-px bg-black/10" />
        <div className="absolute left-[6%] top-1/2 h-9 w-[3px] -translate-y-1/2 rounded-full bg-white/85 shadow-[0_0_12px_rgba(255,255,255,0.55)]" />
      </motion.div>
    </>
  );
}

function DreamPortal({
  door,
  activeDoor,
  setActiveDoor,
}: {
  door: DreamDoor;
  activeDoor: DreamDoorValue;
  setActiveDoor: (door: DreamDoorValue) => void;
}) {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const { isDarkMode } = useTheme();
  const active = activeDoor === door.id;
  const placement = getPlacement(door.id, activeDoor);

  const activate = () => {
    if (active) {
      router.push(door.href);
      return;
    }
    setActiveDoor(door.id);
  };

  return (
    <motion.button
      type="button"
      onMouseEnter={() => setActiveDoor(door.id)}
      onFocus={() => setActiveDoor(door.id)}
      onClick={activate}
      aria-label={active ? `Buka ${door.title}` : `Pilih ${door.title}`}
      initial={false}
      animate={placement}
      transition={{
        type: "spring",
        stiffness: 180,
        damping: 24,
        mass: 0.85,
      }}
      whileHover={reducedMotion ? undefined : { y: active ? -6 : 26 }}
      whileTap={reducedMotion ? undefined : { scale: active ? 0.985 : 0.7 }}
      className="absolute left-1/2 top-1/2 h-[430px] w-[255px] -translate-x-1/2 -translate-y-1/2 cursor-pointer border-0 bg-transparent p-0 text-left outline-none [perspective:1500px] [transform-style:preserve-3d] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background sm:h-[470px] sm:w-[280px] xl:h-[520px] xl:w-[310px]"
      style={{ transformStyle: "preserve-3d" }}
    >
      <motion.div
        animate={{
          opacity: active ? 0.48 : 0.18,
          scaleX: active ? 1.22 : 0.92,
          scaleY: active ? 0.7 : 0.45,
        }}
        transition={{ duration: reducedMotion ? 0.12 : 0.55 }}
        className="absolute -bottom-9 left-[6%] right-[6%] h-16 rounded-[50%] bg-black/50 blur-2xl"
        aria-hidden="true"
      />

      <motion.div
        initial={false}
        animate={{
          opacity: active ? 1 : 0,
          scale: active ? 1 : 0.82,
        }}
        transition={{ duration: reducedMotion ? 0.12 : 0.65 }}
        className="pointer-events-none absolute -inset-[18%] rounded-[48%] bg-[radial-gradient(ellipse_at_center,rgba(255,235,239,0.88)_0%,rgba(217,163,170,0.3)_28%,rgba(192,122,132,0.14)_48%,transparent_72%)] blur-2xl"
        aria-hidden="true"
      />

      <motion.div
        initial={false}
        animate={{ opacity: active ? 1 : 0, scaleY: active ? 1 : 0.5 }}
        transition={{ duration: reducedMotion ? 0.12 : 0.8, delay: reducedMotion ? 0 : 0.12 }}
        className="pointer-events-none absolute -bottom-[28%] left-[17%] right-[17%] h-[34%] origin-top [clip-path:polygon(38%_0,62%_0,100%_100%,0_100%)] bg-[linear-gradient(to_bottom,rgba(255,241,243,0.46),rgba(192,122,132,0.12)_52%,transparent)] blur-[1px]"
        aria-hidden="true"
      />

      <div
        className="absolute inset-[2%] rounded-t-[49%] rounded-b-[8%] bg-[#6f3944]/55 shadow-[0_28px_55px_rgba(48,16,24,0.28)]"
        style={{ transform: "translateZ(-26px)" }}
        aria-hidden="true"
      />

      <div
        className="absolute bottom-[7%] left-[-1.5%] top-[12%] w-[6%] rounded-l-full bg-[linear-gradient(to_right,#63313a,#bd737e)]"
        style={{
          transform: "rotateY(78deg) translateZ(5px)",
          transformOrigin: "right center",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-[7%] right-[-1.5%] top-[12%] w-[6%] rounded-r-full bg-[linear-gradient(to_left,#63313a,#bd737e)]"
        style={{
          transform: "rotateY(-78deg) translateZ(5px)",
          transformOrigin: "left center",
        }}
        aria-hidden="true"
      />

      <div className="absolute inset-0 rounded-t-[50%] rounded-b-[8%] border border-white/55 bg-[linear-gradient(145deg,#e2aeb5_0%,#c47d87_35%,#9f5965_72%,#6e3742_100%)] p-[3.8%] shadow-[inset_0_1px_0_rgba(255,255,255,0.65),inset_0_-16px_32px_rgba(64,20,30,0.22),0_24px_50px_rgba(64,20,30,0.2)]">
        <div className="relative h-full overflow-hidden rounded-t-[48%] rounded-b-[5%] bg-[#100b0e]">
          <motion.div
            initial={false}
            animate={{
              scale: active ? 1.08 : 1.02,
              filter: active ? "saturate(1.04) brightness(1)" : "saturate(0.72) brightness(0.68)",
            }}
            transition={{ duration: reducedMotion ? 0.12 : 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={door.image}
              alt=""
              fill
              priority={active}
              sizes="(max-width: 1279px) 560px, 620px"
              className="object-cover object-center"
            />
          </motion.div>

          <div
            className={`absolute inset-0 ${
              isDarkMode
                ? "bg-[linear-gradient(to_top,rgba(8,6,9,0.88),rgba(8,6,9,0.08)_56%,rgba(255,255,255,0.08))]"
                : "bg-[linear-gradient(to_top,rgba(26,12,18,0.72),rgba(26,12,18,0.03)_58%,rgba(255,255,255,0.12))]"
            }`}
          />

          <motion.div
            animate={{ opacity: active ? 0.6 : 0.16 }}
            transition={{ duration: reducedMotion ? 0.12 : 0.5 }}
            className="absolute inset-0 bg-[radial-gradient(circle_at_50%_22%,rgba(255,255,255,0.48),transparent_38%)]"
            aria-hidden="true"
          />

          <DoorPanels open={active} reducedMotion={reducedMotion} />

          <motion.div
            initial={false}
            animate={{
              opacity: active ? 0 : 0.9,
              y: active ? -10 : 0,
            }}
            transition={{ duration: reducedMotion ? 0.12 : 0.3 }}
            className="pointer-events-none absolute inset-x-0 top-[4%] z-40 flex justify-center text-white"
            aria-hidden="true"
          >
            <Sparkles className="h-6 w-6 opacity-85" strokeWidth={1.35} />
          </motion.div>

          <motion.div
            initial={false}
            animate={{
              opacity: active ? 1 : 0,
              y: active ? 0 : 18,
            }}
            transition={{ duration: reducedMotion ? 0.12 : 0.45, delay: reducedMotion ? 0 : 0.22 }}
            className="absolute inset-x-0 bottom-0 z-20 p-[8%] text-white"
          >
            <p className="font-[family-name:var(--font-dc-mono)] text-[9px] uppercase tracking-[0.18em] text-white/60 sm:text-[10px]">
              Enter this world
            </p>
            <h3 className="mt-1.5 font-[family-name:var(--font-dc-heading)] text-xl leading-tight text-white sm:text-2xl">
              {door.title}
            </h3>
            <p className="mt-2 max-w-[14rem] text-[11px] leading-5 text-white/70 sm:text-xs">
              {door.caption}
            </p>
          </motion.div>

          <motion.div
            initial={false}
            animate={{
              opacity: active ? 0 : 1,
              y: active ? 12 : 0,
            }}
            transition={{ duration: reducedMotion ? 0.12 : 0.32 }}
            className="pointer-events-none absolute inset-x-0 bottom-0 z-40 bg-gradient-to-t from-black/75 via-black/12 to-transparent p-[8%] pt-[30%] text-center"
          >
            <span className="font-[family-name:var(--font-dc-heading)] text-lg font-semibold tracking-wide text-white sm:text-xl">
              {door.title}
            </span>
          </motion.div>
        </div>
      </div>
    </motion.button>
  );
}

export default function DreamPortalScene({
  activeDoor,
  setActiveDoor,
}: DreamPortalSceneProps) {
  const reducedMotion = useReducedMotion();

  return (
    <div className="relative h-[500px] w-full sm:h-[550px] xl:h-[620px]">
      <motion.div
        animate={
          reducedMotion
            ? undefined
            : {
                y: [0, -5, 0],
              }
        }
        transition={{
          duration: 5.8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-0 [perspective:1600px] [transform-style:preserve-3d]"
      >
        {doors.map((door) => (
          <DreamPortal
            key={door.id}
            door={door}
            activeDoor={activeDoor}
            setActiveDoor={setActiveDoor}
          />
        ))}
      </motion.div>
    </div>
  );
}
