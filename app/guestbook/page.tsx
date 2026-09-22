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
import ReviewsGrid from "@/components/Marketing/ReviewsGrid";
import FaqSection from "@/components/Marketing/FaqSection";
import { guestbookReviews, guestbookFaq } from "@/data/services/guestbook";

export default function GuestbookPage() {
  const { locale } = useLanguage();
  const scrollRoot = useRef<HTMLElement>(null);

  return (
    <div className="relative isolate flex min-h-dvh w-full flex-col overflow-hidden bg-background text-foreground">
      <PublicMarketingAtmosphere />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,rgba(217,163,170,0.12),transparent_64%)] dark:bg-[radial-gradient(ellipse_at_50%_45%,rgba(192,122,132,0.11),transparent_65%)]" />
      <div className="relative z-10 mx-auto my-auto flex h-[90dvh] w-[90vw] min-h-0 flex-col overflow-hidden rounded-[18px] border border-primary/30 bg-background/65 shadow-[0_18px_75px_rgba(75,35,47,0.09)] backdrop-blur-[2px] sm:my-[23px] sm:h-[calc(100dvh-46px)] sm:w-[calc(100%-46px)] lg:my-[27px] lg:h-[calc(100dvh-54px)] lg:w-[calc(100%-54px)]">
        <div className="relative z-50 shrink-0 border-b border-primary/15 bg-background/70 backdrop-blur-sm">
          <Navbar embedded />
        </div>
        <main
          ref={scrollRoot}
          tabIndex={0}
          aria-label={locale === "en" ? "Guestbook page content" : "Konten halaman Guestbook"}
          className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain scroll-smooth focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-primary"
        >
          <MarketingTextReveal
            className="mx-auto flex w-[88%] max-w-[1100px] flex-col gap-20 py-12 sm:w-[80vw] md:gap-24 md:py-16"
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
              <ReviewsGrid
          eyebrow="Client Stories"
          title="Yang paling terasa adalah hari acara yang lebih tenang"
          description="Pengalaman pengguna setelah memakai sistem guestbook dan alur penerimaan tamu DC Organizer."
          reviews={guestbookReviews}
          framed
              />
            </ScrollReveal>
            <ScrollReveal scrollRoot={scrollRoot}>
              <FaqSection
          title="Pertanyaan tentang Guestbook Digital"
          description="Aturan check-in, usher, meja, dan penggunaan layanan dijelaskan sejak awal agar tim venue bekerja dengan alur yang jelas."
          items={guestbookFaq}
          wide
              />
            </ScrollReveal>
          </MarketingTextReveal>
        </main>
        <MarketingFrameFooter />
      </div>
    </div>
  );
}
