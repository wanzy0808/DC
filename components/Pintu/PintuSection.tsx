"use client";

import type { Dispatch, SetStateAction } from "react";\nimport { motion, useReducedMotion } from "motion/react";
import PintuCard from "@/components/Pintu/PintuCard";
import { useLanguage } from "@/components/I18n/LanguageProvider";

type DoorValue = 1 | 2 | 3 | null;

type PintuSectionProps = {
  activeDoor: DoorValue;
  setActiveDoor: Dispatch<SetStateAction<DoorValue>>;
};

const doors = [
  {
    id: 1 as const,
    key: "planner" as const,
    href: "/event-planner",
    image: "wo.png",
    kind: "planner" as const,
    captionId: "Dari ide menjadi momen luar biasa",
    captionEn: "From an idea to a memorable event",
  },
  {
    id: 2 as const,
    key: "invitation" as const,
    href: "/d-invitation",
    image: "hp-digital.png",
    kind: "invitation" as const,
    captionId: "Undangan yang terasa lebih personal",
    captionEn: "A more personal way to invite",
  },
  {
    id: 3 as const,
    key: "guestbook" as const,
    href: "/guestbook",
    image: "bukutamu.png",
    kind: "guestbook" as const,
    captionId: "Sambutan dan kenangan yang tercatat",
    captionEn: "Welcome guests and keep the memory",
  },
];

export default function PintuSection({
  activeDoor,
  setActiveDoor,
}: PintuSectionProps) {
  const reduced = useReducedMotion();
  const { messages, locale } = useLanguage();

  return (
    <div className="relative flex h-full min-h-0 w-full items-end justify-center">
      <div className="pointer-events-none absolute bottom-[1%] left-[4%] h-[28%] w-[92%] rounded-[50%] border border-primary/10 bg-primary/[0.025] blur-[1px] dark:bg-primary/[0.04]" />

      <motion.div
        initial={reduced ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduced ? 0.1 : 0.75, ease: [0.22, 1, 0.36, 1] }}
        className="grid w-full grid-cols-[0.88fr_1.08fr_0.88fr] items-end gap-1.5 px-1 pb-[5%] sm:gap-3 md:gap-4 lg:gap-5 lg:px-[2%]"
      >
        {doors.map((door) => (
          <PintuCard
            key={door.id}
            title={messages.home.doors[door.key].eyebrow}
            href={door.href}
            bgImage={door.image}
            kind={door.kind}
            caption={locale === "en" ? door.captionEn : door.captionId}
            featured={door.id === 2}
            isActive={(activeDoor ?? 2) === door.id}
            reducedMotion={reduced}
            onActivate={() => setActiveDoor(door.id)}
          />
        ))}
      </motion.div>
    </div>
  );
}
