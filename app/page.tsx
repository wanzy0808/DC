"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowDown, ArrowUpRight, Check } from "lucide-react";
import PintuSection from "@/components/Pintu/PintuSection";
import RomanticBackground from "@/components/Layout/background";

type DoorValue = 1 | 2 | 3 | null;

const products = [
  {
    number: "01",
    eyebrow: "Wedding Planning",
    title: "Rencanakan hari besar tanpa kehilangan kendali.",
    description: "Rundown, detail acara, vendor, dan koordinasi dalam satu alur kerja yang lebih tenang.",
    href: "/wedding-planner",
  },
  {
    number: "02",
    eyebrow: "Digital Invitation",
    title: "Undangan yang terasa personal, bukan sekadar link.",
    description: "Desain elegan, RSVP realtime, galeri, maps, dan pengalaman tamu yang terhubung.",
    href: "/d-invitation",
  },
  {
    number: "03",
    eyebrow: "Guest Management",
    title: "Dari RSVP sampai kursi, semuanya terlihat jelas.",
    description: "Kelola roster, seating, QR ticket, dan check-in dari data yang sama.",
    href: "/guestbook",
  },
];

const ease = [0.22, 1, 0.36, 1] as const;

export default function Home() {
  const [activeDoor, setActiveDoor] = useState<DoorValue>(2);
  const reduced = useReducedMotion();
  const reveal = reduced
    ? {}
    : {
        initial: { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-80px" },
        transition: { duration: 0.65, ease },
      };

  return (
    <div className="public-page relative min-h-[calc(100svh-88px)] overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      <RomanticBackground />

      <main className="relative z-10 mx-auto w-[92vw] max-w-[1400px]">
        <section className="grid min-h-[calc(100svh-88px)] items-center gap-8 py-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-4 lg:py-16">
          <motion.div
            {...(reduced
              ? {}
              : {
                  initial: { opacity: 0, y: 20 },
                  animate: { opacity: 1, y: 0 },
                  transition: { duration: 0.7, ease },
                })}
            className="relative z-20 max-w-2xl lg:pr-4"
          >
            <p className="font-[family-name:var(--font-dc-mono)] text-[10px] uppercase tracking-[0.3em] text-[var(--primary)]">
              DC Organizer / Wedding & Event
            </p>
            <h1 className="mt-7 max-w-3xl font-[family-name:var(--font-dc-heading)] text-5xl leading-[1.04] tracking-[-0.04em] sm:text-6xl lg:text-[4.65rem]">
              DC Organizer, your best consultant for <span className="text-[var(--primary)]">wedding & event.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-8 text-[var(--muted-foreground)] sm:text-lg">
              Satu tempat untuk merencanakan, mengelola, dan menghadirkan pengalaman acara yang lebih terarah — dari persiapan sampai tamu pulang.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/d-invitation"
                className="group inline-flex min-h-12 items-center gap-3 rounded-full bg-[var(--primary)] px-6 text-sm font-semibold text-[var(--primary-foreground)] shadow-[0_18px_50px_color-mix(in_srgb,var(--primary)_18%,transparent)] transition duration-300 hover:-translate-y-1 hover:bg-[var(--dc-rose-wood-dark)]"
              >
                Mulai eksplorasi
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Link>
              <Link
                href="/packages"
                className="inline-flex min-h-12 items-center rounded-full bg-[var(--secondary)] px-6 text-sm font-semibold text-[var(--foreground)] transition duration-300 hover:-translate-y-1 hover:bg-[var(--muted)]"
              >
                Lihat layanan
              </Link>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-2 font-[family-name:var(--font-dc-mono)] text-[10px] uppercase tracking-[0.13em] text-[var(--muted-foreground)]">
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
            <div className="mb-0 flex items-end justify-between px-4 sm:px-8">
              <div>
                <p className="font-[family-name:var(--font-dc-mono)] text-[9px] uppercase tracking-[0.25em] text-[var(--muted-foreground)]">
                  Choose your workspace
                </p>
                <h2 className="mt-2 font-[family-name:var(--font-dc-heading)] text-2xl sm:text-3xl">
                  Buka pintu yang kamu butuhkan.
                </h2>
              </div>
              <ArrowDown className="mb-1 hidden h-5 w-5 text-[var(--primary)] sm:block" />
            </div>
            <PintuSection activeDoor={activeDoor} setActiveDoor={setActiveDoor} />
          </motion.div>
        </section>

        <section className="pb-24 pt-10 sm:pb-32 sm:pt-20">
          <motion.div {...reveal}>
            <p className="font-[family-name:var(--font-dc-mono)] text-[10px] uppercase tracking-[0.25em] text-[var(--primary)]">
              One platform, many moments
            </p>
            <div className="mt-4 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <h2 className="max-w-3xl font-[family-name:var(--font-dc-heading)] text-4xl leading-tight sm:text-5xl">
                Bukan sekadar tools. <span className="text-[var(--muted-foreground)]">Partner digital untuk seluruh perjalanan acara.</span>
              </h2>
              <p className="max-w-sm text-sm leading-7 text-[var(--muted-foreground)]">
                Pindah dari satu layanan ke layanan lain tanpa kehilangan konteks dan data.
              </p>
            </div>
          </motion.div>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {products.map((product, index) => (
              <motion.div
                key={product.number}
                {...reveal}
                transition={{ duration: 0.6, delay: index * 0.09, ease }}
                whileHover={reduced ? undefined : { y: -6 }}
              >
                <Link
                  href={product.href}
                  className="group flex h-full flex-col rounded-[1.75rem] bg-[var(--card)]/80 p-7 shadow-[0_14px_50px_rgb(31_20_23_/_5%)] transition duration-300 hover:shadow-[0_25px_65px_rgb(31_20_23_/_10%)] sm:p-8"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-[family-name:var(--font-dc-mono)] text-[10px] text-[var(--primary)]">{product.number}</span>
                    <ArrowUpRight className="h-5 w-5 text-[var(--primary)] transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </div>
                  <p className="mt-12 font-[family-name:var(--font-dc-mono)] text-[9px] uppercase tracking-[0.2em] text-[var(--muted-foreground)]">{product.eyebrow}</p>
                  <h3 className="mt-3 font-[family-name:var(--font-dc-heading)] text-2xl leading-snug">{product.title}</h3>
                  <p className="mt-4 flex-1 text-sm leading-7 text-[var(--muted-foreground)]">{product.description}</p>
                  <span className="mt-8 text-xs font-semibold text-[var(--primary)]">Explore</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="pb-24 sm:pb-32">
          <motion.div
            {...reveal}
            className="overflow-hidden rounded-[2.25rem] bg-[var(--primary)] px-7 py-12 text-[var(--primary-foreground)] shadow-[0_25px_80px_rgb(31_20_23_/_12%)] sm:px-12 sm:py-16 lg:flex lg:items-end lg:justify-between"
          >
            <div>
              <p className="font-[family-name:var(--font-dc-mono)] text-[10px] uppercase tracking-[0.25em] opacity-70">DC Organizer</p>
              <h2 className="mt-4 max-w-2xl font-[family-name:var(--font-dc-heading)] text-4xl leading-tight sm:text-5xl">Your best consultant for wedding & event.</h2>
            </div>
            <Link href="/register" className="mt-8 inline-flex min-h-12 shrink-0 items-center gap-3 rounded-full bg-[var(--primary-foreground)] px-6 text-sm font-semibold text-[var(--primary)] transition hover:-translate-y-1 lg:mt-0">
              Buat workspace
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
