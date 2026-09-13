"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, Check } from "lucide-react";
import PintuSection from "@/components/Pintu/PintuSection";
import RomanticBackground from "@/components/Layout/background";

type DoorValue = 1 | 2 | 3 | null;

const ease = [0.22, 1, 0.36, 1] as const;

const doorContent = {
  1: {
    eyebrow: "01 / Wedding Planner",
    title: "Rencanakan acara tanpa kehilangan kendali.",
    description:
      "Susun rundown, koordinasikan kebutuhan acara, dan kelola vendor dalam satu ruang kerja yang lebih terarah.",
    href: "/wedding-planner",
    capabilities: ["Staff", "Event rundown", "Vendor"],
  },
  2: {
    eyebrow: "02 / Digital Invitation",
    title: "Undangan digital yang terasa seperti bagian dari acaranya.",
    description:
      "Bangun undangan, kelola RSVP, dan siapkan pengalaman tamu dengan data acara yang tetap terhubung.",
    href: "/d-invitation",
    capabilities: ["Undangan", "RSVP", "Guest management"],
  },
  3: {
    eyebrow: "03 / Guestbook",
    title: "Tahu siapa yang datang, sejak tamu membuka pintu.",
    description:
      "Kelola kehadiran dengan QR check-in dan guestbook digital agar penerimaan tamu lebih cepat dan rapi.",
    href: "/guestbook",
    capabilities: ["Buku tamu", "QR check-in", "Kehadiran"],
  },
} as const;

export default function Home() {
  const [activeDoor, setActiveDoor] = useState<DoorValue>(2);
  const reduced = useReducedMotion();
  const selectedDoor = activeDoor ?? 2;
  const content = doorContent[selectedDoor];

  return (
    <div className="public-page relative min-h-[calc(100dvh-88px)] overflow-hidden text-[var(--foreground)]">
      <RomanticBackground />

      <main className="relative z-10 mx-auto min-h-[calc(100dvh-88px)] w-[92vw] max-w-[1400px]">
        <section className="grid min-h-[calc(100dvh-88px)] items-center gap-2 py-5 sm:py-8 lg:grid-cols-[0.78fr_1.22fr] lg:gap-0 lg:py-6">
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
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={selectedDoor}
                initial={reduced ? false : { opacity: 0, y: 16 }}
                animate={reduced ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, y: -12 }}
                transition={{ duration: reduced ? 0.15 : 0.42, ease }}
              >
                <p className="font-[family-name:var(--font-dc-mono)] text-[10px] uppercase tracking-[0.3em] text-[var(--primary)]">
                  {content.eyebrow}
                </p>
                <h1 className="mt-5 max-w-2xl font-[family-name:var(--font-dc-heading)] text-4xl leading-[1.04] tracking-[-0.04em] sm:text-5xl lg:text-[4.05rem]">
                  {content.title}
                </h1>
                <p className="mt-5 max-w-xl text-sm leading-7 text-[var(--muted-foreground)] sm:text-base sm:leading-8">
                  {content.description}
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Link
                    href={content.href}
                    className="group inline-flex min-h-11 items-center gap-3 rounded-full bg-[var(--primary)] px-5 text-sm font-semibold text-[var(--primary-foreground)] shadow-[0_18px_50px_color-mix(in_srgb,var(--primary)_18%,transparent)] transition duration-300 hover:-translate-y-1 hover:bg-[var(--dc-rose-wood-dark)]"
                  >
                    Buka workspace
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </Link>
                </div>
                <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 font-[family-name:var(--font-dc-mono)] text-[9px] uppercase tracking-[0.13em] text-[var(--muted-foreground)]">
                  {content.capabilities.map((item) => (
                    <span key={item} className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-[var(--primary)]" />
                      {item}
                    </span>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
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
