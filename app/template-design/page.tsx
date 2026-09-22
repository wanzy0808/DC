"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight, Eye, Search, X } from "lucide-react";
import BrandWordmark from "@/components/Brand/BrandWordmark";
import { Button } from "@/components/ui/button";
import { invitationTemplatePresets } from "@/components/InvitationStudio/designer-config";
import { invitationFonts, invitationPalettes } from "@/lib/templates/design";
import {
  defaultInvitationSections,
  type InvitationSectionKey,
  type InvitationSections,
} from "@/lib/templates/sections";
import { useTemplateCatalog } from "@/lib/templates/use-template-catalog";
import { templateDemoInvitation, templateDemoPhoto } from "@/data/templates/preview-invitation";

const InvitationPreview = dynamic(
  () => import("@/components/InvitationStudio/InvitationPreview").then((module) => module.InvitationPreview),
  { loading: () => <div className="grid min-h-[550px] place-items-center bg-[#fcf7f6] text-xs text-[#916f7a]">Memuat pratinjau…</div> },
);

function TemplateCanvas({
  templateKey,
  sections = defaultInvitationSections,
}: {
  templateKey: string;
  sections?: InvitationSections;
}) {
  const preset = invitationTemplatePresets[templateKey] ?? invitationTemplatePresets["botanical-ivory"];
  return (
    <InvitationPreview
      invitation={{ ...templateDemoInvitation, templateKey }}
      templateKey={templateKey}
      palette={invitationPalettes[preset.palette]}
      fontPair={invitationFonts[preset.font]}
      decorUrl={templateDemoPhoto}
      eventTag=""
      dressCode=""
      sections={sections}
    />
  );
}

/** Lazily render the actual Studio canvas for each visible card (not a stock-image mockup). */
function TemplateCardCanvas({ templateKey }: { templateKey: string }) {
  const root = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = root.current;
    if (!element || visible) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [visible]);

  return (
    <div ref={root} className="relative h-[340px] w-full overflow-hidden bg-[#fcf7f6]" aria-hidden="true">
      {visible ? (
        <div
          className="pointer-events-none absolute left-1/2 top-0 w-[390px]"
          style={{ transform: "translateX(-50%) scale(0.77)", transformOrigin: "top center" }}
        >
          <TemplateCanvas templateKey={templateKey} />
        </div>
      ) : (
        <div className="grid h-full place-items-center text-xs text-[#916f7a]">Pratinjau template</div>
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#fcf7f6] to-transparent" />
    </div>
  );
}

const optionalSections: { key: InvitationSectionKey; label: string }[] = [
  { key: "rsvp", label: "RSVP" },
  { key: "wishes", label: "Ucapan" },
  { key: "gift", label: "E-Angpao" },
];

export default function TemplateDesignPage() {
  const catalog = useTemplateCatalog();
  const categories = useMemo(() => ["Semua", ...Array.from(new Set(catalog.map((item) => item.category)))], [catalog]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Semua");
  const [sort, setSort] = useState<"Katalog" | "Nama">("Katalog");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [sections, setSections] = useState<InvitationSections>({ ...defaultInvitationSections });

  const filteredTemplates = useMemo(() => {
    const result = catalog.filter((template) =>
      `${template.name} ${template.description} ${template.category}`.toLocaleLowerCase("id").includes(query.trim().toLocaleLowerCase("id")) &&
      (category === "Semua" || template.category === category),
    );
    return sort === "Nama"
      ? [...result].sort((a, b) => a.name.localeCompare(b.name, "id"))
      : result;
  }, [catalog, category, query, sort]);

  const selected = catalog.find((item) => item.key === selectedKey);

  function openPreview(key: string) {
    setSections({ ...defaultInvitationSections });
    setSelectedKey(key);
  }

  useEffect(() => {
    if (!selectedKey) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedKey(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedKey]);

  return (
    <main className="min-h-screen bg-background font-[family-name:var(--font-dc-body)] text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex min-h-[76px] w-[calc(100%-2rem)] items-center justify-between gap-4 py-3 lg:w-[80vw]">
          <Link href="/" aria-label="Beranda DC Organizer"><BrandWordmark size="dashboard" /></Link>
          <nav className="flex items-center gap-3 text-xs sm:gap-6">
            <Link href="/d-invitation" className="text-foreground/65 transition hover:text-primary">Undangan Digital</Link>
            <Link href="/dashboard" className="rounded-full border border-primary/35 px-4 py-2.5 text-primary transition hover:bg-primary/5">Dashboard</Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto w-[calc(100%-2rem)] pb-20 pt-11 lg:w-[80vw]">
        <div className="flex flex-col justify-between gap-6 border-b border-border/70 pb-8 md:flex-row md:items-end">
          <div>
            <p className="font-[family-name:var(--font-dc-mono)] text-[11px] uppercase tracking-[0.22em] text-primary">Koleksi DC Organizer</p>
            <h1 className="mt-3 font-[family-name:var(--font-dc-heading)] text-3xl text-primary sm:text-4xl">Template undangan</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-foreground/65">
              Lihat desain yang tersedia di Invitation Studio. Pilih Pratinjau untuk mencoba alur undangannya sebelum membuat acara.
            </p>
          </div>
          <div className="relative w-full max-w-sm shrink-0">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/45" aria-hidden />
            <input
              aria-label="Cari template undangan"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari desain..."
              className="min-h-11 w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>
        </div>

        <div className="mb-8 mt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2" aria-label="Filter jenis desain">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={category === item}
                onClick={() => setCategory(item)}
                className={`min-h-10 rounded-full border px-4 py-2 text-xs transition ${category === item ? "border-primary bg-primary text-white dark:text-black" : "border-border bg-background text-foreground/70 hover:border-primary/40 hover:text-primary"}`}
              >
                {item}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-3 text-xs text-foreground/65">
            Urutkan
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as "Katalog" | "Nama")}
              className="min-h-10 rounded-xl border border-border bg-background px-3 text-xs text-foreground outline-none focus:border-primary"
            >
              <option value="Katalog">Urutan katalog</option>
              <option value="Nama">Nama A–Z</option>
            </select>
          </label>
        </div>

        <p className="mb-4 text-xs text-foreground/55" role="status">{filteredTemplates.length} desain tersedia</p>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredTemplates.map((template) => (
            <article key={template.key} className="group min-w-0 overflow-hidden rounded-2xl border border-border/80 bg-background shadow-[0_8px_28px_rgba(80,45,58,0.05)] transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_16px_38px_rgba(80,45,58,0.1)]">
              <button
                type="button"
                onClick={() => openPreview(template.key)}
                aria-label={`Lihat pratinjau ${template.name}`}
                className="block w-full overflow-hidden text-left focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-primary"
              >
                {template.ready ? <TemplateCardCanvas templateKey={template.key} /> : (
                  <div className="relative h-[340px] overflow-hidden bg-[#fcf7f6]"><img src={template.previewImage} alt={template.name} loading="lazy" className="h-full w-full object-cover" /></div>
                )}
                <div className="flex items-center justify-between gap-3 border-b border-border/70 px-5 py-4">
                  <div className="min-w-0">
                    <p className="mb-1 font-[family-name:var(--font-dc-mono)] text-[10px] uppercase tracking-[0.16em] text-primary">{template.category}</p>
                    <h2 className="truncate font-[family-name:var(--font-dc-heading)] text-lg text-foreground">{template.name}</h2>
                  </div>
                  <Eye className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                </div>
              </button>
              <div className="px-5 pb-5 pt-3">
                <p className="min-h-12 text-xs leading-6 text-foreground/60">{template.description}</p>
                <p className="mt-2 text-[11px] text-foreground/50">{!template.ready ? "Desain designer · pratinjau gambar, belum tersedia di Studio" : template.previewType === "public" ? "Preview mengikuti renderer undangan publik" : "Pratinjau desain Invitation Studio"}</p>
                <Button onClick={() => openPreview(template.key)} size="sm" className="mt-4 w-full rounded-xl text-xs">
                  {template.ready ? "Lihat undangan" : "Lihat desain"} <ArrowRight className="h-4 w-4" aria-hidden />
                </Button>
              </div>
            </article>
          ))}
        </div>
        {filteredTemplates.length === 0 && (
          <div className="rounded-xl border border-dashed border-border px-6 py-20 text-center text-sm text-foreground/60">Tidak ada template yang cocok dengan pencarianmu.</div>
        )}

        <p className="mt-8 text-xs leading-6 text-foreground/50">
          Foto dan nama pada pratinjau merupakan data contoh. Untuk memakai foto sendiri, buat acara lalu unggah foto melalui Invitation Studio.
        </p>
      </section>

      {selected && (
        <div
          role="presentation"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-2 backdrop-blur-sm sm:p-5"
          onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedKey(null); }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="template-preview-title"
            className="flex max-h-[95dvh] w-full max-w-[950px] min-w-0 flex-col overflow-hidden rounded-2xl bg-background shadow-2xl md:flex-row"
          >
            <aside className="shrink-0 border-b border-border p-4 md:w-[310px] md:border-b-0 md:border-r md:p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-[family-name:var(--font-dc-mono)] text-[10px] uppercase tracking-[0.2em] text-primary">Pratinjau · data contoh</p>
                  <h2 id="template-preview-title" className="mt-2 break-words font-[family-name:var(--font-dc-heading)] text-xl text-primary">{selected.name}</h2>
                </div>
                <button autoFocus type="button" onClick={() => setSelectedKey(null)} aria-label="Tutup pratinjau" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border text-foreground/70 hover:text-primary">
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>
              <p className="mt-3 hidden text-xs leading-6 text-foreground/60 md:block">{selected.description}</p>
              {selected.ready && <div className="mt-4 flex flex-wrap gap-2 md:mt-7" aria-label="Coba tampilkan atau sembunyikan bagian undangan">
                {optionalSections.map((item) => (
                  <label key={item.key} className="flex min-h-9 cursor-pointer items-center gap-2 rounded-full border border-border px-3 py-2 text-xs">
                    <input
                      type="checkbox"
                      checked={sections[item.key]}
                      onChange={(event) => setSections((current) => ({ ...current, [item.key]: event.target.checked }))}
                      className="accent-[#a65e69]"
                    />
                    {item.label}
                  </label>
                ))}
              </div>}
              <p className="mt-3 hidden text-xs leading-6 text-foreground/55 md:block">{selected.ready ? "Toggle hanya untuk mencoba preview. Perubahan tidak disimpan." : "Desain designer ini masih berupa paket preview; belum dapat digunakan dalam Invitation Studio."}</p>
              {selected.ready && <div className="mt-4 flex flex-col gap-2 md:mt-8">
                <Button asChild size="sm" className="rounded-xl text-xs">
                  <Link href="/dashboard">Buat undangan <ArrowRight className="h-4 w-4" aria-hidden /></Link>
                </Button>
                <p className="text-[11px] leading-5 text-foreground/50">Login dan buat acara terlebih dahulu, lalu pilih {selected.name} di Studio.</p>
              </div>}
            </aside>
            <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain bg-[#f4eeee] px-2 py-5 dark:bg-[#201a1d] sm:px-5" aria-label={`Contoh undangan ${selected.name}`}>
              <div className="mx-auto w-full max-w-[390px] overflow-hidden rounded-[24px] border-[5px] border-[#30272d] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
                {selected.ready ? (
                  <TemplateCanvas key={selected.key} templateKey={selected.key} sections={sections} />
                ) : (
                  <div className="bg-[#fff9f7]"><img src={selected.previewImage} alt={selected.name} className="h-auto w-full object-contain" /><p className="px-4 py-5 text-center text-xs leading-6 text-[#765460]">Pratinjau gambar dari designer. Belum terintegrasi menjadi template interaktif.</p></div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
