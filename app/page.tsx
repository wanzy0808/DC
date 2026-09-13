"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, Check } from "lucide-react";
import PintuSection from "@/components/Pintu/PintuSection";
import RomanticBackground from "@/components/Layout/background";

type DoorValue = 1 | 2 | 3 | null;

const ease = [0.22, 1, 0.36, 1] as const;

export default function Home() {
  const [activeDoor, setActiveDoor] = useState<DoorValue>(2);
  const reduced = useReducedMotion();

  return (
    <div className="public-page relative h-[calc(100dvh-88px)] overflow-hidden text-[var(--foreground)]">
      <RomanticBackground />

      <main className="relative z-10 mx-auto h-full w-[92vw] max-w-[1400px]">
        <section className="grid h-full items-center gap-2 py-5 sm:py-8 lg:grid-cols-[0.78fr_1.22fr] lg:gap-0 lg:py-6">
          <motion.div
            {...(reduced
              ? {}
              : {
                  initial: { opacity: 0, y: 20 },
                  animate: { opacity: 1, y: 0 },
                  transition: { duration: 0.7, ease },
                })}
            className="relative z-20 max-w-2xl lg:pr-5"
          >
            <p className="font-[family-name:var(--font-dc-mono)] text-[10px] uppercase tracking-[0.3em] text-[var(--primary)]">
              DC Organizer / Wedding & Event
            </p>
            <h1 className="mt-5 max-w-3xl font-[family-name:var(--font-dc-heading)] text-4xl leading-[1.04] tracking-[-0.04em] sm:text-5xl lg:text-[4.25rem]">
              DC Organizer, your best consultant for <span className="text-[var(--primary)]">wedding & event.</span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-[var(--muted-foreground)] sm:text-base sm:leading-8">
              Satu tempat untuk merencanakan, mengelola, dan menghadirkan pengalaman acara yang lebih terarah — dari persiapan sampai tamu pulang.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/d-invitation"
                className="group inline-flex min-h-11 items-center gap-3 rounded-full bg-[var(--primary)] px-5 text-sm font-semibold text-[var(--primary-foreground)] shadow-[0_18px_50px_color-mix(in_srgb,var(--primary)_18%,transparent)] transition duration-300 hover:-translate-y-1 hover:bg-[var(--dc-rose-wood-dark)]"
              >
                Mulai eksplorasi
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Link>
              <Link
                href="/packages"
                className="inline-flex min-h-11 items-center rounded-full bg-[var(--secondary)] px-5 text-sm font-semibold text-[var(--foreground)] transition duration-300 hover:-translate-y-1 hover:bg-[var(--muted)]"
              >
                Lihat layanan
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 font-[family-name:var(--font-dc-mono)] text-[9px] uppercase tracking-[0.13em] text-[var(--muted-foreground)]">
              {["Database-first", "Realtime RSVP", "Guest management"].map((item) => (
                <span key={item} className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-[var(--primary)]" />
                  {item}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            {...(reduced
              ? {}
              : {
                  initial: { opacity: 0, x: 30 },
                  animate: { opacity: 1, x: 0 },
                  transition: { duration: 0.85, delay: 0.12, ease },
                })}
            className="relative min-w-0 lg:-mr-20"
          >
            <PintuSection activeDoor={activeDoor} setActiveDoor={setActiveDoor} />
          </motion.div>
        </section>
      </main>
    </div>
  );
}
