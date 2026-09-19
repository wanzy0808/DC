"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, Check, Sparkles } from "lucide-react";
import DreamPortalScene, {
  type DreamDoorValue,
} from "@/components/Landing/Pintu/DreamPortalScene";
import DreamWorldBackground from "@/components/Layout/DreamWorldBackground";
import { useLanguage } from "@/components/I18n/LanguageProvider";
import { Button } from "@/components/ui/button";

const ease = [0.22, 1, 0.36, 1] as const;

const doorMeta = {
  1: {
    label: "Event Planner",
    href: "/event-planner",
  },
  2: {
    label: "Digital Invitation",
    href: "/d-invitation",
  },
  3: {
    label: "Guestbook",
    href: "/guestbook",
  },
} as const;

export default function JiplakLanding() {
  const [activeDoor, setActiveDoor] = useState<DreamDoorValue>(2);
  const reduced = useReducedMotion();
  const { messages } = useLanguage();

  const key =
    activeDoor === 1
      ? "planner"
      : activeDoor === 2
        ? "invitation"
        : "guestbook";
  const content = messages.home.doors[key];
  const meta = doorMeta[activeDoor];

  return (
    <div className="public-page relative min-h-[calc(100dvh-88px)] overflow-hidden bg-background text-foreground">
      <DreamWorldBackground activeDoor={activeDoor} />

      <main className="relative z-10 mx-auto flex min-h-[calc(100dvh-88px)] w-[80vw] max-w-full items-center pb-14 pt-6 sm:pt-8 lg:pb-16 lg:pt-5">
        <section className="grid w-full items-center gap-8 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] lg:gap-10 xl:gap-16">
          <motion.div
            {...(reduced
              ? {}
              : {
                  initial: { opacity: 0, y: 18 },
                  animate: { opacity: 1, y: 0 },
                  transition: { duration: 0.72, ease },
                })}
            className="relative z-30 max-w-[42rem] lg:pr-4"
          >
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-9 bg-primary/45" />
              <span className="font-[family-name:var(--font-dc-mono)] text-[9px] uppercase tracking-[0.22em] text-primary/75 sm:text-[10px]">
                Three doors · three worlds
              </span>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeDoor}
                initial={reduced ? false : { opacity: 0, y: 14, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, y: -10, filter: "blur(3px)" }}
                transition={{ duration: reduced ? 0.12 : 0.42, ease }}
              >
                <p className="font-[family-name:var(--font-dc-mono)] text-[10px] uppercase tracking-[0.2em] text-foreground/50 sm:text-[11px]">
                  {content.eyebrow}
                </p>

                <h1 className="mt-4 max-w-[40rem] font-[family-name:var(--font-dc-heading)] text-[2.75rem] leading-[1.02] tracking-[-0.04em] text-primary sm:text-[3.25rem] lg:text-[3.7rem] xl:text-[4.45rem]">
                  {content.title}
                </h1>

                <p className="mt-5 max-w-[37rem] text-sm leading-7 text-foreground/68 sm:text-[15px] sm:leading-8 lg:text-base">
                  {content.description}
                </p>

                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <Button
                    asChild
                    size="lg"
                    className="h-11 rounded-xl px-6 text-sm font-semibold sm:text-[15px]"
                  >
                    <Link href={meta.href}>
                      {messages.home.openWorkspace}
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </Button>

                  <div className="flex items-center gap-2 font-[family-name:var(--font-dc-mono)] text-[9px] uppercase tracking-[0.13em] text-foreground/42 sm:text-[10px]">
                    <Sparkles className="h-3.5 w-3.5 text-primary/70" />
                    hover another door
                  </div>
                </div>

                <div className="mt-8 max-w-[38rem] border-l border-primary/25 pl-4">
                  <p className="text-sm leading-6 text-foreground/62 sm:text-[15px]">
                    “{content.proof.quote}”
                  </p>
                  <p className="mt-2 font-[family-name:var(--font-dc-mono)] text-[9px] uppercase tracking-[0.15em] text-foreground/38 sm:text-[10px]">
                    {content.proof.source}
                  </p>
                </div>

                <div className="mt-7 flex max-w-[40rem] flex-wrap gap-x-5 gap-y-2.5">
                  {content.capabilities.map((item) => (
                    <span
                      key={item}
                      className="flex items-center gap-1.5 font-[family-name:var(--font-dc-mono)] text-[9px] uppercase tracking-[0.09em] text-foreground/48 sm:text-[10px]"
                    >
                      <Check className="h-3.5 w-3.5 text-primary" />
                      {item}
                    </span>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="mt-9 flex items-center gap-2">
              {([1, 2, 3] as DreamDoorValue[]).map((door) => {
                const active = activeDoor === door;
                return (
                  <button
                    key={door}
                    type="button"
                    onClick={() => setActiveDoor(door)}
                    aria-pressed={active}
                    className={`group flex items-center gap-2 rounded-full px-1 py-1 text-left transition-opacity ${
                      active ? "opacity-100" : "opacity-45 hover:opacity-80"
                    }`}
                  >
                    <span
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        active ? "w-7 bg-primary" : "w-1.5 bg-foreground/35"
                      }`}
                    />
                    <span className="hidden font-[family-name:var(--font-dc-mono)] text-[9px] uppercase tracking-[0.12em] text-foreground/55 sm:inline">
                      {doorMeta[door].label}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            {...(reduced
              ? {}
              : {
                  initial: { opacity: 0, x: 26, scale: 0.98 },
                  animate: { opacity: 1, x: 0, scale: 1 },
                  transition: { duration: 0.9, delay: 0.08, ease },
                })}
            className="relative z-20 min-w-0 lg:-mr-[3vw]"
          >
            <div className="relative mx-auto w-full max-w-[760px]">
              <DreamPortalScene
                activeDoor={activeDoor}
                setActiveDoor={setActiveDoor}
              />
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
