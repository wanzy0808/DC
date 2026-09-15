"use client";

import { Heart, Palette, QrCode, Sparkles } from "lucide-react";
import { useLanguage } from "@/components/I18n/LanguageProvider";

export default function FeatureSection() {
  const { locale } = useLanguage();
  const features =
    locale === "en"
      ? [
          [
            Palette,
            "01",
            "A design that feels like yours",
            "Choose a template as your starting point, then add photos, colors, words, and details that make your story feel complete.",
          ],
          [
            Sparkles,
            "02",
            "A studio that stays calm",
            "Keep the important content in one simple workspace, so you can focus on the story instead of the complexity.",
          ],
          [
            QrCode,
            "03",
            "From RSVP to the big day",
            "Receive guest confirmations, prepare personal QR tickets, and carry the data into check-in when the celebration arrives.",
          ],
        ]
      : ([
          [
            Palette,
            "01",
            "Desain yang terasa milikmu",
            "Pilih template sebagai awal, lalu isi dengan foto, warna, kata-kata, dan detail yang membuat kisah kalian terasa utuh.",
          ],
          [
            Sparkles,
            "02",
            "Studio yang tetap tenang",
            "Susun konten penting dalam satu ruang kerja yang sederhana, sehingga kamu bisa fokus pada cerita, bukan pada kerumitannya.",
          ],
          [
            QrCode,
            "03",
            "Dari RSVP hingga hari-H",
            "Terima konfirmasi tamu, siapkan tiket QR personal, dan bawa data ke tahap check-in ketika perayaan akhirnya tiba.",
          ],
        ] as const);
  const copy =
    locale === "en"
      ? [
          "Why it feels different / 02",
          "Beautiful to look at. Even better when it truly helps.",
          "Made for the moments that matter",
        ]
      : [
          "Why it feels different / 02",
          "Indah untuk dilihat. Lebih indah saat benar-benar membantu.",
          "Dibuat untuk momen yang berarti",
        ];
  return (
    <section
      id="fitur"
      className="scroll-mt-24 border-y border-border/70 py-12 md:py-14"
    >
      <div className="mb-10 max-w-2xl">
        <p className="font-[family-name:var(--font-dc-mono)] text-[10px] uppercase tracking-[0.26em] text-primary">
          {copy[0]}
        </p>
        <h2 className="mt-3 max-w-xl font-[family-name:var(--font-dc-heading)] text-3xl font-normal leading-tight text-primary md:text-4xl">
          {copy[1]}
        </h2>
      </div>
      <div className="grid gap-0 md:grid-cols-3">
        {features.map(([Icon, label, title, description], index) => (
          <article
            key={label}
            className={`py-6 md:px-7 ${index > 0 ? "border-t border-border/70 md:border-l md:border-t-0" : ""}`}
          >
            <div className="flex items-center justify-between">
              <Icon
                className="h-5 w-5 text-primary"
                strokeWidth={1.6}
                aria-hidden="true"
              />
              <span className="font-[family-name:var(--font-dc-mono)] text-[9px] tracking-[0.18em] text-foreground/45">
                {label}
              </span>
            </div>
            <h3 className="mt-6 max-w-xs font-[family-name:var(--font-dc-heading)] text-xl font-normal text-primary">
              {title}
            </h3>
            <p className="mt-3 max-w-sm text-sm leading-7 text-foreground/65">
              {description}
            </p>
            <div className="mt-6 flex items-center gap-2 font-[family-name:var(--font-dc-mono)] text-[8px] uppercase tracking-[0.16em] text-foreground/40">
              <Heart className="h-3 w-3 text-primary/75" aria-hidden="true" />
              {copy[2]}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
