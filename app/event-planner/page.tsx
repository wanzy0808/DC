"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  Check,
  MessageCircle,
  Quote,
} from "lucide-react";
import Navbar from "@/components/Layout/Navbar/Navbar";
import PublicMarketingAtmosphere from "@/components/Layout/PublicMarketingAtmosphere";
import MarketingFrameFooter from "@/components/Layout/MarketingFrameFooter";
import MarketingTextReveal from "@/components/DigitalInvitation/MarketingTextReveal";
import ScrollReveal from "@/components/EventPlanner/ScrollReveal";
import FounderSection from "@/components/EventPlanner/FounderSection";
import ServicesSection from "@/components/EventPlanner/ServicesSection";
import PortfolioSection from "@/components/EventPlanner/PortfolioSection";
import FaqSection from "@/components/Marketing/FaqSection";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/I18n/LanguageProvider";
import {
  plannerFaq,
  plannerPackages,
  plannerReviews,
} from "@/data/services/event-planner";

const WHATSAPP_NUMBER = "6282124786516";

function consultationUrl(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

const plannerScope = [
  "Konsep & budget",
  "Vendor & venue",
  "Rundown & crew",
  "Guest flow",
];

export default function EventPlannerPage() {
  const { locale } = useLanguage();
  const scrollRoot = useRef<HTMLElement>(null);

  return (
    <div className="relative isolate flex min-h-dvh w-full flex-col overflow-hidden bg-background text-foreground">
      <PublicMarketingAtmosphere />

      <div data-undara-marketing-frame className="undara-marketing-frame">
        <div className="undara-marketing-frame-header">
          <Navbar embedded />
        </div>

        <main
          ref={scrollRoot}
          tabIndex={0}
          aria-label={locale === "en" ? "Event planner page content" : "Konten halaman Event Planner"}
          className="undara-marketing-scroll focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-primary"
        >
          <MarketingTextReveal
            className="mx-auto flex w-[90%] max-w-[1180px] flex-col gap-24 py-10 sm:w-[84vw] md:gap-32 md:py-16"
            scrollRoot={scrollRoot}
            ready
            locale={locale}
          >
            <ScrollReveal scrollRoot={scrollRoot}>
              <section className="relative grid min-h-[620px] items-center gap-10 border-b border-primary/25 pb-14 lg:grid-cols-[0.92fr_1.08fr] lg:gap-14 lg:pb-20">
                <div className="relative z-10 py-4 lg:py-10">
                  <p className="font-[family-name:var(--font-undara-mono)] text-[10px] font-semibold uppercase tracking-[0.24em] text-primary md:text-xs">
                    Event planning · coordination · execution
                  </p>

                  <h1 className="mt-5 max-w-[12ch] font-[family-name:var(--font-undara-heading)] text-[clamp(3rem,6.8vw,6.75rem)] leading-[0.92] tracking-[-0.035em] text-primary">
                    Kamu hadir di momenmu.
                    <span className="block text-foreground">Kami jaga alurnya.</span>
                  </h1>

                  <p className="mt-7 max-w-xl font-[family-name:var(--font-undara-body)] text-sm leading-7 text-muted-foreground md:text-base md:leading-8">
                    Dari keputusan pertama sampai cue terakhir, Undara merapikan konsep, vendor,
                    rundown, crew, dan guest flow supaya kamu tidak perlu menjadi operator di
                    acaramu sendiri.
                  </p>

                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <Button asChild size="lg">
                      <a
                        href={consultationUrl("Halo, aku ingin konsultasi Event Planner Undara.")}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Ceritakan Acaramu
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button asChild size="lg" variant="outline">
                      <a href="#cara-kerja">
                        Cara Kami Bekerja
                        <ArrowDownRight className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>

                  <div className="mt-10 grid max-w-xl grid-cols-2 gap-x-6 gap-y-3 border-t border-primary/20 pt-5 sm:grid-cols-4">
                    {plannerScope.map((item) => (
                      <p
                        key={item}
                        className="font-[family-name:var(--font-undara-mono)] text-[9px] uppercase tracking-[0.14em] text-muted-foreground"
                      >
                        {item}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="relative min-h-[460px] lg:min-h-[620px]">
                  <div className="absolute inset-[4%_0_0_8%] overflow-hidden rounded-[42px_8px_42px_8px] border border-primary/25 bg-card shadow-[0_30px_90px_rgba(70,42,32,0.14)]">
                    <Image
                      src="/assets/marketing/event-planner/hero.webp"
                      alt="Tim Event Planner Undara mengoordinasikan jalannya acara"
                      fill
                      priority
                      sizes="(max-width: 1024px) 90vw, 52vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(24,16,12,0.72)_0%,rgba(24,16,12,0.08)_42%,transparent_68%)]" />
                    <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4 text-white md:bottom-8 md:left-8 md:right-8">
                      <div>
                        <p className="font-[family-name:var(--font-undara-mono)] text-[9px] uppercase tracking-[0.2em] text-white/70">
                          Behind every calm celebration
                        </p>
                        <p className="mt-2 max-w-sm font-[family-name:var(--font-undara-heading)] text-2xl leading-tight md:text-3xl">
                          Ada tim yang menjaga detail tetap bergerak.
                        </p>
                      </div>
                      <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/35 bg-black/10 backdrop-blur-sm sm:flex">
                        <ArrowDownRight className="h-5 w-5" />
                      </span>
                    </div>
                  </div>

                  <div className="absolute left-0 top-[18%] hidden -rotate-90 origin-left font-[family-name:var(--font-undara-mono)] text-[9px] uppercase tracking-[0.32em] text-primary/70 lg:block">
                    Plan / Coordinate / Execute
                  </div>
                </div>
              </section>
            </ScrollReveal>

            <ScrollReveal scrollRoot={scrollRoot}>
              <FounderSection />
            </ScrollReveal>

            <ScrollReveal scrollRoot={scrollRoot}>
              <div id="cara-kerja" className="scroll-mt-24">
                <ServicesSection />
              </div>
            </ScrollReveal>

            <ScrollReveal scrollRoot={scrollRoot}>
              <PortfolioSection />
            </ScrollReveal>

            <ScrollReveal scrollRoot={scrollRoot}>
              <section className="grid gap-10 border-y border-primary/25 py-12 lg:grid-cols-[0.78fr_1.22fr] lg:gap-16 lg:py-16">
                <div className="lg:sticky lg:top-8 lg:self-start">
                  <p className="font-[family-name:var(--font-undara-mono)] text-[10px] uppercase tracking-[0.22em] text-primary">
                    Undara digital workflow
                  </p>
                  <h2 className="mt-4 max-w-[12ch] font-[family-name:var(--font-undara-heading)] text-4xl leading-[1.02] text-primary md:text-5xl">
                    Planning dan data tamu, dalam satu alur.
                  </h2>
                </div>

                <div className="flex flex-col justify-between gap-8">
                  <p className="max-w-2xl font-[family-name:var(--font-undara-body)] text-sm leading-7 text-muted-foreground md:text-base md:leading-8">
                    Bila dibutuhkan, acara dapat terhubung dengan Undangan Digital Undara untuk
                    publikasi, RSVP, dan manajemen tamu. Tim planner tetap fokus pada keputusan
                    dan eksekusi; data digital membantu operasional tetap rapi.
                  </p>
                  <Button asChild variant="outline" className="w-fit">
                    <Link href="/d-invitation">
                      Lihat Undangan Digital
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </section>
            </ScrollReveal>

            <ScrollReveal scrollRoot={scrollRoot}>
              <section className="space-y-10" aria-labelledby="event-planner-packages">
                <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
                  <div>
                    <p className="font-[family-name:var(--font-undara-mono)] text-[10px] uppercase tracking-[0.22em] text-primary">
                      Service scope
                    </p>
                    <h2
                      id="event-planner-packages"
                      className="mt-3 font-[family-name:var(--font-undara-heading)] text-4xl leading-tight text-primary md:text-5xl"
                    >
                      Pilih titik mulai yang paling dekat dengan kebutuhanmu.
                    </h2>
                  </div>
                  <p className="max-w-2xl font-[family-name:var(--font-undara-body)] text-sm leading-7 text-muted-foreground lg:justify-self-end md:text-base">
                    Tidak ada harga generik yang dipaksakan ke semua acara. Venue, jumlah tamu,
                    kebutuhan crew, vendor, dan scope dibicarakan lebih dulu sebelum penawaran.
                  </p>
                </div>

                <div className="border-t border-primary/30">
                  {plannerPackages.map((item) => (
                    <article
                      key={item.key}
                      className="group grid gap-6 border-b border-primary/25 py-8 transition-colors md:grid-cols-[0.72fr_1fr_auto] md:items-start md:gap-8 md:py-10"
                    >
                      <div>
                        <p className="font-[family-name:var(--font-undara-mono)] text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                          Event service
                        </p>
                        <h3 className="mt-2 font-[family-name:var(--font-undara-heading)] text-2xl leading-tight text-primary md:text-3xl">
                          {item.name}
                        </h3>
                        <p className="mt-3 max-w-sm text-sm leading-7 text-muted-foreground">
                          {item.description}
                        </p>
                      </div>

                      <ul className="grid gap-3 sm:grid-cols-2">
                        {item.features.map((feature) => (
                          <li
                            key={feature}
                            className="flex gap-3 text-sm leading-6 text-foreground/85"
                          >
                            <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-primary" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Button asChild variant="outline" size="sm" className="w-fit md:mt-1">
                        <a
                          href={consultationUrl(item.waMessage)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Konsultasi
                          <ArrowRight className="h-4 w-4" />
                        </a>
                      </Button>
                    </article>
                  ))}
                </div>

                <p className="font-[family-name:var(--font-undara-mono)] text-[10px] text-muted-foreground">
                  WhatsApp konsultasi · +62 821-2478-6516
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal scrollRoot={scrollRoot}>
              <section className="space-y-10">
                <div className="max-w-3xl">
                  <p className="font-[family-name:var(--font-undara-mono)] text-[10px] uppercase tracking-[0.22em] text-primary">
                    Client stories
                  </p>
                  <h2 className="mt-3 font-[family-name:var(--font-undara-heading)] text-4xl leading-tight text-primary md:text-5xl">
                    Saat host bisa benar-benar hadir di acaranya sendiri.
                  </h2>
                </div>

                <div className="grid border-y border-primary/25 md:grid-cols-3">
                  {plannerReviews.map((item, index) => (
                    <article
                      key={`${item.name}-${item.date}`}
                      className={`relative py-8 md:px-8 md:py-10 ${index > 0 ? "border-t border-primary/20 md:border-l md:border-t-0" : ""}`}
                    >
                      <Quote className="h-5 w-5 text-primary/55" />
                      <p className="mt-5 font-[family-name:var(--font-undara-heading)] text-xl italic leading-8 text-foreground md:text-2xl">
                        “{item.review}”
                      </p>
                      <div className="mt-7">
                        <p className="text-sm font-semibold">{item.name}</p>
                        <p className="mt-1 font-[family-name:var(--font-undara-mono)] text-[9px] uppercase tracking-[0.15em] text-muted-foreground">
                          {item.date}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </ScrollReveal>

            <ScrollReveal scrollRoot={scrollRoot}>
              <FaqSection
                eyebrow="Before we plan"
                title="Pertanyaan sebelum kita mulai"
                description="Hal-hal yang paling sering dibahas sebelum menentukan scope acara dan kebutuhan tim."
                items={plannerFaq}
                wide
              />
            </ScrollReveal>

            <ScrollReveal scrollRoot={scrollRoot}>
              <section className="relative overflow-hidden border-y border-primary/30 py-12 md:py-16">
                <div className="pointer-events-none absolute -right-12 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full border border-primary/15 md:h-80 md:w-80" />
                <div className="pointer-events-none absolute right-8 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full border border-primary/20 md:h-48 md:w-48" />

                <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
                  <div>
                    <p className="font-[family-name:var(--font-undara-mono)] text-[10px] uppercase tracking-[0.22em] text-primary">
                      Start with the story
                    </p>
                    <h2 className="mt-3 max-w-3xl font-[family-name:var(--font-undara-heading)] text-4xl leading-[1.02] text-primary md:text-6xl">
                      Ceritakan acaranya. Detail lainnya kita rapikan bersama.
                    </h2>
                    <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
                      Bawa tanggal, venue, perkiraan tamu, atau bahkan baru sebuah ide. Christine
                      dan tim akan membantu memetakan prioritas sebelum masuk ke penawaran.
                    </p>
                  </div>

                  <Button asChild size="lg" className="w-fit">
                    <a
                      href={consultationUrl("Halo, aku ingin tanya2 mengenai paket Event Planner.")}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Mulai konsultasi
                    </a>
                  </Button>
                </div>
              </section>
            </ScrollReveal>
          </MarketingTextReveal>
        </main>

        <MarketingFrameFooter />
      </div>
    </div>
  );
}
