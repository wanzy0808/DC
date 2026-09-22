"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, Eye, Search, X } from "lucide-react";
import Navbar from "@/components/Layout/Navbar/Navbar";
import PublicMarketingAtmosphere from "@/components/Layout/PublicMarketingAtmosphere";
import MarketingFrameFooter from "@/components/Layout/MarketingFrameFooter";
import { useLanguage } from "@/components/I18n/LanguageProvider";
import { Button } from "@/components/ui/button";
import {
  defaultInvitationSections,
  type InvitationSectionKey,
  type InvitationSections,
} from "@/lib/templates/sections";
import { useTemplateCatalog } from "@/lib/templates/use-template-catalog";
import { TemplateCanvas, TemplateCardCanvas } from "@/components/Templates/TemplateGalleryCanvas";

const optionalSections: { key: InvitationSectionKey; label: string }[] = [
  { key: "rsvp", label: "RSVP" },
  { key: "wishes", label: "Ucapan" },
  { key: "gift", label: "E-Angpao" },
];

export default function TemplateDesignPage() {
  const { locale } = useLanguage();
  const catalog = useTemplateCatalog();
  const deepLinkHandled = useRef(false);
  const sortMenuRef = useRef<HTMLDivElement>(null);
  const sortTriggerRef = useRef<HTMLButtonElement>(null);
  const copy = locale === "en"
    ? {
        eyebrow: "Invitation collection",
        title: "Find a design that feels like yours.",
        description: "Explore the real designs available in Invitation Studio. Preview each invitation and choose your favorite.",
        search: "Search templates...",
        searchLabel: "Search invitation templates",
        all: "All",
        withPhoto: "With photos",
        withoutPhoto: "Without photos",
        sort: "Sort by",
        catalog: "Catalog order",
        nameAsc: "Name A–Z",
        nameDesc: "Name Z–A",
        available: "designs available",
        none: "No templates match your search.",
        ready: "Preview uses the published invitation renderer",
        studio: "Invitation Studio design preview",
        designer: "Designer image preview · not yet available in Studio",
        view: "View invitation",
        viewImage: "View design",
        note: "Preview names and photos are samples. To add your own photos, create an event and upload them in Invitation Studio.",
        preview: "Preview · demo data",
        close: "Close preview",
        toggle: "Try showing or hiding invitation sections",
        toggleNote: "Toggles are for preview only. Changes are not saved.",
        designerNote: "This designer package is an image preview and cannot yet be used in Invitation Studio.",
        start: "Create an invitation",
        startNote: "Sign in and create an event first, then choose this design in Studio.",
        designerPreview: "Designer image preview. Interactive invitation integration is not available yet.",
        contentLabel: "Template gallery",
      }
    : {
        eyebrow: "Koleksi undangan",
        title: "Pilih desain yang terasa personal.",
        description: "Jelajahi desain yang tersedia di Invitation Studio. Lihat isi undangannya sebelum menentukan pilihan.",
        search: "Cari desain...",
        searchLabel: "Cari template undangan",
        all: "Semua",
        withPhoto: "Dengan foto",
        withoutPhoto: "Tanpa foto",
        sort: "Urutkan",
        catalog: "Urutan katalog",
        nameAsc: "Nama A–Z",
        nameDesc: "Nama Z–A",
        available: "desain tersedia",
        none: "Tidak ada template yang cocok dengan pencarianmu.",
        ready: "Preview mengikuti renderer undangan publik",
        studio: "Pratinjau desain Invitation Studio",
        designer: "Desain designer · pratinjau gambar, belum tersedia di Studio",
        view: "Lihat undangan",
        viewImage: "Lihat desain",
        note: "Foto dan nama pada pratinjau merupakan data contoh. Untuk memakai foto sendiri, buat acara lalu unggah foto melalui Invitation Studio.",
        preview: "Pratinjau · data contoh",
        close: "Tutup pratinjau",
        toggle: "Coba tampilkan atau sembunyikan bagian undangan",
        toggleNote: "Toggle hanya untuk mencoba preview. Perubahan tidak disimpan.",
        designerNote: "Desain designer ini masih berupa paket preview; belum dapat digunakan dalam Invitation Studio.",
        start: "Buat undangan",
        startNote: "Login dan buat acara terlebih dahulu, lalu pilih desain ini di Studio.",
        designerPreview: "Pratinjau gambar dari designer. Belum terintegrasi menjadi template interaktif.",
        contentLabel: "Koleksi template undangan",
      };
  const categories = useMemo(() => ["Semua", ...Array.from(new Set(catalog.map((item) => item.category)))], [catalog]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Semua");
  const [photoFilter, setPhotoFilter] = useState<"all" | "photo" | "no-photo">("all");
  const [sort, setSort] = useState<"Katalog" | "NamaAsc" | "NamaDesc">("Katalog");
  const [sortOpen, setSortOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [sections, setSections] = useState<InvitationSections>({ ...defaultInvitationSections });

  const filteredTemplates = useMemo(() => {
    const result = catalog.filter((template) =>
      `${template.name} ${template.description} ${template.category}`.toLocaleLowerCase("id").includes(query.trim().toLocaleLowerCase("id")) &&
      (category === "Semua" || template.category === category) &&
      (photoFilter === "all" || (template.ready && (photoFilter === "photo" ? template.usesPhotos : !template.usesPhotos))),
    );
    if (sort === "NamaAsc") return [...result].sort((a, b) => a.name.localeCompare(b.name, "id"));
    if (sort === "NamaDesc") return [...result].sort((a, b) => b.name.localeCompare(a.name, "id"));
    return result;
  }, [catalog, category, query, sort, photoFilter]);

  const selected = catalog.find((item) => item.key === selectedKey);
  const sortOptions = [
    { value: "Katalog", label: copy.catalog },
    { value: "NamaAsc", label: copy.nameAsc },
    { value: "NamaDesc", label: copy.nameDesc },
  ] as const;
  const sortLabel = sortOptions.find((option) => option.value === sort)?.label ?? copy.catalog;

  // Marketing cards deep-link to a specific preview. Public preview never opens Studio.
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("template");
    if (!deepLinkHandled.current && requested && catalog.some((item) => item.key === requested)) {
      deepLinkHandled.current = true;
      setSelectedKey(requested);
    }
  }, [catalog]);

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

  useEffect(() => {
    if (!sortOpen) return;
    const closeOutside = (event: PointerEvent) => {
      if (!sortMenuRef.current?.contains(event.target as Node)) setSortOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSortOpen(false);
        sortTriggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [sortOpen]);

  return (
    <div className="relative isolate flex min-h-dvh w-full flex-col overflow-hidden bg-background text-foreground">
      <PublicMarketingAtmosphere />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,rgba(217,163,170,0.12),transparent_64%)] dark:bg-[radial-gradient(ellipse_at_50%_45%,rgba(192,122,132,0.11),transparent_65%)]" />
      <div className="relative z-10 mx-auto my-auto flex h-[90dvh] w-[90vw] min-h-0 flex-col overflow-hidden rounded-[18px] border border-primary/30 bg-background/65 shadow-[0_18px_75px_rgba(75,35,47,0.09)] backdrop-blur-[2px] sm:my-[23px] sm:h-[calc(100dvh-46px)] sm:w-[calc(100%-46px)] lg:my-[27px] lg:h-[calc(100dvh-54px)] lg:w-[calc(100%-54px)]">
        <div className="relative z-50 shrink-0 border-b border-primary/15 bg-background/70 backdrop-blur-sm">
          <Navbar embedded />
        </div>
        <main
          tabIndex={0}
          aria-label={copy.contentLabel}
          className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain scroll-smooth focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-primary"
        >
          <section className="mx-auto w-[88%] max-w-full pb-16 pt-12 font-[family-name:var(--font-dc-body)] sm:w-[80vw] md:pb-24 md:pt-16">
        <div className="flex flex-col justify-between gap-7 border-b border-primary/20 pb-9 lg:flex-row lg:items-end">
          <div>
            <p className="font-[family-name:var(--font-dc-mono)] text-[11px] uppercase tracking-[0.25em] text-primary">{copy.eyebrow}</p>
            <h1 className="mt-4 max-w-3xl font-[family-name:var(--font-dc-heading)] text-3xl font-normal leading-tight text-primary sm:text-4xl lg:text-5xl">{copy.title}</h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-foreground/65">
              {copy.description}
            </p>
          </div>
          <div className="relative w-full shrink-0 lg:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/45" aria-hidden />
            <input
              aria-label={copy.searchLabel}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={copy.search}
              className="min-h-12 w-full rounded-full border border-primary/80 bg-background/75 py-3 pl-10 pr-5 text-sm shadow-sm backdrop-blur-md outline-none transition hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        <div className="mt-7 flex flex-wrap gap-2" aria-label={locale === "en" ? "Filter designs by photo use" : "Filter penggunaan foto"}>
          {([
            ["all", copy.all],
            ["photo", copy.withPhoto],
            ["no-photo", copy.withoutPhoto],
          ] as const).map(([value, label]) => (
            <button key={value} type="button" onClick={() => setPhotoFilter(value)} aria-pressed={photoFilter === value}
              className={`min-h-11 rounded-full border px-5 py-2 text-xs font-medium transition ${photoFilter === value ? "border-primary bg-primary text-white dark:text-black" : "border-primary/25 bg-background/65 text-foreground/80 hover:border-primary/60 hover:bg-primary/10"}`}>{label}</button>
          ))}
        </div>
        <div className="mb-8 mt-5 flex flex-wrap items-center justify-between gap-5">
          <div className="flex flex-wrap gap-2" aria-label={locale === "en" ? "Filter design categories" : "Filter jenis desain"}>
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={category === item}
                onClick={() => setCategory(item)}
                className={`min-h-10 rounded-full border px-4 py-2 font-[family-name:var(--font-dc-body)] text-xs transition ${category === item ? "border-primary bg-primary text-white shadow-sm dark:text-black" : "border-primary/25 bg-background/65 text-foreground/75 hover:border-primary/60 hover:bg-primary/10 hover:text-primary"}`}
              >
                {item === "Semua" ? copy.all : item}
              </button>
            ))}
          </div>
          <div ref={sortMenuRef} className="relative z-20 flex items-center gap-3 text-xs text-foreground/65">
            <span id="template-sort-label">{copy.sort}</span>
            <button
              ref={sortTriggerRef}
              type="button"
              aria-haspopup="menu"
              aria-expanded={sortOpen}
              aria-labelledby="template-sort-label template-sort-value"
              onClick={() => setSortOpen((open) => !open)}
              className="flex min-h-11 min-w-[155px] items-center justify-between gap-3 rounded-full border border-primary/80 bg-background/85 px-4 py-2 text-xs text-foreground shadow-sm transition hover:border-primary hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              <span id="template-sort-value">{sortLabel}</span>
              <ChevronDown className={`h-4 w-4 shrink-0 text-primary transition-transform ${sortOpen ? "rotate-180" : ""}`} aria-hidden />
            </button>
            {sortOpen && (
              <div role="menu" aria-label={copy.sort} className="absolute right-0 top-[calc(100%+8px)] z-30 w-48 overflow-hidden rounded-2xl border border-primary/80 bg-background p-1.5 shadow-[0_16px_36px_rgba(0,0,0,0.16)]">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    role="menuitemradio"
                    aria-checked={sort === option.value}
                    onClick={() => {
                      setSort(option.value);
                      setSortOpen(false);
                      sortTriggerRef.current?.focus();
                    }}
                    className={`flex min-h-10 w-full items-center rounded-xl px-3 text-left text-xs transition hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${sort === option.value ? "bg-primary/10 text-primary" : "text-foreground/80"}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <p className="mb-4 text-xs text-foreground/55" role="status">{filteredTemplates.length} {copy.available}</p>
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredTemplates.map((template) => (
            <article key={template.key} className="group min-w-0 overflow-hidden rounded-[24px] border border-primary/25 bg-background/80 shadow-[0_8px_28px_rgba(80,45,58,0.06)] backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-primary/55 hover:shadow-[0_16px_38px_rgba(80,45,58,0.13)]">
              <div className="relative w-full overflow-hidden text-left">
                {template.ready ? <TemplateCardCanvas templateKey={template.key} /> : (
                  <div className="relative h-[340px] overflow-hidden bg-[#fcf7f6]"><img src={template.previewImage} alt={template.name} loading="lazy" className="h-full w-full object-cover" /></div>
                )}
                {template.ready && <div className="pointer-events-none absolute left-3 top-3 z-[11] rounded-full border border-white/35 bg-black/65 px-3 py-1.5 text-[11px] font-medium text-white">{template.usesPhotos ? copy.withPhoto : copy.withoutPhoto}</div>}
                <div className="flex items-center justify-between gap-3 border-b border-primary/15 px-5 py-4">
                  <div className="min-w-0">
                    <p className="mb-1 font-[family-name:var(--font-dc-mono)] text-[10px] uppercase tracking-[0.16em] text-primary">{template.category}</p>
                    <h2 className="truncate font-[family-name:var(--font-dc-heading)] text-lg font-normal text-primary">{template.name}</h2>
                  </div>
                  <Eye className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                </div>
                <button type="button" onClick={() => openPreview(template.key)} aria-label={`Lihat pratinjau ${template.name}`} className="absolute inset-0 z-10 w-full focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-primary" />
              </div>
              <div className="px-5 pb-5 pt-3">
                <p className="min-h-12 text-sm leading-6 text-foreground/65">{template.description}</p>
                <p className="mt-2 text-[11px] text-foreground/50">{!template.ready ? copy.designer : template.previewType === "public" ? copy.ready : copy.studio}</p>
                <Button onClick={() => openPreview(template.key)} size="sm" className="mt-4 min-h-11 w-full rounded-full border-primary/80 text-sm focus-visible:ring-primary/60">
                  {template.ready ? copy.view : copy.viewImage} <ArrowRight className="h-4 w-4" aria-hidden />
                </Button>
              </div>
            </article>
          ))}
        </div>
        {filteredTemplates.length === 0 && (
          <div className="rounded-xl border border-dashed border-border px-6 py-20 text-center text-sm text-foreground/60">{copy.none}</div>
        )}

        <p className="mt-8 text-xs leading-6 text-foreground/50">
          {copy.note}
        </p>
          </section>
        </main>
        <MarketingFrameFooter />
      </div>

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
                  <p className="font-[family-name:var(--font-dc-mono)] text-[10px] uppercase tracking-[0.2em] text-primary">{copy.preview}</p>
                  <h2 id="template-preview-title" className="mt-2 break-words font-[family-name:var(--font-dc-heading)] text-xl text-primary">{selected.name}</h2>
                </div>
                <button autoFocus type="button" onClick={() => setSelectedKey(null)} aria-label={copy.close} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border text-foreground/70 hover:text-primary">
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>
              <p className="mt-3 hidden text-xs leading-6 text-foreground/60 md:block">{selected.description}</p>
              {selected.ready && <div className="mt-4 flex flex-wrap gap-2 md:mt-7" aria-label={copy.toggle}>
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
              <p className="mt-3 hidden text-xs leading-6 text-foreground/55 md:block">{selected.ready ? copy.toggleNote : copy.designerNote}</p>
              {selected.ready && <div className="mt-4 flex flex-col gap-2 md:mt-8">
                <Button asChild size="sm" className="rounded-xl text-xs">
                  <Link href="/dashboard">{copy.start} <ArrowRight className="h-4 w-4" aria-hidden /></Link>
                </Button>
                <p className="text-[11px] leading-5 text-foreground/50">{copy.startNote}</p>
              </div>}
            </aside>
            <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain bg-[#f4eeee] px-2 py-5 dark:bg-[#201a1d] sm:px-5" aria-label={`Contoh undangan ${selected.name}`}>
              <div className="mx-auto w-full max-w-[390px] overflow-hidden rounded-[24px] border-[5px] border-[#30272d] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
                {selected.ready ? (
                  <TemplateCanvas key={selected.key} templateKey={selected.key} sections={sections} />
                ) : (
                  <div className="bg-[#fff9f7]"><img src={selected.previewImage} alt={selected.name} className="h-auto w-full object-contain" /><p className="px-4 py-5 text-center text-xs leading-6 text-[#765460]">{copy.designerPreview}</p></div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
