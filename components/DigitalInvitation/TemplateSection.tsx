"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/I18n/LanguageProvider";
import { useTemplateCatalog } from "@/lib/templates/use-template-catalog";
import { TemplateCardCanvas } from "@/components/Templates/TemplateGalleryCanvas";

export default function TemplateCollection() {
  const { locale } = useLanguage();
  const templates = useTemplateCatalog();
  const copy =
    locale === "en"
      ? {
          eyebrow: "Template Collection",
          title: "Choose a visual direction that fits your event.",
          description: "Explore the same up-to-date collection as the public gallery and Invitation Studio. Preview a design without signing in.",
          all: "Explore all templates",
          preview: "View preview",
          previewOnly: "Designer preview · not yet in Studio",
          ready: "Available in Studio",
        }
      : {
          eyebrow: "Koleksi Template",
          title: "Pilih visual yang paling cocok dengan suasana acaramu.",
          description: "Lihat desain dari katalog yang sama dengan galeri publik dan Invitation Studio. Kamu bisa melihat preview tanpa login.",
          all: "Lihat semua template",
          preview: "Lihat pratinjau",
          previewOnly: "Preview designer · belum tersedia di Studio",
          ready: "Tersedia di Studio",
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
          <p className="mt-3 max-w-xl font-[family-name:var(--font-dc-body)] text-sm leading-7 text-foreground/65">
            {copy.description}
          </p>
        </div>
        <Button asChild size="sm" className="min-w-0 shrink-0 text-xs uppercase tracking-[0.14em]">
          <Link href="/template-design">
            {copy.all}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>

      <div className="grid justify-items-center gap-8 md:grid-cols-3">
        {templates.map((template) => (
          <article key={template.key} className="group w-full min-w-0">
            <Link
              href={`/template-design?template=${encodeURIComponent(template.key)}`}
              className="relative mx-auto block aspect-[0.72] w-full max-w-[270px] overflow-hidden rounded-[28px] border-2 border-[#111111] bg-white p-2 shadow-lg shadow-black/5 transition-transform duration-500 hover:-translate-y-1.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary dark:border-white dark:bg-[#111113] dark:shadow-black/20"
              aria-label={`${copy.preview}: ${template.name}`}
            >
              <div className="relative h-full overflow-hidden rounded-[21px] bg-[#fcf7f6]">
                {template.ready ? (
                  <TemplateCardCanvas templateKey={template.key} />
                ) : (
                  <img src={template.previewImage} alt={template.name} loading="lazy" className="h-full w-full object-cover" />
                )}
              </div>
              <span className="absolute left-4 top-4 border border-white/30 bg-black/45 px-2.5 py-1 font-[family-name:var(--font-dc-mono)] text-[9px] uppercase tracking-[0.16em] text-white backdrop-blur-md">
                {template.category}
              </span>
            </Link>
            <div className="mx-auto max-w-[270px] pt-5">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="min-w-0 break-words font-[family-name:var(--font-dc-heading)] text-xl font-normal text-primary">
                  {template.name}
                </h3>
                <span className="shrink-0 font-[family-name:var(--font-dc-mono)] text-[9px] uppercase tracking-[0.12em] text-foreground/40">
                  {template.ready ? copy.ready : copy.previewOnly}
                </span>
              </div>
              <p className="mt-2 text-xs leading-6 text-foreground/60">{template.description}</p>
              <Button asChild size="xs" className="mt-3 min-w-0 text-xs">
                <Link href={`/template-design?template=${encodeURIComponent(template.key)}`}>
                  {copy.preview} <ArrowUpRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
