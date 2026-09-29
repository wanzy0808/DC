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
  const en = locale === "en";

  const faqItems = guestbookFaq.map((item) => ({
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
          aria-label={en ? "Guestbook page content" : "Konten halaman Guestbook"}
          className="undara-marketing-scroll focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-primary"
        >
          <MarketingTextReveal
            className="undara-marketing-content flex flex-col gap-24 py-8 md:gap-28 md:py-12"
            scrollRoot={scrollRoot}
            ready
            locale={locale}
          >
            <ScrollReveal scrollRoot={scrollRoot}>
              <HeroSection />
            </ScrollReveal>

            <ScrollReveal scrollRoot={scrollRoot}>
              <div className="undara-editorial-offset-left undara-editorial-rail undara-editorial-ambient undara-editorial-ambient-left">
                <FeatureSection />
              </div>
            </ScrollReveal>

            <ScrollReveal scrollRoot={scrollRoot}>
              <div className="undara-editorial-offset-right">
                <ProcessSection />
              </div>
            </ScrollReveal>

            <ScrollReveal scrollRoot={scrollRoot}>
              <div className="undara-editorial-offset-left undara-editorial-ambient undara-editorial-ambient-right">
              <PackageShowcase
                eyebrow={en ? "Digital Guestbook" : "Guestbook Digital"}
                title={
                  en
                    ? "Event-day guest operations that stay organized."
                    : "Operasional tamu yang tetap rapi saat acara berlangsung."
                }
                description={
                  en
                    ? "Digital Guestbook is a dedicated event-day service for official QR check-in, the Usher App, seating, guest displays, and attendance monitoring at the venue."
                    : "Guestbook Digital berdiri sebagai layanan khusus hari acara untuk QR check-in resmi, Usher App, seating, tampilan tamu, dan monitoring attendance di venue."
                }
                packageKeys={["GUESTBOOK_DIGITAL"]}
                wide
                editorial
                note={
                  en
                    ? "Digital Guestbook can be used for many event types. Digital Invitation remains a separate Rp150,000 per-event product when a public invitation page is also needed."
                    : "Guestbook Digital dapat digunakan untuk berbagai jenis acara. Undangan Digital tetap merupakan produk terpisah Rp150.000 per event ketika halaman undangan publik juga dibutuhkan."
                }
              />
              </div>
            </ScrollReveal>

            <ScrollReveal scrollRoot={scrollRoot}>
              <section className="undara-marketing-section undara-editorial-offset-right undara-editorial-rail grid gap-8 border-b border-primary/25 pb-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:gap-16">
                <div>
                  <p className="undara-marketing-kicker">{en ? "One event, one source" : "Satu Acara, Satu Sumber Data"}</p>
                  <h2 className="mt-4 max-w-[17ch] font-[family-name:var(--font-undara-heading)] text-4xl leading-[1.04] text-primary md:text-5xl lg:text-6xl">
                    {en ? "One guest list for the whole reception team." : "Satu daftar tamu untuk seluruh tim penerima."}
                  </h2>
                </div>
                <p className="max-w-2xl text-sm leading-7 text-muted-foreground md:text-base md:leading-8">
                  {en
                    ? "The usher verifies arrivals and scans valid QR codes while the event team follows attendance and seating from the same event-scoped data."
                    : "Usher memverifikasi kedatangan dan memindai QR yang valid, sementara tim acara memantau attendance dan meja dari data event-scoped yang sama."}
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal scrollRoot={scrollRoot}>
              <div className="undara-editorial-offset-left">
              <FaqSection
                eyebrow={en ? "Before event day" : "Sebelum Hari Acara"}
                title={en ? "Questions the reception team should settle early." : "Pertanyaan yang sebaiknya jelas sebelum tamu datang."}
                description={
                  en
                    ? "Official check-in, usher verification, seating, and product boundaries are explained up front so the venue team can work with a predictable flow."
                    : "Aturan check-in resmi, verifikasi usher, seating, dan batas layanan dijelaskan sejak awal agar tim venue bekerja dengan alur yang dapat diprediksi."
                }
                items={faqItems}
                wide
                editorial
              />
              </div>
            </ScrollReveal>
          </MarketingTextReveal>
        </main>

        <MarketingFrameFooter />
      </div>
    </div>
  );
}
