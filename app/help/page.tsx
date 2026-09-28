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
        data-dc-marketing-frame
        className="undara-marketing-frame"
      >
        <div className="undara-marketing-frame-header">
          <Navbar embedded />
        </div>

        <main className="undara-marketing-scroll">
          <div className="mx-auto w-[88%] max-w-[1100px] space-y-20 py-12 sm:w-[80vw] md:space-y-24 md:py-16">
            <section className="space-y-5">
              <div className="flex items-center gap-3 text-sm uppercase tracking-[0.24em] text-primary">
                <CircleHelp className="h-4 w-4" />
                Bantuan Undara
              </div>
              <h1 className="max-w-3xl text-4xl leading-tight md:text-6xl">
                Jawaban untuk pertanyaan yang paling sering muncul.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                Panduan singkat mengenai produk, paket, template, publikasi, RSVP,
                Guestbook, dan alur penggunaan Undara.
              </p>
            </section>

            <FaqSection
              title="Pertanyaan umum"
              description="Kalau masih bingung, mulai dari sini."
              items={helpFaq}
            />

            <section className="flex flex-col gap-4 rounded-[24px] border border-primary/25 bg-card/65 p-7 md:flex-row md:items-center md:justify-between md:p-9">
              <div>
                <p className="font-heading text-xl text-primary">Siap mulai?</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Lihat paket atau masuk ke dashboard untuk melanjutkan persiapan.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/packages"
                  className="inline-flex min-h-10 items-center justify-center rounded-[16px] border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Lihat Paket <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex min-h-10 items-center justify-center rounded-[16px] border border-primary/55 bg-background/70 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
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
