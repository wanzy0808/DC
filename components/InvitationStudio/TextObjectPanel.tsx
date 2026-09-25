"use client";

import { useMemo, useState } from "react";
import { Type } from "lucide-react";
import { MAX_ASSET_LAYERS, type InvitationAssetLayer, type StudioObjectSection } from "@/lib/templates/asset-layers";
import { useLanguage } from "@/components/I18n/LanguageProvider";
import { Button } from "@/components/ui/button";
import InvitationFonts from "@/components/PublicInvitation/InvitationFonts";
import { invitationFontFamily } from "@/lib/templates/presentation";
import { invitationFontOptions } from "@/components/InvitationStudio/designer-config";
import type { FontKey } from "@/lib/templates/design";

function stableFontRank(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export default function TextObjectPanel({
  layers,
  selectedId,
  targetSection,
  selectedFont,
  onAdd,
  onSelect,
  onFontSelect,
}: {
  layers: InvitationAssetLayer[];
  selectedId: string | null;
  targetSection: StudioObjectSection;
  selectedFont: FontKey;
  onAdd: (text: string, section: StudioObjectSection) => void;
  onSelect: (id: string) => void;
  onFontSelect: (font: FontKey) => void;
}) {
  const { locale } = useLanguage();
  const en = locale === "en";
  const texts = layers.filter((layer) => layer.kind === "text");
  const [showMoreFonts, setShowMoreFonts] = useState(false);

  const orderedFonts = useMemo(() => {
    const selected = invitationFontOptions.find(([key]) => key === selectedFont);
    const rest = invitationFontOptions
      .filter(([key]) => key !== selectedFont)
      .sort((a, b) => stableFontRank(a[0]) - stableFontRank(b[0]));
    return selected ? [selected, ...rest] : rest;
  }, [selectedFont]);

  const visibleFonts = showMoreFonts ? orderedFonts : orderedFonts.slice(0, 4);

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

      <div className="space-y-2 border-t border-primary/20 pt-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-primary">{en ? "Font combinations" : "Kombinasi font"}</h3>
          <small className="text-[10px] text-muted-foreground">{visibleFonts.length}/{orderedFonts.length}</small>
        </div>

        <InvitationFonts families={visibleFonts.flatMap(([, item]) => [item.heading, item.body])} />

        <div className="space-y-2">
          {visibleFonts.map(([key, item]) => (
            <button
              type="button"
              key={key}
              onClick={() => onFontSelect(key)}
              aria-pressed={selectedFont === key}
              className="dc-studio-font-choice"
            >
              <span style={{ fontFamily: invitationFontFamily(item.heading) }}>{item.heading}</span>
              <small style={{ fontFamily: invitationFontFamily(item.body) }}>{item.body}</small>
            </button>
          ))}
        </div>

        {orderedFonts.length > 4 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full justify-center"
            onClick={() => setShowMoreFonts((value) => !value)}
          >
            {showMoreFonts ? (en ? "Show less" : "Lebih sedikit") : (en ? "See more" : "Lihat lebih banyak")}
          </Button>
        )}
      </div>

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
