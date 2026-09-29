"use client";

import { useState, type ReactNode } from "react";
import { useLanguage } from "@/components/I18n/LanguageProvider";
import { invitationText, type InvitationLanguage } from "@/lib/invitations/language";
import { RotateCcw, Upload } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { MAX_AUDIO_FILES, AUDIO_MIME_TYPES } from "@/lib/invitations/audio-limits";
import { invitationSectionItems } from "@/lib/templates/sections";
import type { PaletteKey } from "@/lib/templates/design";
import type {
  InvitationSectionKey,
  InvitationSections,
} from "@/lib/templates/sections";
import {
  invitationPaletteOptions,
} from "@/components/InvitationStudio/designer-config";
import type { InvitationDesignerInvitation } from "@/components/InvitationStudio/designer-types";
import { MAX_RSVP_CUSTOM_FIELDS, type InvitationRsvpConfig } from "@/lib/templates/rsvp-config";
import {
  availableEditableCopyFields,
  editableCopyMaxLength,
  invitationCopyDefaults,
  type EditableInvitationCopy,
  type EditableInvitationCopyField,
} from "@/lib/templates/editable-copy";

export function DesignerTool({
  active,
  label,
  icon,
  onClick,
  disabled = false,
  title,
}: {
  active: boolean;
  label: string;
  icon: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} title={title} className="undara-studio-tool" aria-pressed={active}>
      {icon}<span>{label}</span>
    </button>
  );
}

const studioHeadingEnglish: Record<string, string> = {
  "Pilih Tema": "Choose a Theme",
  "Lihat desainnya langsung di sebelah kanan.": " ",
  "Isi": "Content",
  "Palet Warna": "Color Palette",
  "Pilih kombinasi warna untuk tema ini.": "Choose this theme's color combination.",
  "Pasangan Font": "Font Pair",
  "Nama huruf ditampilkan dengan font aslinya.": "Font names are displayed in their actual typefaces.",
  "Musik": "Music",
  "Maksimal 2 file, masing-masing 3 MB. Hapus file untuk menggantinya.": "Up to two files, 3 MB each.",
};

function Heading({ title, description }: { title: string; description: string }) {
  const { locale } = useLanguage();
  const shownTitle = locale === "en" ? studioHeadingEnglish[title] || title : title;
  const shownDescription = locale === "en" ? studioHeadingEnglish[description] ?? description : description;
  return (
    <div>
      <h2 className="font-[family-name:var(--font-undara-heading)] text-lg font-semibold text-primary">
        {shownTitle}
      </h2>
      {shownDescription.trim() && <p className="mt-1 text-sm leading-6 text-foreground/75">{shownDescription}</p>}
    </div>
  );
}

export { TemplatePanel } from "@/components/InvitationStudio/TemplatePanel";

const sectionNamesEnglish: Record<InvitationSectionKey, string> = {
  envelope: "Digital Envelope", cover: "Cover", greeting: "Greeting",
  identity: "Identity", event: "Event Details", dateTime: "Date & Time",
  gallery: "Gallery / Media", countdown: "Countdown", location: "Location",
  rsvp: "RSVP", wishes: "Guest Wishes", gift: "Gifts / E-Angpao",
  closing: "Closing", footer: "Footer", music: "Music",
};

export type StudioContentElementKind = "input" | "button";

const sectionFunctionalElements: Partial<Record<InvitationSectionKey, StudioContentElementKind[]>> = {
  location: ["button"],
  rsvp: ["input", "button"],
  wishes: ["input", "button"],
  gift: ["button"],
};

const copyFieldsBySection: Partial<Record<InvitationSectionKey, EditableInvitationCopyField[]>> = {
  greeting: ["greeting", "attendanceRequest", "prayerWish"],
  identity: ["ourStory"],
  closing: ["closing", "zenQuote"],
};

const copyLabels: Record<EditableInvitationCopyField, { id: string; en: string }> = {
  greeting: { id: "Salam / Pengantar", en: "Greeting / Introduction" },
  attendanceRequest: { id: "Permohonan Kehadiran", en: "Invitation Message" },
  prayerWish: { id: "Doa / Harapan", en: "Prayer / Wish" },
  closing: { id: "Ucapan Penutup", en: "Closing Message" },
  ourStory: { id: "Our Story / Tentang Kami", en: "Our Story / About Us" },
  zenQuote: { id: "Kutipan Penutup", en: "Closing Quote" },
};

export function ContentPanel({
  invitationLanguage,
  sections,
  rsvpConfig,
  eventCategory,
  templateKey,
  eventDescription,
  narrativeCopy,
  englishNarrativeCopy,
  onNarrativeCopy,
  onResetNarrativeCopy,
  onChange,
  onSelectSection,
  onSelectElement,
  onRsvpConfig,
  onAddRsvpField,
  onUpdateRsvpField,
  onRemoveRsvpField,
}: {
  invitationLanguage: InvitationLanguage;
  sections: InvitationSections;
  rsvpConfig: InvitationRsvpConfig;
  eventCategory: string;
  templateKey: string;
  eventDescription?: string | null;
  narrativeCopy: EditableInvitationCopy;
  englishNarrativeCopy: EditableInvitationCopy;
  onNarrativeCopy: (field: EditableInvitationCopyField, value: string) => void;
  onResetNarrativeCopy: (field: EditableInvitationCopyField) => void;
  onChange: (section: InvitationSectionKey, enabled: boolean) => void;
  onSelectSection: (section: InvitationSectionKey) => void;
  onSelectElement: (section: InvitationSectionKey, element: StudioContentElementKind) => void;
  onRsvpConfig: (patch: Partial<InvitationRsvpConfig>) => void;
  onAddRsvpField: () => void;
  onUpdateRsvpField: (id: string, patch: { label?: string; required?: boolean }) => void;
  onRemoveRsvpField: (id: string) => void;
}) {
  const { locale } = useLanguage();
  const en = locale === "en";
  const [activeElement, setActiveElement] = useState("");
  const [activeCopySection, setActiveCopySection] = useState<InvitationSectionKey | null>(null);
  const availableCopy = new Set(availableEditableCopyFields(templateKey, eventCategory === "WEDDING"));
  const copyDefaults = invitationCopyDefaults(templateKey, eventDescription);

  return (
    <div>
      <Heading title="Isi" description="" />
      <div className="mt-4 divide-y divide-primary/15">
        {invitationSectionItems.map((item) => {
          const enabled = sections[item.key] !== false;
          const elements = sectionFunctionalElements[item.key] ?? [];
          const copyFields = (copyFieldsBySection[item.key] ?? []).filter((field) => availableCopy.has(field));
          return (
            <div key={item.key} className="py-2">
              <div className="flex min-h-12 items-center gap-2">
                <button
                  type="button"
                  className="min-w-0 flex-1 truncate rounded-[10px] px-2 py-2 text-left text-sm text-foreground hover:bg-primary/5 hover:text-primary"
                  onClick={() => {
                    onSelectSection(item.key);
                    if (copyFields.length) setActiveCopySection((current) => current === item.key ? null : item.key);
                  }}
                  aria-expanded={copyFields.length ? activeCopySection === item.key : undefined}
                  title={en ? sectionNamesEnglish[item.key] : item.title}
                >
                  {en ? sectionNamesEnglish[item.key] : item.title}
                </button>
                <label className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center" title={enabled ? (en ? "Hide section" : "Sembunyikan section") : (en ? "Show section" : "Tampilkan section")}>
                  <input
                    type="checkbox"
                    role="switch"
                    className="peer sr-only"
                    checked={enabled}
                    onChange={(event) => onChange(item.key, event.target.checked)}
                  />
                  <span className="absolute inset-0 rounded-full bg-foreground/20 transition peer-checked:bg-primary peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-primary" />
                  <span className="absolute left-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
                </label>
              </div>

              {enabled && copyFields.length > 0 && activeCopySection === item.key && (
                <div className="ml-3 mb-2 grid gap-3 border-l border-primary/20 pl-3">
                  {copyFields.map((field) => {
                    const label = en ? copyLabels[field].en : copyLabels[field].id;
                    const source = narrativeCopy[field] ?? copyDefaults[field] ?? "";
                    const value = invitationLanguage === "EN" ? englishNarrativeCopy[field] ?? invitationText("EN", source) : source;
                    return (
                      <label key={field} className="grid gap-1 text-[10px] text-foreground">
                        <span className="flex items-center justify-between gap-2">
                          <strong className="font-semibold text-primary">{label}</strong>
                          <button
                            type="button"
                            className="inline-flex h-7 items-center gap-1 rounded-[8px] px-2 text-[9px] text-muted-foreground hover:bg-primary/10 hover:text-primary"
                            onClick={(event) => {
                              event.preventDefault();
                              onResetNarrativeCopy(field);
                            }}
                            title={en ? "Reset content" : "Reset isi"}
                          >
                            <RotateCcw size={11} />
                            Reset
                          </button>
                        </span>
                        <textarea
                          value={value}
                          rows={field === "ourStory" ? 7 : 4}
                          maxLength={editableCopyMaxLength[field]}
                          onChange={(event) => onNarrativeCopy(field, event.target.value)}
                          className="min-h-20 w-full resize-y rounded-[var(--undara-control-radius)] border border-primary/25 bg-background px-2.5 py-2 text-xs leading-5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                        />
                        <small className="text-right text-[9px] text-muted-foreground">{value.length}/{editableCopyMaxLength[field]}</small>
                      </label>
                    );
                  })}
                </div>
              )}

              {enabled && elements.length > 0 && (
                <div className="ml-3 mt-1 grid gap-1 border-l border-primary/20 pl-3">
                  {elements.map((element) => (
                    <div key={element}>
                      <button
                        type="button"
                        className="min-h-9 w-full rounded-[10px] px-2.5 text-left text-xs text-muted-foreground hover:bg-primary/5 hover:text-primary"
                        aria-expanded={activeElement === `${item.key}:${element}`}
                        onClick={() => {
                          const key = `${item.key}:${element}`;
                          setActiveElement((current) => current === key ? "" : key);
                          onSelectElement(item.key, element);
                        }}
                      >
                        {element === "input" ? "Input" : "Button"}
                      </button>

                      {item.key === "rsvp" && element === "input" && activeElement === "rsvp:input" && (
                        <div className="mt-2 space-y-2 rounded-[var(--undara-control-radius)] border border-primary/20 bg-primary/[.03] p-2.5">
                          <label className="block text-[10px] text-foreground">
                            <span className="mb-1 block font-semibold text-primary">{en ? "RSVP title" : "Judul RSVP"}</span>
                            <input
                              className="h-8 w-full rounded-[9px] border border-primary/25 bg-background px-2 text-[10px]"
                              value={rsvpConfig.title ?? "Konfirmasi Kehadiran"}
                              maxLength={80}
                              onChange={(event) => onRsvpConfig({ title: event.target.value })}
                            />
                          </label>
                          <p className="text-[10px] leading-4 text-muted-foreground">
                            {en
                              ? "Check the event options guests may choose from in the RSVP dropdown."
                              : "Centang opsi acara yang boleh dipilih tamu di dropdown RSVP."}
                          </p>
                          {eventCategory !== "WEDDING" && <p className="text-[10px] leading-4 text-muted-foreground">{en ? "Event choices are mainly used for weddings." : "Pilihan acara terutama dipakai untuk wedding."}</p>}
                          <label className="undara-studio-rsvp-switch">
                            <span>{en ? "Wedding Ceremony" : "Upacara Nikah"}</span>
                            <input type="checkbox" checked={rsvpConfig.ceremony} onChange={(event) => onRsvpConfig({ ceremony: event.target.checked })} />
                          </label>
                          <label className="undara-studio-rsvp-switch">
                            <span>{en ? "Reception" : "Resepsi"}</span>
                            <input type="checkbox" checked={rsvpConfig.reception} onChange={(event) => onRsvpConfig({ reception: event.target.checked })} />
                          </label>
                          <label className="undara-studio-rsvp-switch">
                            <span>{en ? "Attend all events" : "Hadiri Semua Acara"}</span>
                            <input type="checkbox" checked={rsvpConfig.attendAll} disabled={!(rsvpConfig.ceremony && rsvpConfig.reception)} onChange={(event) => onRsvpConfig({ attendAll: event.target.checked })} />
                          </label>

                          <div className="pt-1">
                            <div className="mb-1.5 flex items-center justify-between gap-2">
                              <span className="text-[10px] font-semibold text-primary">{en ? "Columns" : "Kolom"}</span>
                              <small className="text-[9px] text-muted-foreground">{rsvpConfig.customFields.length}/{MAX_RSVP_CUSTOM_FIELDS}</small>
                            </div>
                            <div className="mb-2 flex flex-wrap gap-1">
                              <small className="rounded-md border border-primary/15 px-1.5 py-1 text-[8px] text-muted-foreground">{en ? "Name" : "Nama"}</small>
                              <small className="rounded-md border border-primary/15 px-1.5 py-1 text-[8px] text-muted-foreground">WhatsApp</small>
                              <small className="rounded-md border border-primary/15 px-1.5 py-1 text-[8px] text-muted-foreground">{en ? "Attendance" : "Kehadiran"}</small>
                              <small className="rounded-md border border-primary/15 px-1.5 py-1 text-[8px] text-muted-foreground">{en ? "Companions" : "Pendamping"}</small>
                            </div>
                            <div className="space-y-1.5">
                              {rsvpConfig.customFields.map((field) => (
                                <div className="grid grid-cols-[minmax(0,1fr)_auto_24px] items-center gap-1" key={field.id}>
                                  <input className="h-8 min-w-0 rounded-[9px] border border-primary/25 bg-background px-2 text-[10px]" value={field.label} maxLength={60} onChange={(event) => onUpdateRsvpField(field.id, { label: event.target.value })} />
                                  <label className="flex items-center gap-1 text-[8px] text-muted-foreground"><input type="checkbox" checked={field.required} onChange={(event) => onUpdateRsvpField(field.id, { required: event.target.checked })} />{en ? "Req" : "Wajib"}</label>
                                  <button type="button" className="grid h-6 w-6 place-items-center rounded-[8px] text-sm text-muted-foreground hover:bg-primary/10 hover:text-primary" onClick={() => onRemoveRsvpField(field.id)} aria-label={en ? "Remove field" : "Hapus field"}>×</button>
                                </div>
                              ))}
                            </div>
                            <button type="button" className="mt-2 min-h-8 w-full rounded-[10px] border border-primary/35 text-[10px] font-semibold text-primary hover:bg-primary/5 disabled:opacity-40" disabled={rsvpConfig.customFields.length >= MAX_RSVP_CUSTOM_FIELDS} onClick={onAddRsvpField}>
                              + {en ? "Add column" : "Tambah Kolom"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
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

export function MusicPanel({
  musicUrl, defaultTrack, defaultUrl, assets, busy, setMusicUrl, onUpload, onDelete,
}: {
  musicUrl: string;
  defaultTrack: string;
  defaultUrl: string;
  assets: InvitationDesignerInvitation["assets"];
  busy: boolean;
  setMusicUrl: (value: string) => void;
  onUpload?: (file: File) => void;
  onDelete?: (id: string) => void;
}) {
  const { locale } = useLanguage();
  const en = locale === "en";
  const tracks = assets.filter((asset) => asset.type === "AUDIO");
  const activeUrl = musicUrl || tracks[0]?.url || defaultUrl;
  const full = tracks.length >= MAX_AUDIO_FILES;
  return (
    <div>
      <Heading title="Musik" description={onUpload ? "Maksimal 2 file, masing-masing 3 MB. Hapus file untuk menggantinya." : "Gunakan musik bawaan tema untuk preview template. Upload musik customer tetap event-scoped."} />
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
            {onDelete && <Button size="sm" onClick={() => onDelete(track.id)} aria-label={`${en ? "Delete" : "Hapus"} ${track.title || (en ? "music" : "musik")}`}>{en ? "Delete" : "Hapus"}</Button>}
          </div>
        ))}
        {onUpload && <>
          <p className="text-xs text-muted-foreground">{tracks.length} / {MAX_AUDIO_FILES} {en ? "files" : "file"}</p>
          <label aria-disabled={full || busy} className={buttonVariants({ size: "sm", className: `flex min-h-11 w-full cursor-pointer px-3 py-3 ${full || busy ? "pointer-events-none opacity-50" : ""}` })}>
            <Upload className="h-4 w-4" /> {busy ? (en ? "Processing…" : "Memproses…") : (en ? "Upload Music" : "Unggah Musik")}
            <input type="file" accept={AUDIO_MIME_TYPES.join(",")} disabled={full || busy} className="sr-only"
              onChange={(event) => { const file = event.target.files?.[0]; if (file) onUpload(file); event.currentTarget.value = ""; }} />
          </label>
        </>}
      </fieldset>
    </div>
  );
}
