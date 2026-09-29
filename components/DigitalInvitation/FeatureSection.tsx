"use client";

import { Palette, Sparkles, Users, type LucideIcon } from "lucide-react";
import { useLanguage } from "@/components/I18n/LanguageProvider";

type FeatureItem = {
  icon: LucideIcon;
  title: string;
  description: string;
  note: string;
};

export default function FeatureSection() {
  const { locale } = useLanguage();
  const en = locale === "en";

  const features: FeatureItem[] = en
    ? [
        {
          icon: Palette,
          title: "Begin with a visual direction, not a blank page.",
          description:
            "Choose a ready invitation theme, then shape the photos, tone, copy, music, venue, and event details around your celebration.",
          note: "Template → personal direction",
        },
        {
          icon: Sparkles,
          title: "Keep the creative work in one calm workspace.",
          description:
            "Invitation content and design stay together in Studio, so every event can be refined independently without turning the setup into a complicated design tool.",
          note: "Studio → draft → publish",
        },
        {
          icon: Users,
          title: "Let the invitation continue into the guest flow.",
          description:
            "RSVP, plus-one information, and guest management remain scoped to the same event, so the invitation is connected to what happens after guests open it.",
          note: "Invitation → RSVP → guests",
        },
      ]
    : [
        {
          icon: Palette,
          title: "Mulai dari arah visual, bukan halaman kosong.",
          description:
            "Pilih tema undangan yang sudah siap, lalu bentuk foto, nuansa, isi, musik, venue, dan detail acara agar terasa benar-benar milik perayaanmu.",
          note: "Template → arah personal",
        },
        {
          icon: Sparkles,
          title: "Rapikan proses kreatif dalam satu ruang yang tenang.",
          description:
            "Isi dan desain undangan tetap berada di Studio yang sama, sehingga setiap acara bisa dibentuk sendiri tanpa membuat prosesnya terasa seperti software desain yang rumit.",
          note: "Studio → draft → publish",
        },
        {
          icon: Users,
          title: "Biarkan undangan berlanjut sampai ke alur tamu.",
          description:
            "RSVP, informasi plus one, dan manajemen tamu tetap terikat pada acara yang sama, jadi undangan tidak berhenti saat tamu selesai membacanya.",
          note: "Undangan → RSVP → tamu",
        },
      ];

  return (
    <section id="fitur" className="undara-marketing-section scroll-mt-24 border-y border-primary/25 py-14 md:py-20">
      <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:gap-20">
        <div className="lg:sticky lg:top-8 lg:self-start">
          <p className="undara-marketing-kicker">
            {en ? "A complete invitation flow" : "Alur Undangan yang Utuh"}
          </p>
          <h2 className="mt-4 max-w-[15ch] font-[family-name:var(--font-undara-heading)] text-4xl font-normal leading-[1.02] text-primary md:text-5xl lg:text-6xl">
            {en
              ? "Beautiful first. Useful all the way through."
              : "Cantik saat dibuka. Berguna sampai acara berjalan."}
          </h2>
          <p className="mt-6 max-w-xl text-sm leading-7 text-muted-foreground md:text-base md:leading-8">
            {en
              ? "Undara connects the visual invitation with the practical event flow without making the experience feel like an admin dashboard."
              : "Undara menghubungkan pengalaman visual undangan dengan kebutuhan acara yang praktis, tanpa membuat tamu maupun pemilik acara merasa sedang membuka dashboard admin."}
          </p>
        </div>

        <div className="border-t border-primary/30">
          {features.map(({ icon: Icon, title, description, note }, index) => (
            <article
              key={title}
              className={`group grid gap-6 border-b border-primary/25 py-8 md:grid-cols-[84px_minmax(0,1fr)] md:gap-9 md:py-10 lg:py-12 ${index % 2 ? "lg:pl-[7%]" : "lg:pr-[5%]"}`}
            >
              <div className="flex items-start md:block">
                <span className="grid h-11 w-11 place-items-center border border-primary/35 text-primary transition-transform duration-300 group-hover:-translate-y-1">
                  <Icon className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
                </span>
              </div>

              <div>
                <p className="font-[family-name:var(--font-undara-mono)] text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
                  {note}
                </p>
                <h3 className="mt-4 max-w-[21ch] font-[family-name:var(--font-undara-heading)] text-2xl font-normal leading-[1.08] text-primary md:text-3xl lg:text-4xl">
                  {title}
                </h3>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base md:leading-8">
                  {description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
