"use client";

import {
  CalendarCheck2,
  Palette,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useLanguage } from "@/components/I18n/LanguageProvider";

type FeatureItem = [
  icon: LucideIcon,
  title: string,
  description: string,
];

export default function FeatureSection() {
  const { locale } = useLanguage();
  const features: FeatureItem[] =
    locale === "en"
      ? [
          [
            Palette,
            "One template for one event",
            "Choose the design that fits the occasion, then personalize the content, photos, colors, music, venue, and event details.",
          ],
          [
            Sparkles,
            "A studio that stays simple",
            "Keep invitation content in one workspace so every event can be edited and published independently.",
          ],
          [
            Users,
            "RSVP and guest management included",
            "Collect responses, plus-one information, and manage the guest list for the selected event without mixing data from your other events.",
          ],
        ]
      : [
          [
            Palette,
            "Satu template untuk satu acara",
            "Pilih desain yang cocok untuk acaranya, lalu personalisasi konten, foto, warna, musik, venue, dan detail yang ingin dibagikan.",
          ],
          [
            Sparkles,
            "Studio yang tetap sederhana",
            "Kelola isi undangan dalam satu workspace agar setiap acara bisa diedit dan dipublikasikan secara independen.",
          ],
          [
            Users,
            "RSVP dan manajemen tamu termasuk",
            "Terima respons, data plus one, dan kelola daftar tamu untuk acara yang dipilih tanpa mencampur data dengan acara lain.",
          ],
        ];

  const copy =
    locale === "en"
      ? [
          "What you get",
          "The invitation is only the beginning of the event workflow.",
          "One event, one organized flow",
        ]
      : [
          "Yang kamu dapatkan",
          "Undangan adalah awal dari alur acara yang lebih rapi.",
          "Satu acara, satu alur yang rapi",
        ];

  return (
    <section
      id="fitur"
      className="scroll-mt-24 border-y border-border/70 py-10 md:py-12"
    >
      <div className="mx-auto w-full max-w-[960px]">
        <div className="mb-8 max-w-2xl md:mb-10">
          <p className="font-[family-name:var(--font-dc-mono)] text-[10px] uppercase tracking-[0.26em] text-primary">
            {copy[0]}
          </p>
          <h2 className="mt-3 max-w-xl font-[family-name:var(--font-dc-heading)] text-3xl font-normal leading-tight text-primary md:text-4xl">
            {copy[1]}
          </h2>
      </div>

        <div className="grid gap-0 md:grid-cols-3">
          {features.map(([Icon, title, description], index) => (
            <article
              key={title}
              className={`py-6 md:px-6 ${
                index > 0
                  ? "border-t border-border/70 md:border-l md:border-t-0"
                  : ""
              }`}
            >
              <Icon
                className="h-5 w-5 text-primary"
                strokeWidth={1.6}
                aria-hidden="true"
              />
              <h3 className="mt-6 max-w-xs font-[family-name:var(--font-dc-heading)] text-xl font-normal text-primary">
                {title}
              </h3>
              <p className="mt-3 max-w-sm font-[family-name:var(--font-dc-body)] text-sm leading-7 text-foreground/65">
                {description}
              </p>
              <div className="mt-6 flex items-center gap-2 font-[family-name:var(--font-dc-mono)] text-[8px] uppercase tracking-[0.16em] text-foreground/40">
                <CalendarCheck2
                  className="h-3 w-3 text-primary/75"
                  aria-hidden="true"
                />
                {copy[2]}
              </div>
          </article>
          ))}
        </div>
      </div>
    </section>
  );
}
