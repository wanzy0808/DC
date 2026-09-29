"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowDownRight, ArrowRight, Check, MessageCircle } from "lucide-react";
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
        ["Tell us about your event", "Share the event type, quantity, date and delivery location."],
        ["Choose the details", "Discuss the visual direction, paper, envelope and finishing touches."],
        ["Review the proof", "Check names, date, venue and layout before print approval."],
        ["Print and deliver", "Production and delivery timing are confirmed when you place the order."],
      ]
    : [
        ["Ceritakan acaramu", "Bagikan jenis acara, jumlah undangan, tanggal, dan alamat pengiriman."],
        ["Tentukan detailnya", "Diskusikan desain, pilihan kertas, amplop, dan sentuhan akhir."],
        ["Periksa pratinjau", "Pastikan nama, tanggal, lokasi, dan tata letaknya tepat sebelum cetak."],
        ["Cetak dan kirim", "Jadwal produksi serta pengiriman dikonfirmasi saat pemesanan."],
      ];
  const waMessage = en
    ? "Hi Undara, I would like to discuss printed invitations."
    : "Halo Undara, aku ingin konsultasi undangan fisik.";

  return (
    <div className="relative isolate flex min-h-dvh w-full flex-col overflow-hidden bg-background text-foreground">
      <PublicMarketingAtmosphere />
      <div data-undara-marketing-frame className="undara-marketing-frame">
        <div className="undara-marketing-frame-header"><Navbar embedded /></div>
        <main ref={scrollRoot} tabIndex={0} aria-label={en ? "Printed invitation page content" : "Konten halaman Undangan Fisik"} className="undara-marketing-scroll relative z-20 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-primary">
          <div className="mx-auto flex w-full max-w-none flex-col gap-24 px-5 py-8 sm:px-8 md:gap-28 md:py-12 lg:px-12 xl:px-16 2xl:px-20">
            <ScrollReveal scrollRoot={scrollRoot}>
              <section className="grid min-h-[calc(100dvh-150px)] items-center gap-10 border-b border-primary/25 pb-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16 lg:pb-16">
                <div className="max-w-3xl py-8">
                  <p className="font-[family-name:var(--font-undara-mono)] text-[10px] uppercase tracking-[0.22em] text-primary md:text-xs">{en ? "Printed Invitations / Undara" : "Undangan Fisik / Undara"}</p>
                  <h1 className="mt-5 font-[family-name:var(--font-undara-heading)] text-[clamp(3rem,6vw,6.6rem)] leading-[0.97] tracking-[-0.035em] text-primary">
                    {en ? "A keepsake in every detail." : "Kabar bahagia yang bisa disimpan."}
                    <span className="block text-foreground">{en ? "Made to be held." : "Terasa hingga di tangan."}</span>
                  </h1>
                  <p className="mt-7 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base md:leading-8">{en ? "From design and paper to the last finishing touch, make a printed invitation that feels personal to your celebration." : "Dari desain dan pilihan kertas hingga sentuhan akhir, buat undangan cetak yang terasa dekat dengan cerita perayaanmu."}</p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Button asChild size="lg"><a href={WHATSAPP + encodeURIComponent(waMessage)} target="_blank" rel="noopener noreferrer"><MessageCircle className="h-4 w-4" />{en ? "Discuss your invitation" : "Konsultasi Undangan"}</a></Button>
                    <Button asChild size="lg" variant="outline"><a href="#proses">{en ? "See the process" : "Lihat Proses"}<ArrowDownRight className="h-4 w-4" /></a></Button>
                  </div>
                  <p className="mt-10 border-t border-primary/20 pt-5 font-[family-name:var(--font-undara-mono)] text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{en ? "Design / Paper / Envelope / Finishing" : "Desain / Kertas / Amplop / Finishing"}</p>
                </div>
                <div className="relative min-h-[440px] lg:min-h-[680px]">
                  <div className="absolute inset-[4%_0_2%_4%] overflow-hidden rounded-[48px_8px_48px_8px] border border-primary/25 bg-card shadow-[0_30px_90px_rgba(70,42,32,0.14)]">
                    <Image src="/assets/marketing/physical-invitation/hero.webp" alt={en ? "Printed invitation stationery" : "Undangan cetak dan perlengkapan kertas"} fill priority sizes="(max-width: 1024px) 94vw, 54vw" className="object-cover" />
                    <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(24,16,12,0.65),transparent_62%)]" />
                    <p className="absolute bottom-7 left-7 right-7 max-w-lg font-[family-name:var(--font-undara-heading)] text-2xl text-white md:bottom-10 md:left-10 md:text-3xl">{en ? "A moment guests can take home." : "Sebuah momen yang bisa dibawa pulang."}</p>
                  </div>
                </div>
              </section>
            </ScrollReveal>
            <ScrollReveal scrollRoot={scrollRoot}>
              <section id="proses" className="scroll-mt-24 border-y border-primary/25 py-14 md:py-20">
                <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-end lg:gap-16">
                  <div><p className="font-[family-name:var(--font-undara-mono)] text-[10px] uppercase tracking-[0.2em] text-primary">{en ? "From idea to delivery" : "Dari Ide Hingga Diterima"}</p><h2 className="mt-4 max-w-[20ch] font-[family-name:var(--font-undara-heading)] text-4xl leading-[1.04] text-primary md:text-5xl lg:text-6xl">{en ? "The little details make it yours." : "Detail kecil yang membuatnya terasa milikmu."}</h2></div>
                  <p className="max-w-2xl text-sm leading-7 text-muted-foreground md:text-base md:leading-8">{en ? "Tell us what you have in mind. The design, print specifications and delivery schedule are discussed together before production." : "Ceritakan bayanganmu lebih dulu. Desain, spesifikasi cetak, dan jadwal pengiriman dibicarakan bersama sebelum produksi."}</p>
                </div>
                <div className="mt-12 border-t border-primary/30">
                  {steps.map(([title, detail], index) => (
                    <article key={title} className={`grid gap-5 border-b border-primary/25 py-8 md:grid-cols-[0.9fr_1.1fr] md:items-center md:gap-16 md:py-11 ${index % 2 ? "md:pl-[8%]" : "md:pr-[8%]"}`}>
                      <h3 className={`font-[family-name:var(--font-undara-heading)] text-2xl text-primary md:text-4xl ${index % 2 ? "md:order-2" : ""}`}>{title}</h3>
                      <p className={`flex max-w-xl gap-3 text-sm leading-7 text-muted-foreground md:text-base md:leading-8 ${index % 2 ? "md:order-1" : ""}`}><Check className="mt-2 h-4 w-4 shrink-0 text-primary" />{detail}</p>
                    </article>
                  ))}
                </div>
              </section>
            </ScrollReveal>
            <ScrollReveal scrollRoot={scrollRoot}>
              <section className="grid gap-10 border-b border-primary/25 pb-14 lg:grid-cols-2 lg:items-end lg:gap-16">
                <h2 className="max-w-[20ch] font-[family-name:var(--font-undara-heading)] text-4xl leading-tight text-primary md:text-5xl">{en ? "Need a digital invitation too?" : "Perlu Undangan Digital juga?"}</h2>
                <div><p className="max-w-xl text-sm leading-7 text-muted-foreground md:text-base md:leading-8">{en ? "Digital invitations with RSVP and guest management are available separately for each event." : "Undangan Digital dengan RSVP dan manajemen tamu tersedia terpisah untuk setiap acara."}</p><Button asChild variant="outline" className="mt-6"><Link href="/d-invitation">{en ? "Explore Digital Invitations" : "Lihat Undangan Digital"}<ArrowRight className="h-4 w-4" /></Link></Button></div>
              </section>
            </ScrollReveal>
            <ScrollReveal scrollRoot={scrollRoot}>
              <section className="mb-4 grid gap-8 border-y border-primary/30 py-14 md:py-20 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16">
                <div><p className="font-[family-name:var(--font-undara-mono)] text-[10px] uppercase tracking-[0.2em] text-primary">{en ? "Start here" : "Mulai dari Sini"}</p><h2 className="mt-4 max-w-[22ch] font-[family-name:var(--font-undara-heading)] text-4xl leading-[1.04] text-primary md:text-6xl">{en ? "Let's talk about the invitation you imagine." : "Ceritakan undangan yang kamu bayangkan."}</h2><p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base md:leading-8">{en ? "Share the quantity, date and design direction. Pricing and production estimates follow the agreed specifications." : "Bagikan jumlah cetak, tanggal, dan arah desain. Harga serta estimasi produksi diberikan sesuai spesifikasi yang disepakati."}</p></div>
                <Button asChild size="lg" className="w-fit"><a href={WHATSAPP + encodeURIComponent(waMessage)} target="_blank" rel="noopener noreferrer"><MessageCircle className="h-4 w-4" />{en ? "WhatsApp Undara" : "WhatsApp Undara"}</a></Button>
              </section>
            </ScrollReveal>
          </div>
        </main>
        <MarketingFrameFooter />
      </div>
    </div>
  );
}
