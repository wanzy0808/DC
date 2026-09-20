"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { ArrowUpRight } from "lucide-react";

export type AssetDoorValue = 1 | 2 | 3;

type AssetDreamPortalSceneProps = {
  activeDoor: AssetDoorValue;
  setActiveDoor: (door: AssetDoorValue) => void;
};

type Portal = {
  id: AssetDoorValue;
  title: string;
  href: string;
  image: string;
  whisper: string;
};

const portals: Portal[] = [
  {
    id: 1,
    title: "Event Planner",
    href: "/event-planner",
    image: "/wo.png",
    whisper: "Step into a celebration shaped around you",
  },
  {
    id: 2,
    title: "Digital Invitation",
    href: "/d-invitation",
    image: "/hp-digital.png",
    whisper: "A world your guests can enter from anywhere",
  },
  {
    id: 3,
    title: "Guestbook",
    href: "/guestbook",
    image: "/bukutamu.png",
    whisper: "A softer arrival, from the very first guest",
  },
];

function placement(id: AssetDoorValue, activeDoor: AssetDoorValue) {
  if (id === activeDoor) {
    return {
      x: "0%",
      y: "0%",
      scale: 1,
      rotateY: 0,
      opacity: 1,
      zIndex: 30,
    };
  }

  const next = (id - activeDoor + 3) % 3 === 1;

  return {
    x: next ? "72%" : "-72%",
    y: "10%",
    scale: 0.68,
    rotateY: next ? -13 : 13,
    opacity: 0.7,
    zIndex: 10,
  };
}

function DoorLeaf({
  side,
  open,
  reduced,
}: {
  side: "left" | "right";
  open: boolean;
  reduced: boolean | null;
}) {
  const left = side === "left";

  return (
    <motion.div
      initial={false}
      animate={{
        rotateY: open ? (left ? -76 : 76) : 0,
      }}
      transition={{
        duration: reduced ? 0.12 : 0.9,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{
        transformOrigin: left ? "left center" : "right center",
        transformStyle: "preserve-3d",
        backfaceVisibility: "hidden",
      }}
      className={`absolute bottom-[4%] top-[4%] z-30 w-[47%] overflow-hidden border-white/25 bg-[linear-gradient(145deg,rgba(230,177,185,0.98)_0%,rgba(192,122,132,0.98)_46%,rgba(151,78,91,0.98)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.48),0_18px_34px_rgba(72,28,38,0.18)] ${
        left
          ? "left-[3%] rounded-tl-[48%] border-r"
          : "right-[3%] rounded-tr-[48%] border-l"
      }`}
    >
      <div className="absolute inset-[8%] rounded-t-[44%] border border-white/16" />
      <div className="absolute inset-x-[13%] top-[38%] h-px bg-white/16" />
      <div className="absolute inset-x-[13%] top-[64%] h-px bg-black/10" />
      <div
        className={`absolute top-1/2 h-10 w-[3px] -translate-y-1/2 rounded-full bg-white/85 shadow-[0_0_12px_rgba(255,255,255,0.6)] ${
          left ? "right-[6%]" : "left-[6%]"
        }`}
      />
    </motion.div>
  );
}

function PortalCard({
  portal,
  activeDoor,
  setActiveDoor,
}: {
  portal: Portal;
  activeDoor: AssetDoorValue;
  setActiveDoor: (door: AssetDoorValue) => void;
}) {
  const router = useRouter();
  const reduced = useReducedMotion();
  const active = portal.id === activeDoor;
  const target = placement(portal.id, activeDoor);

  const activate = () => {
    if (active) {
      router.push(portal.href);
      return;
    }

    setActiveDoor(portal.id);
  };

  return (
    <motion.button
      type="button"
      onMouseEnter={() => setActiveDoor(portal.id)}
      onFocus={() => setActiveDoor(portal.id)}
      onClick={activate}
      initial={false}
      animate={target}
      transition={{ type: "spring", stiffness: 175, damping: 23, mass: 0.9 }}
      whileHover={reduced ? undefined : { y: active ? -7 : 20 }}
      whileTap={reduced ? undefined : { scale: active ? 0.985 : 0.67 }}
      className="absolute left-1/2 top-1/2 h-[440px] w-[262px] -translate-x-1/2 -translate-y-1/2 cursor-pointer border-0 bg-transparent p-0 text-left outline-none [perspective:1600px] [transform-style:preserve-3d] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background sm:h-[485px] sm:w-[288px] xl:h-[540px] xl:w-[322px]"
    >
      <motion.div
        animate={{
          opacity: active ? 0.42 : 0.16,
          scaleX: active ? 1.18 : 0.88,
          scaleY: active ? 0.72 : 0.46,
        }}
        transition={{ duration: reduced ? 0.12 : 0.55 }}
        className="absolute -bottom-8 left-[7%] right-[7%] h-16 rounded-[50%] bg-black/45 blur-2xl"
        aria-hidden="true"
      />

      <motion.div
        initial={false}
        animate={{
          opacity: active ? 0.96 : 0,
          scale: active ? 1 : 0.86,
        }}
        transition={{ duration: reduced ? 0.12 : 0.65 }}
        className="pointer-events-none absolute -inset-[15%] rounded-[48%] bg-[radial-gradient(ellipse_at_center,rgba(255,245,246,0.82)_0%,rgba(217,163,170,0.28)_34%,rgba(192,122,132,0.1)_54%,transparent_73%)] blur-2xl"
        aria-hidden="true"
      />

      <motion.div
        initial={false}
        animate={{ opacity: active ? 1 : 0, y: active ? 0 : -12, scale: active ? 1 : 0.9 }}
        transition={{ duration: reduced ? 0.12 : 0.6, delay: reduced ? 0 : 0.1 }}
        className="pointer-events-none absolute left-1/2 top-[-13%] z-50 h-[25%] w-[145%] -translate-x-1/2"
      >
        <div className="relative h-full w-full">
          <Image
            src="/tiara.png"
            alt=""
            fill
            sizes="480px"
            className="object-contain"
            loading="eager"
          />
        </div>
      </motion.div>

      <div className="absolute inset-[2%] rounded-t-[49%] rounded-b-[7%] bg-[#6c3540]/52 shadow-[0_28px_50px_rgba(45,14,22,0.26)]" style={{ transform: "translateZ(-20px)" }} />

      <div className="absolute inset-0 rounded-t-[50%] rounded-b-[8%] border border-white/55 bg-[linear-gradient(145deg,#e4b5bb_0%,#c67e89_38%,#a35e69_75%,#7d414d_100%)] p-[3.6%] shadow-[inset_0_1px_0_rgba(255,255,255,0.65),inset_0_-14px_28px_rgba(67,20,31,0.18),0_24px_44px_rgba(64,20,30,0.18)]">
        <div className="relative h-full overflow-hidden rounded-t-[48%] rounded-b-[5%] bg-[#120d10]">
          <motion.div
            initial={false}
            animate={{
              scale: active ? 1.08 : 1.02,
              filter: active
                ? "saturate(1.06) brightness(1)"
                : "saturate(0.72) brightness(0.72)",
            }}
            transition={{ duration: reduced ? 0.12 : 0.85, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <div className="relative h-full w-full">
              <Image
                src={portal.image}
                alt=""
                fill
                loading="eager"
                fetchPriority={active ? "high" : "auto"}
                sizes="(max-width: 1279px) 576px, 644px"
                className="object-cover object-center"
              />
            </div>
          </motion.div>

          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(25,9,15,0.74),rgba(25,9,15,0.04)_58%,rgba(255,255,255,0.10))]" />

          <motion.div
            animate={{ opacity: active ? 0.54 : 0.12 }}
            transition={{ duration: reduced ? 0.12 : 0.45 }}
            className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.52),transparent_38%)]"
          />

          <DoorLeaf side="left" open={active} reduced={reduced} />
          <DoorLeaf side="right" open={active} reduced={reduced} />

          <motion.div
            initial={false}
            animate={{
              opacity: active ? 1 : 0,
              y: active ? 0 : 18,
            }}
            transition={{ duration: reduced ? 0.12 : 0.42, delay: reduced ? 0 : 0.23 }}
            className="absolute inset-x-0 bottom-0 z-20 p-[8%] text-white"
          >
            <p className="font-[family-name:var(--font-dc-mono)] text-[9px] uppercase tracking-[0.17em] text-white/58 sm:text-[10px]">
              enter this world
            </p>
            <h3 className="mt-1.5 font-[family-name:var(--font-dc-heading)] text-xl leading-tight sm:text-2xl">
              {portal.title}
            </h3>
            <p className="mt-2 max-w-[15rem] text-[11px] leading-5 text-white/72 sm:text-xs">
              {portal.whisper}
            </p>
            <span className="mt-3 inline-flex items-center gap-1.5 font-[family-name:var(--font-dc-mono)] text-[9px] uppercase tracking-[0.12em] text-white/72 sm:text-[10px]">
              Explore
              <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </motion.div>

          <motion.div
            initial={false}
            animate={{ opacity: active ? 0 : 1, y: active ? 10 : 0 }}
            transition={{ duration: reduced ? 0.12 : 0.3 }}
            className="pointer-events-none absolute inset-x-0 bottom-0 z-40 bg-gradient-to-t from-black/72 via-black/12 to-transparent p-[8%] pt-[30%] text-center"
          >
            <span className="font-[family-name:var(--font-dc-heading)] text-lg font-semibold tracking-wide text-white sm:text-xl">
              {portal.title}
            </span>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={false}
        animate={{
          opacity: active ? 0.75 : 0,
          scaleX: active ? 1 : 0.62,
          y: active ? 0 : -12,
        }}
        transition={{ duration: reduced ? 0.12 : 0.7, delay: reduced ? 0 : 0.16 }}
        className="pointer-events-none absolute -bottom-[23%] left-[16%] right-[16%] h-[28%] origin-top [clip-path:polygon(38%_0,62%_0,100%_100%,0_100%)] bg-[linear-gradient(to_bottom,rgba(255,246,247,0.48),rgba(217,163,170,0.14)_52%,transparent)] blur-[1px]"
        aria-hidden="true"
      />
    </motion.button>
  );
}

export default function AssetDreamPortalScene({
  activeDoor,
  setActiveDoor,
}: AssetDreamPortalSceneProps) {
  const reduced = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 90, damping: 22 });
  const smoothY = useSpring(pointerY, { stiffness: 90, damping: 22 });
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-2.8, 2.8]);
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [2.2, -2.2]);

  return (
    <div
      className="relative h-[510px] w-full sm:h-[570px] xl:h-[640px]"
      onPointerMove={(event) => {
        if (reduced) return;
        const rect = event.currentTarget.getBoundingClientRect();
        pointerX.set((event.clientX - rect.left) / rect.width - 0.5);
        pointerY.set((event.clientY - rect.top) / rect.height - 0.5);
      }}
      onPointerLeave={() => {
        pointerX.set(0);
        pointerY.set(0);
      }}
    >
      <motion.div
        style={reduced ? undefined : { rotateX, rotateY }}
        className="absolute inset-0 [perspective:1700px] [transform-style:preserve-3d]"
      >
        {portals.map((portal) => (
          <PortalCard
            key={portal.id}
            portal={portal}
            activeDoor={activeDoor}
            setActiveDoor={setActiveDoor}
          />
        ))}
      </motion.div>
    </div>
  );
}
