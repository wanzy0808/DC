"use client";

import { useEffect, useRef, useState } from "react";
import PuzzleAssemble from "@/components/DigitalInvitation/PuzzleAssemble";
import Navbar from "@/components/Layout/Navbar/Navbar";
import PublicMarketingAtmosphere from "@/components/Layout/PublicMarketingAtmosphere";
import MarketingFrameFooter from "@/components/Layout/MarketingFrameFooter";
import { useLanguage } from "@/components/I18n/LanguageProvider";
import HeroSection from "@/components/DigitalInvitation/HeroSection";
import FeatureSection from "@/components/DigitalInvitation/FeatureSection";
import TemplateCollection from "@/components/DigitalInvitation/TemplateSection";
import CtaStudioSection from "@/components/DigitalInvitation/StudioSection";
import PackageShowcase from "@/components/Marketing/PackageShowcase";
import FaqSection from "@/components/Marketing/FaqSection";
import ReviewsGrid from "@/components/DigitalInvitation/ReviewsSection";
import {
  digitalInvitationFaq,
  digitalInvitationReviews,
} from "@/data/services/digital-invitation";

export default function DigitalInvitationPage() {
  const { locale } = useLanguage();
  const scrollRoot = useRef<HTMLElement>(null);
  const [assembleReady, setAssembleReady] = useState(false);

  useEffect(() => {
    // When reached through a marketing link or Pintu, assemble behind the
    // opening veil. Direct loads and refreshes assemble immediately.
    if (document.documentElement.dataset.dcMarketingTransition !== "1") {
      const frame = requestAnimationFrame(() => setAssembleReady(true));
      return () => cancelAnimationFrame(frame);
    }
    const onReveal = () => setAssembleReady(true);
    window.addEventListener("dc-marketing-reveal", onReveal);
    const fallback = window.setTimeout(onReveal, 4300);
    return () => {
      window.removeEventListener("dc-marketing-reveal", onReveal);
      window.clearTimeout(fallback);
    };
  }, []);
  const copy =
    locale === "en"
      ? {
          packageEyebrow: "Per-event Invitation",
          packageTitle: "One event. One invitation. One complete guest flow.",
          packageDescription:
            "Each purchase activates one event with one invitation template, publishing, RSVP, and guest management. Create as many events as you need and activate them separately.",
          packageNote:
            "WA Blast is not included. Add 50 WA Blast credits to a selected active event for Rp 75,000 whenever needed.",
          reviewEyebrow: "Client Stories",
          reviewTitle: "Built for more than weddings",
          reviewDescription:
            "From weddings and anniversaries to baby showers and other celebrations, each event keeps its own invitation, RSVP, and guest data.",
          faqTitle: "Frequently asked",
          faqDescription:
            "About per-event pricing, templates, RSVP, guest management, publishing, and the WA Blast add-on.",
        }
      : {
          packageEyebrow: "Undangan per Acara",
          packageTitle: "Satu acara. Satu undangan. Satu alur tamu yang lengkap.",
          packageDescription:
            "Setiap pembelian mengaktifkan satu acara dengan satu template undangan, publikasi, RSVP, dan manajemen tamu. Buat acara sebanyak yang dibutuhkan lalu aktifkan satu per satu.",
          packageNote:
            "WA Blast tidak termasuk. Tambahkan 50 kuota WA Blast ke acara aktif yang dipilih seharga Rp75.000 kapan pun dibutuhkan.",
          reviewEyebrow: "Cerita Klien",
          reviewTitle: "Dibuat untuk lebih dari sekadar wedding",
          reviewDescription:
            "Wedding, anniversary, baby shower, sampai perayaan lainnya dapat memiliki undangan, RSVP, dan data tamu masing-masing.",
          faqTitle: "Yang sering ditanyakan",
          faqDescription:
            "Tentang harga per acara, template, RSVP, manajemen tamu, publikasi, dan add-on WA Blast.",
        };

  return (
    <div className="relative isolate flex min-h-dvh w-full flex-col overflow-hidden bg-background text-foreground">
      {/* The same flowers and wind-driven petals as the landing, behind the scrolling main frame. */}
      <PublicMarketingAtmosphere />
      {/* Match the approved landing frame. Only the center panel scrolls; navigation stays visible. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,rgba(217,163,170,0.12),transparent_64%)] dark:bg-[radial-gradient(ellipse_at_50%_45%,rgba(192,122,132,0.11),transparent_65%)]" />
      <div className="relative z-10 mx-auto my-auto flex h-[90dvh] w-[90vw] min-h-0 flex-col overflow-hidden rounded-[18px] border border-primary/30 bg-background/65 shadow-[0_18px_75px_rgba(75,35,47,0.09)] backdrop-blur-[2px] sm:my-[23px] sm:h-[calc(100dvh-46px)] sm:w-[calc(100%-46px)] lg:my-[27px] lg:h-[calc(100dvh-54px)] lg:w-[calc(100%-54px)]">
        <div className="relative z-50 shrink-0 border-b border-primary/15 bg-background/70 backdrop-blur-sm">
          <PuzzleAssemble ready={assembleReady} direction="top" delay={0.02} className="w-full"><Navbar embedded /></PuzzleAssemble>
        </div>
        <main
          ref={scrollRoot}
          tabIndex={0}
          aria-label={locale === "en" ? "Digital invitation page content" : "Konten halaman undangan digital"}
          className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain scroll-smooth focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-primary"
        >
          <div className="mx-auto flex w-[88%] max-w-full flex-col gap-20 py-12 sm:w-[80vw] md:gap-24 md:py-16">
            <HeroSection ready={assembleReady} />
            <div className="dc-invitation-other-sections flex flex-col gap-20 md:gap-24">
              <PuzzleAssemble ready={assembleReady} direction="left" scrollRoot={scrollRoot} delay={0.04}>
                <FeatureSection />
              </PuzzleAssemble>
              <PuzzleAssemble ready={assembleReady} direction="right" scrollRoot={scrollRoot} delay={0.07}>
                <TemplateCollection />
              </PuzzleAssemble>
              <PuzzleAssemble ready={assembleReady} direction="bottom" scrollRoot={scrollRoot} delay={0.07}>
                <CtaStudioSection />
              </PuzzleAssemble>
              <PuzzleAssemble ready={assembleReady} direction="left" scrollRoot={scrollRoot} delay={0.07}>
                <PackageShowcase
                  eyebrow={copy.packageEyebrow}
                  title={copy.packageTitle}
                  description={copy.packageDescription}
                  packageKeys={["INVITATION_BASIC"]}
                  roundedCard
                  note={copy.packageNote}
                />
              </PuzzleAssemble>
              <PuzzleAssemble ready={assembleReady} direction="right" scrollRoot={scrollRoot} delay={0.07}>
                <ReviewsGrid
                  eyebrow={copy.reviewEyebrow}
                  title={copy.reviewTitle}
                  description={copy.reviewDescription}
                  reviews={digitalInvitationReviews[locale]}
                />
              </PuzzleAssemble>
              <PuzzleAssemble ready={assembleReady} direction="bottom" scrollRoot={scrollRoot} delay={0.07}>
                <FaqSection
                  title={copy.faqTitle}
                  description={copy.faqDescription}
                  items={digitalInvitationFaq[locale]}
                />
              </PuzzleAssemble>
            </div>
          </div>
        </main>
        <PuzzleAssemble ready={assembleReady} direction="bottom" delay={0.02} className="shrink-0"><MarketingFrameFooter /></PuzzleAssemble>
      </div>
    </div>
  );
}
