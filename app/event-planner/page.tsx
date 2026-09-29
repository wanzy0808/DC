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

export default function EventPlannerPage() {
  const { locale } = useLanguage();
  const scrollRoot = useRef<HTMLElement>(null);
  const en = locale === "en";

  const scope = en
    ? ["Concept & budget", "Vendor & venue", "Rundown & crew", "Guest flow"]
    : ["Konsep & anggaran", "Vendor & venue", "Rundown & tim", "Alur tamu"];

  const faqItems = plannerFaq.map((item) => ({
    question: en ? item.questionEn : item.question,
    answer: en ? item.answerEn : item.answer,
  }));

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
          aria-label={en ? "Event Planner page content" : "Konten halaman Event Planner"}
          className="undara-marketing-scroll focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-primary"
        >
          <MarketingTextReveal
            className="mx-auto flex w-[92%] max-w-[1240px] flex-col gap-24 py-10 sm:w-[86vw] md:gap-32 md:py-16"
            scrollRoot={scrollRoot}
            ready
            locale={locale}
          >
            <ScrollReveal scrollRoot={scrollRoot}>
              <section className="relative grid min-h-[620px] items-center gap-10 border-b border-primary/25 pb-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:pb-20">
                <div className="relative z-10 py-4 lg:py-10">
                  <p className="font-[family-name:var(--font-undara-mono)] text-[10px] font-semibold uppercase tracking-[0.22em] text-primary md:text-xs">
                    {en
                      ? "Event planning · coordination · execution"
                      : "Perencanaan · koordinasi · eksekusi acara"}
                  </p>

                  <h1 className="mt-5 max-w-[15ch] font-[family-name:var(--font-undara-heading)] text-[clamp(3rem,5.5vw,5.75rem)] leading-[0.96] tracking-[-0.03em] text-primary">
                    {en ? "Be present in your moment." : "Hadir penuh di momenmu."}
                    <span className="block text-foreground">
                      {en ? "We keep it moving." : "Kami jaga alurnya."}
                    </span>
                  </h1>

                  <p className="mt-7 max-w-2xl font-[family-name:var(--font-undara-body)] text-sm leading-7 text-muted-foreground md:text-base md:leading-8">
                    {en
                      ? "From the first decision to the final cue, Undara brings structure to the concept, vendors, rundown, crew, and guest flow so you do not have to operate your own event."
                      : "Dari keputusan pertama sampai cue terakhir, Undara merapikan konsep, vendor, rundown, tim, dan alur tamu supaya kamu tidak perlu menjadi operator di acaramu sendiri."}
                  </p>

                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <Button asChild size="lg">
                      <a
                        href={consultationUrl(
                          en
                            ? "Hi, I would like to consult about Undara Event Planner."
                            : "Halo, aku ingin konsultasi Event Planner Undara.",
                        )}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {en ? "Tell Us About Your Event" : "Ceritakan Acaramu"}
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    </Button>

                    <Button asChild size="lg" variant="outline">
                      <a href="#cara-kerja">
                        {en ? "How We Work" : "Cara Kami Bekerja"}
                        <ArrowDownRight className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>

                  <div className="mt-10 flex max-w-2xl flex-wrap gap-x-7 gap-y-3 border-t border-primary/20 pt-5">
                    {scope.map((item) => (
                      <p
                        key={item}
                        className="font-[family-name:var(--font-undara-mono)] text-[9px] uppercase tracking-[0.13em] text-muted-foreground"
                      >
                        {item}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="relative min-h-[460px] lg:min-h-[620px]">
                  <div className="absolute inset-[4%_0_0_5%] overflow-hidden rounded-[42px_8px_42px_8px] border border-primary/25 bg-card shadow-[0_30px_90px_rgba(70,42,32,0.14)]">
                    <Image
                      src="/assets/marketing/event-planner/hero.webp"
                      alt={
                        en
                          ? "Undara Event Planner team coordinating an event"
                          : "Tim Event Planner Undara mengoordinasikan jalannya acara"
                      }
                      fill
                      priority
                      sizes="(max-width: 1024px) 92vw, 48vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(24,16,12,0.72)_0%,rgba(24,16,12,0.08)_42%,transparent_68%)]" />
                    <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4 text-white md:bottom-8 md:left-8 md:right-8">
                      <div className="max-w-md">
                        <p className="font-[family-name:var(--font-undara-mono)] text-[9px] uppercase tracking-[0.18em] text-white/70">
                          {en ? "Behind every calm celebration" : "Di balik perayaan yang terasa tenang"}
                        </p>
                        <p className="mt-2 font-[family-name:var(--font-undara-heading)] text-2xl leading-tight md:text-3xl">
                          {en
                            ? "A team is keeping every detail in motion."
                            : "Ada tim yang menjaga setiap detail tetap bergerak."}
                        </p>
                      </div>
                      <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/35 bg-black/10 backdrop-blur-sm sm:flex">
                        <ArrowDownRight className="h-5 w-5" />
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            </ScrollReveal>

            <ScrollReveal scrollRoot={scrollRoot}>
              <FounderSection locale={locale} />
            </ScrollReveal>

            <ScrollReveal scrollRoot={scrollRoot}>
              <div id="cara-kerja" className="scroll-mt-24">
                <ServicesSection locale={locale} />
              </div>
            </ScrollReveal>

            <ScrollReveal scrollRoot={scrollRoot}>
              <PortfolioSection locale={locale} />
            </ScrollReveal>

            <ScrollReveal scrollRoot={scrollRoot}>
              <section className="grid gap-8 border-y border-primary/25 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-end lg:gap-14 lg:py-16">
                <div>
                  <p className="font-[family-name:var(--font-undara-mono)] text-[10px] uppercase tracking-[0.2em] text-primary">
                    {en ? "Connected digital workflow" : "Alur digital terhubung"}
                  </p>
                  <h2 className="mt-4 max-w-[18ch] font-[family-name:var(--font-undara-heading)] text-4xl leading-[1.04] text-primary md:text-5xl">
                    {en
                      ? "Planning and guest data, moving in one direction."
                      : "Planning dan data tamu bergerak dalam satu alur."}
                  </h2>
                </div>

                <div className="flex flex-col gap-7">
                  <p className="max-w-2xl font-[family-name:var(--font-undara-body)] text-sm leading-7 text-muted-foreground md:text-base md:leading-8">
                    {en
                      ? "When useful, your event can connect with Undara Digital Invitations for publishing, RSVP, and guest management. The planning team stays focused on decisions and execution while the digital layer keeps operations organized."
                      : "Bila dibutuhkan, acara dapat terhubung dengan Undangan Digital Undara untuk publikasi, RSVP, dan manajemen tamu. Tim planner tetap fokus pada keputusan dan eksekusi, sementara sistem digital membantu operasional tetap rapi."}
                  </p>
                  <Button asChild variant="outline" className="w-fit">
                    <Link href="/d-invitation">
                      {en ? "Explore Digital Invitations" : "Lihat Undangan Digital"}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </section>
            </ScrollReveal>

            <ScrollReveal scrollRoot={scrollRoot}>
              <section className="space-y-10" aria-labelledby="event-planner-packages">
                <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-end lg:gap-14">
                  <div>
                    <p className="font-[family-name:var(--font-undara-mono)] text-[10px] uppercase tracking-[0.2em] text-primary">
                      {en ? "Service scope" : "Cakupan layanan"}
                    </p>
                    <h2
                      id="event-planner-packages"
                      className="mt-3 max-w-[20ch] font-[family-name:var(--font-undara-heading)] text-4xl leading-[1.04] text-primary md:text-5xl"
                    >
                      {en
                        ? "Start from the support your event actually needs."
                        : "Mulai dari dukungan yang benar-benar dibutuhkan acaramu."}
                    </h2>
                  </div>

                  <p className="max-w-2xl font-[family-name:var(--font-undara-body)] text-sm leading-7 text-muted-foreground md:text-base md:leading-8">
                    {en
                      ? "We do not force one generic price across different events. Venue, guest count, crew, vendors, and scope are discussed first before we prepare a proposal."
                      : "Kami tidak memaksakan satu harga generik untuk semua acara. Venue, jumlah tamu, kebutuhan tim, vendor, dan scope dibahas lebih dulu sebelum penawaran disusun."}
                  </p>
                </div>

                <div className="border-t border-primary/30">
                  {plannerPackages.map((item) => {
                    const features = en ? item.featuresEn : item.features;
                    return (
                      <article
                        key={item.key}
                        className="grid gap-7 border-b border-primary/25 py-8 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] md:gap-12 md:py-10"
                      >
                        <div>
                          <p className="font-[family-name:var(--font-undara-mono)] text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
                            {en ? "Event service" : "Layanan acara"}
                          </p>
                          <h3 className="mt-2 font-[family-name:var(--font-undara-heading)] text-2xl leading-tight text-primary md:text-3xl">
                            {en ? item.nameEn : item.name}
                          </h3>
                          <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground md:text-base">
                            {en ? item.descriptionEn : item.description}
                          </p>
                        </div>

                        <div>
                          <ul className="grid gap-3 sm:grid-cols-2 sm:gap-x-6">
                            {features.map((feature) => (
                              <li
                                key={feature}
                                className="flex gap-3 text-sm leading-6 text-foreground/85"
                              >
                                <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-primary" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>

                          <Button asChild variant="outline" size="sm" className="mt-6 w-fit">
                            <a
                              href={consultationUrl(en ? item.waMessageEn : item.waMessage)}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {en ? "Consult" : "Konsultasi"}
                              <ArrowRight className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </article>
                    );
                  })}
                </div>

                <p className="font-[family-name:var(--font-undara-mono)] text-[10px] text-muted-foreground">
                  WhatsApp · +62 821-2478-6516
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal scrollRoot={scrollRoot}>
              <section className="space-y-9">
                <div className="max-w-4xl">
                  <p className="font-[family-name:var(--font-undara-mono)] text-[10px] uppercase tracking-[0.2em] text-primary">
                    {en ? "Client stories" : "Cerita klien"}
                  </p>
                  <h2 className="mt-3 max-w-[22ch] font-[family-name:var(--font-undara-heading)] text-4xl leading-[1.04] text-primary md:text-5xl">
                    {en
                      ? "When hosts can truly be present in their own celebration."
                      : "Saat host bisa benar-benar hadir di acaranya sendiri."}
                  </h2>
                </div>

                <div className="border-y border-primary/25">
                  {plannerReviews.map((item) => (
                    <article
                      key={`${item.name}-${item.date}`}
                      className="grid gap-5 border-b border-primary/20 py-8 last:border-b-0 md:grid-cols-[0.3fr_0.7fr] md:gap-10 md:py-9"
                    >
                      <div>
                        <p className="text-sm font-semibold">{item.name}</p>
                        <p className="mt-1 font-[family-name:var(--font-undara-mono)] text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                          {en ? item.dateEn : item.date}
                        </p>
                      </div>

                      <div className="flex gap-4">
                        <Quote className="mt-1 h-5 w-5 shrink-0 text-primary/55" />
                        <p className="max-w-3xl font-[family-name:var(--font-undara-heading)] text-xl italic leading-8 text-foreground md:text-2xl md:leading-9">
                          “{en ? item.reviewEn : item.review}”
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </ScrollReveal>

            <ScrollReveal scrollRoot={scrollRoot}>
              <FaqSection
                eyebrow={en ? "Before we plan" : "Sebelum kita mulai"}
                title={en ? "Questions before we begin" : "Pertanyaan sebelum kita mulai"}
                description={
                  en
                    ? "The things we usually discuss before defining the event scope and team requirements."
                    : "Hal-hal yang paling sering dibahas sebelum menentukan scope acara dan kebutuhan tim."
                }
                items={faqItems}
                wide
              />
            </ScrollReveal>

            <ScrollReveal scrollRoot={scrollRoot}>
              <section className="relative overflow-hidden border-y border-primary/30 py-12 md:py-16">
                <div className="pointer-events-none absolute -right-12 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full border border-primary/15 md:h-80 md:w-80" />
                <div className="pointer-events-none absolute right-8 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full border border-primary/20 md:h-48 md:w-48" />

                <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-12">
                  <div>
                    <p className="font-[family-name:var(--font-undara-mono)] text-[10px] uppercase tracking-[0.2em] text-primary">
                      {en ? "Start with the story" : "Mulai dari ceritanya"}
                    </p>
                    <h2 className="mt-3 max-w-[24ch] font-[family-name:var(--font-undara-heading)] text-4xl leading-[1.04] text-primary md:text-6xl">
                      {en
                        ? "Tell us about the event. We will organize the rest together."
                        : "Ceritakan acaranya. Detail lainnya kita rapikan bersama."}
                    </h2>
                    <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base md:leading-8">
                      {en
                        ? "Bring the date, venue, guest estimate, or even just an idea. Christine and the team will help map the priorities before moving into a proposal."
                        : "Bawa tanggal, venue, perkiraan tamu, atau bahkan baru sebuah ide. Christine dan tim akan membantu memetakan prioritas sebelum masuk ke penawaran."}
                    </p>
                  </div>

                  <Button asChild size="lg" className="w-fit">
                    <a
                      href={consultationUrl(
                        en
                          ? "Hi, I would like to ask about Undara Event Planner."
                          : "Halo, aku ingin tanya2 mengenai paket Event Planner.",
                      )}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <MessageCircle className="h-4 w-4" />
                      {en ? "Start a Consultation" : "Mulai Konsultasi"}
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
