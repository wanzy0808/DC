import HeroSection from "@/components/InvitationPage/HeroSection";
import FeatureSection from "@/components/InvitationPage/FeatureSection";
import TemplateCollection from "@/components/InvitationPage/TemplateSection";
import CtaStudioSection from "@/components/InvitationPage/StudioSection";
import ReviewsSection from "@/components/InvitationPage/ReviewsSection";
import PackageShowcase from "@/components/Marketing/PackageShowcase";
import FaqSection from "@/components/Marketing/FaqSection";
import { digitalInvitationReviews, digitalInvitationFaq } from "@/data/digital-invitation";
import ReviewsGrid from "@/components/Marketing/ReviewsGrid";

export default function DigitalInvitationPage() {
  return (
    <main className="relative z-10 min-h-screen overflow-hidden text-foreground">
      <div className="pointer-events-none fixed left-1/2 top-0 h-[420px] w-[900px] -translate-x-1/2 rounded-full bg-dc-gold/10 blur-[150px]" />
      <div className="mx-auto max-w-6xl space-y-28 px-5 py-12 sm:px-8 md:py-20">
        <HeroSection />
        <FeatureSection />
        <TemplateCollection />
        <CtaStudioSection />
        <ReviewsSection />
        <PackageShowcase
          eyebrow="Invitation Packages"
          title="Undangan Digital untuk setiap tahap persiapan"
          description="Pilih Undangan Digital untuk fokus pada desain dan publikasi, atau gunakan Bundle jika Anda ingin sekaligus mengelola tamu dan check-in hari-H."
          packageKeys={["INVITATION_BASIC", "INVITATION_GUESTBOOK"]}
          note="Workspace template dapat digunakan sebelum paket aktif. Publikasi dan upload aset pribadi mengikuti paket Digital Invitation yang sudah aktif."
        />
        <ReviewsGrid eyebrow="More Client Stories" title="Bukan cuma cantik, tapi membantu persiapan" description="Cerita singkat pasangan yang memakai undangan digital DC untuk mengurangi pekerjaan manual sebelum hari-H." reviews={digitalInvitationReviews} />
        <FaqSection title="Pertanyaan tentang Undangan Digital" description="Jawaban singkat tentang template, RSVP, asset, publikasi, dan perbedaan paket." items={digitalInvitationFaq} />
      </div>
    </main>
  );
}
