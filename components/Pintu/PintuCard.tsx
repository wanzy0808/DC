"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, BookOpen, CalendarDays, Mail } from "lucide-react";

type PintuKind = "planner" | "invitation" | "guestbook";

type PintuCardProps = {
  title: string;
  href: string;
  bgImage: string;
  kind: PintuKind;
  caption: string;
  isActive: boolean;
  featured?: boolean;
  reducedMotion?: boolean | null;
  onActivate: () => void;
};

const icons = {
  planner: CalendarDays,
  invitation: Mail,
  guestbook: BookOpen,
};

export default function PintuCard({
  title,
  href,
  bgImage,
  kind,
  caption,
  isActive,
  featured = false,
  reducedMotion = false,
  onActivate,
}: PintuCardProps) {
  const Icon = icons[kind];

  return (
    <motion.div
      initial={false}
      animate={
        reducedMotion
          ? undefined
          : {
              y: isActive ? -8 : 0,
              scale: isActive ? 1.018 : 1,
            }
      }
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="relative flex items-end justify-center"
      onMouseEnter={onActivate}
      onFocus={onActivate}
    >
      <div
        className={`pointer-events-none absolute bottom-[-4%] left-1/2 -translate-x-1/2 rounded-[50%] bg-primary blur-2xl transition-opacity duration-500 ${
          featured ? "h-[12%] w-[84%]" : "h-[10%] w-[78%]"
        } ${isActive ? "opacity-25 dark:opacity-35" : "opacity-5 dark:opacity-10"}`}
        aria-hidden="true"
      />

      <Link
        href={href}
        aria-label={title}
        className={`group relative block overflow-hidden rounded-t-[999px] rounded-b-[22px] border border-primary/45 bg-background/35 shadow-[0_28px_70px_rgba(31,20,24,.16)] outline-none backdrop-blur-[2px] transition-shadow focus-visible:ring-2 focus-visible:ring-primary/80 focus-visible:ring-offset-4 focus-visible:ring-offset-background dark:bg-black/15 dark:shadow-[0_32px_90px_rgba(0,0,0,.48)] ${
          featured
            ? "h-[clamp(330px,57dvh,590px)] w-[clamp(178px,15vw,290px)]"
            : "h-[clamp(290px,49dvh,510px)] w-[clamp(150px,12.5vw,242px)]"
        }`}
      >
        <div className="absolute inset-[5px] z-30 rounded-t-[999px] rounded-b-[18px] border border-white/35 dark:border-white/18" />
        <div className="absolute inset-[11px] z-30 rounded-t-[999px] rounded-b-[14px] border border-primary/28" />

        <Image
          src={`/${bgImage}`}
          alt=""
          fill
          priority={featured}
          sizes={featured ? "(min-width: 1024px) 290px, 190px" : "(min-width: 1024px) 242px, 160px"}
          className={`object-cover transition duration-700 ${
            isActive ? "scale-[1.035] grayscale-0" : "scale-100 grayscale-[.45]"
          }`}
        />

        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(20,11,15,.88),rgba(20,11,15,.18)_55%,rgba(192,122,132,.08))]" />
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${
            isActive
              ? "bg-[radial-gradient(circle_at_50%_42%,rgba(217,163,170,.28),transparent_48%)] opacity-100"
              : "bg-[linear-gradient(to_bottom,rgba(192,122,132,.08),rgba(25,16,20,.35))] opacity-80"
          }`}
        />

        <motion.div
          initial={false}
          animate={{ x: isActive ? "-103%" : "0%" }}
          transition={{ duration: reducedMotion ? 0.08 : 0.72, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-y-0 left-0 z-10 w-1/2 border-r border-white/20 bg-[linear-gradient(100deg,rgba(166,94,105,.9),rgba(192,122,132,.72))] shadow-[inset_-14px_0_28px_rgba(45,19,25,.16)] backdrop-blur-sm dark:bg-[linear-gradient(100deg,rgba(67,35,43,.94),rgba(192,122,132,.62))]"
        />
        <motion.div
          initial={false}
          animate={{ x: isActive ? "103%" : "0%" }}
          transition={{ duration: reducedMotion ? 0.08 : 0.72, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-y-0 right-0 z-10 w-1/2 border-l border-white/20 bg-[linear-gradient(260deg,rgba(166,94,105,.9),rgba(192,122,132,.72))] shadow-[inset_14px_0_28px_rgba(45,19,25,.16)] backdrop-blur-sm dark:bg-[linear-gradient(260deg,rgba(67,35,43,.94),rgba(192,122,132,.62))]"
        />

        <motion.div
          initial={false}
          animate={{ opacity: isActive ? 1 : 0.9, y: isActive ? -3 : 0 }}
          transition={{ duration: reducedMotion ? 0.08 : 0.35 }}
          className="absolute inset-0 z-20 flex flex-col items-center justify-center px-4 text-center text-white"
        >
          <div className={`mb-4 grid place-items-center rounded-full border border-white/38 bg-black/10 backdrop-blur-md ${
            featured ? "h-12 w-12" : "h-10 w-10"
          }`}>
            <Icon className={featured ? "h-5 w-5" : "h-4 w-4"} strokeWidth={1.45} />
          </div>

          <h3 className={`max-w-[85%] font-[family-name:var(--font-dc-heading)] font-medium leading-tight tracking-[-0.02em] text-white ${
            featured ? "text-xl lg:text-[1.65rem]" : "text-base lg:text-[1.25rem]"
          }`}>
            {title}
          </h3>

          <span className="my-4 h-px w-8 bg-white/55" />

          <p className="max-w-[78%] font-[family-name:var(--font-dc-mono)] text-[8px] uppercase leading-[1.55] tracking-[0.12em] text-white/74 lg:text-[9px]">
            {caption}
          </p>

          <motion.span
            animate={reducedMotion ? undefined : { x: isActive ? [0, 3, 0] : 0 }}
            transition={{ duration: 1.8, repeat: isActive ? Infinity : 0, ease: "easeInOut" }}
            className="mt-5 grid h-9 w-9 place-items-center rounded-full border border-white/38 bg-black/10 backdrop-blur-md"
          >
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          </motion.span>
        </motion.div>

        <div className={`absolute inset-x-[14%] bottom-0 z-30 h-px bg-white/60 transition-opacity ${
          isActive ? "opacity-90" : "opacity-35"
        }`} />
      </Link>
    </motion.div>
  );
}
