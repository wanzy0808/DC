import Link from "next/link";
import { ArrowRight, Check, MessageCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import FounderSection from "@/components/WeddingPlanner/FounderSection";
import ServicesSection from "@/components/WeddingPlanner/ServicesSection";
import PortfolioSection from "@/components/WeddingPlanner/PortfolioSection";
import ReviewsGrid from "@/components/Marketing/ReviewsGrid";
import FaqSection from "@/components/Marketing/FaqSection";
import {
  plannerFaq,
  plannerPackages,
  plannerReviews,
} from "@/data/wedding-planner";

const WHATSAPP_NUMBER = "6282124786516";

function consultationUrl(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export default function EventPlannerPage() {
  return (
    <main className="relative z-10 min-h-screen w-full overflow-x-clip pb-20 pt-24 text-[var(--foreground)]">
      <div className="mx-auto w-[min(92vw,1400px)] space-y-28">
        <header className="flex flex-col gap-6 border-b border-[var(--border)] pb-9 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="font-[family-name:var(--font-dc-mono)] text-xs font-semibold uppercase tracking-[0.24em] text-[var(--primary)]">
              [ DC ORGANIZER / EVENT PLANNER ]
            </p>
            <h1 className="mt-3 font-[family-name:var(--font-dc-heading)] text-4xl leading-tight md:text-6xl">
              Event Planner untuk momen yang ingin kamu jalani dengan lebih tenang.
            </h1>
            <p className="mt-5 max-w-2xl font-[family-name:var(--font-dc-body)] text-sm leading-7 text-[var(--muted-foreground)] md:text-base">
              Dari wedding sampai anniversary dan baby shower, kami membantu merapikan konsep, vendor, rundown, tim, dan detail operasional supaya acara tetap terasa personal tanpa membuatmu tenggelam di koordinasi.
            </p>
          </div>
          <Button asChild size="lg" className="w-fit">
            <Link href="/login">
              <User className="h-4 w-4" />
              Client Login
            </Link>
          </Button>
        </header>

        <FounderSection />
        <ServicesSection />
        <PortfolioSection />

        <section className="border-y border-[var(--border)] py-12 md:py-16">
          <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
            <div className="max-w-3xl">
              <p className="font-[family-name:var(--font-dc-mono)] text-[10px] uppercase tracking-[0.2em] text-[var(--primary)]">
                [ DIGITAL WORKFLOW ]
              </p>
              <h2 className="mt-3 font-[family-name:var(--font-dc-heading)] text-3xl md:text-4xl">
                Planning yang nyambung dengan undangan dan data tamu.
              </h2>
              <p className="mt-4 max-w-2xl font-[family-name:var(--font-dc-body)] text-sm leading-7 text-[var(--muted-foreground)]">
                Bila dibutuhkan, setiap acara dapat memakai Undangan Digital DC Organizer untuk publikasi, RSVP, dan manajemen tamu. WA Blast tersedia sebagai add-on terpisah sesuai kuota acara.
              </p>
            </div>
            <Button asChild size="lg" className="w-fit">
              <Link href="/d-invitation">
                Lihat Undangan Digital
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        <section className="space-y-10" aria-labelledby="event-planner-packages">
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-[family-name:var(--font-dc-mono)] text-xs font-semibold uppercase tracking-[0.24em] text-[var(--primary)]">
              [ EVENT PLANNER PACKAGES ]
            </p>
            <h2
              id="event-planner-packages"
              className="mt-3 font-[family-name:var(--font-dc-heading)] text-3xl md:text-5xl"
            >
              Empat tipe layanan, dibahas sesuai kebutuhan acara.
            </h2>
            <p className="mt-4 font-[family-name:var(--font-dc-body)] text-sm leading-7 text-[var(--muted-foreground)] md:text-base">
              Kami tidak menampilkan harga tetap karena venue, jumlah tamu, kebutuhan tim, vendor, dan scope tiap acara berbeda. Mulai dari konsultasi, lalu kami susun kebutuhan yang paling relevan.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {plannerPackages.map((item, index) => (
              <article
                key={item.key}
                className="flex h-full flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)]/70 p-6 md:p-7"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-[family-name:var(--font-dc-mono)] text-[9px] uppercase tracking-[0.18em] text-[var(--primary)]">
                      Paket {String(index + 1).padStart(2, "0")}
                    </p>
                    <h3 className="mt-2 font-[family-name:var(--font-dc-heading)] text-2xl">
                      {item.name}
                    </h3>
                  </div>
                  <MessageCircle className="mt-1 h-5 w-5 shrink-0 text-[var(--primary)]" />
                </div>

                <p className="mt-4 font-[family-name:var(--font-dc-body)] text-sm leading-7 text-[var(--muted-foreground)]">
                  {item.description}
                </p>

                <ul className="mt-6 flex-1 space-y-3">
                  {item.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex gap-3 font-[family-name:var(--font-dc-body)] text-sm leading-6"
                    >
                      <Check className="mt-1 h-4 w-4 shrink-0 text-[var(--primary)]" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button asChild size="lg" className="mt-7 w-full">
                  <a
                    href={consultationUrl(item.waMessage)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Konsultasi
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
              </article>
            ))}
          </div>

          <p className="text-center font-[family-name:var(--font-dc-mono)] text-[10px] text-[var(--muted-foreground)]">
            WhatsApp konsultasi: +62 821-2478-6516
          </p>
        </section>

        <ReviewsGrid
          eyebrow="Client Stories"
          title="Saat host bisa benar-benar hadir di acaranya sendiri"
          description="Cerita dari klien yang mempercayakan koordinasi dan planning kepada DC Organizer."
          reviews={plannerReviews}
        />

        <FaqSection
          title="Pertanyaan tentang Event Planner"
          description="Hal-hal yang paling sering ditanyakan sebelum memulai konsultasi dan menentukan scope acara."
          items={plannerFaq}
        />

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)]/70 p-8 md:p-12">
          <p className="font-[family-name:var(--font-dc-mono)] text-xs uppercase tracking-[0.2em] text-[var(--primary)]">
            [ READY WHEN YOU ARE ]
          </p>
          <h2 className="mt-3 max-w-2xl font-[family-name:var(--font-dc-heading)] text-3xl md:text-4xl">
            Ceritakan dulu acaranya. Scope bisa kita susun setelahnya.
          </h2>
          <p className="mt-4 max-w-2xl font-[family-name:var(--font-dc-body)] text-sm leading-7 text-[var(--muted-foreground)]">
            Mulai dari tanggal, venue, jumlah tamu, dan jenis acara yang kamu bayangkan. Tim kami akan membantu memetakan prioritas sebelum masuk ke penawaran.
          </p>
          <Button asChild size="lg" className="mt-7">
            <a
              href={consultationUrl(
                "Halo, aku ingin tanya2 mengenai paket Event Planner.",
              )}
              target="_blank"
              rel="noreferrer"
            >
              Mulai konsultasi
              <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
        </section>
      </div>
    </main>
  );
}
