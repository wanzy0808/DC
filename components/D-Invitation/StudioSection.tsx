"use client";

import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/I18n/LanguageProvider";

export default function StudioSection() {
  const { locale } = useLanguage();
  const copy =
    locale === "en"
      ? {
          eyebrow: "Design Studio",
          title: "Start with a template. Make it completely yours.",
          description:
            "Add the photos you love, choose colors that feel right, tell your story, and let every detail lead your guests toward the day you have been waiting for.",
          action: "Enter Design Studio",
        }
      : {
          eyebrow: "Design Studio",
          title: "Mulai dari contoh. Jadikan sepenuhnya milik kalian.",
          description:
            "Masukkan foto yang paling kamu suka, pilih warna yang terasa tepat, tuliskan kisah kalian, lalu biarkan setiap detail mengantarkan tamu pada hari yang sudah lama dinantikan.",
          action: "Masuk Studio",
        };
  return (
    <section className="border-y border-border/70 py-14 md:py-16">
      <div className="grid items-end gap-8 md:grid-cols-[1fr_auto] md:gap-12">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 font-[family-name:var(--font-dc-mono)] text-[10px] uppercase tracking-[0.25em] text-primary">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            {copy.eyebrow}
          </div>
          <h2 className="mt-4 font-[family-name:var(--font-dc-heading)] text-3xl font-normal leading-tight text-primary md:text-5xl">
            {copy.title}
          </h2>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-foreground/65 md:text-base md:leading-8">
            {copy.description}
          </p>
        </div>
        <Button asChild size="lg" className="min-w-[12rem] text-base font-[family-name:var(--font-dc-body)] font-bold uppercase tracking-[0.16em]">
          <Link href="/dashboard/editor">
            {copy.action}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
