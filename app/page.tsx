"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import PintuSection from "@/components/Pintu/PintuSection";
import LandingThresholdAtmosphere from "@/components/Layout/LandingThresholdAtmosphere";
import { useLanguage } from "@/components/I18n/LanguageProvider";
import { Button } from "@/components/ui/button";

type DoorValue = 1 | 2 | 3 | null;
const ease = [0.22, 1, 0.36, 1] as const;

const doorTabs = [
  { id: 1 as const, key: "planner" as const },
  { id: 2 as const, key: "invitation" as const },
  { id: 3 as const, key: "guestbook" as const },
];

export default function Home() {
  const [activeDoor, setActiveDoor] = useState<DoorValue>(2);
  const reduced = useReducedMotion();
  const { messages } = useLanguage();
  const selectedDoor = activeDoor ?? 2;
  const selectedKey =
    selectedDoor === 1 ? "planner" : selectedDoor === 2 ? "invitation" : "guestbook";
  const content = messages.home.doors[selectedKey];
  const href =
    selectedDoor === 1
      ? "/event-planner"
      : selectedDoor === 2
        ? "/d-invitation"
        : "/guestbook";

  return (
    <div className="public-page relative h-[calc(100dvh-84px)] min-h-[560px] overflow-hidden bg-background text-foreground">
      <LandingThresholdAtmosphere />

      <main className="relative z-10 mx-auto h-full w-[80vw] max-w-full">
        <section className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] items-center gap-1 pb-8 pt-3 md:gap-4 md:pb-10 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] lg:grid-rows-1 lg:gap-0 lg:pb-10 lg:pt-2">
          <motion.div
            {...(reduced
              ? {}
              : {
                  initial: { opacity: 0, y: 18 },
                  animate: { opacity: 1, y: 0 },
                  transition: { duration: 0.65, ease },
                })}
            className="relative z-20 max-w-[45rem] pt-2 lg:pl-[0.5vw] lg:pr-6 xl:pl-[1vw]"
          >
            <div className="mb-4 flex flex-wrap gap-2 sm:mb-5">
              {doorTabs.map((door) => {
                const item = messages.home.doors[door.key];
                const active = selectedDoor === door.id;
                return (
                  <button
                    key={door.id}
                    type="button"
                    onClick={() => setActiveDoor(door.id)}
                    onFocus={() => setActiveDoor(door.id)}
                    className={`rounded-full border px-3 py-1.5 font-[family-name:var(--font-dc-mono)] text-[9px] uppercase tracking-[0.12em] transition sm:text-[10px] ${
                      active
                        ? "border-primary bg-primary text-white dark:text-black"
                        : "border-foreground/12 bg-background/45 text-foreground/55 hover:border-primary/45 hover:text-primary"
                    }`}
                    aria-pressed={active}
                  >
                    {item.eyebrow}
                  </button>
                );
              })}
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={selectedKey}
                initial={reduced ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, y: -10 }}
                transition={{ duration: reduced ? 0.12 : 0.38, ease }}
              >
                <p className="font-[family-name:var(--font-dc-mono)] text-[10px] uppercase tracking-[0.2em] text-foreground/52 sm:text-[11px]">
                  {content.eyebrow}
                </p>
                <h1 className="mt-3 max-w-[44rem] text-balance font-[family-name:var(--font-dc-heading)] text-[2.15rem] leading-[1.04] tracking-[-0.035em] text-primary sm:text-[2.75rem] lg:text-[3.55rem] xl:text-[4rem] 2xl:text-[4.3rem]">
                  {content.title}
                </h1>
                <p className="mt-4 max-w-[40rem] text-[13px] leading-6 text-foreground/68 sm:text-[15px] sm:leading-7 lg:text-base lg:leading-8">
                  {content.description}
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-4 sm:mt-6">
                  <Button
                    asChild
                    size="lg"
                    className="h-11 min-w-[10.5rem] rounded-xl px-6 text-sm font-[family-name:var(--font-dc-body)] font-semibold tracking-normal sm:text-base"
                  >
                    <Link href={href}>
                      {messages.home.openWorkspace}
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </Button>

                  <div className="hidden items-center gap-3 font-[family-name:var(--font-dc-mono)] text-[10px] uppercase tracking-[0.1em] text-foreground/45 sm:flex">
                    {content.capabilities.map((item) => (
                      <span key={item}>{item}</span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 hidden max-w-[36rem] items-center gap-3 border-t border-primary/18 pt-4 lg:flex">
                  <span className="h-px w-8 bg-primary/55" aria-hidden="true" />
                  <p className="text-[12px] leading-5 text-foreground/48">
                    “{content.proof.quote}”
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          <motion.div
            {...(reduced
              ? {}
              : {
                  initial: { opacity: 0, x: 28, scale: 0.985 },
                  animate: { opacity: 1, x: 0, scale: 1 },
                  transition: { duration: 0.8, delay: 0.08, ease },
                })}
            className="relative z-10 min-h-0 min-w-0 self-stretch lg:-ml-[4vw] xl:-ml-[5vw]"
          >
            <div className="absolute inset-x-[8%] bottom-[10%] h-[12%] rounded-[50%] bg-primary/[0.055] blur-2xl dark:bg-primary/[0.08]" aria-hidden="true" />
            <div className="flex h-full min-h-0 items-center justify-center">
              <PintuSection activeDoor={activeDoor} setActiveDoor={setActiveDoor} />
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
