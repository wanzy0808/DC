"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDownRight, ArrowRight } from "lucide-react";
import { useLanguage } from "@/components/I18n/LanguageProvider";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  const { locale } = useLanguage();
  const en = locale === "en";

  return (
    <section className="relative grid min-h-[calc(100dvh-150px)] items-center gap-10 border-b border-primary/25 pb-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16 lg:pb-16">
      <div className="max-w-3xl py-8">
        <p className="font-[family-name:var(--font-undara-mono)] text-[10px] uppercase tracking-[0.22em] text-primary md:text-xs">
          {en ? "Digital Guestbook / Undara" : "Buku Tamu Digital / Undara"}
        </p>
        <h1 className="mt-5 font-[family-name:var(--font-undara-heading)] text-[clamp(3rem,6vw,6.6rem)] leading-[0.97] tracking-[-0.035em] text-primary">
          {en ? "Welcome guests with ease." : "Sambut tamu dengan tenang."}
          <span className="block text-foreground">{en ? "Stay in the flow." : "Pantau setiap kedatangan."}</span>
        </h1>
        <p className="mt-7 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base md:leading-8">
          {en ? "Connect guest verification, QR check-in, seating and attendance in one event day workflow." : "Verifikasi tamu, QR check-in, pengaturan meja, dan data kehadiran terhubung dalam satu alur di hari acara."}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg"><Link href="/packages">{en ? "Explore packages" : "Lihat Paket"}<ArrowRight className="h-4 w-4" /></Link></Button>
          <Button asChild size="lg" variant="outline"><a href="#fitur-guestbook">{en ? "Explore the workflow" : "Lihat Alurnya"}<ArrowDownRight className="h-4 w-4" /></a></Button>
        </div>
        <p className="mt-10 border-t border-primary/20 pt-5 font-[family-name:var(--font-undara-mono)] text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          {en ? "Guest list / QR entry / Seating / Attendance" : "Daftar tamu / QR masuk / Meja / Kehadiran"}
        </p>
      </div>
      <div className="relative min-h-[440px] lg:min-h-[680px]">
        <div className="absolute inset-[4%_0_2%_4%] overflow-hidden rounded-[48px_8px_48px_8px] border border-primary/25 bg-card shadow-[0_30px_90px_rgba(70,42,32,0.14)]">
          <Image src="/assets/marketing/guestbook/hero.webp" alt={en ? "Guest reception at an event" : "Penerimaan tamu di acara"} fill priority sizes="(max-width: 1024px) 94vw, 54vw" className="object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(24,16,12,0.72),transparent_65%)]" />
          <p className="absolute bottom-7 left-7 right-7 max-w-lg font-[family-name:var(--font-undara-heading)] text-2xl leading-tight text-white md:bottom-10 md:left-10 md:text-3xl">
            {en ? "Every arrival deserves a warm welcome." : "Setiap kedatangan layak disambut dengan hangat."}
          </p>
        </div>
      </div>
    </section>
  );
}
