"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import SectionHeading from "@/components/Marketing/SectionHeading";
import VideoModal from "@/components/Marketing/VideoModal";
import { plannerPortfolio } from "@/data/services/event-planner";

export default function PortfolioSection() {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  return (
    <section className="space-y-10">
      <SectionHeading
        eyebrow="Our Portfolio"
        title="Momen yang kami bantu jaga"
        description="Beberapa contoh wedding, anniversary, dan intimate celebration yang menggambarkan cara kerja Event Planner DC Organizer."
      />
      <div className="grid gap-6 md:grid-cols-3">
        {plannerPortfolio.map((item) => (
          <article
            key={item.name}
            className="group overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]/70"
          >
            <button
              type="button"
              onClick={() => setActiveVideo(item.video)}
              className="relative block h-60 w-full overflow-hidden text-left"
              aria-label={`Lihat video ${item.name}`}
            >
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary)] text-white shadow-xl">
                  <Play className="ml-1 h-5 w-5 fill-current" />
                </span>
              </div>
              <span className="absolute left-3 top-3 rounded-lg bg-black/60 px-3 py-1 font-[family-name:var(--font-dc-mono)] text-[10px] text-white">
                {item.date}
              </span>
            </button>
            <div className="space-y-2 p-5">
              <p className="font-[family-name:var(--font-dc-mono)] text-[9px] uppercase tracking-[0.16em] text-[var(--primary)]">
                {item.category}
              </p>
              <h3 className="font-[family-name:var(--font-dc-heading)] text-xl">
                {item.name}
              </h3>
              <p className="text-xs text-[var(--primary)]">{item.concept}</p>
              <p className="text-xs text-[var(--muted-foreground)]">{item.location}</p>
            </div>
          </article>
        ))}
      </div>
      <VideoModal url={activeVideo} onClose={() => setActiveVideo(null)} />
    </section>
  );
}
