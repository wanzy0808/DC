import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const CONSULTATION_URL =
  "https://wa.me/6282124786516?text=Halo%2C%20aku%20ingin%20tanya2%20mengenai%20paket%20Event%20Planner.";

export default function FounderSection({ locale }: { locale: "id" | "en" }) {
  const en = locale === "en";
  return (
    <section className="grid items-center gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16">
      <div className="relative min-h-[520px] lg:min-h-[640px]">
        <div className="absolute inset-[0_8%_10%_0] overflow-hidden rounded-[8px_44px_8px_44px] border border-primary/25">
          <Image
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1200&auto=format&fit=crop"
            alt={en ? "Christine, Founder and Lead Event Planner at Undara" : "Christine, Founder dan Lead Event Planner Undara"}
            fill
            sizes="(max-width: 1024px) 90vw, 52vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(25,17,13,0.52),transparent_42%)]" />
        </div>

        <div className="absolute bottom-0 right-0 max-w-[19rem] border-l border-t border-primary/30 bg-background/92 px-6 py-5 backdrop-blur-md">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="h-4 w-4" />
            <span className="font-[family-name:var(--font-undara-mono)] text-[9px] font-semibold uppercase tracking-[0.16em]">
              {en ? "8+ years of experience" : "8+ tahun pengalaman"}
            </span>
          </div>
          <p className="mt-3 font-[family-name:var(--font-undara-heading)] text-lg italic leading-7">
            {en ? "“A great event feels clear and considered for the host, family, vendors, and every guest.”" : "“Acara yang baik terasa terarah bagi host, keluarga, vendor, dan setiap tamu.”"}
          </p>
        </div>
      </div>

      <div>
        <p className="font-[family-name:var(--font-undara-mono)] text-[10px] uppercase tracking-[0.22em] text-primary">
          {en ? "Meet the founder" : "Kenali founder"}
        </p>
        <h2 className="mt-4 font-[family-name:var(--font-undara-heading)] text-5xl leading-none text-primary md:text-6xl">
          Christine
        </h2>
        <p className="mt-3 font-[family-name:var(--font-undara-mono)] text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {en ? "Founder & Lead Event Planner" : "Pendiri & Perencana Acara Utama"}
        </p>

        <p className="mt-7 max-w-xl font-[family-name:var(--font-undara-body)] text-sm leading-7 text-muted-foreground md:text-base md:leading-8">
          {en
            ? "With a background in hospitality and event execution, Christine built Undara to turn countless details into clear decisions. The goal is not only a polished event, but a flow where everyone knows when to move, who makes the call, and what happens when the plan changes."
            : "Berangkat dari hospitality dan event execution, Christine membangun Undara untuk mengubah banyak detail menjadi keputusan yang jelas. Bukan sekadar membuat acara terlihat rapi, tapi memastikan orang-orang di dalamnya tahu kapan harus bergerak, siapa yang mengambil keputusan, dan apa yang terjadi ketika rencana berubah."}
        </p>

        <div className="mt-9 grid grid-cols-3 border-y border-primary/25 py-6">
          {[
            ["150+", en ? "Events" : "Acara"],
            ["99%", en ? "Satisfaction" : "Kepuasan"],
            ["8+", en ? "Years" : "Tahun"],
          ].map(([value, label], index) => (
            <div
              key={label}
              className={index > 0 ? "border-l border-primary/20 pl-5 sm:pl-7" : ""}
            >
              <p className="font-[family-name:var(--font-undara-heading)] text-3xl text-primary md:text-4xl">
                {value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center gap-5">
          <Button asChild>
            <Link href={CONSULTATION_URL} target="_blank" rel="noreferrer">
              {en ? "Consult with Christine" : "Konsultasi dengan Christine"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <p className="hidden max-w-[16rem] text-xs leading-5 text-muted-foreground sm:block">
            {en ? "Start with the story. We can shape the scope and team needs from there." : "Mulai dari cerita acaranya dulu. Scope dan kebutuhan tim bisa disusun setelahnya."}
          </p>
        </div>
      </div>
    </section>
  );
}
