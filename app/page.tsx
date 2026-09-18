"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, BookOpen, CalendarDays, Mail } from "lucide-react";
import PintuSection from "@/components/Pintu/PintuSection";
import LandingRoomScene from "@/components/Layout/LandingRoomScene";
import { useLanguage } from "@/components/I18n/LanguageProvider";
import { Button } from "@/components/ui/button";

type DoorValue = 1 | 2 | 3 | null;
const ease = [0.22, 1, 0.36, 1] as const;

const doorTabs = [
  { id: 1 as const, key: "planner" as const, icon: CalendarDays },
  { id: 2 as const, key: "invitation" as const, icon: Mail },
  { id: 3 as const, key: "guestbook" as const, icon: BookOpen },
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
    <div className="public-page relative h-[100dvh] min-h-0 overflow-hidden bg-background text-foreground">
      <LandingRoomScene activeDoor={activeDoor} />

      <main className="relative z-10 mx-auto h-full w-[80vw] max-w-full pb-10 pt-[88px] sm:pb-12 sm:pt-[96px]">
        <section className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] items-center gap-0 lg:grid-cols-[37%_63%] lg:grid-rows-1">
          <motion.div
            {...(reduced
              ? {}
              : {
                  initial: { opacity: 0, x: -20 },
                  animate: { opacity: 1, x: 0 },
                  transition: { duration: 0.68, ease },
                })}
            className="relative z-20 self-center pr-2 sm:pr-5 lg:pr-[2vw]"
          >
            <div className="mb-5 flex max-w-[37rem] flex-wrap gap-2 lg:mb-8">
              {doorTabs.map((door) => {
                const item = messages.home.doors[door.key];
                const Icon = door.icon;
                const active = selectedDoor === door.id;

                return (
                  <button
                    key={door.id}
                    type="button"
                    onClick={() => setActiveDoor(door.id)}
                    onFocus={() => setActiveDoor(door.id)}
                    aria-pressed={active}
                    className={`group relative isolate inline-flex min-h-10 items-center gap-2 overflow-hidden rounded-full border px-3.5 py-2 font-[family-name:var(--font-dc-body)] text-[11px] transition-[border-color,color,box-shadow] duration-300 sm:text-xs ${
                      active
                        ? "border-primary text-white shadow-[0_8px_22px_rgba(192,122,132,.22)] dark:text-black"
                        : "border-primary/28 bg-background/45 text-foreground/68 backdrop-blur-md hover:border-primary/55 hover:text-primary dark:bg-black/10"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="landing-service-active"
                        transition={reduced ? { duration: 0.08 } : { type: "spring", stiffness: 420, damping: 34 }}
                        className="absolute inset-0 -z-10 bg-primary"
                      />
                    )}
                    <Icon className="h-3.5 w-3.5" strokeWidth={1.6} />
                    {item.eyebrow}
                  </button>
                );
              })}
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={selectedKey}
                initial={reduced ? false : { opacity: 0, x: 12, y: 7 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, x: -10, y: -5 }}
                transition={{ duration: reduced ? 0.1 : 0.48, ease }}
              >
                <motion.p
                  initial={reduced ? false : { opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduced ? 0.1 : 0.38, delay: reduced ? 0 : 0.04, ease }}
                  className="font-[family-name:var(--font-dc-mono)] text-[9px] uppercase tracking-[0.2em] text-primary/82 sm:text-[10px]"
                >
                  DC Organizer · {content.eyebrow}
                </motion.p>

                <motion.h1
                  initial={reduced ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduced ? 0.1 : 0.46, delay: reduced ? 0 : 0.07, ease }}
                  className="mt-3 max-w-[36rem] text-balance font-[family-name:var(--font-dc-heading)] text-[2.3rem] font-medium leading-[1.02] tracking-[-0.035em] text-primary sm:text-[3rem] lg:text-[clamp(2.9rem,4.1vw,4.7rem)]"
                >
                  {content.title}
                </motion.h1>

                <motion.p
                  initial={reduced ? false : { opacity: 0, y: 7 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduced ? 0.1 : 0.44, delay: reduced ? 0 : 0.11, ease }}
                  className="mt-4 max-w-[32rem] text-sm leading-6 text-foreground/67 sm:text-[15px] sm:leading-7 lg:mt-5 lg:text-base lg:leading-8"
                >
                  {content.description}
                </motion.p>

                <motion.div
                  initial={reduced ? false : { opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: reduced ? 0.1 : 0.42, delay: reduced ? 0 : 0.15, ease }}
                  className="mt-4 flex max-w-[31rem] items-center gap-3 text-primary lg:mt-5"
                >
                  <motion.span
                    initial={reduced ? false : { scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: reduced ? 0.1 : 0.45, delay: reduced ? 0 : 0.12, ease }}
                    className="h-px w-10 origin-left bg-primary/70"
                  />
                  <p className="font-[family-name:var(--font-dc-body)] text-xs leading-5 text-primary/88 sm:text-[13px]">
                    {content.proof.quote}
                  </p>
                </motion.div>

                <div className="mt-5 flex flex-wrap items-center gap-4 lg:mt-7">
                  <Button
                    asChild
                    size="lg"
                    className="h-11 min-w-[11rem] rounded-xl px-6 text-sm font-[family-name:var(--font-dc-body)] font-semibold sm:text-[15px]"
                  >
                    <Link href={href}>
                      {messages.home.openWorkspace}
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </Button>

                  <div className="hidden items-center gap-2.5 font-[family-name:var(--font-dc-mono)] text-[9px] uppercase tracking-[0.11em] text-foreground/42 sm:flex">
                    {content.capabilities.map((item, index) => (
                      <span key={item} className="flex items-center gap-2.5">
                        {index > 0 && <span className="h-1 w-1 rounded-full bg-primary/55" />}
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          <motion.div
            {...(reduced
              ? {}
              : {
                  initial: { opacity: 0, x: 34, scale: 0.985 },
                  animate: { opacity: 1, x: 0, scale: 1 },
                  transition: { duration: 0.86, delay: 0.08, ease },
                })}
            className="relative z-10 min-h-0 min-w-0 self-stretch lg:-mr-[4vw]"
          >
            <div className="absolute inset-x-[8%] bottom-[7%] h-[15%] rounded-[50%] bg-primary/[0.06] blur-2xl dark:bg-primary/[0.09]" />
            <PintuSection activeDoor={activeDoor} setActiveDoor={setActiveDoor} />
          </motion.div>
        </section>
      </main>
    </div>
  );
}
