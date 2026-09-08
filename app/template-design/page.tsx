"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, Eye, Filter, Search, Sparkles } from "lucide-react";

const templates = [
  {
    id: "167",
    name: "Tema 167",
    category: "Floral",
    status: "Baru",
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=88&w=900",
    accent: "#f6c0cf",
    tone: "from-[#f9d8df] via-[#fff8f2] to-[#e8b1c0]",
  },
  {
    id: "194",
    name: "Palembang Classic Artistry",
    category: "Adat",
    status: "Studio",
    image:
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=88&w=900",
    accent: "#dce39a",
    tone: "from-[#dfe6a0] via-[#fff6c8] to-[#d2a477]",
  },
  {
    id: "166",
    name: "Tema 166",
    category: "Classic",
    status: "Baru",
    image:
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=88&w=900",
    accent: "#e6e4df",
    tone: "from-[#f4f2ee] via-[#ffffff] to-[#d2d0cf]",
  },
  {
    id: "193",
    name: "Chinese Royal Radiance",
    category: "Adat",
    status: "Studio",
    image:
      "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=88&w=900",
    accent: "#eab2a5",
    tone: "from-[#e9b8a8] via-[#fce7c9] to-[#bad3be]",
  },
  {
    id: "181",
    name: "Garden Bloom",
    category: "Floral",
    status: "Premium",
    image:
      "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&q=88&w=900",
    accent: "#b8cfca",
    tone: "from-[#8ca8ad] via-[#dce8e2] to-[#f8d6c7]",
  },
  {
    id: "172",
    name: "Javanese Garden",
    category: "Adat",
    status: "Studio",
    image:
      "https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&q=88&w=900",
    accent: "#f4e6c8",
    tone: "from-[#f5e8cc] via-[#fffaf0] to-[#d8b88b]",
  },
  {
    id: "155",
    name: "Blue Serenity",
    category: "Minimal",
    status: "Premium",
    image:
      "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=88&w=900",
    accent: "#b7d4e7",
    tone: "from-[#9cc7e5] via-[#e8f3f8] to-[#f4d4c3]",
  },
  {
    id: "148",
    name: "Line Art Love",
    category: "Minimal",
    status: "Baru",
    image:
      "https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?auto=format&fit=crop&q=88&w=900",
    accent: "#f7b6d4",
    tone: "from-[#f7b6d4] via-[#fff1f7] to-[#f1d3e0]",
  },
];

const categories = ["Semua", "Floral", "Adat", "Classic", "Minimal"];

export default function TemplateDesignPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Semua");
  const [sort, setSort] = useState("Terbaru");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filteredTemplates = useMemo(() => {
    const result = templates.filter((template) => {
      const matchesQuery = `${template.name} ${template.category}`
        .toLowerCase()
        .includes(query.toLowerCase());
      return (
        matchesQuery && (category === "Semua" || template.category === category)
      );
    });
    return sort === "Nama"
      ? [...result].sort((a, b) => a.name.localeCompare(b.name))
      : result;
  }, [category, query, sort]);

  const selected = templates.find((template) => template.id === selectedId);

  return (
    <main className="min-h-screen bg-[#fffefe] text-[#191317] [font-family:var(--font-dc-sans)]">
      <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-[#e9dfe5] bg-white/95 px-5 backdrop-blur-md sm:px-8">
        <Link
          href="/"
          className="font-serif text-xl font-bold italic tracking-[0.08em] text-dc-maroon"
        >
          DC
        </Link>
        <nav className="hidden items-center gap-8 text-xs text-[#756b72] md:flex">
          <Link href="/D-invitation" className="hover:text-dc-maroon">
            Produk
          </Link>
          <span className="font-medium text-dc-maroon">Template</span>
          <Link href="/" className="hover:text-dc-maroon">
            Blog
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="hidden items-center gap-1 rounded-full border border-[#e6dfe4] px-3 py-1.5 text-[10px] sm:flex"
          >
            ID <ChevronDown className="h-3 w-3" />
          </button>
          <Link
            href="/dashboard"
            className="rounded-full bg-dc-pink px-4 py-2 text-[10px] font-medium text-white transition hover:bg-dc-maroon"
          >
            Ke Dashboard
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-[1420px] px-5 pb-16 pt-10 sm:px-8 lg:px-12">
        <div className="mb-7 flex flex-col justify-between gap-5 border-b border-[#eee5e9] pb-7 lg:flex-row lg:items-end">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-dc-maroon">
              DC Wedding
            </p>
            <h1 className="mt-2 font-serif text-3xl sm:text-4xl">
              Pilih template undanganmu
            </h1>
            <p className="mt-2 max-w-xl text-sm text-[#80767d]">
              Temukan desain yang paling dekat dengan cerita hari bahagiamu.
            </p>
          </div>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-3 h-4 w-4 text-[#aa9da5]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari template"
              className="w-full rounded-lg border border-[#e6dfe4] bg-white py-2.5 pl-10 pr-3 text-xs outline-none transition focus:border-dc-pink"
            />
          </div>
        </div>
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`rounded-full px-4 py-2 text-[10px] transition ${category === item ? "bg-dc-pink text-white" : "border border-[#e6dfe4] text-[#71676e] hover:border-dc-pink hover:text-dc-maroon"}`}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                setCategory(category === "Semua" ? "Floral" : "Semua")
              }
              className="flex items-center gap-2 rounded-lg border border-[#e6dfe4] px-3 py-2 text-[10px] text-[#71676e]"
            >
              <Filter className="h-3.5 w-3.5" />
              Filter
            </button>
            <label className="flex items-center gap-2 rounded-lg border border-[#e6dfe4] px-3 py-2 text-[10px] text-[#71676e]">
              Urutkan
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="bg-transparent font-medium outline-none"
              >
                <option>Terbaru</option>
                <option>Nama</option>
              </select>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTemplates.map((template) => (
            <article
              key={template.id}
              className="group overflow-hidden rounded-xl border border-[#eee3e8] bg-white shadow-[0_5px_18px_rgba(90,34,55,0.06)] transition duration-300 hover:-translate-y-1 hover:border-[#e9a8bd] hover:shadow-[0_15px_30px_rgba(90,34,55,0.12)]"
            >
              <div
                className={`relative aspect-[0.7] overflow-hidden bg-linear-to-br ${template.tone}`}
              >
                <img
                  src={template.image}
                  alt={template.name}
                  className="absolute inset-0 h-full w-full object-cover opacity-75 mix-blend-multiply transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-white/10" />
                <span className="absolute left-3 top-3 rounded-full bg-dc-pink px-2.5 py-1 text-[9px] font-medium text-white">
                  {template.status}
                </span>
                {template.status === "Studio" && (
                  <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-dc-pink px-2.5 py-1 text-[9px] font-medium text-white">
                    <Sparkles className="h-3 w-3" />
                    Studio
                  </span>
                )}
                <div className="absolute inset-x-5 bottom-6 rounded-lg border border-white/70 bg-white/78 p-4 text-center shadow-lg backdrop-blur-sm">
                  <p className="font-serif text-xl text-dc-maroon">
                    {template.category === "Adat"
                      ? "Vidi & Hening"
                      : "Vidi & Hening"}
                  </p>
                  <p className="mt-1 text-[8px] uppercase tracking-[0.25em] text-dc-maroon/70">
                    We are getting married
                  </p>
                  <div className="mx-auto mt-4 h-10 w-10 border-4 border-dc-maroon/80" />
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 p-3">
                <div className="min-w-0">
                  <h2 className="truncate font-serif text-sm">
                    {template.id} · {template.name}
                  </h2>
                  <p className="mt-1 text-[10px] text-[#92868d]">
                    {template.category}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedId(template.id)}
                  className="shrink-0 rounded-full border border-dc-pink px-3 py-1.5 text-[10px] text-dc-maroon transition hover:bg-dc-pink hover:text-white"
                >
                  <Eye className="mr-1 inline h-3 w-3" />
                  Pratinjau
                </button>
              </div>
              <Link
                href="/dashboard/editor"
                className="mx-3 mb-3 block rounded-full bg-dc-pink py-2 text-center text-[10px] font-medium text-white transition hover:bg-dc-maroon"
              >
                Gunakan template
              </Link>
            </article>
          ))}
        </div>
        {filteredTemplates.length === 0 && (
          <div className="py-24 text-center text-sm text-[#877b83]">
            Template tidak ditemukan.
          </div>
        )}
      </section>

      {selected && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[#24131d]/55 p-5"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedId(null)}
        >
          <div
            className="grid max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl md:grid-cols-2"
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className={`relative min-h-[420px] bg-linear-to-br ${selected.tone}`}
            >
              <img
                src={selected.image}
                alt={selected.name}
                className="h-full w-full object-cover opacity-75 mix-blend-multiply"
              />
              <div className="absolute inset-x-12 bottom-10 rounded-xl bg-white/85 p-7 text-center backdrop-blur">
                <p className="font-serif text-3xl text-dc-maroon">
                  Vidi &amp; Hening
                </p>
                <p className="mt-2 text-[10px] uppercase tracking-widest text-dc-maroon/70">
                  The wedding invitation
                </p>
              </div>
            </div>
            <div className="flex flex-col justify-between p-7">
              <div>
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="float-right text-xs text-[#8a7d85] hover:text-dc-maroon"
                >
                  Tutup
                </button>
                <p className="text-[10px] uppercase tracking-[0.25em] text-dc-maroon">
                  Template {selected.id}
                </p>
                <h2 className="mt-3 font-serif text-3xl">{selected.name}</h2>
                <p className="mt-2 text-sm text-[#83777e]">
                  {selected.category} · {selected.status}
                </p>
                <p className="mt-7 text-sm leading-7 text-[#625861]">
                  Desain undangan dengan layout responsif, RSVP realtime,
                  galeri, musik, dan QR check-in yang bisa disesuaikan di
                  editor.
                </p>
              </div>
              <Link
                href="/dashboard/editor"
                className="mt-8 rounded-full bg-dc-pink px-5 py-3 text-center text-xs font-medium text-white hover:bg-dc-maroon"
              >
                Pilih template ini
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
