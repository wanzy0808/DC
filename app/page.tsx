"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, CalendarHeart, Check, LayoutTemplate, UsersRound } from "lucide-react";
import RomanticBackground from "@/components/Layout/background";

const products = [
  { number: "01", icon: CalendarHeart, eyebrow: "Wedding Planning", title: "Rencanakan hari besar tanpa kehilangan kendali.", description: "Rundown, detail acara, vendor, dan koordinasi dalam satu alur kerja yang lebih tenang.", href: "/wedding-planner" },
  { number: "02", icon: LayoutTemplate, eyebrow: "Digital Invitation", title: "Undangan yang terasa personal, bukan sekadar link.", description: "Desain elegan, RSVP realtime, galeri, maps, dan pengalaman tamu yang terhubung.", href: "/d-invitation" },
  { number: "03", icon: UsersRound, eyebrow: "Guest Management", title: "Dari RSVP sampai kursi, semuanya terlihat jelas.", description: "Kelola roster, seating, QR ticket, dan check-in dari data yang sama.", href: "/guestbook" },
];

const ease = [0.22, 1, 0.36, 1] as const;

export default function Home() {
  const reduced = useReducedMotion();
  const reveal = reduced ? {} : { initial: { opacity: 0, y: 28 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-80px" }, transition: { duration: 0.65, ease } };

  return (
    <div className="public-page relative min-h-[calc(100svh-88px)] overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      <RomanticBackground />
      <main className="relative z-10 mx-auto w-[92vw] max-w-[1400px]">
        <section className="grid min-h-[calc(100svh-88px)] items-center gap-12 py-14 lg:grid-cols-[1.05fr_.95fr] lg:gap-24 lg:py-20">
          <motion.div {...(reduced ? {} : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, ease } })}>
            <p className="font-[family-name:var(--font-dc-mono)] text-[10px] uppercase tracking-[0.3em] text-[var(--primary)]">DC Organizer / Wedding & Event</p>
            <h1 className="mt-7 max-w-5xl font-[family-name:var(--font-dc-heading)] text-5xl leading-[1.02] tracking-[-0.04em] sm:text-6xl lg:text-[5.25rem]">Your best consultant for <span className="text-[var(--primary)]">wedding & event.</span></h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-[var(--muted-foreground)] sm:text-lg">Satu tempat untuk merencanakan, mengelola, dan menghadirkan pengalaman acara yang lebih terarah — dari persiapan sampai tamu pulang.</p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/d-invitation" className="group inline-flex min-h-12 items-center gap-3 rounded-full bg-[var(--primary)] px-6 text-sm font-semibold text-[var(--primary-foreground)] shadow-[0_18px_50px_color-mix(in_srgb,var(--primary)_22%,transparent)] transition duration-300 hover:-translate-y-1 hover:bg-[var(--dc-rose-wood-dark)]">Mulai eksplorasi <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></Link>
              <Link href="/packages" className="inline-flex min-h-12 items-center rounded-full bg-[var(--secondary)] px-6 text-sm font-semibold text-[var(--foreground)] transition duration-300 hover:-translate-y-1 hover:bg-[var(--muted)]">Lihat layanan</Link>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-2 font-[family-name:var(--font-dc-mono)] text-[10px] uppercase tracking-[0.13em] text-[var(--muted-foreground)]">{["Database-first", "Realtime RSVP", "Guest management"].map((item) => <span key={item} className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-[var(--primary)]" />{item}</span>)}</div>
          </motion.div>

          <motion.div className="relative" {...(reduced ? {} : { initial: { opacity: 0, scale: 0.95, y: 24 }, animate: { opacity: 1, scale: 1, y: 0 }, transition: { duration: 0.85, delay: 0.15, ease } })}>
            <motion.div animate={reduced ? undefined : { y: [0, -10, 0], rotate: [0, 0.4, 0] }} transition={reduced ? undefined : { duration: 7, repeat: Infinity, ease: "easeInOut" }} className="relative overflow-hidden rounded-[2.5rem] bg-[var(--card)]/75 p-5 shadow-[0_35px_100px_rgb(31_20_23_/_12%)] backdrop-blur-xl sm:p-7">
              <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[var(--secondary)]/40 blur-3xl" />
              <div className="relative">
                <div className="flex items-center justify-between pb-5"><div><p className="font-[family-name:var(--font-dc-mono)] text-[9px] uppercase tracking-[0.2em] text-[var(--muted-foreground)]">Your Event Workspace</p><p className="mt-1 font-[family-name:var(--font-dc-heading)] text-xl">Everything in one place.</p></div><span className="rounded-full bg-[var(--secondary)] px-3 py-1 font-[family-name:var(--font-dc-mono)] text-[9px] uppercase tracking-wider text-[var(--primary)]">Live</span></div>
                <div className="grid gap-3 sm:grid-cols-2">{["Undangan Digital", "RSVP & Tamu", "Seating Chart", "Event Planning"].map((item, index) => <motion.div key={item} whileHover={reduced ? undefined : { y: -5, scale: 1.01 }} className="rounded-2xl bg-[var(--background)]/75 p-5 shadow-sm transition-shadow hover:shadow-md"><span className="font-[family-name:var(--font-dc-mono)] text-[9px] text-[var(--primary)]">0{index + 1}</span><p className="mt-7 font-[family-name:var(--font-dc-heading)] text-sm">{item}</p><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[var(--muted)]"><motion.div initial={reduced ? false : { width: 0 }} animate={{ width: `${68 + index * 7}%` }} transition={{ duration: 0.9, delay: 0.4 + index * 0.08 }} className="h-full rounded-full bg-[var(--primary)]" /></div></motion.div>)}</div>
                <div className="mt-3 rounded-2xl bg-[var(--primary)] p-5 text-[var(--primary-foreground)]"><p className="font-[family-name:var(--font-dc-mono)] text-[9px] uppercase tracking-[0.18em] opacity-70">One source of truth</p><p className="mt-2 max-w-sm font-[family-name:var(--font-dc-heading)] text-lg">Data pasangan, acara, dan tamu tetap sinkron di seluruh workspace.</p></div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        <section className="py-24 sm:py-32">
          <motion.div {...reveal}><p className="font-[family-name:var(--font-dc-mono)] text-[10px] uppercase tracking-[0.25em] text-[var(--primary)]">One platform, many moments</p><div className="mt-4 flex flex-col justify-between gap-6 lg:flex-row lg:items-end"><h2 className="max-w-3xl font-[family-name:var(--font-dc-heading)] text-4xl leading-tight sm:text-5xl">Bukan sekadar tools. <span className="text-[var(--muted-foreground)]">Partner digital untuk seluruh perjalanan acara.</span></h2><p className="max-w-sm text-sm leading-7 text-[var(--muted-foreground)]">Pindah dari satu layanan ke layanan lain tanpa kehilangan konteks dan data.</p></div></motion.div>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">{products.map((product, index) => { const Icon = product.icon; return <motion.div key={product.number} {...reveal} transition={{ duration: 0.6, delay: index * 0.09, ease }} whileHover={reduced ? undefined : { y: -7 }}><Link href={product.href} className="group flex h-full flex-col rounded-[1.75rem] bg-[var(--card)]/65 p-7 shadow-[0_14px_50px_rgb(31_20_23_/_5%)] transition duration-300 hover:shadow-[0_25px_65px_rgb(31_20_23_/_10%)] sm:p-8"><div className="flex items-center justify-between"><span className="font-[family-name:var(--font-dc-mono)] text-[10px] text-[var(--primary)]">{product.number}</span><Icon className="h-5 w-5 text-[var(--primary)]" /></div><p className="mt-12 font-[family-name:var(--font-dc-mono)] text-[9px] uppercase tracking-[0.2em] text-[var(--muted-foreground)]">{product.eyebrow}</p><h3 className="mt-3 font-[family-name:var(--font-dc-heading)] text-2xl leading-snug">{product.title}</h3><p className="mt-4 flex-1 text-sm leading-7 text-[var(--muted-foreground)]">{product.description}</p><span className="mt-8 inline-flex items-center gap-2 text-xs font-semibold text-[var(--primary)]">Explore <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></span></Link></motion.div>; })}</div>
        </section>

        <section className="pb-24 sm:pb-32"><motion.div {...reveal} className="overflow-hidden rounded-[2.25rem] bg-[var(--primary)] px-7 py-12 text-[var(--primary-foreground)] shadow-[0_25px_80px_rgb(31_20_23_/_12%)] sm:px-12 sm:py-16 lg:flex lg:items-end lg:justify-between"><div><p className="font-[family-name:var(--font-dc-mono)] text-[10px] uppercase tracking-[0.25em] opacity-70">DC Organizer</p><h2 className="mt-4 max-w-2xl font-[family-name:var(--font-dc-heading)] text-4xl leading-tight sm:text-5xl">Your best consultant for wedding & event.</h2></div><Link href="/register" className="mt-8 inline-flex min-h-12 shrink-0 items-center gap-3 rounded-full bg-[var(--primary-foreground)] px-6 text-sm font-semibold text-[var(--primary)] transition hover:-translate-y-1 lg:mt-0">Buat workspace <ArrowUpRight className="h-4 w-4" /></Link></motion.div></section>
      </main>
    </div>
  );
}
