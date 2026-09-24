"use client";

import { useState } from "react";
import { Type } from "lucide-react";
import { invitationSectionItems, type InvitationSections } from "@/lib/templates/sections";
import { MAX_ASSET_LAYERS, studioObjectSections, type InvitationAssetLayer, type StudioObjectSection } from "@/lib/templates/asset-layers";
import { useLanguage } from "@/components/I18n/LanguageProvider";

export default function TextObjectPanel({
  layers, sections, selectedId, onAdd, onSelect,
}: {
  layers: InvitationAssetLayer[];
  sections: InvitationSections;
  selectedId: string | null;
  onAdd: (text: string, section: StudioObjectSection) => void;
  onSelect: (id: string) => void;
}) {
  const { locale } = useLanguage();
  const en = locale === "en";
  const [value, setValue] = useState("");
  const [section, setSection] = useState<StudioObjectSection>("cover");
  const options = invitationSectionItems.filter((item) =>
    studioObjectSections.includes(item.key as StudioObjectSection) && sections[item.key] !== false,
  );
  const selectedSection = options.some((item) => item.key === section) ? section : (options[0]?.key as StudioObjectSection | undefined);
  const texts = layers.filter((layer) => layer.kind === "text");

  return (
    <div className="space-y-5">
      <div>
        <h2 className="flex items-center gap-2 font-[family-name:var(--font-dc-heading)] text-lg font-semibold text-primary"><Type size={18} />{en ? "Design text" : "Teks Desain"}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{en
          ? "Add decorative text to any enabled section. Names, event details, RSVP and fixed template labels remain controlled by the invitation system."
          : "Tambahkan teks dekoratif di bagian yang aktif. Nama, detail acara, RSVP, dan label bawaan template tetap mengikuti data undangan."}</p>
      </div>
      <form className="space-y-3" onSubmit={(event) => { event.preventDefault(); if (selectedSection && value.trim()) { onAdd(value, selectedSection); setValue(""); } }}>
        <label className="block space-y-2 text-xs font-medium text-foreground">
          <span>{en ? "Text" : "Tulisan"}</span>
          <textarea value={value} maxLength={180} rows={3} onChange={(event) => setValue(event.target.value)}
            placeholder={en ? "Write a decorative quote…" : "Tulis kutipan dekoratif…"}
            className="w-full resize-y rounded-[var(--dc-control-radius)] border border-primary/40 bg-background p-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-primary" />
          <span className="block text-right text-muted-foreground">{value.length}/180</span>
        </label>
        <label className="block space-y-2 text-xs font-medium text-foreground">
          <span>{en ? "Place in" : "Letakkan di bagian"}</span>
          <select className="min-h-11 w-full rounded-[var(--dc-control-radius)] border border-primary/40 bg-background px-3 text-sm" value={selectedSection ?? ""} onChange={(event) => setSection(event.target.value as StudioObjectSection)}>
            {options.map((option) => <option key={option.key} value={option.key}>{option.title}</option>)}
          </select>
        </label>
        <button type="submit" disabled={!value.trim() || !selectedSection || layers.length >= MAX_ASSET_LAYERS}
          className="min-h-11 w-full rounded-[var(--dc-control-radius)] bg-primary px-4 py-2 text-sm font-medium text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-40 dark:text-black">
          {en ? "Add text to canvas" : "Tambahkan teks ke canvas"}
        </button>
        <p className="text-xs text-muted-foreground">{layers.length}/{MAX_ASSET_LAYERS} {en ? "objects" : "objek"} · {en ? "Choose the new text on the canvas to resize and rotate it." : "Pilih teks di canvas untuk mengubah ukuran dan memutarnya."}</p>
      </form>
      {texts.length > 0 && <div className="space-y-2 border-t border-primary/25 pt-4">
        <h3 className="text-sm font-semibold text-primary">{en ? "Your text objects" : "Objek teks"}</h3>
        {texts.map((layer) => <button type="button" key={layer.id} onClick={() => onSelect(layer.id)}
          aria-pressed={selectedId === layer.id}
          className={`flex w-full items-center gap-2 rounded-[var(--dc-control-radius)] border p-3 text-left text-sm ${selectedId === layer.id ? "border-primary bg-primary/10" : "border-primary/25 hover:border-primary"}`}>
          <Type size={16} className="shrink-0 text-primary" /><span className="min-w-0 flex-1 truncate">{layer.text}</span>
        </button>)}
      </div>}
    </div>
  );
}
