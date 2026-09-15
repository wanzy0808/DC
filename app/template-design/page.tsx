"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, Eye, Filter, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const templates = [
  ["167", "Tema 167", "Floral", "Baru", "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=88&w=900"],
  ["194", "Palembang Classic Artistry", "Adat", "Studio", "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=88&w=900"],
  ["166", "Tema 166", "Classic", "Baru", "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=88&w=900"],
  ["193", "Chinese Royal Radiance", "Adat", "Studio", "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=88&w=900"],
  ["181", "Garden Bloom", "Floral", "Premium", "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&q=88&w=900"],
  ["172", "Javanese Garden", "Adat", "Studio", "https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&q=88&w=900"],
  ["155", "Blue Serenity", "Minimal", "Premium", "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=88&w=900"],
  ["148", "Line Art Love", "Minimal", "Baru", "https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?auto=format&fit=crop&q=88&w=900"],
] as const;

const categories = ["Semua", "Floral", "Adat", "Classic", "Minimal"];

export default function TemplateDesignPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Semua");
  const [sort, setSort] = useState("Terbaru");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filteredTemplates = useMemo(() => {
    const result = templates.filter(([id, name, itemCategory]) =>
      `${id} ${name} ${itemCategory}`.toLowerCase().includes(query.toLowerCase()) &&
      (category === "Semua" || itemCategory === category),
    );
    return sort === "Nama" ? [...result].sort((a, b) => a[1].localeCompare(b[1])) : result;
  }, [category, query, sort]);

  const selected = templates.find(([id]) => id === selectedId);

  return (
    <main className="min-h-screen bg-white text-[#191317] [font-family:var(--font-dc-sans)]">
      <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-[#e9dfe5] bg-white/95 px-5 backdrop-blur-md sm:px-8">
        <Link href="/" className="font-[family-name:var(--font-dc-heading)] text-xl font-bold tracking-[0.08em] text-primary">DC Organizer</Link>
        <nav className="hidden items-center gap-8 text-xs text-[#756b72] md:flex">
          <Link href="/d-invitation" className="hover:text-primary">Produk</Link>
          <span className="font-medium text-primary">Template</span>
          <Link href="/" className="hover:text-primary">Blog</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button type="button" size="sm" className="hidden h-9 rounded-xl bg-transparent px-3 text-[10px] text-primary shadow-none hover:bg-primary/5 sm:flex">
            ID <ChevronDown className="h-3 w-3" />
          </Button>
          <Button asChild size="sm" className="rounded-xl px-4 text-[10px] font-medium">
            <Link href="/dashboard">Ke Dashboard</Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto max-w-[1420px] px-5 pb-16 pt-10 sm:px-8 lg:px-12">
        <div className="mb-7 flex flex-col justify-between gap-5 border-b border-[#eee5e9] pb-7 lg:flex-row lg:items-end">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-primary">DC Organizer</p>
            <h1 className="mt-2 font-[family-name:var(--font-dc-heading)] text-3xl sm:text-4xl">Pilih template undanganmu</h1>
            <p className="mt-2 max-w-xl text-sm text-[#80767d]">Temukan desain yang paling dekat dengan cerita hari bahagiamu.</p>
          </div>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-3 h-4 w-4 text-[#aa9da5]" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari template" className="w-full rounded-lg border border-[#e6dfe4] bg-white py-2.5 pl-10 pr-3 text-xs outline-none transition focus:border-primary" />
          </div>
        </div>

        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {categories.map((item) => (
              <Button key={item} type="button" size="sm" onClick={() => setCategory(item)} className={`rounded-xl px-4 text-[10px] ${category === item ? "" : "bg-transparent text-[#71676e] shadow-none hover:bg-primary/5 hover:text-primary"}`}>{item}</Button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button type="button" size="sm" onClick={() => setCategory(category === "Semua" ? "Floral" : "Semua")} className="rounded-xl bg-transparent text-[10px] text-[#71676e] shadow-none hover:bg-primary/5 hover:text-primary"><Filter className="h-3.5 w-3.5" />Filter</Button>
            <label className="flex items-center gap-2 rounded-xl border border-[#e6dfe4] px-3 py-2 text-[10px] text-[#71676e]">Urutkan<select value={sort} onChange={(event) => setSort(event.target.value)} className="bg-transparent font-medium outline-none"><option>Terbaru</option><option>Nama</option></select></label>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTemplates.map(([id, name, itemCategory, status, image]) => (
            <article key={id} className="group overflow-hidden rounded-xl border border-[#eee3e8] bg-white shadow-[0_5px_18px_rgba(90,34,55,0.06)] transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_15px_30px_rgba(90,34,55,0.12)]">
              <div className="relative aspect-[0.7] overflow-hidden bg-[#f8eef2]">
                <img src={image} alt={name} className="absolute inset-0 h-full w-full object-cover opacity-75 mix-blend-multiply transition duration-500 group-hover:scale-105" />
                <span className="absolute left-3 top-3 rounded-xl bg-primary px-2.5 py-1 text-[9px] font-medium text-white">{status}</span>
                {status === "Studio" && <span className="absolute right-3 top-3 flex items-center gap-1 rounded-xl bg-primary px-2.5 py-1 text-[9px] font-medium text-white"><Sparkles className="h-3 w-3" />Studio</span>}
                <div className="absolute inset-x-5 bottom-6 rounded-lg border border-white/70 bg-white/80 p-4 text-center shadow-lg backdrop-blur-sm"><p className="font-[family-name:var(--font-dc-heading)] text-xl text-primary">Vidi & Hening</p><p className="mt-1 text-[8px] uppercase tracking-[0.25em] text-primary/70">We are getting married</p><div className="mx-auto mt-4 h-10 w-10 border-4 border-primary/80" /></div>
              </div>
              <div className="flex items-center justify-between gap-3 p-3">
                <div className="min-w-0"><h2 className="truncate font-[family-name:var(--font-dc-heading)] text-sm">{id} · {name}</h2><p className="mt-1 text-[10px] text-[#92868d]">{itemCategory}</p></div>
                <Button type="button" size="xs" onClick={() => setSelectedId(id)} className="shrink-0 rounded-xl px-3 text-[10px]"><Eye className="h-3 w-3" />Pratinjau</Button>
              </div>
              <Button asChild size="sm" className="mx-3 mb-3 w-[calc(100%-1.5rem)] rounded-xl text-[10px]"><Link href="/dashboard/editor">Gunakan template</Link></Button>
            </article>
          ))}
        </div>
        {filteredTemplates.length === 0 && <div className="py-24 text-center text-sm text-[#877b83]">Template tidak ditemukan.</div>}
      </section>

      {selected && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#24131d]/55 p-5" role="dialog" aria-modal="true" onClick={() => setSelectedId(null)}>
          <div className="grid max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl md:grid-cols-2" onClick={(event) => event.stopPropagation()}>
            <div className="relative min-h-[420px] bg-[#f8eef2]"><img src={selected[4]} alt={selected[1]} className="h-full w-full object-cover opacity-75 mix-blend-multiply" /><div className="absolute inset-x-12 bottom-10 rounded-xl bg-white/85 p-7 text-center backdrop-blur"><p className="font-[family-name:var(--font-dc-heading)] text-3xl text-primary">Vidi &amp; Hening</p><p className="mt-2 text-[10px] uppercase tracking-widest text-primary/70">The wedding invitation</p></div></div>
            <div className="flex flex-col justify-between p-7">
              <div><Button type="button" size="xs" onClick={() => setSelectedId(null)} className="float-right rounded-xl bg-transparent text-xs text-[#8a7d85] shadow-none hover:bg-primary/5 hover:text-primary">Tutup</Button><p className="text-[10px] uppercase tracking-[0.25em] text-primary">Template {selected[0]}</p><h2 className="mt-3 font-[family-name:var(--font-dc-heading)] text-3xl">{selected[1]}</h2><p className="mt-2 text-sm text-[#83777e]">{selected[2]} · {selected[3]}</p><p className="mt-7 text-sm leading-7 text-[#625861]">Desain undangan dengan layout responsif, RSVP realtime, galeri, musik, dan QR check-in yang bisa disesuaikan di editor.</p></div>
              <Button asChild size="lg" className="mt-8 rounded-xl"><Link href="/dashboard/editor">Pilih template ini</Link></Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
