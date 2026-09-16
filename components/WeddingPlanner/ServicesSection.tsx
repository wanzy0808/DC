import { Check } from "lucide-react";
import SectionHeading from "@/components/Marketing/SectionHeading";
import { plannerServices } from "@/data/wedding-planner";

export default function ServicesSection() {
  return (
    <section className="space-y-10">
      <SectionHeading
        eyebrow="What We Handle"
        title="Bukan hanya mengurus acara, tapi menjaga alurnya"
        description="Kami membantu memecah persiapan menjadi keputusan yang jelas, menyatukan vendor dan tim, lalu memastikan semuanya bertemu dengan baik saat acara berlangsung."
      />
      <div className="grid gap-5 md:grid-cols-2">
        {plannerServices.map((service, index) => (
          <article
            key={service.title}
            className="rounded-2xl border border-[var(--border)] bg-[var(--card)]/70 p-6 md:p-7"
          >
            <div className="flex items-center justify-between">
              <span className="font-[family-name:var(--font-dc-mono)] text-xs text-[var(--primary)]">
                0{index + 1}
              </span>
              <Check className="h-5 w-5 text-[var(--primary)]" />
            </div>
            <h3 className="mt-7 font-[family-name:var(--font-dc-heading)] text-2xl">
              {service.title}
            </h3>
            <p className="mt-3 font-[family-name:var(--font-dc-body)] text-sm leading-7 text-[var(--muted-foreground)]">
              {service.text}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
