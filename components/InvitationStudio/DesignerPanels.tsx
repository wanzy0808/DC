"use client";

import { useState, type ReactNode } from "react";
import {
  Check,
  Upload,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { invitationSectionItems } from "@/lib/templates/sections";
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
  return (
    <div>
      <Heading
        title="Pilih Tema"
        description="Lihat desainnya langsung di sebelah kanan."
      />
      <div className="mt-5 grid grid-cols-2 gap-3">
        {templates.map((item) => (
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
              {!item.ready && <span className="mt-2 block text-[11px] text-primary">Preview designer · belum dapat digunakan</span>}
            </span>
            <button
              type="button"
              onClick={() => onSelect(item.key)}
              disabled={!item.ready}
              aria-label={item.ready ? item.name : `${item.name} · pratinjau saja, belum bisa digunakan`}
              aria-pressed={selected === item.key}
              className="absolute inset-0 z-10 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-65"
            />
          </div>
        ))}
      </div>
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
            <span className="text-sm">{item.title}</span>
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
              style={{ fontFamily: item.heading }}
            >
              {item.heading}
            </span>
            <span className="mt-1 block text-sm text-muted-foreground" style={{ fontFamily: item.body }}>{item.body}</span>
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
  musicUrl,
  defaultTrack,
  setMusicUrl,
  onUpload,
}: {
  musicUrl: string;
  defaultTrack: string;
  setMusicUrl: (value: string) => void;
  onUpload: (file: File) => void;
}) {
  return (
    <div>
      <Heading
        title="Musik"
        description="Gunakan lagu bawaan atau pilih lagu sendiri."
      />
      <p className="mt-4 text-xs leading-6 text-muted-foreground">Musik bawaan tema: <span className="font-semibold text-primary">{defaultTrack}</span>. Digunakan jika belum ada URL atau musik yang diunggah.</p>
      <input
        aria-label="URL musik"
        value={musicUrl}
        onChange={(event) => setMusicUrl(event.target.value)}
        placeholder="https://.../music.mp3"
        className="mt-5 w-full rounded-[10px] border border-border bg-background px-3 py-3 text-xs outline-none focus:border-primary"
      />
      <label className={buttonVariants({ size: "sm", className: "mt-3 flex min-h-11 w-full cursor-pointer px-3 py-3" })}>
        <Upload className="h-4 w-4" /> Upload musik
        <input
          type="file"
          accept="audio/mpeg,audio/wav,audio/ogg,audio/aac,audio/mp4,audio/x-m4a"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onUpload(file);
            event.currentTarget.value = "";
          }}
        />
      </label>
    </div>
  );
}
