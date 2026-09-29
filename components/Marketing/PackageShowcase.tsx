"use client";

import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getServicePackage } from "@/lib/packages/catalog";
import { useLanguage } from "@/components/I18n/LanguageProvider";

type PackageShowcaseProps = {
  eyebrow: string;
  title: string;
  description: string;
  packageKeys: string[];
  note?: string;
  /** Use the more rounded outlined package card on /d-invitation. */
  roundedCard?: boolean;
  /** Let the /d-invitation section occupy the shared marketing content width. */
  wide?: boolean;
};

export default function PackageShowcase({ eyebrow, title, description, packageKeys, note, roundedCard = false, wide = false }: PackageShowcaseProps) {
  const { locale } = useLanguage();
  const packages = packageKeys.map(getServicePackage).filter(Boolean);
  const chooseLabel = locale === "en" ? "Choose package" : "Pilih paket";
  const featuredLabel = locale === "en" ? "Best value" : "Paling lengkap";

  return (
    <section className={`w-full border-y border-primary/25 py-14 md:py-20 ${wide ? "max-w-none" : ""}`}>
      <div className={`grid gap-10 ${wide && packages.length === 1 ? "lg:grid-cols-[0.95fr_1.05fr] lg:gap-16" : ""}`}>
      <div className={`space-y-4 ${wide && packages.length === 1 ? "lg:pt-8" : "mx-auto max-w-3xl text-center"}`}>
        <p className="font-[family-name:var(--font-undara-mono)] text-[10px] uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
        <h2 className="max-w-[20ch] font-[family-name:var(--font-undara-heading)] text-4xl leading-[1.05] text-primary md:text-5xl">{title}</h2>
        <p className="max-w-xl text-sm leading-7 text-muted-foreground md:text-base md:leading-8">{description}</p>
      </div>
      <div className={`grid w-full gap-6 ${packages.length === 2 ? "md:grid-cols-2" : "md:grid-cols-1"}`}>
        {packages.map((item, index) => {
          if (!item) return null;
          const featured = packageKeys.length === 3 && index === 2;
          return (
            <article key={item.key} className={`relative flex h-full w-full flex-col border p-7 md:p-10 ${roundedCard ? "rounded-[40px] border-primary/50 md:rounded-[48px]" : "rounded-3xl"} ${featured ? "border-primary bg-primary/[0.07]" : "bg-card/70"}`}>
              {featured ? <span className="absolute right-5 top-5 rounded-full bg-[var(--primary)] px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-white">{featuredLabel}</span> : null}
              <p className="text-xs font-[family-name:var(--font-undara-mono)] uppercase tracking-[0.18em] text-[var(--primary)]">Undara</p>
              <h3 className="mt-3 max-w-[85%] font-[family-name:var(--font-undara-heading)] text-3xl text-primary">{item.name[locale]}</h3>
              <p className="mt-4 text-2xl font-semibold">Rp {item.price.toLocaleString("id-ID")}</p>
              <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">{item.description[locale]}</p>
              <ul className="mt-6 flex-1 space-y-3">{item.features[locale].map((feature) => <li key={feature} className="flex gap-2 text-sm"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" /><span>{feature}</span></li>)}</ul>
              <Button asChild className="mt-7 w-full text-xs uppercase tracking-[0.16em]">
                <Link href={`/packages?package=${encodeURIComponent(item.key)}`}>{chooseLabel} <ArrowRight className="h-3.5 w-3.5" /></Link>
              </Button>
            </article>
          );
        })}
      </div>
      </div>
      {note ? <p className="mt-7 text-xs leading-6 text-muted-foreground">{note}</p> : null}
    </section>
  );
}
