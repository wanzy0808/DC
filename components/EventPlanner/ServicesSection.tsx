import { ArrowDownRight } from "lucide-react";
import { plannerServices } from "@/data/services/event-planner";

export default function ServicesSection({ locale }: { locale: "id" | "en" }) {
  const en = locale === "en";

  return (
    <section className="space-y-10 md:space-y-12">
      <div className="grid gap-6 border-b border-primary/25 pb-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-end lg:gap-14">
        <div>
          <p className="font-[family-name:var(--font-undara-mono)] text-[10px] uppercase tracking-[0.2em] text-primary">
            {en ? "Before we connect you" : "Sebelum kami hubungkan"}
          </p>
          <h2 className="mt-4 max-w-[19ch] font-[family-name:var(--font-undara-heading)] text-4xl leading-[1.04] text-primary md:text-5xl">
            {en ? "Four things are enough to get started." : "Empat hal sederhana sudah cukup untuk mulai."}
          </h2>
        </div>

        <div className="flex items-end gap-4">
          <p className="max-w-xl text-sm leading-7 text-muted-foreground md:text-base md:leading-8">
            {en
              ? "You do not need a complete brief. Send whatever is already known, and the rest can be clarified during consultation."
              : "Kamu tidak perlu menyiapkan brief yang lengkap. Kirim saja informasi yang sudah ada, sisanya bisa dibicarakan saat konsultasi."}
          </p>
          <ArrowDownRight className="mb-1 hidden h-6 w-6 shrink-0 text-primary/55 lg:block" />
        </div>
      </div>

      <div className="divide-y divide-primary/20 border-b border-primary/20">
        {plannerServices.map((service, index) => (
          <article
            key={service.title}
            className="grid gap-5 py-7 md:grid-cols-[3.25rem_minmax(0,0.85fr)_minmax(0,1.25fr)] md:items-start md:gap-7 md:py-9"
          >
            <p className="font-[family-name:var(--font-undara-heading)] text-3xl leading-none text-primary/50">
              {String(index + 1).padStart(2, "0")}
            </p>

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
