"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import { useLanguage } from "@/components/I18n/LanguageProvider";
import {
  Check,
  ChevronDown,
  Search,
  Upload,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { MAX_AUDIO_FILES, AUDIO_MIME_TYPES } from "@/lib/invitations/audio-limits";
import { invitationSectionItems } from "@/lib/templates/sections";
import { invitationFontFamily } from "@/lib/templates/presentation";
import InvitationFonts from "@/components/PublicInvitation/InvitationFonts";
import { Input } from "@/components/ui/input";
import type { CatalogTemplate } from "@/lib/templates/use-template-catalog";
import { TemplateCardCanvas } from "@/components/Templates/TemplateGalleryCanvas";
import type { FontKey, PaletteKey } from "@/lib/templates/design";
import type {
  InvitationSectionKey,
  InvitationSections,
} from "@/lib/templates/sections";
import {
  invitationFontOptions,
  invitationPaletteOptions,
} from "@/components/InvitationStudio/designer-config";
import { availableEditableCopyFields, editableCopyMaxLength, invitationCopyDefaults, type EditableInvitationCopy, type EditableInvitationCopyField } from "@/lib/templates/editable-copy";
import type { InvitationDesignerInvitation } from "@/components/InvitationStudio/designer-types";

export function DesignerTool({
  active,
  label,
  icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className="dc-studio-tool" aria-pressed={active}>
      {icon}<span>{label}</span>
    </button>
  );
}

const studioHeadingEnglish: Record<string, string> = {
  "Pilih Tema": "Choose a Theme",
  "Lihat desainnya langsung di sebelah kanan.": " ",
  "Bagian & Fitur": "Sections & Features",
  "Sembunyikan bagian tanpa menghapus isinya.": "Hide a section without deleting its content.",
  "Palet Warna": "Color Palette",
  "Pilih kombinasi warna untuk tema ini.": "Choose this theme's color combination.",
  "Pasangan Font": "Font Pair",
  "Nama huruf ditampilkan dengan font aslinya.": "Font names are displayed in their actual typefaces.",
  "Isi Undangan": "Invitation Content",
  "Identitas dan jadwal mengikuti data acara.": "Names and schedules use your event details.",
  "Musik": "Music",
  "Maksimal 2 file, masing-masing 3 MB. Hapus file untuk menggantinya.": "Up to two files, 3 MB each.",
};

function Heading({ title, description }: { title: string; description: string }) {
  const { locale } = useLanguage();
  const shownTitle = locale === "en" ? studioHeadingEnglish[title] || title : title;
  const shownDescription = locale === "en" ? studioHeadingEnglish[description] ?? description : description;
  return (
    <div>
      <h2 className="font-[family-name:var(--font-dc-heading)] text-lg font-semibold text-primary">
        {shownTitle}
      </h2>
      {shownDescription.trim() && <p className="mt-1 text-sm leading-6 text-foreground/75">{shownDescription}</p>}
    </div>
  );
}

export function TemplatePanel({
  selected,
  onSelect,
  templates,
}: {
  selected: string;
  onSelect: (key: string) => void;
  templates: CatalogTemplate[];
}) {
  const { locale } = useLanguage();
  const en = locale === "en";
  const [search, setSearch] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const [photoFilter, setPhotoFilter] = useState<"all" | "photo" | "no-photo">("all");
  const [sort, setSort] = useState<"selected" | "az" | "za">("selected");
  const [limit, setLimit] = useState(18);
  const activeName = templates.find((item) => item.key === selected)?.name;

  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("id");
    const matches = templates.filter((item) => {
      if (term && !`${item.name} ${item.category} ${item.description}`.toLocaleLowerCase("id").includes(term)) return false;
      if (photoFilter === "photo" && !item.usesPhotos) return false;
      if (photoFilter === "no-photo" && item.usesPhotos) return false;
      return true;
    });
    if (sort === "az") return matches.sort((a, b) => a.name.localeCompare(b.name, "id"));
    if (sort === "za") return matches.sort((a, b) => b.name.localeCompare(a.name, "id"));
    // Keep the current selection within the first visible cards, even with hundreds of themes.
    return matches.sort((a, b) => Number(b.key === selected) - Number(a.key === selected));
  }, [templates, selected, search, photoFilter, sort]);

  return (
    <div>
      <h2 className="font-[family-name:var(--font-dc-heading)] text-lg font-semibold text-primary">{en ? "Choose a Theme" : "Pilih Tema"}</h2>
      {activeName && <p className="mt-2 text-sm font-medium text-foreground">{en ? "Selected" : "Dipilih"}: {activeName}</p>}
      <div className="mt-4 space-y-3">
        <div className="relative">
          <button
            type="button"
            aria-label={en ? "Search templates" : "Cari template"}
            onClick={() => searchRef.current?.focus()}
            className="absolute left-1 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-[var(--dc-control-radius)] text-primary hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-primary"
          >
            <Search size={17} aria-hidden="true" />
          </button>
          <Input
            ref={searchRef}
            type="search"
            aria-label={en ? "Search by name or theme" : "Cari nama atau tema template"}
            placeholder={en ? "Search name or theme…" : "Cari nama atau tema…"}
            className="pl-11"
            value={search}
            onChange={(event) => { setSearch(event.target.value); setLimit(18); }}
          />
        </div>
        <div role="group" aria-label={en ? "Filter templates by photos" : "Filter foto template"} className="flex flex-wrap gap-2">
          {([
            ["all", en ? "All" : "Semua"],
            ["photo", en ? "With Photos" : "Dengan foto"],
            ["no-photo", en ? "Without Photos" : "Tanpa foto"],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              type="button"
              aria-pressed={photoFilter === key}
              onClick={() => { setPhotoFilter(key); setLimit(18); }}
              className={`min-h-9 rounded-[var(--dc-control-radius)] border border-primary/70 px-3.5 text-xs font-medium transition-colors ${photoFilter === key ? "bg-[#C07A84] text-white hover:bg-[#A65E69] dark:text-black dark:hover:bg-[#D9A3AA]" : "bg-background text-foreground hover:bg-primary/10"}`}
            >{label}</button>
          ))}
        </div>
        <div className="flex items-center justify-between gap-3">
          <span aria-live="polite" className="text-xs text-foreground">{filtered.length} {en ? "templates" : "template"}</span>
          <div className="relative w-[204px] max-w-[68%] shrink-0">
            <select
              aria-label={en ? "Sort templates" : "Urutkan template"}
              value={sort}
              onChange={(event) => { setSort(event.target.value as "selected" | "az" | "za"); setLimit(18); }}
              className="h-9 w-full appearance-none rounded-[var(--dc-control-radius)] border border-primary/70 bg-background py-1 pl-4 pr-11 text-xs text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <option value="selected">{en ? "Selected first" : "Pilihan aktif"}</option>
              <option value="az">{en ? "Name A–Z" : "Nama A–Z"}</option>
              <option value="za">{en ? "Name Z–A" : "Nama Z–A"}</option>
            </select>
            <ChevronDown size={15} strokeWidth={1.8} aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-primary" />
          </div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {filtered.slice(0, limit).map((item) => (
          <div
            key={item.key}
            className={`relative overflow-hidden rounded-xl border text-left transition ${
              selected === item.key
                ? "border-primary ring-2 ring-primary/20"
                : "border-border hover:border-primary/40"
            }`}
          >
            <span className="relative block">
              {item.ready ? (
                <span className="block h-36 overflow-hidden">
                  <TemplateCardCanvas templateKey={item.key} />
                </span>
              ) : (
                <img src={item.previewImage} alt="" loading="lazy" className="h-36 w-full object-cover" />
              )}
              {item.ready && <span className="absolute bottom-2 left-2 rounded-full border border-white/40 bg-black/70 px-2.5 py-1 text-[10px] font-medium text-white">{item.usesPhotos ? (en ? "With Photos" : "Dengan foto") : (en ? "Without Photos" : "Tanpa foto")}</span>}
              {selected === item.key && (
                <span className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-[var(--dc-control-radius)] bg-primary text-white dark:text-black">
                  <Check className="h-4 w-4" />
                </span>
              )}
            </span>
            <span className="block bg-background p-3">
              <span className="block font-[family-name:var(--font-dc-heading)] text-xs font-semibold text-foreground">
                {item.name}
              </span>
              {!item.ready && <span className="mt-2 block text-[11px] text-primary">{en ? "Not Available" : "Belum tersedia"}</span>}
            </span>
            <button
              type="button"
              onClick={() => onSelect(item.key)}
              disabled={!item.ready}
              aria-label={item.ready ? item.name : `${item.name} ${en ? "unavailable" : "belum tersedia"}`}
              aria-pressed={selected === item.key}
              className="absolute inset-0 z-10 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-65"
            />
          </div>
        ))}
      </div>
      {filtered.length === 0 && <p role="status" className="py-5 text-sm text-foreground">{en ? "No templates found." : "Template tidak ditemukan."}</p>}
      {limit < filtered.length && (
        <Button size="sm" className="mt-4 w-full" type="button" onClick={() => setLimit((count) => count + 18)}>
          {en ? "Show More" : "Tampilkan Lagi"}
        </Button>
      )}
    </div>
  );
}

const sectionNamesEnglish: Record<InvitationSectionKey, string> = {
  envelope: "Digital Envelope", cover: "Cover", greeting: "Greeting",
  identity: "Identity", event: "Event Details", dateTime: "Date & Time",
  gallery: "Gallery / Media", countdown: "Countdown", location: "Location",
  rsvp: "RSVP", wishes: "Guest Wishes", gift: "Gifts / E-Angpao",
  closing: "Closing", footer: "Footer", music: "Music",
};

export function SectionsPanel({
  sections,
  onChange,
}: {
  sections: InvitationSections;
  onChange: (section: InvitationSectionKey, enabled: boolean) => void;
}) {
  const { locale } = useLanguage();
  return (
    <div>
      <Heading title="Bagian & Fitur" description="Sembunyikan bagian tanpa menghapus isinya." />
      <div className="mt-4 divide-y divide-primary/15">
        {invitationSectionItems.map((item) => (
          <label key={item.key} className="flex min-h-14 cursor-pointer items-center justify-between gap-4 py-3">
            <span className="text-sm">{locale === "en" ? sectionNamesEnglish[item.key] : item.title}{item.key === "wishes" && <span className="mt-1 block text-xs text-foreground/75">{locale === "en" ? "Sending wishes is not available yet." : "Pengiriman ucapan belum tersedia."}</span>}</span>
            <span className="relative inline-flex h-6 w-11 shrink-0 items-center">
              <input type="checkbox" role="switch" className="peer sr-only" checked={sections[item.key] !== false}
                onChange={(event) => onChange(item.key, event.target.checked)} />
              <span className="absolute inset-0 rounded-full bg-foreground/20 transition peer-checked:bg-primary peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-primary" />
              <span className="absolute left-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

export function ColorPanel({
  selected,
  onSelect,
}: {
  selected: PaletteKey;
  onSelect: (key: PaletteKey) => void;
}) {
  return (
    <div>
      <Heading
        title="Palet Warna"
        description="Pilih kombinasi warna untuk tema ini."
      />
      <div className="mt-5 space-y-2">
        {invitationPaletteOptions.map(([key, item]) => (
          <button
            type="button"
            key={key}
            onClick={() => onSelect(key)}
            aria-pressed={selected === key}
            className={`flex min-h-14 w-full items-center gap-3 rounded-xl border px-3 text-left ${
              selected === key
                ? "border-primary ring-2 ring-primary/20"
                : "border-border"
            }`}
          >
            <span className="flex h-8 w-12 shrink-0 overflow-hidden rounded-lg">
              <i className="flex-1" style={{ background: item.bg }} />
              <i className="flex-1" style={{ background: item.accent }} />
              <i className="flex-1" style={{ background: item.soft }} />
            </span>
            <span className="text-xs font-semibold text-foreground">
              {item.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function FontPanel({
  selected,
  onSelect,
}: {
  selected: FontKey;
  onSelect: (key: FontKey) => void;
}) {
  const { locale } = useLanguage();
  const [search, setSearch] = useState("");
  const options = invitationFontOptions.filter(([, item]) => item.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <div>
      <Heading
        title="Pasangan Font"
        description="Nama huruf ditampilkan dengan font aslinya."
      />
      <InvitationFonts families={invitationFontOptions.flatMap(([, item]) => [item.heading, item.body])} />
      <Input className="mt-4" aria-label={locale === "en" ? "Search fonts" : "Cari font"} placeholder={locale === "en" ? "Search fonts…" : "Cari nama font…"} value={search} onChange={(event) => setSearch(event.target.value)} />
      <div className="mt-4 space-y-2">
        {options.length === 0 && <p className="py-4 text-sm text-foreground">{locale === "en" ? "No fonts found." : "Font tidak ditemukan."}</p>}
        {options.map(([key, item]) => (
          <button
            type="button"
            key={key}
            onClick={() => onSelect(key)}
            aria-pressed={selected === key}
            className={`w-full rounded-xl border px-3 py-3 text-left ${
              selected === key
                ? "border-primary ring-2 ring-primary/20"
                : "border-border"
            }`}
          >
            <span
              className="mt-1 block text-lg text-foreground"
              style={{ fontFamily: invitationFontFamily(item.heading) }}
            >
              {item.heading}
            </span>
            <span className="mt-1 block text-sm text-muted-foreground" style={{ fontFamily: invitationFontFamily(item.body) }}>{item.body}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

const narrativeCopyLabels: Record<EditableInvitationCopyField, { id: string; en: string }> = {
  greeting: { id: "Salam & Permohonan Kehadiran", en: "Greeting & Invitation" },
  closing: { id: "Ucapan Penutup", en: "Closing Message" },
  ourStory: { id: "Our Story / Tentang Kami", en: "Our Story / About Us" },
  zenQuote: { id: "Kutipan Penutup", en: "Closing Quote" },
};

/** Only words rendered as editable narrative slots in the selected theme.
 * Event/guest/parents/date/venue/RSVP fields belong to Dashboard and shared data.
 */
export function ContentPanel({
  templateKey,
  eventDescription,
  isWedding,
  copy,
  onChange,
}: {
  templateKey: string;
  eventDescription?: string | null;
  isWedding: boolean;
  copy: EditableInvitationCopy;
  onChange: (field: EditableInvitationCopyField, text: string) => void;
}) {
  const { locale } = useLanguage();
  const en = locale === "en";
  const defaults = invitationCopyDefaults(templateKey, eventDescription);
  const fields = availableEditableCopyFields(templateKey, isWedding);
  return (
    <div>
      <h2 className="font-[family-name:var(--font-dc-heading)] text-lg font-semibold text-primary">
        {en ? "Invitation Wording" : "Isi Undangan"}
      </h2>
      <div className="mt-5 space-y-5">
        {fields.map((field) => (
          <label key={field} className="block space-y-2 text-sm text-foreground">
            <span className="block font-medium">{narrativeCopyLabels[field][en ? "en" : "id"]}</span>
            <textarea
              value={copy[field] ?? defaults[field] ?? ""}
              onChange={(event) => onChange(field, event.target.value)}
              rows={field === "ourStory" ? 8 : field === "zenQuote" ? 4 : 5}
              maxLength={editableCopyMaxLength[field]}
              placeholder={field === "ourStory" ? (en ? "Tell your story together in your own words…" : "Ceritakan perjalanan kalian dengan kata-kata sendiri…") : undefined}
              className="w-full resize-y rounded-[var(--dc-control-radius)] border border-primary/70 bg-background px-3.5 py-3 text-sm leading-relaxed text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
        ))}
      </div>
    </div>
  );
}

export function MusicPanel({
  musicUrl, defaultTrack, defaultUrl, assets, busy, setMusicUrl, onUpload, onDelete,
}: {
  musicUrl: string;
  defaultTrack: string;
  defaultUrl: string;
  assets: InvitationDesignerInvitation["assets"];
  busy: boolean;
  setMusicUrl: (value: string) => void;
  onUpload: (file: File) => void;
  onDelete: (id: string) => void;
}) {
  const { locale } = useLanguage();
  const en = locale === "en";
  const tracks = assets.filter((asset) => asset.type === "AUDIO");
  const activeUrl = musicUrl || tracks[0]?.url || defaultUrl;
  const full = tracks.length >= MAX_AUDIO_FILES;
  return (
    <div>
      <Heading title="Musik" description="Maksimal 2 file, masing-masing 3 MB. Hapus file untuk menggantinya." />
      <fieldset disabled={busy} className="mt-5 min-w-0 space-y-3 border-0 p-0">
        <legend className="sr-only">{en ? "Choose music" : "Pilih musik"}</legend>
        <label className="flex min-h-12 cursor-pointer items-center gap-3 border-b border-primary/20 py-3 text-sm">
          <input type="radio" name="studio-music" checked={activeUrl === defaultUrl} onChange={() => setMusicUrl(defaultUrl)} className="accent-primary" />
          <span>{defaultTrack}<span className="mt-1 block text-xs text-muted-foreground">{en ? "Theme music · no upload slot used" : "Bawaan tema · tidak memakai slot"}</span></span>
        </label>
        {musicUrl && musicUrl !== defaultUrl && !tracks.some((track) => track.url === musicUrl) && (
          <p className="text-xs text-muted-foreground">{en ? "Previously saved music is in use." : "Musik tersimpan sebelumnya sedang digunakan."}</p>
        )}
        {tracks.map((track) => (
          <div key={track.id} className="flex items-center gap-3 border-b border-primary/20 py-3">
            <label className="flex min-h-11 min-w-0 flex-1 cursor-pointer items-center gap-3 text-sm">
              <input type="radio" name="studio-music" checked={activeUrl === track.url} onChange={() => setMusicUrl(track.url)} className="accent-primary" />
              <span className="break-all">{track.title || (en ? "Uploaded Music" : "Musik unggahan")}</span>
            </label>
            <Button size="sm" onClick={() => onDelete(track.id)} aria-label={`${en ? "Delete" : "Hapus"} ${track.title || (en ? "music" : "musik")}`}>{en ? "Delete" : "Hapus"}</Button>
          </div>
        ))}
        <p className="text-xs text-muted-foreground">{tracks.length} / {MAX_AUDIO_FILES} {en ? "files" : "file"}</p>
        <label aria-disabled={full || busy} className={buttonVariants({ size: "sm", className: `flex min-h-11 w-full cursor-pointer px-3 py-3 ${full || busy ? "pointer-events-none opacity-50" : ""}` })}>
          <Upload className="h-4 w-4" /> {busy ? (en ? "Processing…" : "Memproses…") : (en ? "Upload Music" : "Unggah Musik")}
          <input type="file" accept={AUDIO_MIME_TYPES.join(",")} disabled={full || busy} className="sr-only"
            onChange={(event) => { const file = event.target.files?.[0]; if (file) onUpload(file); event.currentTarget.value = ""; }} />
        </label>
      </fieldset>
    </div>
  );
}
