"use client";

import { Type } from "lucide-react";
import { invitationSectionItems } from "@/lib/templates/sections";
import { MAX_ASSET_LAYERS, type InvitationAssetLayer, type StudioObjectSection } from "@/lib/templates/asset-layers";
import { useLanguage } from "@/components/I18n/LanguageProvider";
import { Button } from "@/components/ui/button";

export default function TextObjectPanel({
  layers,
  selectedId,
  targetSection,
  onAdd,
  onSelect,
}: {
  layers: InvitationAssetLayer[];
  selectedId: string | null;
  targetSection: StudioObjectSection;
  onAdd: (text: string, section: StudioObjectSection) => void;
  onSelect: (id: string) => void;
}) {
  const { locale } = useLanguage();
  const en = locale === "en";
  const texts = layers.filter((layer) => layer.kind === "text");
  const targetLabel = invitationSectionItems.find((item) => item.key === targetSection)?.title ?? targetSection;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="flex items-center gap-2 font-[family-name:var(--font-dc-heading)] text-lg font-semibold text-primary">
          <Type size={18} />
          {en ? "Text" : "Teks"}
        </h2>
      </div>

      <Button
        type="button"
        size="lg"
        disabled={layers.length >= MAX_ASSET_LAYERS}
        onClick={() => onAdd(en ? "Add your text" : "Tambahkan teks", targetSection)}
        className="w-full justify-center"
      >
        <Type size={18} />
        <span>{en ? "Add text box" : "Tambah kotak teks"}</span>
      </Button>

      <p className="text-xs text-muted-foreground">
        {en ? "Added to " + targetLabel + ". Select a section first to change the target." : "Ditambahkan ke " + targetLabel + ". Pilih section dulu untuk mengganti target."}
      </p>

      {texts.length > 0 && (
        <div className="space-y-2 border-t border-primary/20 pt-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-primary">{en ? "Text boxes" : "Kotak teks"}</h3>
            <small className="text-[10px] text-muted-foreground">{texts.length}/{MAX_ASSET_LAYERS}</small>
          </div>
          {texts.map((layer, index) => (
            <button
              type="button"
              key={layer.id}
              onClick={() => onSelect(layer.id)}
              aria-pressed={selectedId === layer.id}
              className="dc-studio-text-list-item"
            >
              <Type size={15} className="shrink-0 text-primary" />
              <span className="min-w-0 flex-1">
                <strong>{en ? "Text" : "Teks"} {index + 1}</strong>
                <small>{layer.text}</small>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}