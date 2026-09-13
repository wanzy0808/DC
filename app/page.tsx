"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, CalendarHeart, Check, LayoutTemplate, UsersRound } from "lucide-react";
import RomanticBackground from "@/components/Layout/background";

const products = [
  {
    number: "01",
    icon: CalendarHeart,
    eyebrow: "Wedding Planning",
    title: "Rencanakan hari besar tanpa kehilangan kendali.",
    description: "Rundown, detail acara, vendor, dan koordinasi dalam satu alur kerja yang lebih tenang.",
    href: "/wedding-planner",
  },
  {
    number: "02",
    icon: LayoutTemplate,
    eyebrow: "Digital Invitation",
    title: "Undangan yang terasa personal, bukan sekadar link.",
    description: "Desain elegan, RSVP realtime, galeri, maps, dan pengalaman tamu yang terhubung.",
    href: "/d-invitation",
  },
  {
    number: "03",
    icon: UsersRound,
    eyebrow: "Guest Management",
    title: "Dari RSVP sampai kursi, semuanya terlihat jelas.",
    description: "Kelola roster, seating, QR ticket, dan check-in dari data yang sama.",
    href: "/guestbook",
  },
];

const ease = [0.22, 1, 0.36, 1] as const;

export default function Home() {
  const reduced = useReducedMotion();
  const reveal = reduced ? {} : { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-60px" }, transition: { duration: 0.55, ease } };

  return (
    <div className="public-page relative overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      <RomanticBackground />
      <main className="relative z-10 mx-auto w-[90vw] max-w-[1320px]">
        <section className="grid min-h-[calc(100svh-88px)] items-center gap-12 py-14 lg:grid-cols-[1.08fr_.92fr] lg:gap-20 lg:py-20">
          <div>
            <motion.div {...(reduced ? {} : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.55, ease } })}>
              <p className="font-[family-name:var(--font-dc-mono)] text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--primary)]">DC Organizer / Wedding Operating System</p>
              <h1 className="mt-7 max-w-4xl font-[family-name:var(--font-dc-heading)] text-5xl leading-[1.02] tracking-[-0.035em] sm:text-6xl lg:text-7xl">
                Hari besar yang <span className="text-[var(--primary)]">indah</span> dimulai dari sistem yang tenang.
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-8 text-[color:var(--muted-foreground)] sm:text-lg">
                DC Organizer menyatukan undangan digital, RSVP, data tamu, seating, hingga check-in. Satu sumber data untuk membuat persiapan terasa lebih ringan.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link href="/d-invitation" className="group inline-flex min-h-12 items-center gap-3 rounded-full bg-[var(--primary)] px-6 text-sm font-semibold text-[var(--primary-foreground)] shadow-[0_16px_40px_color-mix(in_srgb,var(--primary)_22%,transparent)] transition hover:-translate-y-0.5 hover:bg-[var(--dc-rose-wood-dark)]">
                  Mulai dari undangan <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
                <Link href="/packages" className="inline-flex min-h-12 items-center rounded-full border border-[color-mix(in_srgb,var(--primary)_22%,var(--border))] bg-[color-mix(in_srgb,var(--background)_72%,transparent)] px-6 text-sm font-semibold transition hover:-translate-y-0.5 hover:bg-[var(--muted)]">
                  Lihat paket
                </Link>
              </div>
              <div className="mt-9 flex flex-wrap gap-x-6 gap-y-2 font-[family-name:var(--font-dc-mono)] text-[10px] uppercase tracking-[0.13em] text-[color:var(--muted-foreground)]">
                {["Database-first", "Realtime RSVP", "Guest management"].map((item) => <span key={item} className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-[var(--primary)]" />{item}</span>)}
              </div>
            </motion.div>
          </div>

          <motion.div className="relative" {...(reduced ? {} : { initial: { opacity: 0, scale: 0.96, y: 18 }, animate: { opacity: 1, scale: 1, y: 0 }, transition: { duration: 0.8, delay: 0.12, ease } })}>
            <div className="relative overflow-hidden rounded-[2rem] border border-[color-mix(in_srgb,var(--primary)_16%,var(--border))] bg-[color-mix(in_srgb,var(--card)_72%,transparent)] p-5 shadow-[0_30px_100px_rgb(31_20_23_/_10%)] backdrop-blur-xl sm:p-7">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[var(--secondary)]/25 blur-3xl" />
              <div className="relative">
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-5">
                  <div><p className="font-[family-name:var(--font-dc-mono)] text-[9px] uppercase tracking-[0.2em] text-[var(--muted-foreground)]">Workspace Preview</p><p className="mt-1 font-[family-name:var(--font-dc-heading)] text-xl">Your Wedding, organized.</p></div>
                  <span className="rounded-full bg-[var(--secondary)]/60 px-3 py-1 font-[family-name:var(--font-dc-mono)] text-[9px] uppercase tracking-wider text-[var(--primary)]">Live</span>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {["Undangan Digital", "RSVP", "Manajemen Tamu", "Seating Chart"].map((item, index) => (
                    <motion.div key={item} whileHover={reduced ? undefined : { y: -4 }} transition={{ type: "spring", stiffness: 400, damping: 25 }} className="rounded-2xl border border-[var(--border)] bg-[var(--background)]/70 p-4">
                      <span className="font-[family-name:var(--font-dc-mono)] text-[9px] text-[var(--primary)]">0{index + 1}</span>
                      <p className="mt-6 font-[family-name:var(--font-dc-heading)] text-sm">{item}</p>
                      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[var(--muted)]"><div className="h-full rounded-full bg-[var(--primary)]" style={{ width: `${68 + index * 7}%` }} /></div>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-3 rounded-2xl border border-[var(--border)] bg-[var(--primary)] p-5 text-[var(--primary-foreground)]">
                  <p className="font-[family-name:var(--font-dc-mono)] text-[9px] uppercase tracking-[0.18em] opacity-70">One source of truth</p>
                  <p className="mt-2 max-w-sm font-[family-name:var(--font-dc-heading)] text-lg">Data pasangan, acara, dan tamu tetap sinkron di seluruh workspace.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="border-t border-[var(--border)] py-20 sm:py-24">
          <motion.div {...reveal}>
            <p className="font-[family-name:var(--font-dc-mono)] text-[10px] uppercase tracking-[0.25em] text-[var(--primary)]">Three connected layers</p>
            <div className="mt-4 flex flex-col justify-between gap-6 lg:flex-row lg:items-end"><h2 className="max-w-3xl font-[family-name:var(--font-dc-heading)] text-4xl leading-tight sm:text-5xl">Bukan hanya membuat undangan. <span className="text-[var(--muted-foreground)]">Kami menghubungkan seluruh pengalaman tamu.</span></h2><p className="max-w-sm text-sm leading-7 text-[var(--muted-foreground)]">Mulai dari halaman pertama yang dilihat tamu sampai kursi yang mereka tempati di venue.</p></div>
          </motion.div>
          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {products.map((product, index) => {
              const Icon = product.icon;
              return <motion.div key={product.number} {...reveal} transition={{ duration: 0.55, delay: index * 0.08, ease }} whileHover={reduced ? undefined : { y: -4 }}>
                <Link href={product.href} className="group flex h-full flex-col rounded-[1.5rem] border border-[var(--border)] bg-[var(--card)]/60 p-6 transition hover:border-[color-mix(in_srgb,var(--primary)_28%,var(--border))] hover:shadow-[0_22px_55px_rgb(31_20_23_/_8%)] sm:p-7">
                  <div className="flex items-center justify-between"><span className="font-[family-name:var(--font-dc-mono)] text-[10px] text-[var(--primary)]">{product.number}</span><Icon className="h-5 w-5 text-[var(--primary)]" /></div>
                  <p className="mt-12 font-[family-name:var(--font-dc-mono)] text-[9px] uppercase tracking-[0.2em] text-[var(--muted-foreground)]">{product.eyebrow}</p>
                  <h3 className="mt-3 font-[family-name:var(--font-dc-heading)] text-2xl leading-snug">{product.title}</h3>
                  <p className="mt-4 flex-1 text-sm leading-7 text-[var(--muted-foreground)]">{product.description}</p>
                  <span className="mt-8 inline-flex items-center gap-2 text-xs font-semibold text-[var(--primary)]">Explore <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></span>
                </Link>
              </motion.div>;
            })}
          </div>
        </section>

        <section className="pb-24 sm:pb-32">
          <motion.div {...reveal} className="overflow-hidden rounded-[2rem] bg-[var(--primary)] px-7 py-12 text-[var(--primary-foreground)] sm:px-12 sm:py-16 lg:flex lg:items-end lg:justify-between">
            <div><p className="font-[family-name:var(--font-dc-mono)] text-[10px] uppercase tracking-[0.25em] opacity-70">Ready when you are</p><h2 className="mt-4 max-w-2xl font-[family-name:var(--font-dc-heading)] text-4xl leading-tight sm:text-5xl">Mari buat persiapan pernikahan terasa lebih sederhana.</h2></div>
            <Link href="/register" className="mt-8 inline-flex min-h-12 shrink-0 items-center gap-3 rounded-full bg-[var(--primary-foreground)] px-6 text-sm font-semibold text-[var(--primary)] transition hover:-translate-y-0.5 lg:mt-0">Buat workspace <ArrowUpRight className="h-4 w-4" /></Link>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
