import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

const templates = [
  {
    name: "Eternal Blossom",
    theme: "Floral editorial",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800",
  },
  {
    name: "Celestial Night",
    theme: "Dark gold romance",
    image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800",
  },
  {
    name: "Royal Velvet",
    theme: "Classic monogram",
    image: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=800",
  },
];

export default function TemplateCollection() {
  return (
    <section className="space-y-9">
      <div className="flex flex-col justify-between gap-6 border-b border-border/70 pb-7 sm:flex-row sm:items-end">
        <div className="max-w-2xl">
          <p className="font-[family-name:var(--font-dc-mono)] text-[10px] uppercase tracking-[0.26em] text-primary">
            Curated Collection / 03
          </p>
          <h2 className="mt-4 font-[family-name:var(--font-dc-heading)] text-4xl font-normal leading-tight text-primary md:text-5xl">
            Pilih suasana yang paling dekat dengan kisah kalian.
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-foreground/65">
            Mulai dari visual yang lembut hingga karakter yang lebih dramatis. Detail terbaik selalu dimulai dari rasa yang tepat.
          </p>
        </div>
        <Link
          href="/template-design"
          className={buttonVariants({ variant: "link", size: "default", className: "h-auto shrink-0 px-0 text-xs uppercase tracking-[0.14em]" })}
        >
          Lihat semua template
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {templates.map((template) => (
          <article key={template.name} className="group min-w-0">
            <div className="relative mx-auto aspect-[0.72] max-w-[270px] overflow-hidden rounded-2xl border border-border bg-card p-2 shadow-lg shadow-black/5 transition-transform duration-500 group-hover:-translate-y-1.5 dark:shadow-black/20">
              <div className="relative h-full overflow-hidden rounded-xl bg-black">
                <Image
                  src={template.image}
                  alt={template.name}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 80vw, 270px"
                />
              </div>
              <span className="absolute left-5 top-5 border border-white/30 bg-black/35 px-2.5 py-1 font-[family-name:var(--font-dc-mono)] text-[8px] uppercase tracking-[0.16em] text-white backdrop-blur-md">
                Studio
              </span>
            </div>
            <div className="mx-auto max-w-[270px] pt-5">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-[family-name:var(--font-dc-heading)] text-xl font-normal text-primary">{template.name}</h3>
                <span className="font-[family-name:var(--font-dc-mono)] text-[8px] uppercase tracking-[0.15em] text-foreground/40">Invitation</span>
              </div>
              <p className="mt-1 text-xs text-foreground/55">{template.theme}</p>
              <Link
                href="/template-design"
                className={buttonVariants({ variant: "link", size: "sm", className: "mt-3 h-auto px-0 text-xs" })}
              >
                Lihat detail <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
