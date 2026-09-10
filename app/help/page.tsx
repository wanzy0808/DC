import Link from "next/link";
import { ArrowRight, CircleHelp } from "lucide-react";
import { Button } from "@/components/ui/button";
import FaqSection from "@/components/Marketing/FaqSection";

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
      "Buka halaman Package untuk melihat pilihan layanan. Setelah memilih paket dan pembayaran dikonfirmasi admin, fitur sesuai paket akan aktif di dashboard.",
  },
  {
    question: "Saya mengalami masalah saat menggunakan dashboard, harus bagaimana?",
    answer:
      "Pastikan akun sudah masuk dan paket yang dibutuhkan sudah aktif. Jika masalah tetap terjadi, simpan informasi error yang muncul agar tim DC dapat membantu melakukan pengecekan.",
  },
];

export default function HelpPage() {
  return (
    <div className="w-full space-y-20 py-16 md:py-24">
      <section className="space-y-5">
        <div className="flex items-center gap-3 text-sm uppercase tracking-[0.24em] text-primary">
          <CircleHelp className="h-4 w-4" />
          Bantuan DC Wedding
        </div>
        <h1 className="max-w-3xl text-4xl leading-tight md:text-6xl">
          Jawaban untuk pertanyaan yang paling sering muncul.
        </h1>
        <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
          Panduan singkat mengenai produk, paket, template, publikasi, RSVP,
          Guestbook, dan alur penggunaan DC Wedding.
        </p>
      </section>

      <FaqSection
        title="Pertanyaan umum"
        description="Kalau masih bingung, mulai dari sini."
        items={helpFaq}
      />

      <section className="flex flex-col gap-4 rounded-3xl border border-[var(--border)] bg-[var(--card)]/70 p-7 md:flex-row md:items-center md:justify-between md:p-9">
        <div>
          <p className="font-[family-name:var(--font-dc-heading)] text-xl">
            Siap mulai?
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Lihat paket atau masuk ke dashboard untuk melanjutkan persiapan.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/packages">
              Lihat Package <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/login">Masuk</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
