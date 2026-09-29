"use client";

import { useRef } from "react";
import Navbar from "@/components/Layout/Navbar/Navbar";
import PublicMarketingAtmosphere from "@/components/Layout/PublicMarketingAtmosphere";
import MarketingFrameFooter from "@/components/Layout/MarketingFrameFooter";
import MarketingTextReveal from "@/components/DigitalInvitation/MarketingTextReveal";
import ScrollReveal from "@/components/EventPlanner/ScrollReveal";
import { useLanguage } from "@/components/I18n/LanguageProvider";
import HeroSection from "@/components/Guestbook/HeroSection";
import FeatureSection from "@/components/Guestbook/FeatureSection";
import ProcessSection from "@/components/Guestbook/ProcessSection";
import PackageShowcase from "@/components/Marketing/PackageShowcase";
import FaqSection from "@/components/Marketing/FaqSection";
import { guestbookFaq } from "@/data/services/guestbook";

export default function GuestbookPage() {
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
          aria-label={locale === "en" ? "Guestbook page content" : "Konten halaman Guestbook"}
          className="undara-marketing-scroll focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-primary"
        >
          <MarketingTextReveal
            className="mx-auto flex w-full max-w-none flex-col gap-24 px-5 py-8 sm:px-8 md:gap-28 md:py-12 lg:px-12 xl:px-16 2xl:px-20"
            scrollRoot={scrollRoot}
            ready
            locale={locale}
          >
            <ScrollReveal scrollRoot={scrollRoot}><HeroSection /></ScrollReveal>
            <ScrollReveal scrollRoot={scrollRoot}><FeatureSection /></ScrollReveal>
            <ScrollReveal scrollRoot={scrollRoot}><ProcessSection /></ScrollReveal>
            <ScrollReveal scrollRoot={scrollRoot}>
              <PackageShowcase
          eyebrow="Guestbook Digital"
          title="Operasional tamu yang lebih rapi saat acara berlangsung"
          description="Guestbook Digital berdiri sebagai layanan operasional hari acara untuk QR check-in, Usher App, seating, perangkat, dan dukungan teknis di venue."
          packageKeys={["GUESTBOOK_DIGITAL"]}
          roundedCard
          wide
          note="Guestbook Digital dapat digunakan untuk berbagai jenis acara. Undangan Digital Rp150.000 per event tetap diaktifkan terpisah ketika dibutuhkan."
              />
            </ScrollReveal>
            <ScrollReveal scrollRoot={scrollRoot}>
              <section className="grid gap-8 border-b border-primary/25 pb-14 lg:grid-cols-2 lg:items-end lg:gap-16">
                <div><p className="font-[family-name:var(--font-undara-mono)] text-[10px] uppercase tracking-[0.2em] text-primary">{locale === "en" ? "On the event day" : "Saat Hari Acara"}</p><h2 className="mt-4 max-w-[20ch] font-[family-name:var(--font-undara-heading)] text-4xl leading-tight text-primary md:text-5xl">{locale === "en" ? "One guest list for the whole team." : "Satu daftar tamu untuk seluruh tim."}</h2></div>
                <p className="max-w-xl text-sm leading-7 text-muted-foreground md:text-base md:leading-8">{locale === "en" ? "The usher can verify arrivals and scan valid QR codes while the event team follows attendance and seating from the same event data." : "Usher dapat memverifikasi kedatangan dan memindai QR yang valid, sementara tim acara memantau kehadiran dan meja dari data acara yang sama."}</p>
              </section>
            </ScrollReveal>
            <ScrollReveal scrollRoot={scrollRoot}>
              <FaqSection
          title="Pertanyaan tentang Guestbook Digital"
          description="Aturan check-in, usher, meja, dan penggunaan layanan dijelaskan sejak awal agar tim venue bekerja dengan alur yang jelas."
          items={guestbookFaq}
          wide
          editorial
              />
            </ScrollReveal>
          </MarketingTextReveal>
        </main>
        <MarketingFrameFooter />
      </div>
    </div>
  );
}
