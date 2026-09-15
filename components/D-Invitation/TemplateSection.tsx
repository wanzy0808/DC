"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/I18n/LanguageProvider";

const templates = [
  ["Eternal Blossom", "Floral editorial", "/hp-digital.png"],
  ["Celestial Night", "Dark gold romance", "/bca.webp"],
  ["Royal Velvet", "Classic monogram", "/wo.png"],
] as const;

export default function TemplateCollection() {
  const { locale } = useLanguage();
  const [selected, setSelected] = useState<(typeof templates)[number] | null>(null);
  const copy =
    locale === "en"
      ? {
          eyebrow: "Favorite Collection",
          title: "Choose the atmosphere that feels closest to your story.",
          description: "See the invitation result at a glance, then explore the full collection when you are ready to compare more designs.",
          all: "See more templates",
          preview: "Preview",
          invitation: "Digital invitation",
          close: "Close preview",
          choose: "Choose this template",
        }
      : {
          eyebrow: "Koleksi Favorit",
          title: "Pilih suasana yang paling dekat dengan kisah kalian.",
          description: "Lihat gambaran hasil jadi undangan sejak awal, lalu jelajahi koleksi lengkap saat ingin membandingkan lebih banyak desain.",
          all: "Lihat template lainnya",
          preview: "Pratinjau",
          invitation: "Undangan digital",
          close: "Tutup pratinjau",
          choose: "Pilih template ini",
        };

  return (
    <section className="space-y-9">
      <div className="flex flex-col justify-between gap-6 border-b border-border/70 pb-7 sm:flex-row sm:items-end">
        <div className="max-w-2xl">
          <p className="font-[family-name:var(--font-dc-mono)] text-[10px] uppercase tracking-[0.26em] text-primary">{copy.eyebrow}</p>
          <h2 className="mt-4 font-[family-name:var(--font-dc-heading)] text-4xl font-normal leading-tight text-primary md:text-5xl">{copy.title}</h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-foreground/65">{copy.description}</p>
        </div>
        <Button asChild size="sm" className="shrink-0 min-w-0 text-xs uppercase tracking-[0.14em]">
          <Link href="/template-design">{copy.all}<ArrowUpRight className="h-3.5 w-3.5" /></Link>
        </Button>
      </div>

      <div className="grid justify-items-center gap-8 md:grid-cols-3">
        {templates.map((template) => {
          const [name, theme, image] = template;
          return (
            <article key={name} className="group w-full min-w-0">
              <div className="relative mx-auto aspect-[0.72] w-full max-w-[270px] overflow-hidden rounded-[28px] border-2 border-[#111111] bg-white p-2 shadow-lg shadow-black/5 transition-transform duration-500 group-hover:-translate-y-1.5 dark:border-white dark:bg-[#111113] dark:shadow-black/20">
                <div className="relative h-full overflow-hidden rounded-[21px] bg-black">
                  <Image src={image} alt={name} fill className="object-cover transition duration-700 group-hover:scale-105" sizes="(max-width: 768px) 80vw, 270px" />
                </div>
                <span className="absolute left-5 top-5 border border-white/30 bg-black/35 px-2.5 py-1 font-[family-name:var(--font-dc-mono)] text-[8px] uppercase tracking-[0.16em] text-white backdrop-blur-md">{copy.preview}</span>
              </div>
              <div className="mx-auto max-w-[270px] pt-5">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-[family-name:var(--font-dc-heading)] text-xl font-normal text-primary">{name}</h3>
                  <span className="font-[family-name:var(--font-dc-mono)] text-[8px] uppercase tracking-[0.15em] text-foreground/40">{copy.invitation}</span>
                </div>
                <p className="mt-1 text-xs text-foreground/55">{theme}</p>
                <Button type="button" size="xs" onClick={() => setSelected(template)} className="mt-3 min-w-0 text-xs">
                  {copy.preview}<ArrowUpRight className="h-3 w-3" />
                </Button>
              </div>
            </article>
          );
        })}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={`${copy.preview}: ${selected[0]}`} onClick={() => setSelected(null)}>
          <div className="relative flex max-h-[92vh] w-full max-w-[430px] flex-col items-center gap-5" onClick={(event) => event.stopPropagation()}>
            <div className="relative w-[min(82vw,330px)] aspect-[0.48] rounded-[38px] border-[7px] border-[#171719] bg-[#171719] p-[5px] shadow-[0_24px_70px_rgb(0_0_0_/_0.4)] dark:border-[#e5e5e5] dark:bg-[#111113]">
              <div className="absolute -right-[10px] top-[23%] h-14 w-[4px] rounded-r-full bg-[#303034]" aria-hidden="true" />
              <div className="absolute -left-[10px] top-[21%] h-8 w-[4px] rounded-l-full bg-[#303034]" aria-hidden="true" />
              <div className="absolute -left-[10px] top-[31%] h-12 w-[4px] rounded-l-full bg-[#303034]" aria-hidden="true" />
              <div className="relative h-full overflow-hidden rounded-[30px] bg-white">
                <div className="absolute left-1/2 top-2 z-20 h-6 w-[34%] -translate-x-1/2 rounded-full bg-black" aria-hidden="true" />
                <div className="h-full overflow-y-auto scrollbar-thin">
                  <Image src={selected[2]} alt={selected[0]} width={900} height={1500} className="min-h-full w-full object-cover object-top" priority />
                </div>
              </div>
            </div>
            <div className="flex w-full max-w-[330px] items-center justify-between gap-3">
              <div className="min-w-0 text-white">
                <p className="font-[family-name:var(--font-dc-mono)] text-[9px] uppercase tracking-[0.2em] text-white/65">{copy.preview}</p>
                <p className="truncate font-[family-name:var(--font-dc-heading)] text-xl">{selected[0]}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button type="button" size="sm" onClick={() => setSelected(null)} aria-label={copy.close}>{copy.close}<X className="h-4 w-4" /></Button>
                <Button asChild size="sm"><Link href="/dashboard/editor">{copy.choose}<ArrowUpRight className="h-4 w-4" /></Link></Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
