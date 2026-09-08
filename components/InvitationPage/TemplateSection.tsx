import Link from "next/link";
import { ArrowRight } from "lucide-react";

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
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-dc-maroon">
            [ CURATED COLLECTION ]
          </p>
          <h2 className="mt-3 font-serif text-4xl md:text-5xl">
            Pilih rasa yang paling kamu
          </h2>
          <p className="mt-1 font-serif text-4xl italic text-dc-maroon md:text-5xl">
            kenal.
          </p>
        </div>
        <Link
          href="/template-design"
          className="text-xs font-medium uppercase tracking-[0.16em] text-dc-maroon underline underline-offset-4"
        >
          Lihat lagi semua template{" "}
          <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {templates.map((template) => (
          <article key={template.name} className="group">
            <div className="relative mx-auto aspect-[0.72] max-w-[250px] overflow-hidden rounded-[28px] border-8 border-[#33252a] bg-black p-2 shadow-lg transition duration-500 group-hover:-translate-y-2">
              <img
                src={template.image}
                alt={template.name}
                className="h-full w-full rounded-[20px] object-cover transition duration-500 group-hover:scale-105"
              />
              <span className="absolute left-4 top-4 rounded-full bg-dc-pink px-2.5 py-1 text-[9px] text-white">
                Studio
              </span>
            </div>
            <div className="mx-auto max-w-[250px] pt-4">
              <h3 className="font-serif text-xl">{template.name}</h3>
              <p className="mt-1 text-xs opacity-60">{template.theme}</p>
              <Link
                href="/template-design"
                className="mt-3 inline-flex items-center text-xs font-medium text-dc-maroon"
              >
                Lihat detail <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}