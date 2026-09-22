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
          title: "Start with a template. Shape it around your event.",
          description:
            "Add photos, choose the right tone, write the invitation copy, and keep venue, time, RSVP, and guest-facing details together before publishing.",
          action: "Enter Studio",
        }
      : {
          eyebrow: "Design Studio",
          title: "Mulai dari template. Bentuk sesuai karakter acaramu.",
          description:
            "Masukkan foto, pilih nuansa, tulis isi undangan, lalu rapikan venue, waktu, RSVP, dan informasi yang perlu dilihat tamu sebelum dipublikasikan.",
          action: "Masuk Studio",
        };

  return (
    <section className="border-y border-border/70 py-10 md:py-12">
      <div className="mx-auto grid w-full max-w-[960px] items-center gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:gap-8">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 font-[family-name:var(--font-dc-mono)] text-[10px] uppercase tracking-[0.25em] text-primary">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            {copy.eyebrow}
          </div>
          <h2 className="mt-4 font-[family-name:var(--font-dc-heading)] text-3xl font-normal leading-tight text-primary md:text-5xl">
            {copy.title}
          </h2>
          <p className="mt-4 max-w-2xl font-[family-name:var(--font-dc-body)] text-sm leading-7 text-foreground/65 md:text-base md:leading-8">
            {copy.description}
          </p>
        </div>
        <Button
          asChild
          size="lg"
          className="min-w-[9rem] font-[family-name:var(--font-dc-body)] text-base"
        >
          <Link href="/studio">
            {copy.action}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
