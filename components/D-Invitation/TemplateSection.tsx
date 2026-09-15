"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { GlowButton } from "@/components/ui/glow-button";
import { useLanguage } from "@/components/I18n/LanguageProvider";

const templates = [
  ["Eternal Blossom", "Floral editorial", "/hp-digital.png"],
  ["Celestial Night", "Dark gold romance", "/bca.webp"],
  ["Royal Velvet", "Classic monogram", "/wo.png"],
] as const;

export default function TemplateCollection() {
  const { locale } = useLanguage();
  const copy =
    locale === "en"
      ? {
          eyebrow: "Favorite Collection",
          title: "Choose the atmosphere that feels closest to your story.",
          description:
            "See the invitation result at a glance, then explore the full collection when you are ready to compare more designs.",
          all: "See more templates",
          detail: "View details",
          studio: "Invitation preview",
          invitation: "Digital invitation",
        }
      : {
          eyebrow: "Koleksi Favorit",
          title: "Pilih suasana yang paling dekat dengan kisah kalian.",
          description:
            "Lihat gambaran hasil jadi undangan sejak awal, lalu jelajahi koleksi lengkap saat ingin membandingkan lebih banyak desain.",
          all: "Lihat template lainnya",
          detail: "Lihat detail",
          studio: "Preview undangan",
          invitation: "Undangan digital",
        };
  return (
    <section className="space-y-9">
      <div className="flex flex-col justify-between gap-6 border-b border-border/70 pb-7 sm:flex-row sm:items-end">
        <div className="max-w-2xl">
          <p className="font-[family-name:var(--font-dc-mono)] text-[10px] uppercase tracking-[0.26em] text-primary">
            {copy.eyebrow}
          </p>
          <h2 className="mt-4 font-[family-name:var(--font-dc-heading)] text-4xl font-normal leading-tight text-primary md:text-5xl">
            {copy.title}
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-foreground/65">
            {copy.description}
          </p>
        </div>
        <GlowButton
          asChild
          size="sm"
          className="shrink-0 min-w-0 rounded-xl px-6 text-xs uppercase tracking-[0.14em]"
        >
          <Link href="/template-design">
            {copy.all}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </GlowButton>
      </div>
      <div className="grid justify-items-center gap-8 md:grid-cols-3">
        {templates.map(([name, theme, image]) => (
          <article key={name} className="group w-full min-w-0">
            <div className="relative mx-auto aspect-[0.72] w-full max-w-[270px] overflow-hidden rounded-[28px] border-2 border-[#111111] bg-white p-2 shadow-lg shadow-black/5 transition-transform duration-500 group-hover:-translate-y-1.5 dark:border-white dark:bg-[#111113] dark:shadow-black/20">
              <div className="relative h-full overflow-hidden rounded-[21px] bg-black">
                <Image
                  src={image}
                  alt={name}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 80vw, 270px"
                />
              </div>
              <span className="absolute left-5 top-5 border border-white/30 bg-black/35 px-2.5 py-1 font-[family-name:var(--font-dc-mono)] text-[8px] uppercase tracking-[0.16em] text-white backdrop-blur-md">
                {copy.studio}
              </span>
            </div>
            <div className="mx-auto max-w-[270px] pt-5">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-[family-name:var(--font-dc-heading)] text-xl font-normal text-primary">
                  {name}
                </h3>
                <span className="font-[family-name:var(--font-dc-mono)] text-[8px] uppercase tracking-[0.15em] text-foreground/40">
                  {copy.invitation}
                </span>
              </div>
              <p className="mt-1 text-xs text-foreground/55">{theme}</p>
              <GlowButton
                asChild
                size="xs"
                className="mt-3 min-w-0 rounded-lg px-2.5 text-xs"
              >
                <Link href="/template-design">
                  {copy.detail}
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </GlowButton>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
