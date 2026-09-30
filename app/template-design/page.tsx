"use client";

import { useEffect, useMemo, useRef, useState, type TouchEvent as ReactTouchEvent } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, Search, X } from "lucide-react";
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
import { controlStyles } from "@/components/ui/control-styles";
import { rememberTemplateSelection } from "@/lib/templates/template-intent";

const optionalSectionKeys: InvitationSectionKey[] = ["rsvp", "wishes", "gift"];

export default function TemplateDesignPage() {
  const { locale } = useLanguage();
  const catalog = useTemplateCatalog();
  const deepLinkHandled = useRef(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
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
        designer: "Not yet available",
        view: "View invitation",
        viewImage: "View design",
        close: "Close preview",
        toggle: "Try showing or hiding invitation sections",
        start: "Create an invitation",
        contentLabel: "Template gallery",
        previewLabel: "Preview",
        previewCanvasLabel: "Invitation preview",
        wheelHint: "Scroll or swipe to choose · click the centered phone to preview",
        optionalLabels: { rsvp: "RSVP", wishes: "Guest wishes", gift: "Gift" },
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
        designer: "Belum Tersedia",
        view: "Lihat undangan",
        viewImage: "Lihat desain",
        close: "Tutup pratinjau",
        toggle: "Coba tampilkan atau sembunyikan bagian undangan",
        start: "Buat Undangan",
        contentLabel: "Koleksi template undangan",
        previewLabel: "Pratinjau",
        previewCanvasLabel: "Contoh undangan",
        wheelHint: "Scroll atau geser untuk memilih · klik HP di tengah untuk pratinjau",
        optionalLabels: { rsvp: "RSVP", wishes: "Ucapan", gift: "E-Angpao" },
      };
  const categories = useMemo(() => ["Semua", ...Array.from(new Set(catalog.map((item) => item.category)))], [catalog]);
  const descriptionFor = (template: (typeof catalog)[number]) =>
    locale === "en" ? template.descriptionEn ?? template.description : template.description;
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Semua");
  const [photoFilter, setPhotoFilter] = useState<"all" | "photo" | "no-photo">("all");
  const [sort, setSort] = useState<"Katalog" | "NamaAsc" | "NamaDesc">("Katalog");
  const [sortOpen, setSortOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [sections, setSections] = useState<InvitationSections>({ ...defaultInvitationSections });
  const [wheelIndex, setWheelIndex] = useState(0);
  const wheelStageRef = useRef<HTMLDivElement>(null);
  const wheelIndexRef = useRef(0);
  const wheelLockRef = useRef(0);
  const wheelTouchStartRef = useRef<number | null>(null);
  const suppressWheelClickRef = useRef(false);

  const filteredTemplates = useMemo(() => {
    const result = catalog.filter((template) =>
      `${template.name} ${template.description} ${template.descriptionEn ?? ""} ${template.category}`.toLocaleLowerCase("id").includes(query.trim().toLocaleLowerCase("id")) &&
      (category === "Semua" || template.category === category) &&
      (photoFilter === "all" || (template.ready && (photoFilter === "photo" ? template.usesPhotos : !template.usesPhotos))),
    );
    if (sort === "NamaAsc") return [...result].sort((a, b) => a.name.localeCompare(b.name, "id"));
    if (sort === "NamaDesc") return [...result].sort((a, b) => b.name.localeCompare(a.name, "id"));
    return result;
  }, [catalog, category, query, sort, photoFilter]);

  const selected = catalog.find((item) => item.key === selectedKey);
  const activeWheelTemplate = filteredTemplates[wheelIndex] ?? null;
  const sortOptions = [
    { value: "Katalog", label: copy.catalog },
    { value: "NamaAsc", label: copy.nameAsc },
    { value: "NamaDesc", label: copy.nameDesc },
  ] as const;
  const sortLabel = sortOptions.find((option) => option.value === sort)?.label ?? copy.catalog;

  useEffect(() => {
    wheelIndexRef.current = 0;
    setWheelIndex(0);
  }, [query, category, photoFilter, sort]);

  useEffect(() => {
    if (wheelIndex < filteredTemplates.length) return;
    const next = Math.max(0, filteredTemplates.length - 1);
    wheelIndexRef.current = next;
    setWheelIndex(next);
  }, [filteredTemplates.length, wheelIndex]);

  function moveWheel(direction: -1 | 1) {
    setWheelIndex((current) => {
      const next = Math.max(0, Math.min(filteredTemplates.length - 1, current + direction));
      wheelIndexRef.current = next;
      return next;
    });
  }

  useEffect(() => {
    const stage = wheelStageRef.current;
    if (!stage || filteredTemplates.length < 2) return;
    const onWheel = (event: WheelEvent) => {
      const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
      if (Math.abs(delta) < 8) return;
      const direction: -1 | 1 = delta > 0 ? 1 : -1;
      const current = wheelIndexRef.current;
      const canMove = direction > 0 ? current < filteredTemplates.length - 1 : current > 0;
      if (!canMove) return;
      event.preventDefault();
      const now = performance.now();
      if (now - wheelLockRef.current < 170) return;
      wheelLockRef.current = now;
      const next = Math.max(0, Math.min(filteredTemplates.length - 1, current + direction));
      wheelIndexRef.current = next;
      setWheelIndex(next);
    };
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
  }, [filteredTemplates.length]);

  function handleWheelTouchStart(event: ReactTouchEvent<HTMLDivElement>) {
    wheelTouchStartRef.current = event.changedTouches[0]?.clientX ?? null;
  }

  function handleWheelTouchEnd(event: ReactTouchEvent<HTMLDivElement>) {
    const startX = wheelTouchStartRef.current;
    wheelTouchStartRef.current = null;
    if (startX === null) return;
    const endX = event.changedTouches[0]?.clientX ?? startX;
    const distance = endX - startX;
    if (Math.abs(distance) < 38) return;
    suppressWheelClickRef.current = true;
    moveWheel(distance < 0 ? 1 : -1);
    window.setTimeout(() => { suppressWheelClickRef.current = false; }, 220);
  }

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
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedKey(null);
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ) ?? []).filter((item) => item.getClientRects().length > 0);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !dialogRef.current?.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !dialogRef.current?.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      previousFocusRef.current?.focus();
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
      <div data-undara-marketing-frame className="undara-marketing-frame">
        <div className="undara-marketing-frame-header">
          <Navbar embedded />
        </div>
        <main
          tabIndex={0}
          aria-label={copy.contentLabel}
          className="undara-marketing-scroll focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-primary"
        >
          <section className="undara-marketing-content pb-16 pt-8 font-[family-name:var(--font-undara-body)] md:pb-24 md:pt-12">
        <div className="undara-marketing-section grid min-h-[min(64dvh,680px)] items-end gap-10 pb-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          <div className="max-w-4xl">
            <p className="font-[family-name:var(--font-undara-mono)] text-[10px] uppercase tracking-[0.22em] text-primary md:text-xs">{copy.eyebrow}</p>
            <h1 className="mt-5 max-w-[20ch] font-[family-name:var(--font-undara-heading)] text-[clamp(3rem,6vw,6.6rem)] font-normal leading-[0.97] tracking-[-0.035em] text-primary">{copy.title}</h1>
          </div>
          <div className="max-w-xl lg:pb-2">
            <p className="text-sm leading-7 text-muted-foreground md:text-base md:leading-8">
              {copy.description}
            </p>
          <div className="relative mt-7 w-full">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/45" aria-hidden />
            <input
              aria-label={copy.searchLabel}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={copy.search}
              className={`${controlStyles.input} pl-10`}
            />
          </div>
        </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-2" aria-label={locale === "en" ? "Filter designs by photo use" : "Filter penggunaan foto"}>
          {([
            ["all", copy.all],
            ["photo", copy.withPhoto],
            ["no-photo", copy.withoutPhoto],
          ] as const).map(([value, label]) => (
            <button key={value} type="button" onClick={() => setPhotoFilter(value)} aria-pressed={photoFilter === value}
              className={`${controlStyles.filter} ${photoFilter === value ? "bg-primary text-white dark:text-black" : "bg-background/65 text-foreground/80 hover:bg-primary/10"}`}>{label}</button>
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
                className={`${controlStyles.filter} min-h-10 px-4 font-[family-name:var(--font-undara-body)] ${category === item ? "bg-primary text-primary-foreground shadow-sm" : "bg-background/65 text-foreground/75 hover:bg-primary/10 hover:text-primary"}`}
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
              className={controlStyles.trigger}
            >
              <span id="template-sort-value">{sortLabel}</span>
              <ChevronDown className={`h-4 w-4 shrink-0 text-primary transition-transform ${sortOpen ? "rotate-180" : ""}`} aria-hidden />
            </button>
            {sortOpen && (
              <div role="menu" aria-label={copy.sort} className={controlStyles.menu}>
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
                    className={`${controlStyles.option} ${sort === option.value ? "border-primary bg-primary/10 text-primary" : "border-primary/30 text-foreground/80"}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <p className="mb-5 text-xs text-foreground/55" role="status">{filteredTemplates.length} {copy.available}</p>
        {filteredTemplates.length > 0 && (
          <div className="relative -mx-4 overflow-hidden px-4 pb-10 sm:-mx-8 sm:px-8">
            <div
              ref={wheelStageRef}
              data-template-wheel
              role="group"
              aria-label={locale === "en" ? "Template selection wheel" : "Roda pilihan template"}
              tabIndex={0}
              onTouchStart={handleWheelTouchStart}
              onTouchEnd={handleWheelTouchEnd}
              onKeyDown={(event) => {
                if (event.key === "ArrowLeft") {
                  event.preventDefault();
                  moveWheel(-1);
                } else if (event.key === "ArrowRight") {
                  event.preventDefault();
                  moveWheel(1);
                } else if (event.key === "Enter" && activeWheelTemplate) {
                  event.preventDefault();
                  openPreview(activeWheelTemplate.key);
                }
              }}
              className="relative h-[470px] w-full touch-pan-y overflow-hidden outline-none [perspective:1200px] sm:h-[525px] md:h-[555px] focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-4 focus-visible:ring-offset-background"
            >
              <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[47%] h-[64%] w-[min(66vw,560px)] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(112,59,59,0.10),rgba(112,59,59,0.025)_52%,transparent_72%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(214,179,140,0.12),rgba(214,179,140,0.025)_52%,transparent_72%)]" />
              <div aria-hidden="true" className="pointer-events-none absolute inset-x-[12%] bottom-[5.5%] h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              <div aria-hidden="true" className="pointer-events-none absolute left-1/2 bottom-[3.5%] h-8 w-[min(50vw,360px)] -translate-x-1/2 rounded-[50%] bg-black/10 blur-xl dark:bg-black/25" />

              {filteredTemplates.map((template, index) => {
                const distance = index - wheelIndex;
                const depth = Math.abs(distance);
                const visible = depth <= 3;
                const scale = Math.max(0.56, 1 - depth * 0.16);
                const opacity = visible ? Math.max(0.18, 1 - depth * 0.24) : 0;
                const rotation = distance === 0 ? 0 : distance < 0 ? 13 : -13;
                const translateY = depth * 18;
                return (
                  <button
                    key={template.key}
                    type="button"
                    aria-current={distance === 0 ? "true" : undefined}
                    aria-label={distance === 0 ? `${copy.previewLabel}: ${template.name}` : template.name}
                    tabIndex={depth <= 1 ? 0 : -1}
                    onClick={() => {
                      if (suppressWheelClickRef.current) return;
                      if (distance === 0) {
                        openPreview(template.key);
                      } else {
                        wheelIndexRef.current = index;
                        setWheelIndex(index);
                      }
                    }}
                    className="group absolute left-1/2 top-[46%] aspect-[9/19.5] [transform-style:preserve-3d] w-[clamp(148px,22vw,224px)] rounded-[38px] bg-gradient-to-br from-[#f8f8f8] via-[#a9a9aa] to-[#303032] p-[3px] shadow-[0_28px_58px_rgba(17,17,17,0.20),inset_0_1px_0_rgba(255,255,255,0.9)] transition-[transform,opacity,filter] duration-[240ms] ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary dark:from-[#e4e4e4] dark:via-[#77777a] dark:to-[#121214]"
                    style={{
                      transform: `translate(-50%, -50%) translateX(calc(${distance} * clamp(112px, 17vw, 190px))) translateY(${translateY}px) rotateY(${rotation}deg) scale(${scale})`,
                      opacity,
                      zIndex: 20 - depth,
                      filter: distance === 0 ? "none" : `saturate(${Math.max(0.5, 1 - depth * 0.14)}) brightness(${Math.max(0.72, 1 - depth * 0.08)})`,
                      pointerEvents: visible ? "auto" : "none",
                    }}
                  >
                    <span aria-hidden="true" className="absolute -right-[4px] top-[24%] h-11 w-[4px] rounded-r-full bg-[#4a4a4c] dark:bg-[#8b8b8e]" />
                    <span aria-hidden="true" className="absolute -left-[4px] top-[21%] h-7 w-[4px] rounded-l-full bg-[#4a4a4c] dark:bg-[#8b8b8e]" />
                    <span aria-hidden="true" className="absolute -left-[4px] top-[31%] h-10 w-[4px] rounded-l-full bg-[#4a4a4c] dark:bg-[#8b8b8e]" />
                    <span className="relative block h-full overflow-hidden rounded-[35px] border border-black/70 bg-[#080808] p-[7px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.16),inset_0_0_16px_rgba(0,0,0,0.95)] dark:border-white/20">
                      <span className="pointer-events-none absolute inset-[7px] z-20 rounded-[29px] border border-white/10" aria-hidden="true" />
                      <span className="relative block h-full overflow-hidden rounded-[28px] bg-[#f8f4f1] dark:bg-[#111111]">
                        {template.ready ? (
                          <TemplateCardCanvas templateKey={template.key} designKey={template.designKey} phone />
                        ) : (
                          <img src={template.previewImage} alt="" loading="lazy" className="h-full w-full object-cover" />
                        )}
                      </span>
                      <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-2.5 z-30 h-5 w-[34%] -translate-x-1/2 rounded-full bg-black shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_1px_4px_rgba(0,0,0,0.4)]">
                        <span className="absolute right-2 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[#151515]" />
                      </span>
                      {distance === 0 && (
                        <span className="pointer-events-none absolute inset-x-7 bottom-5 z-30 rounded-full bg-black/70 px-3 py-2 text-center text-[10px] font-medium uppercase tracking-[0.16em] text-white opacity-0 transition-opacity duration-200 [@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-100">
                          {copy.previewLabel}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            {activeWheelTemplate && (
              <div data-template-wheel-details aria-live="polite" className="mx-auto -mt-2 max-w-2xl text-center">
                <p className="font-[family-name:var(--font-undara-mono)] text-[9px] uppercase tracking-[0.18em] text-foreground/45">
                  {String(wheelIndex + 1).padStart(2, "0")} / {String(filteredTemplates.length).padStart(2, "0")} · {activeWheelTemplate.category}
                </p>
                <h2 className="mt-3 font-[family-name:var(--font-undara-heading)] text-[clamp(1.9rem,4vw,3rem)] font-normal leading-tight text-primary">
                  {activeWheelTemplate.name}
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-foreground/65">
                  {descriptionFor(activeWheelTemplate)}
                </p>
                <p className="mt-4 text-[11px] text-foreground/40">{copy.wheelHint}</p>
              </div>
            )}
          </div>
        )}
        {filteredTemplates.length === 0 && (
          <div className="rounded-xl border border-dashed border-border px-6 py-20 text-center text-sm text-foreground/60">{copy.none}</div>
        )}

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
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="template-preview-title"
            className="flex max-h-[95dvh] w-full max-w-[950px] min-w-0 flex-col overflow-hidden rounded-2xl bg-background shadow-2xl md:flex-row"
          >
            <aside className="shrink-0 border-b border-border p-4 md:w-[310px] md:border-b-0 md:border-r md:p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 id="template-preview-title" className="mt-2 break-words font-[family-name:var(--font-undara-heading)] text-xl text-primary">{selected.name}</h2>
                </div>
                <button autoFocus type="button" onClick={() => setSelectedKey(null)} aria-label={copy.close} className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--undara-control-radius)] border border-primary/50 text-primary hover:bg-primary/10">
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>
              <p className="mt-3 hidden text-xs leading-6 text-foreground/60 md:block">{descriptionFor(selected)}</p>
              {selected.ready && <div className="mt-4 flex flex-wrap gap-2 md:mt-7" aria-label={copy.toggle}>
                {optionalSectionKeys.map((key) => (
                  <label key={key} className="flex min-h-9 cursor-pointer items-center gap-2 rounded-[var(--undara-control-radius)] border border-border px-3 py-2 text-xs">
                    <input
                      type="checkbox"
                      checked={sections[key]}
                      onChange={(event) => setSections((current) => ({ ...current, [key]: event.target.checked }))}
                      className="accent-primary"
                    />
                    {copy.optionalLabels[key as keyof typeof copy.optionalLabels]}
                  </label>
                ))}
              </div>}
              {!selected.ready && <p className="mt-3 text-xs font-medium text-foreground">{copy.designer}</p>}
              {selected.ready && <div className="mt-4 flex flex-col gap-2 md:mt-8">
                <Button asChild size="sm" className="rounded-xl text-xs">
                  <Link href={`/studio?template=${encodeURIComponent(selected.key)}`} onClick={() => rememberTemplateSelection(selected.key)}>{copy.start} <ArrowRight className="h-4 w-4" aria-hidden /></Link>
                </Button>
              </div>}
            </aside>
            <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain bg-primary/10 px-2 py-5 sm:px-5" aria-label={`${copy.previewCanvasLabel} ${selected.name}`}>
              <div className="mx-auto w-full max-w-[390px] overflow-hidden rounded-[24px] border-[5px] border-[#30272d] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
                {selected.ready ? (
                  <TemplateCanvas key={selected.key} templateKey={selected.key} designKey={selected.designKey} sections={{ ...sections, envelope: false }} />
                ) : (
                  <div className="bg-[#fff9f7]"><img src={selected.previewImage} alt={selected.name} className="h-auto w-full object-contain" /></div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
