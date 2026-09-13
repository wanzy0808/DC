"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, Check } from "lucide-react";
import PintuSection from "@/components/Pintu/PintuSection";
import RomanticBackground from "@/components/Layout/background";
import { useLanguage } from "@/components/I18n/LanguageProvider";
import { buttonVariants } from "@/components/ui/button";

type DoorValue = 1 | 2 | 3 | null;

const ease = [0.22, 1, 0.36, 1] as const;

export default function Home() {
  const [activeDoor, setActiveDoor] = useState<DoorValue>(2);
  const reduced = useReducedMotion();
  const { messages } = useLanguage();
  const selectedDoor = activeDoor ?? 2;
  const content = messages.home.doors[selectedDoor === 1 ? "planner" : selectedDoor === 2 ? "invitation" : "guestbook"];
  const href = selectedDoor === 1 ? "/wedding-planner" : selectedDoor === 2 ? "/d-invitation" : "/guestbook";

  return (
    <div className="public-page relative min-h-[calc(100dvh-88px)] overflow-hidden bg-background text-foreground">
      <RomanticBackground />

      <main className="relative z-10 mx-auto min-h-[calc(100dvh-88px)] w-[92vw] max-w-[1400px]">
        <section className="grid min-h-[calc(100dvh-88px)] items-center gap-2 py-5 sm:py-8 lg:grid-cols-[0.78fr_1.22fr] lg:gap-0 lg:py-6">
          <motion.div
            {...(reduced ? {} : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, ease } })}
            className="relative z-20 max-w-2xl lg:pr-5"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`${selectedDoor}-${messages.home.doors.planner.title}`}
                initial={reduced ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, y: -12 }}
                transition={{ duration: reduced ? 0.15 : 0.42, ease }}
              >
                <p className="font-[family-name:var(--font-dc-mono)] text-[10px] uppercase tracking-[0.3em] text-foreground/60">{content.eyebrow}</p>
                <h1 className="mt-5 max-w-2xl font-[family-name:var(--font-dc-heading)] text-4xl leading-[1.04] tracking-[-0.04em] text-foreground sm:text-5xl lg:text-[4.05rem]">{content.title}</h1>
                <p className="mt-5 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">{content.description}</p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Link href={href} className={buttonVariants({ variant: "default", size: "lg" })}>
                    {messages.home.openWorkspace}
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 font-[family-name:var(--font-dc-mono)] text-[9px] uppercase tracking-[0.13em] text-muted-foreground">
                  {content.capabilities.map((item) => (
                    <span key={item} className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-primary" />{item}</span>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          <motion.div
            {...(reduced ? {} : { initial: { opacity: 0, x: 30 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.85, delay: 0.12, ease } })}
            className="relative min-w-0 lg:-mr-20"
          >
            <PintuSection activeDoor={activeDoor} setActiveDoor={setActiveDoor} />
          </motion.div>
        </section>
      </main>
    </div>
  );
}
