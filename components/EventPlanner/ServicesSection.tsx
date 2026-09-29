import { ArrowDownRight, Check } from "lucide-react";
import { plannerServices } from "@/data/services/event-planner";

export default function ServicesSection({ locale }: { locale: "id" | "en" }) {
  const en = locale === "en";

  return (
    <section className="space-y-10 md:space-y-12">
      <div className="grid gap-6 border-b border-primary/25 pb-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-14">
        <div>
          <p className="font-[family-name:var(--font-undara-mono)] text-[10px] uppercase tracking-[0.22em] text-primary">
            {en ? "How we work" : "Cara kami bekerja"}
          </p>
          <h2 className="mt-4 max-w-[18ch] font-[family-name:var(--font-undara-heading)] text-4xl leading-[1.04] text-primary md:text-5xl">
            {en
              ? "Less noise, clearer decisions, calmer execution."
              : "Lebih sedikit keruwetan, lebih banyak keputusan yang jelas."}
          </h2>
        </div>

        <div className="flex items-end gap-4">
          <p className="max-w-xl text-sm leading-7 text-muted-foreground md:text-base md:leading-8">
            {en
              ? "We turn preparation into clear decisions, owners, timing, and contingencies so every person involved understands what needs to happen next."
              : "Kami memecah persiapan menjadi keputusan, PIC, timing, dan contingency yang jelas supaya semua orang yang terlibat paham apa yang perlu dilakukan berikutnya."}
          </p>
          <ArrowDownRight className="mb-1 hidden h-6 w-6 shrink-0 text-primary/55 lg:block" />
        </div>
      </div>

      <div className="divide-y divide-primary/20 border-b border-primary/20">
        {plannerServices.map((service) => (
          <article
            key={service.title}
            className="grid gap-5 py-7 md:grid-cols-[2.4rem_minmax(0,0.9fr)_minmax(0,1.35fr)] md:items-start md:gap-7 md:py-9"
          >
            <span className="mt-1 flex h-9 w-9 items-center justify-center rounded-full border border-primary/35 text-primary">
              <Check className="h-4 w-4" />
            </span>

            <h3 className="font-[family-name:var(--font-undara-heading)] text-2xl leading-tight text-primary md:text-3xl">
              {en ? service.titleEn : service.title}
            </h3>

            <p className="max-w-2xl font-[family-name:var(--font-undara-body)] text-sm leading-7 text-muted-foreground md:text-base md:leading-8">
              {en ? service.textEn : service.text}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
