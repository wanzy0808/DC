// app/d-invitation/page.tsx
import HeroSection from "@/components/InvitationPage/HeroSection";
import FeatureSection from "@/components/InvitationPage/FeatureSection";
import TemplateCollection from "@/components/InvitationPage/TemplateSection";
import CtaStudioSection from "@/components/InvitationPage/StudioSection";
import ReviewsSection from "@/components/InvitationPage/ReviewsSection";
/*import FaqInvitation from "@/components/FAQ/FaqInvitation";*/

export default function DigitalInvitationPage() {
  return (
    <main className="relative z-10 min-h-screen overflow-hidden text-foreground">
      {/* Background Effect */}
      <div className="pointer-events-none fixed left-1/2 top-0 h-[420px] w-[900px] -translate-x-1/2 rounded-full bg-dc-gold/10 blur-[150px]" />
      
      <div className="mx-auto space-y-28 px-5 py-12 sm:px-8 md:py-20">
        <HeroSection />
        <FeatureSection />
        <TemplateCollection />
        <CtaStudioSection />
        <ReviewsSection />
        {/* <FaqInvitation /> */}
      </div>
    </main>
  );
}