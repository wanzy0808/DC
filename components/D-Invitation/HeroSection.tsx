"use client";

import Link from "next/link";
import { ArrowUpRight, CalendarDays, Clock3, Heart, MapPin } from "lucide-react";
import { GlowButton } from "@/components/ui/glow-button";
import { useLanguage } from "@/components/I18n/LanguageProvider";

export default function HeroSection() {
  const { locale } = useLanguage();
  const copy = locale === "en" ? {
    eyebrow: "Digital Invitation",
    title: "More than an invitation.",
    accent: "Begin your story beautifully.",
    description: "Share your good news with a digital invitation that feels personal—beautiful to open, easy to share, and designed to make the journey to your big day feel lighter.",
    explore: "Explore collection",
    tags: ["Personal", "Easy RSVP", "Ready for the big day"],
    couple: "Vidi & Hening",
    date: "Saturday, 18 October 2026",
    venue: "The Garden, Jakarta",
    greeting: "Together with our families",
    invitation: "We invite you to celebrate our wedding day",
    countdown: "Our special day",
    rsvp: "RSVP",
  } : {
    eyebrow: "Undangan Digital",
    title: "Bukan hanya sekedar undangan.",
    accent: "Awali ceritamu dengan keindahan.",
    description: "Hadirkan kabar bahagia dengan undangan digital yang terasa personal—indah saat dibuka, mudah dibagikan, dan dirancang untuk membuat perjalanan menuju hari besar terasa lebih ringan.",
    explore: "Lihat Template",
    tags: ["Personal", "Easy RSVP", "Ready for the big day"],
    couple: "Vidi & Hening",
    date: "Sabtu, 18 Oktober 2026",
    venue: "The Garden, Jakarta",
    greeting: "Dengan penuh kebahagiaan bersama keluarga",
    invitation: "Kami mengundangmu untuk merayakan hari pernikahan kami",
    countdown: "Hari istimewa kami",
    rsvp: "RSVP",
  };

  return (
    <section className="grid items-center gap-14 border-b border-border/70 pb-20 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16 lg:pb-24">
      <div className="max-w-2xl">
        <p className="font-[family-name:var(--font-dc-mono)] text-[10px] uppercase tracking-[0.28em] text-primary">{copy.eyebrow}</p>
        <h1 className="mt-6 max-w-xl font-[family-name:var(--font-dc-heading)] text-5xl font-normal leading-[1.02] tracking-[-0.045em] text-primary md:text-7xl">
          {copy.title}<span className="mt-2 block text-foreground">{copy.accent}</span>
        </h1>
        <p className="mt-7 max-w-xl text-base leading-8 text-foreground/70 md:text-lg">{copy.description}</p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <GlowButton asChild>
            <Link href="/template-design" className="gap-2">{copy.explore}<ArrowUpRight className="h-4 w-4" /></Link>
          </GlowButton>
        </div>
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 font-[family-name:var(--font-dc-mono)] text-[9px] uppercase tracking-[0.14em] text-foreground/55">
          {copy.tags.map((tag) => <span key={tag}>{tag}</span>)}
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-xl lg:pr-4">
        <div className="absolute -right-8 top-12 h-48 w-48 rounded-full bg-primary/6 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto w-[min(100%,430px)]">
          <div className="relative aspect-[0.68] overflow-visible rounded-[42px] bg-gradient-to-br from-[#f8f8f8] via-[#a9a9aa] to-[#303032] p-[3px] shadow-[0_34px_70px_rgba(17,17,17,0.2),inset_0_1px_0_rgba(255,255,255,0.9)] dark:from-[#e4e4e4] dark:via-[#77777a] dark:to-[#121214]">
            <div className="absolute -right-[4px] top-[24%] h-16 w-[4px] rounded-r-full bg-[#4a4a4c] shadow-[inset_1px_0_1px_rgba(255,255,255,0.28)] dark:bg-[#8b8b8e]" aria-hidden="true" />
            <div className="absolute -left-[4px] top-[21%] h-9 w-[4px] rounded-l-full bg-[#4a4a4c] shadow-[inset_-1px_0_1px_rgba(255,255,255,0.28)] dark:bg-[#8b8b8e]" aria-hidden="true" />
            <div className="absolute -left-[4px] top-[31%] h-14 w-[4px] rounded-l-full bg-[#4a4a4c] shadow-[inset_-1px_0_1px_rgba(255,255,255,0.28)] dark:bg-[#8b8b8e]" aria-hidden="true" />
            <div className="absolute -left-[4px] top-[43%] h-14 w-[4px] rounded-l-full bg-[#4a4a4c] shadow-[inset_-1px_0_1px_rgba(255,255,255,0.28)] dark:bg-[#8b8b8e]" aria-hidden="true" />

            <div className="relative h-full overflow-hidden rounded-[39px] border border-black/70 bg-[#080808] p-[7px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.16),inset_0_0_16px_rgba(0,0,0,0.95)] dark:border-white/20">
              <div className="absolute inset-[7px] z-20 rounded-[33px] border border-white/10 pointer-events-none" aria-hidden="true" />
              <div className="relative h-full overflow-hidden rounded-[32px] bg-[#f8f4f1] dark:bg-[#111111] shadow-[inset_0_0_18px_rgba(0,0,0,0.18)]">
                <div className="absolute left-1/2 top-2.5 z-30 h-7 w-[34%] -translate-x-1/2 rounded-full bg-black shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_1px_4px_rgba(0,0,0,0.4)]" aria-hidden="true">
                  <div className="absolute right-2 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-[#151515] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]" />
                </div>
                <div className="invitation-phone-scroll absolute inset-x-0 top-0 w-full">
                  <article className="min-h-full bg-[#f8f4f1] px-7 pb-16 pt-12 text-[#2a2220] dark:bg-[#111111] dark:text-white">
                    <div className="mx-auto max-w-[250px] text-center">
                      <p className="font-[family-name:var(--font-dc-mono)] text-[7px] uppercase tracking-[0.28em] text-[#8b5d62] dark:text-primary">{copy.greeting}</p>
                      <div className="mx-auto mt-8 flex h-14 w-14 items-center justify-center rounded-full border border-[#b78b8f]/50">
                        <Heart className="h-5 w-5 text-[#a55d66] dark:text-primary" strokeWidth={1.5} />
                      </div>
                      <p className="mt-8 font-[family-name:var(--font-dc-heading)] text-[12px] leading-5 text-[#72555a] dark:text-white/70">{copy.invitation}</p>
                      <h2 className="mt-5 font-[family-name:var(--font-dc-heading)] text-[38px] font-normal leading-[0.95] tracking-[-0.05em] text-[#3b2a2c] dark:text-white">{copy.couple}</h2>
                      <div className="mx-auto my-8 h-px w-12 bg-[#a55d66]/40 dark:bg-primary/50" />
                      <p className="font-[family-name:var(--font-dc-heading)] text-[20px] italic text-[#76565b] dark:text-white/80">The beginning of forever</p>
                    </div>

                    <div className="mx-auto mt-12 aspect-[4/3] max-w-[290px] overflow-hidden rounded-[24px] bg-gradient-to-br from-[#d7c0b9] via-[#eee2dc] to-[#b58c8c] p-4 shadow-sm">
                      <div className="flex h-full items-end rounded-[18px] border border-white/40 bg-white/15 p-5 backdrop-blur-sm">
                        <p className="font-[family-name:var(--font-dc-heading)] text-2xl italic text-white">Our day</p>
                      </div>
                    </div>

                    <div className="mx-auto mt-12 max-w-[290px] space-y-5 border-y border-[#b78b8f]/30 py-8">
                      <div className="flex items-start gap-3">
                        <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-[#a55d66] dark:text-primary" />
                        <div><p className="font-[family-name:var(--font-dc-mono)] text-[7px] uppercase tracking-[0.2em] opacity-55">Date</p><p className="mt-1 text-[12px]">{copy.date}</p></div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-[#a55d66] dark:text-primary" />
                        <div><p className="font-[family-name:var(--font-dc-mono)] text-[7px] uppercase tracking-[0.2em] opacity-55">Time</p><p className="mt-1 text-[12px]">16:00 WIB — selesai</p></div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#a55d66] dark:text-primary" />
                        <div><p className="font-[family-name:var(--font-dc-mono)] text-[7px] uppercase tracking-[0.2em] opacity-55">Venue</p><p className="mt-1 text-[12px]">{copy.venue}</p></div>
                      </div>
                    </div>

                    <div className="mx-auto mt-12 max-w-[290px] rounded-[22px] bg-[#eee3df] px-6 py-8 text-center dark:bg-white/6">
                      <p className="font-[family-name:var(--font-dc-mono)] text-[7px] uppercase tracking-[0.22em] text-[#8b5d62] dark:text-primary">{copy.countdown}</p>
                      <div className="mt-5 grid grid-cols-3 gap-2">
                        {[["120", "days"], ["08", "hours"], ["42", "mins"]].map(([value, label]) => <div key={label} className="rounded-xl border border-[#b78b8f]/25 px-2 py-3"><p className="font-[family-name:var(--font-dc-heading)] text-xl">{value}</p><p className="mt-1 font-[family-name:var(--font-dc-mono)] text-[6px] uppercase tracking-widest opacity-50">{label}</p></div>)}
                      </div>
                    </div>

                    <div className="mx-auto mt-12 max-w-[290px] text-center">
                      <p className="font-[family-name:var(--font-dc-heading)] text-xl">We would love to see you</p>
                      <div className="mt-5 inline-flex rounded-full bg-[#a55d66] px-6 py-3 font-[family-name:var(--font-dc-mono)] text-[8px] uppercase tracking-[0.2em] text-white dark:bg-primary dark:text-primary-foreground">{copy.rsvp}</div>
                      <p className="mt-8 font-[family-name:var(--font-dc-heading)] text-lg italic opacity-70">With love, Vidi & Hening</p>
                    </div>
                  </article>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .invitation-phone-scroll {
          animation: invitation-phone-scroll 18s ease-in-out infinite;
          will-change: transform;
        }

        @keyframes invitation-phone-scroll {
          0%, 12% { transform: translateY(0); }
          44%, 56% { transform: translateY(-38%); }
          88%, 100% { transform: translateY(0); }
        }

        @media (prefers-reduced-motion: reduce) {
          .invitation-phone-scroll {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}
