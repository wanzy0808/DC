"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { useLanguage } from "@/components/I18n/LanguageProvider";

const templateImage = "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800";

export default function HeroSection() {
  const { locale } = useLanguage();
  const copy = locale === "en" ? {
    eyebrow: "Digital Invitation / 01", title: "More than an invitation.", accent: "Begin your story beautifully.", description: "Share your good news with a digital invitation that feels personal—beautiful to open, easy to share, and designed to make the journey to your big day feel lighter.", explore: "Explore collection", features: "See the features", tags: ["Personal", "Easy RSVP", "Ready for the big day"], glimpse: "A glimpse of your invitation", couple: "Vidi & Hening", sub: "A beginning worth remembering",
  } : {
    eyebrow: "Undangan Digital / 01", title: "Bukan sekadar undangan.", accent: "Awali ceritamu dengan indah.", description: "Hadirkan kabar bahagia dengan undangan digital yang terasa personal—indah saat dibuka, mudah dibagikan, dan dirancang untuk membuat perjalanan menuju hari besar terasa lebih ringan.", explore: "Jelajahi koleksi", features: "Lihat fiturnya", tags: ["Personal", "Easy RSVP", "Ready for the big day"], glimpse: "Sekilas tentang undanganmu", couple: "Vidi & Hening", sub: "A beginning worth remembering",
  };

  return (
    <section className="grid items-center gap-14 border-b border-border/70 pb-20 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16 lg:pb-24">
      <div className="max-w-2xl">
        <p className="font-[family-name:var(--font-dc-mono)] text-[10px] uppercase tracking-[0.28em] text-primary">{copy.eyebrow}</p>
        <h1 className="mt-6 max-w-xl font-[family-name:var(--font-dc-heading)] text-5xl font-normal leading-[1.02] tracking-[-0.045em] text-primary md:text-7xl">{copy.title}<span className="mt-2 block text-foreground">{copy.accent}</span></h1>
        <p className="mt-7 max-w-xl text-base leading-8 text-foreground/70 md:text-lg">{copy.description}</p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link href="/template-design" className={buttonVariants({ variant: "default", size: "lg", className: "gap-2" })}>{copy.explore}<ArrowUpRight className="h-4 w-4" /></Link>
          <Link href="#fitur" className={buttonVariants({ variant: "outline", size: "lg" })}>{copy.features}</Link>
        </div>
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 font-[family-name:var(--font-dc-mono)] text-[9px] uppercase tracking-[0.14em] text-foreground/55">{copy.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
      </div>
      <div className="relative mx-auto w-full max-w-xl lg:pr-4">
        <div className="absolute -right-8 top-12 h-48 w-48 rounded-full bg-primary/6 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto w-[min(100%,430px)]">
          <div className="relative aspect-[0.68] overflow-hidden rounded-[34px] border-2 border-[#111111] bg-card p-2 shadow-2xl shadow-black/10 dark:border-white dark:shadow-black/30">
            <div className="relative h-full overflow-hidden rounded-[27px] bg-black"><Image src={templateImage} alt={`${copy.couple} invitation preview`} fill priority className="object-cover" sizes="(max-width: 768px) 90vw, 42vw" /></div>
            <div className="absolute inset-x-7 bottom-7 rounded-2xl border border-white/25 bg-black/35 p-5 text-left text-white backdrop-blur-md"><p className="font-[family-name:var(--font-dc-heading)] text-2xl">{copy.couple}</p><p className="mt-1 font-[family-name:var(--font-dc-mono)] text-[8px] uppercase tracking-[0.22em] text-white/70">{copy.sub}</p></div>
          </div>
          <p className="mt-4 text-center font-[family-name:var(--font-dc-mono)] text-[9px] uppercase tracking-[0.18em] text-foreground/45">{copy.glimpse}</p>
        </div>
      </div>
    </section>
  );
}
