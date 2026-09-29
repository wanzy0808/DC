"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Play } from "lucide-react";
import VideoModal from "@/components/Marketing/VideoModal";
import { plannerPortfolio } from "@/data/services/event-planner";

export default function PortfolioSection({ locale }: { locale: "id" | "en" }) {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const en = locale === "en";

  return (
    <section className="space-y-10">
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-end lg:gap-14">
        <div>
          <p className="font-[family-name:var(--font-undara-mono)] text-[10px] uppercase tracking-[0.22em] text-primary">
            {en ? "Selected celebrations" : "Pilihan perayaan"}
          </p>
          <h2 className="mt-3 max-w-[18ch] font-[family-name:var(--font-undara-heading)] text-4xl leading-[1.04] text-primary md:text-5xl">
            {en ? "Celebrations we helped hold together." : "Momen yang kami bantu jaga tetap utuh."}
          </h2>
        </div>
        <p className="max-w-2xl text-sm leading-7 text-muted-foreground lg:justify-self-end md:text-base md:leading-8">
          {en
            ? "It is not only about a beautiful result. We look after timing, movement, communication, and the small decisions that make an event feel calm from the inside."
            : "Bukan sekadar hasil akhir yang terlihat indah. Kami menjaga ritme, perpindahan, komunikasi, dan keputusan kecil yang membuat acara terasa tenang dari dalam."}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12 lg:grid-rows-2">
        {plannerPortfolio.map((item, index) => {
          const featured = index === 0;
          return (
            <article
              key={item.name}
              className={featured ? "group lg:col-span-7 lg:row-span-2" : "group lg:col-span-5"}
            >
              <button
                type="button"
                onClick={() => setActiveVideo(item.video)}
                aria-label={en ? `Watch ${item.name}` : `Lihat video ${item.name}`}
                className={`relative block w-full overflow-hidden text-left ${featured ? "h-[520px] lg:h-full lg:min-h-[620px]" : "h-[300px]"}`}
              >
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes={featured ? "(max-width: 1024px) 90vw, 58vw" : "(max-width: 1024px) 90vw, 38vw"}
                  className="object-cover transition duration-700 ease-out group-hover:scale-[1.025]"
                />
                <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(20,14,11,0.74)_0%,rgba(20,14,11,0.08)_46%,transparent_70%)]" />

                <span className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-black/10 text-white backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                  <Play className="ml-0.5 h-4 w-4 fill-current" />
                </span>

                <div className="absolute bottom-0 left-0 right-0 p-6 text-white md:p-7">
                  <p className="font-[family-name:var(--font-undara-mono)] text-[9px] uppercase tracking-[0.16em] text-white/70">
                    {en ? item.categoryEn : item.category} · {en ? item.dateEn : item.date}
                  </p>
                  <h3 className={`mt-2 max-w-xl font-[family-name:var(--font-undara-heading)] leading-tight ${featured ? "text-3xl md:text-4xl" : "text-2xl"}`}>
                    {item.name}
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/75">
                    <span>{item.concept}</span>
                    <span>{item.location}</span>
                  </div>
                </div>
              </button>
            </article>
          );
        })}
      </div>

      {activeVideo && typeof document !== "undefined"
        ? createPortal(
            <VideoModal url={activeVideo} onClose={() => setActiveVideo(null)} />,
            document.body,
          )
        : null}
    </section>
  );
}
