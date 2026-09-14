import HeroSection from "@/components/InvitationPage/HeroSection";
import FeatureSection from "@/components/InvitationPage/FeatureSection";
import TemplateCollection from "@/components/InvitationPage/TemplateSection";
import CtaStudioSection from "@/components/InvitationPage/StudioSection";
import PackageShowcase from "@/components/Marketing/PackageShowcase";
import FaqSection from "@/components/Marketing/FaqSection";
import { digitalInvitationReviews, digitalInvitationFaq } from "@/data/digital-invitation";
import ReviewsGrid from "@/components/Marketing/ReviewsGrid";

export default function DigitalInvitationPage() {
  return (
    <main className="relative z-10 min-h-screen w-full overflow-hidden bg-background text-foreground">
      <div className="mx-auto w-full max-w-[1400px] space-y-28 px-[4vw] py-14 md:space-y-36 md:py-20">
        <HeroSection />
        <FeatureSection />
        <TemplateCollection />
        <CtaStudioSection />
        <PackageShowcase
          eyebrow="Invitation Packages"
          title="Undangan Digital yang tumbuh bersama persiapanmu"
          description="Mulai dari undangan yang terasa personal, lalu lanjutkan ke pengelolaan tamu dan check-in ketika hari istimewamu semakin dekat."
          packageKeys={["INVITATION_BASIC", "INVITATION_GUESTBOOK"]}
          note="Template bisa dipersiapkan lebih dulu. Publikasi dan upload aset pribadi mengikuti paket Digital Invitation yang aktif."
        />
        <ReviewsGrid
          eyebrow="Client Stories"
          title="Karena undangan yang baik bukan hanya indah dilihat"
          description="Ia membuat kabar bahagia lebih mudah dibagikan, RSVP lebih rapi, dan persiapan terasa sedikit lebih ringan."
          reviews={digitalInvitationReviews}
        />
        <FaqSection
          title="Yang sering ditanyakan"
          description="Tentang template, RSVP, aset pribadi, publikasi, dan pilihan paket Digital Invitation."
          items={digitalInvitationFaq}
        />
      </div>
    </main>
  );
}
