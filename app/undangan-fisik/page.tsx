"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  Check,
  Layers3,
  Mail,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import Navbar from "@/components/Layout/Navbar/Navbar";
import PublicMarketingAtmosphere from "@/components/Layout/PublicMarketingAtmosphere";
import MarketingFrameFooter from "@/components/Layout/MarketingFrameFooter";
import ScrollReveal from "@/components/EventPlanner/ScrollReveal";
import { useLanguage } from "@/components/I18n/LanguageProvider";
import { Button } from "@/components/ui/button";

const WHATSAPP = "https://wa.me/6281285009609?text=";

export default function UndanganFisikPage() {
  const { locale } = useLanguage();
  const scrollRoot = useRef<HTMLElement>(null);
  const en = locale === "en";

  const steps = en
    ? [
        ["Tell us about your event", "Share the event type, quantity, date, delivery city, and the visual direction you have in mind."],
        ["Choose the tactile details", "Discuss paper character, envelope treatment, color, print technique, and finishing touches."],
        ["Review the proof carefully", "Check names, wording, date, venue, layout, and production details before print approval."],
        ["Confirm production & delivery", "Production and delivery timing are confirmed around the final specification and order quantity."],
      ]
    : [
        ["Ceritakan acaramu", "Bagikan jenis acara, jumlah undangan, tanggal, kota pengiriman, dan arah visual yang kamu bayangkan."],
        ["Pilih detail yang terasa di tangan", "Diskusikan karakter kertas, amplop, warna, teknik cetak, dan sentuhan finishing."],
        ["Periksa proof dengan teliti", "Pastikan nama, isi, tanggal, lokasi, layout, dan detail produksi tepat sebelum persetujuan cetak."],
        ["Konfirmasi produksi & pengiriman", "Jadwal produksi dan pengiriman mengikuti spesifikasi final serta jumlah pesanan yang disepakati."],
      ];

  const materials = en
    ? [
        [Layers3, "Paper", "Weight, texture, and tone create the first tactile impression before the invitation is even read."],
        [Mail, "Envelope", "The envelope frames the experience and can carry color, lining, seals, or other agreed details."],
        [Sparkles, "Finishing", "Small production details can add contrast and character without making the invitation feel overly decorated."],
      ] as const
    : [
        [Layers3, "Kertas", "Gramatur, tekstur, dan tone membentuk kesan pertama bahkan sebelum undangannya mulai dibaca."],
        [Mail, "Amplop", "Amplop membingkai pengalaman dan dapat membawa warna, lining, seal, atau detail lain yang disepakati."],
        [Sparkles, "Finishing", "Detail produksi kecil dapat memberi kontras dan karakter tanpa membuat undangan terasa terlalu ramai."],
      ] as const;

  const waMessage = en
    ? "Hi Undara, I would like to discuss printed invitations."
    : "Halo Undara, aku ingin konsultasi undangan fisik.";

  return (
    <div className="relative isolate flex min-h-dvh w-full flex-col overflow-hidden bg-background text-foreground">
      <PublicMarketingAtmosphere />

      <div data-undara-marketing-frame className="undara-marketing-frame">
        <div className="undara-marketing-frame-header">
          <Navbar embedded />
        </div>

        <main
          ref={scrollRoot}
          tabIndex={0}
          aria-label={en ? "Printed invitation page content" : "Konten halaman Undangan Fisik"}
          className="undara-marketing-scroll relative z-20 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-primary"
        >
          <div className="undara-marketing-content flex flex-col gap-24 py-8 md:gap-28 md:py-12">
            <ScrollReveal scrollRoot={scrollRoot}>
              <section className="undara-marketing-section undara-editorial-ambient undara-editorial-ambient-left grid min-h-[calc(100dvh-170px)] items-center gap-12 overflow-hidden border-b border-primary/25 pb-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:pb-16">
                <div className="relative z-10 max-w-3xl py-8 lg:py-12">
                  <p className="undara-marketing-kicker">
                    {en ? "Printed Invitations / Undara" : "Undangan Fisik / Undara"}
                  </p>

                  <h1 className="mt-5 max-w-[14ch] font-[family-name:var(--font-undara-heading)] text-[clamp(3.2rem,6vw,6.8rem)] leading-[0.94] tracking-[-0.04em] text-primary">
                    {en ? "A keepsake in every detail." : "Kabar bahagia yang bisa disimpan."}
                    <span className="block text-foreground">
                      {en ? "Made to be held." : "Terasa hingga di tangan."}
                    </span>
                  </h1>

                  <p className="mt-7 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base md:leading-8">
                    {en
                      ? "From paper character and envelope treatment to print finishing, create a physical invitation that feels considered before guests even open it."
                      : "Dari karakter kertas dan perlakuan amplop sampai finishing cetak, buat undangan fisik yang terasa dipikirkan bahkan sebelum tamu membukanya."}
                  </p>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <Button asChild size="lg">
                      <a href={WHATSAPP + encodeURIComponent(waMessage)} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="h-4 w-4" />
                        {en ? "Discuss your invitation" : "Konsultasi Undangan"}
                      </a>
                    </Button>
                    <Button asChild size="lg" variant="outline">
                      <a href="#proses">
                        {en ? "See the process" : "Lihat Proses"}
                        <ArrowDownRight className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>

                  <p className="mt-10 border-t border-primary/20 pt-5 font-[family-name:var(--font-undara-mono)] text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
                    {en ? "Design / Paper / Envelope / Print / Finishing" : "Desain / Kertas / Amplop / Cetak / Finishing"}
                  </p>
                </div>

                <div className="relative z-10 min-h-[470px] lg:min-h-[690px]">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-[4%] top-[6%] h-[64%] w-[64%] rounded-full bg-[radial-gradient(circle,rgba(112,59,59,0.12),transparent_68%)] blur-3xl dark:bg-[radial-gradient(circle,rgba(214,179,140,0.10),transparent_68%)]"
                  />
                  <div className="undara-editorial-media absolute inset-[4%_0_2%_4%]">
                    <Image
                      src="/assets/marketing/physical-invitation/hero.webp"
                      alt={en ? "Printed invitation stationery" : "Undangan cetak dan perlengkapan kertas"}
                      fill
                      priority
                      sizes="(max-width: 1024px) 94vw, 54vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(30,18,16,0.76)_0%,rgba(30,18,16,0.12)_50%,transparent_70%)]" />
                    <div className="absolute bottom-7 left-7 right-7 text-white md:bottom-10 md:left-10 md:right-10">
                      <p className="font-[family-name:var(--font-undara-mono)] text-[9px] uppercase tracking-[0.17em] text-white/65">
                        {en ? "Paper becomes part of the story" : "Kertas Menjadi Bagian dari Cerita"}
                      </p>
                      <p className="mt-2 max-w-lg font-[family-name:var(--font-undara-heading)] text-2xl leading-tight md:text-3xl lg:text-4xl">
                        {en ? "A moment guests can carry home." : "Sebuah momen yang bisa dibawa pulang."}
                      </p>
                    </div>
                  </div>

                  <div className="absolute left-0 top-[15%] hidden w-[220px] border border-primary/25 bg-background/88 p-5 shadow-[0_18px_50px_rgba(58,32,32,0.11)] backdrop-blur-md md:block">
                    <p className="undara-editorial-index">{en ? "Printed invitation" : "Undangan Cetak"}</p>
                    <p className="mt-3 font-[family-name:var(--font-undara-heading)] text-xl leading-tight text-primary">
                      {en ? "Texture, proportion, and quiet details matter." : "Tekstur, proporsi, dan detail kecil ikut berbicara."}
                    </p>
                  </div>
                </div>
              </section>
            </ScrollReveal>

            <ScrollReveal scrollRoot={scrollRoot}>
              <section className="undara-marketing-section undara-editorial-offset-right undara-editorial-rail border-y border-primary/25 py-14 md:py-20">
                <div className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-end lg:gap-16">
                  <div>
                    <p className="undara-marketing-kicker">{en ? "Tactile direction" : "Arah Tactile"}</p>
                    <h2 className="mt-4 max-w-[16ch] font-[family-name:var(--font-undara-heading)] text-4xl leading-[1.04] text-primary md:text-5xl lg:text-6xl">
                      {en ? "The design is not only what guests see." : "Desainnya bukan hanya apa yang tamu lihat."}
                    </h2>
                  </div>
                  <p className="max-w-2xl text-sm leading-7 text-muted-foreground md:text-base md:leading-8">
                    {en
                      ? "Printed invitations have weight, texture, edges, folds, and production constraints. Those details become part of the design rather than an afterthought."
                      : "Undangan fisik punya berat, tekstur, tepian, lipatan, dan batas produksi. Detail itu menjadi bagian dari desain, bukan dipikirkan paling akhir."}
                  </p>
                </div>

                <div className="mt-12 grid border-y border-primary/30 md:grid-cols-3">
                  {materials.map(([Icon, title, detail], index) => (
                    <article
                      key={title}
                      className={`py-8 md:px-8 md:py-10 ${index > 0 ? "border-t border-primary/20 md:border-l md:border-t-0" : ""}`}
                    >
                      <div className="flex items-center gap-4">
                        <Icon className="h-5 w-5 text-primary" strokeWidth={1.5} aria-hidden="true" />
                      </div>
                      <h3 className="mt-8 font-[family-name:var(--font-undara-heading)] text-2xl text-primary md:text-3xl">
                        {title}
                      </h3>
                      <p className="mt-4 text-sm leading-7 text-muted-foreground md:text-base md:leading-8">
                        {detail}
                      </p>
                    </article>
                  ))}
                </div>
              </section>
            </ScrollReveal>

            <ScrollReveal scrollRoot={scrollRoot}>
              <section id="proses" className="undara-marketing-section undara-editorial-offset-left scroll-mt-24 border-y border-primary/25 py-14 md:py-20">
                <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:gap-16">
                  <div>
                    <p className="undara-marketing-kicker">{en ? "From idea to delivery" : "Dari Ide hingga Diterima"}</p>
                    <h2 className="mt-4 max-w-[17ch] font-[family-name:var(--font-undara-heading)] text-4xl leading-[1.04] text-primary md:text-5xl lg:text-6xl">
                      {en ? "A slower process, for a more considered object." : "Proses yang lebih pelan untuk hasil yang lebih dipikirkan."}
                    </h2>
                  </div>
                  <p className="max-w-2xl text-sm leading-7 text-muted-foreground md:text-base md:leading-8">
                    {en
                      ? "Design direction, print specifications, proofing, production, and delivery are discussed in sequence so expectations stay clear before anything is printed."
                      : "Arah desain, spesifikasi cetak, proofing, produksi, dan pengiriman dibicarakan berurutan supaya ekspektasi jelas sebelum apa pun masuk mesin cetak."}
                  </p>
                </div>

                <div className="mt-12 border-t border-primary/30">
                  {steps.map(([title, detail], index) => (
                    <article
                      key={title}
                      className={`grid gap-6 border-b border-primary/25 py-8 md:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] md:items-center md:gap-9 md:py-11 ${index % 2 ? "lg:pl-[6%]" : "lg:pr-[5%]"}`}
                    >
                      <h3 className="max-w-[17ch] font-[family-name:var(--font-undara-heading)] text-2xl leading-[1.08] text-primary md:text-3xl lg:text-4xl">
                        {title}
                      </h3>
                      <p className="flex max-w-xl gap-3 text-sm leading-7 text-muted-foreground md:text-base md:leading-8">
                        <Check className="mt-2 h-4 w-4 shrink-0 text-primary" />
                        {detail}
                      </p>
                    </article>
                  ))}
                </div>
              </section>
            </ScrollReveal>

            <ScrollReveal scrollRoot={scrollRoot}>
              <section className="undara-marketing-section undara-editorial-offset-right undara-editorial-rail grid gap-10 border-b border-primary/25 pb-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:gap-16">
                <div>
                  <p className="undara-marketing-kicker">{en ? "Digital companion" : "Pasangan Digital"}</p>
                  <h2 className="mt-4 max-w-[17ch] font-[family-name:var(--font-undara-heading)] text-4xl leading-[1.04] text-primary md:text-5xl">
                    {en ? "Need a digital invitation too?" : "Perlu Undangan Digital juga?"}
                  </h2>
                </div>
                <div>
                  <p className="max-w-xl text-sm leading-7 text-muted-foreground md:text-base md:leading-8">
                    {en
                      ? "Digital invitations with RSVP and guest management remain available separately for each event."
                      : "Undangan Digital dengan RSVP dan manajemen tamu tetap tersedia sebagai produk terpisah untuk setiap acara."}
                  </p>
                  <Button asChild variant="outline" className="mt-6">
                    <Link href="/d-invitation">
                      {en ? "Explore Digital Invitations" : "Lihat Undangan Digital"}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </section>
            </ScrollReveal>

            <ScrollReveal scrollRoot={scrollRoot}>
              <section className="undara-marketing-section undara-editorial-offset-left undara-editorial-ambient undara-editorial-ambient-right relative mb-4 overflow-hidden border-y border-primary/30 py-14 md:py-20">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-[8%] top-1/2 h-[30rem] w-[30rem] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(112,59,59,0.11),transparent_68%)] blur-2xl dark:bg-[radial-gradient(circle,rgba(214,179,140,0.08),transparent_68%)]"
                />
                <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16">
                  <div>
                    <p className="undara-marketing-kicker">{en ? "Start with the specification" : "Mulai dari Spesifikasinya"}</p>
                    <h2 className="mt-4 max-w-[20ch] font-[family-name:var(--font-undara-heading)] text-4xl leading-[1.04] text-primary md:text-6xl">
                      {en ? "Tell us what you want guests to hold." : "Ceritakan apa yang ingin kamu letakkan di tangan tamu."}
                    </h2>
                    <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base md:leading-8">
                      {en
                        ? "Share the quantity, event date, delivery city, and visual direction. Pricing and production estimates follow the specification that is agreed together."
                        : "Bagikan jumlah cetak, tanggal acara, kota pengiriman, dan arah visual. Harga serta estimasi produksi mengikuti spesifikasi yang disepakati bersama."}
                    </p>
                  </div>
                  <Button asChild size="lg" className="w-fit">
                    <a href={WHATSAPP + encodeURIComponent(waMessage)} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="h-4 w-4" />
                      WhatsApp Undara
                    </a>
                  </Button>
                </div>
              </section>
            </ScrollReveal>
          </div>
        </main>

        <MarketingFrameFooter />
      </div>
    </div>
  );
}
