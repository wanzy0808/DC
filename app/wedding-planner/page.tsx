import Link from "next/link";
import { ArrowRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import FounderSection from "@/components/WeddingPlanner/FounderSection";
import ServicesSection from "@/components/WeddingPlanner/ServicesSection";
import PortfolioSection from "@/components/WeddingPlanner/PortfolioSection";
import PackageShowcase from "@/components/Marketing/PackageShowcase";
import ReviewsGrid from "@/components/Marketing/ReviewsGrid";
import FaqSection from "@/components/Marketing/FaqSection";
import { plannerReviews, plannerFaq } from "@/data/wedding-planner";

export default function WeddingOrganizerPage() {
  return (
    <main className="relative z-10 min-h-screen w-full overflow-hidden px-0 pb-20 pt-24 text-[var(--foreground)]">
      <div className="pointer-events-none fixed left-1/2 top-0 h-[420px] w-[1000px] -translate-x-1/2 rounded-full bg-[var(--primary)]/10 blur-[160px]" />
      <div className="relative mx-auto w-full space-y-28">
        <header className="flex flex-col gap-5 border-b border-[var(--border)] pb-7 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-[var(--primary)]">[ DC WEDDING ]</p>
            <h1 className="mt-2 font-[family-name:var(--font-dc-heading)] text-4xl md:text-6xl">Wedding Organizer & Planning</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted-foreground)]">Dari konsep sampai hari-H, kami membantu pasangan membuat keputusan dengan lebih tenang dan mengeksekusi acara dengan alur yang jelas.</p>
          </div>
          <Link href="/login"><Button variant="outline" className="w-fit rounded-full px-5"><User className="mr-2 h-4 w-4" /> Client Login</Button></Link>
        </header>
        <FounderSection />
        <ServicesSection />
        <PortfolioSection />
        <section className="rounded-3xl border border-[var(--primary)]/20 bg-[var(--primary)]/[0.06] p-7 md:p-10">
          <div className="grid gap-7 md:grid-cols-[1fr_auto] md:items-center">
            <div><p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--primary)]">[ DIGITAL WORKFLOW ]</p><h2 className="mt-3 font-[family-name:var(--font-dc-heading)] text-3xl">Planning yang nyambung dengan tamu dan undangan</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted-foreground)]">Jika Anda membutuhkan lebih dari koordinasi vendor, DC dapat menggabungkan workflow planner dengan Undangan Digital dan Guestbook Digital untuk RSVP, seating, greeting, sampai check-in.</p></div>
            <Link href="/d-invitation" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">Lihat produk digital <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </section>
        <PackageShowcase eyebrow="Wedding Planner Packages" title="Pilih scope planning sesuai kebutuhan" description="Mulai dari koordinasi hari-H sampai pendampingan penuh. Kebutuhan tambahan dapat dibicarakan saat konsultasi." packageKeys={["WO_DAY", "WO_FULL"]} note="Harga yang tampil adalah harga dasar paket. Scope, jumlah tim, venue, dan kebutuhan destination wedding dapat memengaruhi penawaran akhir." />
        <ReviewsGrid eyebrow="Client Stories" title="Hari-H yang terasa lebih ringan" description="Pengalaman pasangan setelah mempercayakan koordinasi dan planning kepada DC Wedding." reviews={plannerReviews} />
        <FaqSection title="Pertanyaan tentang Wedding Planner" description="Hal-hal yang paling sering ditanyakan sebelum pasangan memulai konsultasi." items={plannerFaq} />
        <section className="rounded-3xl bg-[var(--primary)] p-8 text-white md:p-12"><p className="font-mono text-xs uppercase tracking-[0.2em] opacity-75">[ READY WHEN YOU ARE ]</p><h2 className="mt-3 max-w-2xl font-[family-name:var(--font-dc-heading)] text-3xl md:text-4xl">Mari mulai dari cerita dan kebutuhan Anda.</h2><p className="mt-4 max-w-2xl text-sm leading-7 opacity-85">Tidak perlu sudah punya semuanya. Kami bisa mulai dari tanggal, venue, konsep yang Anda bayangkan, lalu menentukan prioritas berikutnya.</p><Link href="https://wa.me/6281234567890?text=Halo%20DC%20Wedding,%20saya%20ingin%20konsultasi%20Wedding%20Planner" target="_blank" className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">Mulai konsultasi <ArrowRight className="h-4 w-4" /></Link></section>
      </div>
    </main>
  );
}