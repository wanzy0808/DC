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
      className={`pointer-events-none fixed z-[1] ${className}`}
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
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_10%_28%,rgba(112,59,59,0.10),transparent_36%),radial-gradient(ellipse_at_88%_60%,rgba(178,139,94,0.10),transparent_38%),linear-gradient(to_bottom,transparent,rgba(214,179,140,0.035),transparent)] dark:bg-[radial-gradient(ellipse_at_12%_25%,rgba(214,179,140,0.09),transparent_36%),radial-gradient(ellipse_at_88%_60%,rgba(214,179,140,0.07),transparent_40%),linear-gradient(to_bottom,transparent,rgba(20,10,10,0.10),transparent)]" />

        <div className="absolute left-[8%] top-[18%] h-[24rem] w-[24rem] rounded-full bg-primary/[0.035] blur-3xl dark:bg-[#D6B38C]/[0.035]" />
        <div className="absolute bottom-[8%] right-[6%] h-[28rem] w-[28rem] rounded-full bg-[#B28B5E]/[0.045] blur-3xl dark:bg-[#D6B38C]/[0.04]" />
      </div>

      <BotanicalLayer
        src="/assets/marketing/event-planner/foliage-left.webp"
        className="-bottom-[8vh] -left-[7vw] h-[72vh] w-[38vw] min-w-[290px] max-w-[620px] opacity-[0.20] sm:opacity-[0.25] lg:opacity-[0.30] dark:opacity-[0.14]"
        x={7}
        y={13}
        rotate={-2.2}
        duration={17}
      />

      <BotanicalLayer
        src="/assets/marketing/event-planner/foliage-right.webp"
        className="-right-[7vw] top-[10vh] h-[68vh] w-[36vw] min-w-[270px] max-w-[590px] opacity-[0.16] sm:opacity-[0.22] lg:opacity-[0.27] dark:opacity-[0.13]"
        x={-6}
        y={10}
        rotate={2}
        duration={19}
        delay={0.8}
      />

      <BotanicalLayer
        src="/assets/marketing/event-planner/foliage-floating.webp"
        className="bottom-[8vh] right-[14vw] hidden h-[30vh] w-[22vw] max-w-[360px] opacity-[0.10] lg:block dark:opacity-[0.07]"
        x={-10}
        y={18}
        rotate={5}
        duration={14}
        delay={1.4}
      />

      <BotanicalLayer
        src="/assets/marketing/event-planner/foliage-floating.webp"
        className="left-[15vw] top-[12vh] hidden h-[20vh] w-[16vw] max-w-[250px] -scale-x-100 opacity-[0.065] xl:block dark:opacity-[0.045]"
        x={8}
        y={15}
        rotate={-8}
        duration={21}
        delay={2.2}
      />

      <FallingLeaves className="opacity-75" />
    </>
  );
}
