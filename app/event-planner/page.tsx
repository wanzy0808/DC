"use client";

import { useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/Layout/Navbar/Navbar";
import PublicMarketingAtmosphere from "@/components/Layout/PublicMarketingAtmosphere";
import MarketingFrameFooter from "@/components/Layout/MarketingFrameFooter";
import MarketingTextReveal from "@/components/DigitalInvitation/MarketingTextReveal";
import ScrollReveal from "@/components/EventPlanner/ScrollReveal";
import { useLanguage } from "@/components/I18n/LanguageProvider";
import { ArrowRight, Check, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import FounderSection from "@/components/EventPlanner/FounderSection";
import ServicesSection from "@/components/EventPlanner/ServicesSection";
import PortfolioSection from "@/components/EventPlanner/PortfolioSection";
import ReviewsGrid from "@/components/Marketing/ReviewsGrid";
import FaqSection from "@/components/Marketing/FaqSection";
import {
  plannerFaq,
  plannerPackages,
  plannerReviews,
} from "@/data/services/event-planner";

const WHATSAPP_NUMBER = "6282124786516";

function consultationUrl(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export default function EventPlannerPage() {
  const { locale } = useLanguage();
  const scrollRoot = useRef<HTMLElement>(null);

  return (
    <div className="relative isolate flex min-h-dvh w-full flex-col overflow-hidden bg-background text-foreground">
      <PublicMarketingAtmosphere />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,rgba(217,163,170,0.12),transparent_64%)] dark:bg-[radial-gradient(ellipse_at_50%_45%,rgba(192,122,132,0.11),transparent_65%)]" />
      <div data-dc-marketing-frame className="relative z-10 mx-auto my-auto flex h-[90dvh] w-[90vw] min-h-0 flex-col overflow-hidden rounded-[18px] border border-primary/30 bg-background/65 shadow-[0_18px_75px_rgba(75,35,47,0.09)] backdrop-blur-[2px] sm:my-[23px] sm:h-[calc(100dvh-46px)] sm:w-[calc(100%-46px)] lg:my-[27px] lg:h-[calc(100dvh-54px)] lg:w-[calc(100%-54px)]">
        <div className="relative z-50 shrink-0 border-b border-primary/15 bg-background/70 backdrop-blur-sm">
          <Navbar embedded />
        </div>
        <main
          ref={scrollRoot}
          tabIndex={0}
          aria-label={locale === "en" ? "Event planner page content" : "Konten halaman Event Planner"}
          className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain scroll-smooth focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-primary"
        >
          <MarketingTextReveal
                className="mx-auto flex w-[88%] max-w-[1100px] flex-col gap-20 py-12 sm:w-[80vw] md:gap-24 md:py-16"
                scrollRoot={scrollRoot}
                ready
                locale={locale}
              >
            <ScrollReveal scrollRoot={scrollRoot}>
              <header className="border-b border-primary/30 pb-9">
                <div className="max-w-3xl">
                  <p className="font-[family-name:var(--font-dc-mono)] text-xs font-semibold uppercase tracking-[0.24em] text-[var(--primary)]">
                    [ DC ORGANIZER / EVENT PLANNER ]
                  </p>
                  <h1 className="mt-3 font-[family-name:var(--font-dc-heading)] text-4xl leading-tight md:text-6xl">
                    Event Planner untuk momen yang ingin kamu jalani dengan lebih tenang.
                  </h1>
                  <p className="mt-5 max-w-2xl font-[family-name:var(--font-dc-body)] text-sm leading-7 text-[var(--muted-foreground)] md:text-base">
                    Dari wedding sampai anniversary dan baby shower, kami membantu merapikan konsep, vendor, rundown, tim, dan detail operasional supaya acara tetap terasa personal tanpa membuatmu tenggelam di koordinasi.
                  </p>
                </div>
              </header>
            </ScrollReveal>

            <ScrollReveal scrollRoot={scrollRoot}><FounderSection /></ScrollReveal>
            <ScrollReveal scrollRoot={scrollRoot}><ServicesSection /></ScrollReveal>
            <ScrollReveal scrollRoot={scrollRoot}><PortfolioSection /></ScrollReveal>

            <ScrollReveal scrollRoot={scrollRoot}>
              <section className="border-y border-primary/30 py-10 md:py-12">
                <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
                  <div className="max-w-3xl">
                    <p className="font-[family-name:var(--font-dc-mono)] text-[10px] uppercase tracking-[0.2em] text-[var(--primary)]">
                      [ DIGITAL WORKFLOW ]
                    </p>
                    <h2 className="mt-3 font-[family-name:var(--font-dc-heading)] text-3xl md:text-4xl">
                      Planning yang nyambung dengan undangan dan data tamu.
                    </h2>
                    <p className="mt-4 max-w-2xl font-[family-name:var(--font-dc-body)] text-sm leading-7 text-[var(--muted-foreground)]">
                      Bila dibutuhkan, setiap acara dapat memakai Undangan Digital DC Organizer untuk publikasi, RSVP, dan manajemen tamu. WA Blast tersedia sebagai add-on terpisah sesuai kuota acara.
                    </p>
                  </div>
                  <Button asChild size="lg" className="w-fit">
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
                <div className="mx-auto max-w-3xl text-center">
                  <p className="font-[family-name:var(--font-dc-mono)] text-xs font-semibold uppercase tracking-[0.24em] text-[var(--primary)]">
                    [ EVENT PLANNER PACKAGES ]
                  </p>
                  <h2
                    id="event-planner-packages"
                    className="mt-3 font-[family-name:var(--font-dc-heading)] text-3xl md:text-5xl"
                  >
                    Empat tipe layanan, dibahas sesuai kebutuhan acara.
                  </h2>
                  <p className="mt-4 font-[family-name:var(--font-dc-body)] text-sm leading-7 text-[var(--muted-foreground)] md:text-base">
                    Kami tidak menampilkan harga tetap karena venue, jumlah tamu, kebutuhan tim, vendor, dan scope tiap acara berbeda. Mulai dari konsultasi, lalu kami susun kebutuhan yang paling relevan.
                  </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  {plannerPackages.map((item) => (
                    <article
                      key={item.key}
                      className="flex h-full flex-col rounded-[28px] border border-primary/35 bg-[var(--card)]/70 p-6 md:rounded-[32px] md:p-7"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-[family-name:var(--font-dc-mono)] text-[9px] uppercase tracking-[0.18em] text-[var(--primary)]">
                            Paket
                          </p>
                          <h3 className="mt-2 font-[family-name:var(--font-dc-heading)] text-2xl">
                            {item.name}
                          </h3>
                        </div>
                        <MessageCircle className="mt-1 h-5 w-5 shrink-0 text-[var(--primary)]" />
                      </div>

                      <p className="mt-4 font-[family-name:var(--font-dc-body)] text-sm leading-7 text-[var(--muted-foreground)]">
                        {item.description}
                      </p>

                      <ul className="mt-6 flex-1 space-y-3">
                        {item.features.map((feature) => (
                          <li
                            key={feature}
                            className="flex gap-3 font-[family-name:var(--font-dc-body)] text-sm leading-6"
                          >
                            <Check className="mt-1 h-4 w-4 shrink-0 text-[var(--primary)]" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Button asChild size="lg" className="mt-7 w-full">
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

                <p className="text-center font-[family-name:var(--font-dc-mono)] text-[10px] text-[var(--muted-foreground)]">
                  WhatsApp konsultasi: +62 821-2478-6516
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal scrollRoot={scrollRoot}>
              <ReviewsGrid
                eyebrow="Client Stories"
                title="Saat host bisa benar-benar hadir di acaranya sendiri"
                description="Cerita dari klien yang mempercayakan koordinasi dan planning kepada DC Organizer."
                reviews={plannerReviews}
                framed
              />
            </ScrollReveal>

            <ScrollReveal scrollRoot={scrollRoot}>
              <FaqSection
                title="Pertanyaan tentang Event Planner"
                description="Hal-hal yang paling sering ditanyakan sebelum memulai konsultasi dan menentukan scope acara."
                items={plannerFaq}
                wide
              />
            </ScrollReveal>

            <ScrollReveal scrollRoot={scrollRoot}>
              <section className="rounded-[32px] border border-primary/35 bg-[var(--card)]/70 p-8 md:rounded-[40px] md:p-12">
                <p className="font-[family-name:var(--font-dc-mono)] text-xs uppercase tracking-[0.2em] text-[var(--primary)]">
                  [ READY WHEN YOU ARE ]
                </p>
                <h2 className="mt-3 max-w-2xl font-[family-name:var(--font-dc-heading)] text-3xl md:text-4xl">
                  Ceritakan dulu acaranya. Scope bisa kita susun setelahnya.
                </h2>
                <p className="mt-4 max-w-2xl font-[family-name:var(--font-dc-body)] text-sm leading-7 text-[var(--muted-foreground)]">
                  Mulai dari tanggal, venue, jumlah tamu, dan jenis acara yang kamu bayangkan. Tim kami akan membantu memetakan prioritas sebelum masuk ke penawaran.
                </p>
                <Button asChild size="lg" className="mt-7">
                  <a
                    href={consultationUrl(
                      "Halo, aku ingin tanya2 mengenai paket Event Planner.",
                    )}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Mulai konsultasi
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
              </section>
            </ScrollReveal>
          </MarketingTextReveal>
        </main>
        <MarketingFrameFooter />
      </div>
    </div>
  );
}
