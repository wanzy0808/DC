import Link from "next/link";
import { ArrowRight, CircleHelp } from "lucide-react";
import FaqSection from "@/components/Marketing/FaqSection";
import Navbar from "@/components/Layout/Navbar/Navbar";
import PublicMarketingAtmosphere from "@/components/Layout/PublicMarketingAtmosphere";
import MarketingFrameFooter from "@/components/Layout/MarketingFrameFooter";

const helpFaq = [
  {
    question: "Apa perbedaan Digital Invitation dan Guestbook Digital?",
    answer:
      "Digital Invitation berfokus pada undangan online, RSVP, publikasi, dan fitur undangan. Guestbook Digital berfokus pada penerimaan tamu, QR check-in, attendance realtime, seating, dan Usher App.",
  },
  {
    question: "Apakah saya bisa melihat template sebelum membeli paket?",
    answer:
      "Bisa. Template dapat dilihat dan diedit dalam mode template. Fitur publikasi dan asset pribadi mengikuti paket Digital Invitation yang aktif.",
  },
  {
    question: "Bagaimana tamu masuk ke venue?",
    answer:
      "QR adalah validasi resmi untuk check-in. Jika tamu datang tanpa konfirmasi RSVP, usher dapat mencari nama tamu yang memang terdaftar, menerbitkan QR resmi melalui Usher App, lalu QR tersebut tetap harus dipindai untuk check-in.",
  },
  {
    question: "Bagaimana cara memilih paket?",
    answer:
      "Buka halaman Paket untuk melihat pilihan layanan. Setelah memilih paket dan pembayaran dikonfirmasi admin, fitur sesuai paket akan aktif di dashboard.",
  },
  {
    question: "Saya mengalami masalah saat menggunakan dashboard, harus bagaimana?",
    answer:
      "Pastikan akun sudah masuk dan paket yang dibutuhkan sudah aktif. Jika masalah tetap terjadi, simpan informasi error yang muncul agar tim Undara dapat membantu melakukan pengecekan.",
  },
];

export default function HelpPage() {
  return (
    <div className="relative isolate flex min-h-dvh w-full flex-col overflow-hidden bg-background text-foreground">
      <PublicMarketingAtmosphere />
      <div
        data-undara-marketing-frame
        className="undara-marketing-frame"
      >
        <div className="undara-marketing-frame-header">
          <Navbar embedded />
        </div>

        <main className="undara-marketing-scroll relative z-20">
          <div className="mx-auto w-full max-w-none space-y-24 px-5 py-8 sm:px-8 md:space-y-28 md:py-12 lg:px-12 xl:px-16 2xl:px-20">
            <section className="grid min-h-[min(68dvh,690px)] items-center gap-10 border-b border-primary/25 pb-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
              <div>
              <div className="flex items-center gap-3 font-[family-name:var(--font-undara-mono)] text-[10px] uppercase tracking-[0.22em] text-primary">
                <CircleHelp className="h-4 w-4" />
                Bantuan Undara
              </div>
              <h1 className="mt-5 max-w-[18ch] font-[family-name:var(--font-undara-heading)] text-[clamp(3rem,6vw,6.6rem)] leading-[0.97] tracking-[-0.035em] text-primary">
                Jawaban untuk pertanyaan yang paling sering muncul.
              </h1>
              </div>
              <div className="max-w-xl border-l border-primary/30 py-5 pl-7 md:pl-12">
              <p className="text-sm leading-7 text-muted-foreground md:text-base md:leading-8">
                Panduan singkat mengenai produk, paket, template, publikasi, RSVP,
                Guestbook, dan alur penggunaan Undara.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/d-invitation" className="inline-flex items-center gap-2 border-b border-primary/50 pb-2 text-sm text-primary hover:border-primary">Undangan Digital <ArrowRight className="h-4 w-4" /></Link>
                <Link href="/guestbook" className="inline-flex items-center gap-2 border-b border-primary/50 pb-2 text-sm text-primary hover:border-primary">Buku Tamu Digital <ArrowRight className="h-4 w-4" /></Link>
              </div>
              </div>
            </section>

            <div className="border-b border-primary/25 pb-16"><FaqSection
              title="Pertanyaan umum"
              description="Kalau masih bingung, mulai dari sini."
              items={helpFaq}
              wide
              editorial
            /></div>

            <section className="mb-4 grid gap-8 border-y border-primary/30 py-14 md:py-20 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16">
              <div>
                <p className="font-[family-name:var(--font-undara-mono)] text-[10px] uppercase tracking-[0.2em] text-primary">Langkah Berikutnya</p>
                <h2 className="mt-4 font-[family-name:var(--font-undara-heading)] text-4xl text-primary md:text-6xl">Siap mulai?</h2>
                <p className="mt-5 max-w-xl text-sm leading-7 text-muted-foreground md:text-base md:leading-8">
                  Lihat paket atau masuk ke dashboard untuk melanjutkan persiapan.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/packages"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-primary bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
                >
                  Lihat Paket <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-primary/55 px-6 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
                >
                  Masuk
                </Link>
              </div>
            </section>
          </div>
        </main>

        <MarketingFrameFooter />
      </div>
    </div>
  );
}
