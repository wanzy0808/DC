"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import FallingLeaves from "@/components/Layout/FallingLeaves";

function BotanicalLayer({
  src,
  className,
  x = 0,
  y = 10,
  rotate = 0,
  duration = 16,
  delay = 0,
}: {
  src: string;
  className: string;
  x?: number;
  y?: number;
  rotate?: number;
  duration?: number;
  delay?: number;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      aria-hidden="true"
      className={`pointer-events-none absolute ${className}`}
      animate={
        reduced
          ? undefined
          : {
              x: [0, x, 0],
              y: [0, -y, 0],
              rotate: [rotate, rotate + (x >= 0 ? 1.35 : -1.35), rotate],
              scale: [1, 1.018, 1],
            }
      }
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    >
      <Image
        src={src}
        alt=""
        fill
        sizes="(max-width: 768px) 58vw, 34vw"
        className="object-contain"
      />
    </motion.div>
  );
}

export default function EventPlannerBotanicalAtmosphere() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[12] overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_10%_28%,rgba(112,59,59,0.12),transparent_36%),radial-gradient(ellipse_at_88%_60%,rgba(178,139,94,0.12),transparent_38%),linear-gradient(to_bottom,transparent,rgba(214,179,140,0.045),transparent)] dark:bg-[radial-gradient(ellipse_at_12%_25%,rgba(214,179,140,0.10),transparent_36%),radial-gradient(ellipse_at_88%_60%,rgba(214,179,140,0.08),transparent_40%),linear-gradient(to_bottom,transparent,rgba(20,10,10,0.12),transparent)]" />

      <div className="absolute left-[8%] top-[18%] h-[24rem] w-[24rem] rounded-full bg-primary/[0.045] blur-3xl dark:bg-[#D6B38C]/[0.04]" />
      <div className="absolute bottom-[8%] right-[6%] h-[28rem] w-[28rem] rounded-full bg-[#B28B5E]/[0.055] blur-3xl dark:bg-[#D6B38C]/[0.045]" />

      <BotanicalLayer
        src="/assets/marketing/event-planner/foliage-left.webp"
        className="-bottom-[5%] -left-[3%] h-[78%] w-[38%] min-w-[300px] max-w-[650px] opacity-[0.32] sm:opacity-[0.38] dark:opacity-[0.17]"
        x={7}
        y={13}
        rotate={-2.2}
        duration={17}
      />

      <BotanicalLayer
        src="/assets/marketing/event-planner/foliage-right.webp"
        className="-right-[3%] top-[2%] h-[72%] w-[36%] min-w-[285px] max-w-[620px] opacity-[0.28] sm:opacity-[0.34] dark:opacity-[0.16]"
        x={-6}
        y={10}
        rotate={2}
        duration={19}
        delay={0.8}
      />

      <BotanicalLayer
        src="/assets/marketing/event-planner/foliage-floating.webp"
        className="bottom-[6%] right-[16%] hidden h-[32%] w-[23%] max-w-[380px] opacity-[0.15] lg:block dark:opacity-[0.08]"
        x={-10}
        y={18}
        rotate={5}
        duration={14}
        delay={1.4}
      />

      <BotanicalLayer
        src="/assets/marketing/event-planner/foliage-floating.webp"
        className="left-[13%] top-[8%] hidden h-[23%] w-[17%] max-w-[270px] -scale-x-100 opacity-[0.10] xl:block dark:opacity-[0.055]"
        x={8}
        y={15}
        rotate={-8}
        duration={21}
        delay={2.2}
      />

      <FallingLeaves embedded className="opacity-85" />
    </div>
  );
}
