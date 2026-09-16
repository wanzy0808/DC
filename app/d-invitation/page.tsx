"use client";

import { useLanguage } from "@/components/I18n/LanguageProvider";
import HeroSection from "@/components/D-Invitation/HeroSection";
import FeatureSection from "@/components/D-Invitation/FeatureSection";
import TemplateCollection from "@/components/D-Invitation/TemplateSection";
import CtaStudioSection from "@/components/D-Invitation/StudioSection";
import PackageShowcase from "@/components/Marketing/PackageShowcase";
import FaqSection from "@/components/Marketing/FaqSection";
import ReviewsGrid from "@/components/D-Invitation/ReviewsSection";
import {
  digitalInvitationFaq,
  digitalInvitationReviews,
} from "@/data/digital-invitation";

export default function DigitalInvitationPage() {
  const { locale } = useLanguage();
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
    <main className="relative z-10 min-h-screen w-full overflow-x-clip bg-transparent text-foreground">
      <div className="mx-auto w-[min(92vw,1400px)] space-y-28 py-14 md:space-y-36 md:py-20">
        <HeroSection />
        <FeatureSection />
        <TemplateCollection />
        <CtaStudioSection />
        <PackageShowcase
          eyebrow={copy.packageEyebrow}
          title={copy.packageTitle}
          description={copy.packageDescription}
          packageKeys={["INVITATION_BASIC"]}
          note={copy.packageNote}
        />
        <ReviewsGrid
          eyebrow={copy.reviewEyebrow}
          title={copy.reviewTitle}
          description={copy.reviewDescription}
          reviews={digitalInvitationReviews[locale]}
        />
        <FaqSection
          title={copy.faqTitle}
          description={copy.faqDescription}
          items={digitalInvitationFaq[locale]}
        />
      </div>
    </main>
  );
}
