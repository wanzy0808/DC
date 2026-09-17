import HeroSection from "@/components/GuestbookPage/HeroSection";
import FeatureSection from "@/components/GuestbookPage/FeatureSection";
import ProcessSection from "@/components/GuestbookPage/ProcessSection";
import PackageShowcase from "@/components/Marketing/PackageShowcase";
import ReviewsGrid from "@/components/Marketing/ReviewsGrid";
import FaqSection from "@/components/Marketing/FaqSection";
import { guestbookReviews, guestbookFaq } from "@/data/guestbook";

export default function GuestbookPage() {
  return (
    <main className="relative z-10 min-h-screen w-full overflow-hidden px-0 pb-20 pt-24 text-foreground">
      <div className="pointer-events-none fixed left-1/2 top-0 h-[420px] w-[900px] -translate-x-1/2 rounded-full bg-primary/10 blur-[150px]" />
      <div className="relative mx-auto w-[80vw] max-w-full space-y-28">
        <HeroSection />
        <FeatureSection />
        <ProcessSection />
        <PackageShowcase
          eyebrow="Guestbook Digital"
          title="Operasional tamu yang lebih rapi saat acara berlangsung"
          description="Guestbook Digital berdiri sebagai layanan operasional hari acara untuk QR check-in, Usher App, seating, perangkat, dan dukungan teknis di venue."
          packageKeys={["GUESTBOOK_DIGITAL"]}
          note="Guestbook Digital dapat digunakan untuk berbagai jenis acara. Undangan Digital Rp150.000 per event tetap diaktifkan terpisah ketika dibutuhkan."
        />
        <ReviewsGrid
          eyebrow="Client Stories"
          title="Yang paling terasa adalah hari acara yang lebih tenang"
          description="Pengalaman pengguna setelah memakai sistem guestbook dan alur penerimaan tamu DC Organizer."
          reviews={guestbookReviews}
        />
        <FaqSection
          title="Pertanyaan tentang Guestbook Digital"
          description="Aturan check-in, usher, meja, dan penggunaan layanan dijelaskan sejak awal agar tim venue bekerja dengan alur yang jelas."
          items={guestbookFaq}
        />
      </div>
    </main>
  );
}
