"use client";

import type { ReactNode } from "react";
import {
  Check,
  Gift,
  MessageCircleHeart,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { invitationTemplates } from "@/lib/templates/catalog";
import type { FontKey, PaletteKey } from "@/lib/templates/design";
import type {
  InvitationSectionKey,
  InvitationSections,
} from "@/lib/templates/sections";
import {
  invitationDecorOptions,
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
    <Button
      onClick={onClick}
      className={`mb-1 grid h-auto min-h-[64px] w-full justify-items-center gap-1 px-2 py-2 text-xs ${
        active ? "ring-2 ring-primary/35" : ""
      }`}
      aria-pressed={active}
    >
      {icon}
      <span>{label}</span>
    </Button>
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
      <h2 className="font-[family-name:var(--font-dc-heading)] text-lg font-semibold text-foreground">
        {title}
      </h2>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

export function TemplatePanel({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (key: string) => void;
}) {
  return (
    <div>
      <Heading
        title="Template Undangan"
        description="Pilih template. Komposisi, palet awal, dan canvas langsung berubah."
      />
      <div className="mt-5 grid gap-3">
        {invitationTemplates.map((item) => (
          <button
            type="button"
            key={item.key}
            onClick={() => onSelect(item.key)}
            className={`overflow-hidden rounded-xl border text-left transition ${
              selected === item.key
                ? "border-primary ring-2 ring-primary/20"
                : "border-border hover:border-primary/40"
            }`}
          >
            <span className="relative block">
              <img
                src={item.previewImage}
                alt=""
                className="h-28 w-full object-cover"
              />
              {selected === item.key && (
                <span className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-primary text-white dark:text-black">
                  <Check className="h-4 w-4" />
                </span>
              )}
            </span>
            <span className="block bg-background p-3.5">
              <span className="block font-[family-name:var(--font-dc-heading)] text-xs font-semibold text-foreground">
                {item.name}
              </span>
              <span className="mt-1 block text-xs leading-4 text-muted-foreground">
                {item.description}
              </span>
            </span>
          </button>
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
  const items: {
    key: InvitationSectionKey;
    title: string;
    description: string;
    icon: ReactNode;
  }[] = [
    {
      key: "rsvp",
      title: "RSVP",
      description: "Form konfirmasi kehadiran.",
      icon: <Check className="h-4 w-4" />,
    },
    {
      key: "wishes",
      title: "Wishes",
      description: "Ucapan dan doa tamu.",
      icon: <MessageCircleHeart className="h-4 w-4" />,
    },
    {
      key: "gift",
      title: "Gift / E-Angpao",
      description: "Informasi hadiah digital.",
      icon: <Gift className="h-4 w-4" />,
    },
  ];

  return (
    <div>
      <Heading
        title="Section Undangan"
        description="Nyalakan hanya section yang dipakai. Canvas berubah langsung dan state ikut tersimpan."
      />
      <div className="mt-5 space-y-2">
        {items.map((item) => (
          <label
            key={item.key}
            className="flex min-h-16 cursor-pointer items-center gap-3 rounded-xl border border-border bg-background p-3"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/[0.08] text-primary">
              {item.icon}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-semibold text-foreground">
                {item.title}
              </span>
              <span className="mt-0.5 block text-xs leading-4 text-muted-foreground">
                {item.description}
              </span>
            </span>
            <span className="relative inline-flex h-6 w-11 shrink-0 items-center">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={sections[item.key]}
                onChange={(event) => onChange(item.key, event.target.checked)}
              />
              <span className="absolute inset-0 rounded-full bg-border transition peer-checked:bg-primary" />
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
        title="Palet warna"
        description="Palet bisa diubah lagi setelah memilih template."
      />
      <div className="mt-5 space-y-2">
        {invitationPaletteOptions.map(([key, item]) => (
          <button
            type="button"
            key={key}
            onClick={() => onSelect(key)}
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
  return (
    <div>
      <Heading
        title="Font pairing"
        description="Tipografi langsung diterapkan pada canvas."
      />
      <div className="mt-5 space-y-2">
        {invitationFontOptions.map(([key, item]) => (
          <button
            type="button"
            key={key}
            onClick={() => onSelect(key)}
            className={`w-full rounded-xl border px-3 py-3 text-left ${
              selected === key
                ? "border-primary ring-2 ring-primary/20"
                : "border-border"
            }`}
          >
            <span className="block text-xs text-muted-foreground">
              {item.name}
            </span>
            <span
              className="mt-1 block text-lg text-foreground"
              style={{ fontFamily: item.heading }}
            >
              Aa Bb
            </span>
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
        title="Isi undangan"
        description="Nama, tanggal, waktu, lokasi, dan orang tua tetap mengikuti Rangkaian Acara."
      />
      <div className="mt-5 rounded-xl border border-border p-4">
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

export function DecorPanel({
  selected,
  onSelect,
  onUpload,
}: {
  selected: string;
  onSelect: (value: string) => void;
  onUpload: (file: File) => void;
}) {
  return (
    <div>
      <Heading
        title="Foto & dekorasi"
        description="Pilih visual bawaan atau unggah foto sendiri."
      />
      <div className="mt-5 grid grid-cols-3 gap-2">
        {invitationDecorOptions.map((item) => (
          <button
            type="button"
            key={item}
            onClick={() => onSelect(item)}
            className={`overflow-hidden rounded-xl border ${
              selected === item ? "border-primary" : "border-border"
            }`}
          >
            <img src={item} alt="" className="aspect-square w-full object-cover" />
          </button>
        ))}
      </div>
      <label className="mt-4 flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-dashed border-primary/30 px-3 py-3 text-xs font-semibold text-primary">
        <Upload className="h-4 w-4" /> Upload foto
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
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

export function MusicPanel({
  musicUrl,
  setMusicUrl,
  onUpload,
}: {
  musicUrl: string;
  setMusicUrl: (value: string) => void;
  onUpload: (file: File) => void;
}) {
  return (
    <div>
      <Heading
        title="Musik"
        description="Gunakan URL audio atau unggah satu track."
      />
      <input
        value={musicUrl}
        onChange={(event) => setMusicUrl(event.target.value)}
        placeholder="https://.../music.mp3"
        className="mt-5 w-full rounded-[10px] border border-border bg-background px-3 py-3 text-xs outline-none focus:border-primary"
      />
      <label className="mt-3 flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-dashed border-primary/30 px-3 py-3 text-xs font-semibold text-primary">
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
