import { ArrowDownRight, Check } from "lucide-react";
import { plannerServices } from "@/data/services/event-planner";

export default function ServicesSection() {
  return (
    <section className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
      <div className="lg:sticky lg:top-8 lg:self-start">
        <p className="font-[family-name:var(--font-undara-mono)] text-[10px] uppercase tracking-[0.22em] text-primary">
          How we work
        </p>
        <h2 className="mt-4 max-w-[10ch] font-[family-name:var(--font-undara-heading)] text-4xl leading-[1.02] text-primary md:text-5xl">
          Bukan mengatur lebih banyak. Membuat semuanya lebih jelas.
        </h2>
        <p className="mt-5 max-w-md text-sm leading-7 text-muted-foreground md:text-base">
          Kami memecah persiapan menjadi keputusan, PIC, timing, dan contingency yang bisa
          dipahami semua orang yang terlibat.
        </p>
        <ArrowDownRight className="mt-8 hidden h-7 w-7 text-primary/55 lg:block" />
      </div>

      <div className="border-t border-primary/30">
        {plannerServices.map((service) => (
          <article
            key={service.title}
            className="group grid gap-5 border-b border-primary/25 py-8 md:grid-cols-[auto_1fr] md:gap-6 md:py-10"
          >
            <div className="pt-1">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/35 text-primary transition-transform duration-300 group-hover:rotate-[-8deg]">
                <Check className="h-4 w-4" />
              </span>
            </div>
            <div>
              <h3 className="font-[family-name:var(--font-undara-heading)] text-2xl leading-tight text-primary md:text-3xl">
                {service.title}
              </h3>
              <p className="mt-3 max-w-2xl font-[family-name:var(--font-undara-body)] text-sm leading-7 text-muted-foreground md:text-base">
                {service.text}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
