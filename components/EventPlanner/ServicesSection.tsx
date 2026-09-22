import { Check } from "lucide-react";
import SectionHeading from "@/components/Marketing/SectionHeading";
import { plannerServices } from "@/data/services/event-planner";

export default function ServicesSection() {
  return (
    <section className="space-y-10">
      <SectionHeading
        eyebrow="What We Handle"
        title="Bukan hanya mengurus acara, tapi menjaga alurnya"
        description="Kami membantu memecah persiapan menjadi keputusan yang jelas, menyatukan vendor dan tim, lalu memastikan semuanya bertemu dengan baik saat acara berlangsung."
      />
      <div className="grid gap-5 md:grid-cols-2">
        {plannerServices.map((service) => (
          <article
            key={service.title}
            className="rounded-[28px] border border-primary/35 bg-[var(--card)]/70 p-6 md:rounded-[32px] md:p-7"
          >
            <div className="flex justify-end">
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
