"use client";

import { useLanguage } from "@/components/I18n/LanguageProvider";
import HeroSection from "@/components/InvitationPage/HeroSection";
import FeatureSection from "@/components/InvitationPage/FeatureSection";
import TemplateCollection from "@/components/InvitationPage/TemplateSection";
import CtaStudioSection from "@/components/InvitationPage/StudioSection";
import PackageShowcase from "@/components/Marketing/PackageShowcase";
import FaqSection from "@/components/Marketing/FaqSection";
import ReviewsGrid from "@/components/Marketing/ReviewsGrid";
import { digitalInvitationReviews, digitalInvitationFaq } from "@/data/digital-invitation";

export default function DigitalInvitationPage() {
  const { locale } = useLanguage();
  const copy = locale === "en" ? {
    packageEyebrow: "Invitation Packages",
    packageTitle: "An invitation that grows with your plans",
    packageDescription: "Start with a personal invitation, then move into guest management and check-in as your celebration gets closer.",
    packageNote: "Prepare your template first. Publishing and personal asset uploads follow the active Digital Invitation package.",
    reviewEyebrow: "Client Stories",
    reviewTitle: "Because a good invitation does more than look beautiful",
    reviewDescription: "It makes sharing the good news easier, keeps RSVPs organized, and makes the journey feel a little lighter.",
    faqTitle: "Frequently asked",
    faqDescription: "About templates, RSVP, personal assets, publishing, and Digital Invitation packages.",
  } : {
    packageEyebrow: "Paket Undangan",
    packageTitle: "Undangan yang tumbuh bersama persiapanmu",
    packageDescription: "Mulai dari undangan yang terasa personal, lalu lanjutkan ke pengelolaan tamu dan check-in ketika hari istimewamu semakin dekat.",
    packageNote: "Template bisa dipersiapkan lebih dulu. Publikasi dan upload aset pribadi mengikuti paket Digital Invitation yang aktif.",
    reviewEyebrow: "Cerita Klien",
    reviewTitle: "Karena undangan yang baik bukan hanya indah dilihat",
    reviewDescription: "Ia membuat kabar bahagia lebih mudah dibagikan, RSVP lebih rapi, dan persiapan terasa sedikit lebih ringan.",
    faqTitle: "Yang sering ditanyakan",
    faqDescription: "Tentang template, RSVP, aset pribadi, publikasi, dan pilihan paket Digital Invitation.",
  };

  return (
    <main className="relative z-10 min-h-screen w-full overflow-x-clip bg-background text-foreground">
      <div className="mx-auto w-[min(92vw,1400px)] space-y-28 py-14 md:space-y-36 md:py-20">
        <HeroSection />
        <FeatureSection />
        <TemplateCollection />
        <CtaStudioSection />
        <PackageShowcase
          eyebrow={copy.packageEyebrow}
          title={copy.packageTitle}
          description={copy.packageDescription}
          packageKeys={["INVITATION_BASIC", "GUESTBOOK_DIGITAL"]}
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
