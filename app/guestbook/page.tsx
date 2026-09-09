import HeroSection from "@/components/GuestbookPage/HeroSection";
import FeatureSection from "@/components/GuestbookPage/FeatureSection";
import ProcessSection from "@/components/GuestbookPage/ProcessSection";
import PackageShowcase from "@/components/Marketing/PackageShowcase";
import ReviewsGrid from "@/components/Marketing/ReviewsGrid";
import FaqSection from "@/components/Marketing/FaqSection";
import { guestbookReviews, guestbookFaq } from "@/data/guestbook";

export default function GuestbookPage() {
  return (
    <main className="relative z-10 min-h-screen overflow-hidden px-5 pb-20 pt-24 text-[var(--foreground)] sm:px-8">
      <div className="pointer-events-none fixed left-1/2 top-0 h-[420px] w-[900px] -translate-x-1/2 rounded-full bg-[var(--primary)]/10 blur-[150px]" />
      <div className="relative mx-auto max-w-6xl space-y-28">
        <HeroSection />
        <FeatureSection />
        <ProcessSection />
        <PackageShowcase
          eyebrow="Guestbook Packages"
          title="Pilih cara yang paling pas untuk hari-H"
          description="Mulai dari Guestbook Digital untuk sistem check-in dan usher, atau ambil Bundle jika Anda juga membutuhkan Undangan Digital yang siap dipublikasikan."
          packageKeys={["GUESTBOOK_DIGITAL", "INVITATION_GUESTBOOK"]}
          note="Paket Guestbook dapat digunakan tanpa membeli Undangan Digital. Bundle menggabungkan keduanya dalam satu paket."
        />
        <ReviewsGrid eyebrow="Client Stories" title="Yang paling terasa adalah hari-H yang lebih tenang" description="Pengalaman pasangan setelah memakai sistem guestbook dan alur penerimaan tamu DC Wedding." reviews={guestbookReviews} />
        <FaqSection title="Pertanyaan tentang Guestbook Digital" description="Aturan check-in, usher, meja, dan penggunaan paket kami jelaskan sejak awal agar tidak ada kebingungan saat hari-H." items={guestbookFaq} />
      </div>
    </main>
  );
}
