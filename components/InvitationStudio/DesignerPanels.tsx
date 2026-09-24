"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  Check,
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
import { formatInvitationEventDate } from "@/components/InvitationStudio/designer-state";
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

function Heading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="font-[family-name:var(--font-dc-heading)] text-lg font-semibold text-primary">
        {title}
      </h2>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
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
  const [search, setSearch] = useState("");
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
      <h2 className="font-[family-name:var(--font-dc-heading)] text-lg font-semibold text-primary">Pilih Tema</h2>
      {activeName && <p className="mt-2 text-sm font-medium text-foreground">Dipilih: {activeName}</p>}
      <div className="mt-4 space-y-3">
        <Input
          type="search"
          aria-label="Cari template"
          placeholder="Cari nama atau tema…"
          value={search}
          onChange={(event) => { setSearch(event.target.value); setLimit(18); }}
        />
        <div role="group" aria-label="Filter foto template" className="flex flex-wrap gap-2">
          {([
            ["all", "Semua"],
            ["photo", "Dengan foto"],
            ["no-photo", "Tanpa foto"],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              type="button"
              aria-pressed={photoFilter === key}
              onClick={() => { setPhotoFilter(key); setLimit(18); }}
              className={`min-h-10 rounded-full border border-primary/45 px-3 text-xs transition-colors ${photoFilter === key ? "bg-primary text-black" : "text-foreground hover:bg-primary/10"}`}
            >{label}</button>
          ))}
        </div>
        <div className="flex items-center justify-between gap-3">
          <span aria-live="polite" className="text-xs text-foreground">{filtered.length} template</span>
          <select
            aria-label="Urutkan template"
            value={sort}
            onChange={(event) => { setSort(event.target.value as "selected" | "az" | "za"); setLimit(18); }}
            className="min-h-10 min-w-0 max-w-[170px] rounded-full border border-primary/45 bg-background px-3 text-xs text-foreground focus-visible:outline-2 focus-visible:outline-primary"
          >
            <option value="selected">Pilihan aktif</option>
            <option value="az">Nama A–Z</option>
            <option value="za">Nama Z–A</option>
          </select>
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
              {item.ready && <span className="absolute bottom-2 left-2 rounded-full border border-white/40 bg-black/70 px-2.5 py-1 text-[10px] font-medium text-white">{item.usesPhotos ? "Dengan foto" : "Tanpa foto"}</span>}
              {selected === item.key && (
                <span className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-primary text-white dark:text-black">
                  <Check className="h-4 w-4" />
                </span>
              )}
            </span>
            <span className="block bg-background p-3">
              <span className="block font-[family-name:var(--font-dc-heading)] text-xs font-semibold text-foreground">
                {item.name}
              </span>
              {!item.ready && <span className="mt-2 block text-[11px] text-primary">Belum tersedia</span>}
            </span>
            <button
              type="button"
              onClick={() => onSelect(item.key)}
              disabled={!item.ready}
              aria-label={item.ready ? item.name : `${item.name} belum tersedia`}
              aria-pressed={selected === item.key}
              className="absolute inset-0 z-10 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-65"
            />
          </div>
        ))}
      </div>
      {filtered.length === 0 && <p role="status" className="py-5 text-sm text-foreground">Template tidak ditemukan.</p>}
      {limit < filtered.length && (
        <Button size="sm" className="mt-4 w-full" type="button" onClick={() => setLimit((count) => count + 18)}>
          Tampilkan Lagi
        </Button>
      )}
    </div>
  );
}

export function SectionsPanel({
  sections,
  onChange,
}: {
  sections: InvitationSections;
  onChange: (section: InvitationSectionKey, enabled: boolean) => void;
}) {
  return (
    <div>
      <Heading title="Bagian & Fitur" description="Sembunyikan bagian tanpa menghapus isinya." />
      <div className="mt-4 divide-y divide-primary/15">
        {invitationSectionItems.map((item) => (
          <label key={item.key} className="flex min-h-14 cursor-pointer items-center justify-between gap-4 py-3">
            <span className="text-sm">{item.title}{item.key === "wishes" && <span className="mt-1 block text-xs text-muted-foreground">Pengiriman ucapan belum tersedia.</span>}</span>
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
  const [search, setSearch] = useState("");
  const options = invitationFontOptions.filter(([, item]) => item.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <div>
      <Heading
        title="Pasangan Font"
        description="Nama huruf ditampilkan dengan font aslinya."
      />
      <InvitationFonts families={invitationFontOptions.flatMap(([, item]) => [item.heading, item.body])} />
      <Input className="mt-4" aria-label="Cari font" placeholder="Cari nama font…" value={search} onChange={(event) => setSearch(event.target.value)} />
      <div className="mt-4 space-y-2">
        {options.length === 0 && <p className="py-4 text-sm text-muted-foreground">Font tidak ditemukan.</p>}
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

export function ContentPanel({
  invitation,
  eventTag,
  dressCode,
  setEventTag,
  setDressCode,
}: {
  invitation: InvitationDesignerInvitation | null;
  eventTag: string;
  dressCode: string;
  setEventTag: (value: string) => void;
  setDressCode: (value: string) => void;
}) {
  return (
    <div>
      <Heading
        title="Isi Undangan"
        description="Identitas dan jadwal mengikuti data acara."
      />
      <div className="mt-5 border-y border-primary/20 py-4">
        <p className="text-xs font-semibold text-foreground">
          {invitation?.title || "Acara"}
        </p>
        <p className="mt-1 text-xs leading-4 text-muted-foreground">
          {formatInvitationEventDate(invitation)} ·{" "}
          {invitation?.venue || "Lokasi belum diatur"}
        </p>
      </div>
      <div className="mt-4 space-y-3">
        <label className="block text-[11px] font-semibold">
          Tag / hashtag acara
          <input
            value={eventTag}
            onChange={(event) => setEventTag(event.target.value)}
            className="mt-1.5 w-full rounded-[10px] border border-border bg-background px-3 py-2.5 text-xs font-normal outline-none focus:border-primary"
            placeholder="#AcaraKita"
          />
        </label>
        <label className="block text-[11px] font-semibold">
          Dress code
          <input
            value={dressCode}
            onChange={(event) => setDressCode(event.target.value)}
            className="mt-1.5 w-full rounded-[10px] border border-border bg-background px-3 py-2.5 text-xs font-normal outline-none focus:border-primary"
            placeholder="Formal / Batik / Pastel"
          />
        </label>
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
  const tracks = assets.filter((asset) => asset.type === "AUDIO");
  const activeUrl = musicUrl || tracks[0]?.url || defaultUrl;
  const full = tracks.length >= MAX_AUDIO_FILES;
  return (
    <div>
      <Heading title="Musik" description="Maksimal 2 file, masing-masing 3 MB. Hapus file untuk menggantinya." />
      <fieldset disabled={busy} className="mt-5 min-w-0 space-y-3 border-0 p-0">
        <legend className="sr-only">Pilih musik</legend>
        <label className="flex min-h-12 cursor-pointer items-center gap-3 border-b border-primary/20 py-3 text-sm">
          <input type="radio" name="studio-music" checked={activeUrl === defaultUrl} onChange={() => setMusicUrl(defaultUrl)} className="accent-primary" />
          <span>{defaultTrack}<span className="mt-1 block text-xs text-muted-foreground">Bawaan tema · tidak memakai slot</span></span>
        </label>
        {musicUrl && musicUrl !== defaultUrl && !tracks.some((track) => track.url === musicUrl) && (
          <p className="text-xs text-muted-foreground">Musik tersimpan sebelumnya sedang digunakan.</p>
        )}
        {tracks.map((track) => (
          <div key={track.id} className="flex items-center gap-3 border-b border-primary/20 py-3">
            <label className="flex min-h-11 min-w-0 flex-1 cursor-pointer items-center gap-3 text-sm">
              <input type="radio" name="studio-music" checked={activeUrl === track.url} onChange={() => setMusicUrl(track.url)} className="accent-primary" />
              <span className="break-all">{track.title || "Musik unggahan"}</span>
            </label>
            <Button size="sm" onClick={() => onDelete(track.id)} aria-label={`Hapus ${track.title || "musik"}`}>Hapus</Button>
          </div>
        ))}
        <p className="text-xs text-muted-foreground">{tracks.length} / {MAX_AUDIO_FILES} file</p>
        <label aria-disabled={full || busy} className={buttonVariants({ size: "sm", className: `flex min-h-11 w-full cursor-pointer px-3 py-3 ${full || busy ? "pointer-events-none opacity-50" : ""}` })}>
          <Upload className="h-4 w-4" /> {busy ? "Memproses…" : "Unggah Musik"}
          <input type="file" accept={AUDIO_MIME_TYPES.join(",")} disabled={full || busy} className="sr-only"
            onChange={(event) => { const file = event.target.files?.[0]; if (file) onUpload(file); event.currentTarget.value = ""; }} />
        </label>
      </fieldset>
    </div>
  );
}
