"use client";

import { useRef } from "react";
import Navbar from "@/components/Layout/Navbar/Navbar";
import PublicMarketingAtmosphere from "@/components/Layout/PublicMarketingAtmosphere";
import MarketingFrameFooter from "@/components/Layout/MarketingFrameFooter";
import MarketingTextReveal from "@/components/DigitalInvitation/MarketingTextReveal";
import ScrollReveal from "@/components/EventPlanner/ScrollReveal";
import { useLanguage } from "@/components/I18n/LanguageProvider";
import Link from "next/link";
import { ArrowRight, Mail, Palette, PackageCheck } from "lucide-react";

const steps = [
  { title: "Ceritakan acaramu", detail: "Bagikan jenis acara, jumlah undangan, tanggal, dan alamat pengiriman." },
  { title: "Tentukan desain", detail: "Pilih arah visual, ukuran, bahan, dan detail personal yang ingin ditampilkan." },
  { title: "Setujui pratinjau", detail: "Periksa nama, waktu, lokasi, serta tata letak sebelum masuk proses cetak." },
  { title: "Cetak dan kirim", detail: "Produksi dimulai setelah desain disetujui. Estimasi pengerjaan dan pengiriman dikonfirmasi saat pemesanan." },
];

export default function UndanganFisikPage() {
  const { locale } = useLanguage();
  const scrollRoot = useRef<HTMLElement>(null);

  return (
    <div className="relative isolate flex min-h-dvh w-full flex-col overflow-hidden bg-background text-foreground">
      <PublicMarketingAtmosphere />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,rgba(217,163,170,0.12),transparent_64%)] dark:bg-[radial-gradient(ellipse_at_50%_45%,rgba(192,122,132,0.11),transparent_65%)]" />
      <div data-dc-marketing-frame className="relative z-10 mx-auto my-auto flex h-[90dvh] w-[90vw] min-h-0 flex-col overflow-hidden rounded-[18px] border border-primary/30 bg-background/65 shadow-[0_18px_75px_rgba(75,35,47,0.09)] backdrop-blur-[2px] sm:my-[23px] sm:h-[calc(100dvh-46px)] sm:w-[calc(100%-46px)] lg:my-[27px] lg:h-[calc(100dvh-54px)] lg:w-[calc(100%-54px)]">
        <div className="relative z-50 shrink-0 border-b border-primary/15 bg-background/70 backdrop-blur-sm">
          <Navbar embedded />
        </div>
        <main
          ref={scrollRoot}
          tabIndex={0}
          aria-label={locale === "en" ? "Printed invitation page content" : "Konten halaman Undangan Fisik"}
          className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain scroll-smooth focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-primary"
        >
          <MarketingTextReveal
            className="mx-auto flex w-[88%] max-w-[1100px] flex-col gap-20 py-12 sm:w-[80vw] md:gap-24 md:py-16"
            scrollRoot={scrollRoot}
            ready
            locale={locale}
          >
      <ScrollReveal scrollRoot={scrollRoot}><section className="grid items-center gap-10 border-b border-primary/30 pb-12 lg:grid-cols-[1fr_0.9fr] lg:gap-16">
        <div>
          <p className="font-[family-name:var(--font-dc-mono)] text-xs uppercase tracking-[0.2em] text-primary">DC Organizer / Undangan Fisik</p>
          <h1 className="mt-5 max-w-xl font-[family-name:var(--font-dc-heading)] text-4xl leading-[1.15] sm:text-5xl lg:text-6xl">Sebuah undangan yang ingin disimpan.</h1>
          <p className="mt-6 max-w-lg font-[family-name:var(--font-dc-body)] text-base leading-8 text-muted-foreground">Dari pernikahan hingga perayaan keluarga, hadirkan kabar bahagia lewat undangan cetak yang terasa personal. Pilih desain, bahan, dan sentuhan akhir yang sesuai dengan ceritamu.</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a href="#proses" className="inline-flex items-center gap-2 rounded-full border border-primary bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">Lihat proses <ArrowRight className="h-4 w-4" /></a>
            <a href="#konsultasi" className="inline-flex items-center rounded-full border border-primary/50 px-6 py-3 text-sm font-medium hover:bg-primary/10">Diskusikan kebutuhan</a>
          </div>
        </div>
        <div aria-label="Ilustrasi undangan cetak" className="relative mx-auto flex aspect-[4/5] w-full max-w-[440px] items-center justify-center rounded-[2rem] border border-primary/15 bg-gradient-to-br from-[#f9e6e8] via-[#efd1d6] to-[#c88798] p-10 shadow-[0_30px_100px_rgba(143,79,97,0.14)]">
          <div className="absolute inset-6 rounded-[1.5rem] border border-white/40" />
          <div className="relative flex aspect-[3/4] w-[75%] rotate-[-6deg] flex-col items-center justify-center border border-[#d7c8bd] bg-[#fffaf5] px-5 text-center shadow-[14px_18px_30px_rgba(95,52,64,0.20)]">
            <div className="absolute inset-3 rounded-t-full border border-[#d9c6b6]" />
            <span className="relative font-[family-name:var(--font-dc-heading)] text-xs tracking-[0.2em] text-[#aa7680]">YOU ARE INVITED</span>
            <span className="relative my-8 font-[family-name:var(--font-dc-heading)] text-3xl text-[#89545f] sm:text-4xl">A & R</span>
            <span className="relative text-xs tracking-[0.15em] text-[#9c747b]">A DAY TO REMEMBER</span>
          </div>
          <div className="absolute bottom-12 right-5 h-24 w-28 rotate-[12deg] rounded-md border border-[#ead7cf] bg-[#fff6ef] shadow-xl sm:right-10" />
        </div>
      </section></ScrollReveal>
      <ScrollReveal scrollRoot={scrollRoot}><section className="grid gap-6 md:grid-cols-3">
        {[{ icon: Palette, title: "Desain personal", detail: "Warna, tipografi, dan komposisi disesuaikan dengan suasana acaramu." }, { icon: Mail, title: "Detail yang terasa", detail: "Pilihan kertas, amplop, dan finishing dibicarakan sesuai kebutuhan." }, { icon: PackageCheck, title: "Siap dibagikan", detail: "Jumlah cetak, jadwal produksi, dan pengiriman disepakati sebelum pemesanan." }].map(({ icon: Icon, title, detail }) => <article key={title} className="rounded-[28px] border border-primary/35 bg-card/70 p-7 md:rounded-[32px]"><Icon className="h-6 w-6 text-primary" /><h2 className="mt-5 font-[family-name:var(--font-dc-heading)] text-xl">{title}</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">{detail}</p></article>)}
      </section></ScrollReveal>
      <ScrollReveal scrollRoot={scrollRoot}><section id="proses" className="scroll-mt-8 border-y border-primary/30 py-10 md:py-12"><h2 className="font-[family-name:var(--font-dc-heading)] text-3xl sm:text-4xl">Dari ide hingga sampai di tangan tamu.</h2><div className="mt-10 grid gap-8 md:grid-cols-2">{steps.map((step, index) => <div key={step.title} className="flex gap-5"><span className="font-[family-name:var(--font-dc-heading)] text-2xl text-primary">{String(index + 1).padStart(2, "0")}</span><div><h3 className="font-[family-name:var(--font-dc-heading)] text-xl">{step.title}</h3><p className="mt-2 text-sm leading-7 text-muted-foreground">{step.detail}</p></div></div>)}</div></section></ScrollReveal>
      <ScrollReveal scrollRoot={scrollRoot}><section id="konsultasi" className="mx-auto max-w-3xl scroll-mt-8 py-10 text-center md:py-12"><h2 className="font-[family-name:var(--font-dc-heading)] text-3xl sm:text-4xl">Mulai dari detail yang kamu bayangkan.</h2><p className="mt-5 text-base leading-8 text-muted-foreground">Ceritakan konsep, jumlah undangan, dan waktu acara. Kami bantu diskusikan pilihan cetak yang sesuai. Harga dan estimasi produksi diberikan setelah spesifikasi disepakati.</p><a href="https://wa.me/6282124786516?text=Halo%20DC%20Organizer%2C%20saya%20ingin%20konsultasi%20undangan%20fisik." target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-full border border-primary bg-primary px-7 py-3 text-sm font-medium text-primary-foreground hover:opacity-90">Konsultasi undangan fisik <ArrowRight className="h-4 w-4" /></a><p className="mt-6 text-xs text-muted-foreground">Butuh versi digital juga? <Link href="/d-invitation" className="underline underline-offset-4 hover:text-primary">Lihat Undangan Digital</Link></p></section></ScrollReveal>
          </MarketingTextReveal>
        </main>
        <MarketingFrameFooter />
      </div>
    </div>
  );
}
