"use client";

import { AlignCenter, AlignLeft, AlignRight } from "lucide-react";
import { invitationSectionItems, type InvitationSections } from "@/lib/templates/sections";
import {
  MAX_ASSET_LAYERS,
  studioObjectSections,
  type InvitationAssetLayer,
  type StudioObjectSection,
} from "@/lib/templates/asset-layers";
import { invitationFontFamily } from "@/lib/templates/presentation";
import InvitationFonts from "@/components/PublicInvitation/InvitationFonts";
import { invitationFontOptions } from "@/components/InvitationStudio/designer-config";

type Props = {
  locale: string;
  layer: InvitationAssetLayer;
  selectedIndex: number;
  layerCount: number;
  sections: InvitationSections;
  onClose: () => void;
  onUpdate: (id: string, patch: Partial<InvitationAssetLayer>) => void;
  onPosition: (id: string, position: "front" | "forward" | "backward" | "back") => void;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const studioTextFontFamilies = [...new Set(invitationFontOptions.flatMap(([, item]) => [item.heading, item.body]))].sort((a, b) => a.localeCompare(b));

function LayerStackIcon({ action }: { action: "front" | "forward" | "backward" | "back" }) {
  const up = action === "front" || action === "forward";
  const edge = action === "front" || action === "back";
  return (
    <svg viewBox="0 0 24 24" width="19" height="19" fill="none" aria-hidden="true">
      <rect x="3.5" y="8.5" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" opacity={action === "back" ? 1 : 0.38} />
      <rect x="6.5" y="5.5" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" opacity={action === "forward" || action === "backward" ? 1 : 0.58} />
      <rect x="9.5" y="2.5" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" opacity={action === "front" ? 1 : 0.78} />
      <path d={up ? "M18.5 18.5v-5m0 0-2 2m2-2 2 2" : "M18.5 13.5v5m0 0-2-2m2 2 2-2"} stroke="currentColor" strokeWidth={edge ? 1.8 : 1.5} strokeLinecap="round" strokeLinejoin="round" />
      {edge && <path d={up ? "M16 11.5h5" : "M16 20.5h5"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />}
    </svg>
  );
}

export default function TextLayerInspector({
  locale,
  layer,
  selectedIndex,
  layerCount,
  sections,
  onClose,
  onUpdate,
  onPosition,
}: Props) {
  const en = locale === "en";
  const section = layer.section ?? "cover";
  const family = layer.fontFamily ?? "";
  const align = layer.textAlign ?? "center";

  const numberInput = (
    label: string,
    value: number,
    min: number,
    max: number,
    step: number,
    suffix: string,
    patch: (value: number) => Partial<InvitationAssetLayer>,
  ) => (
    <label className="dc-studio-layer-field">
      <span>{label}</span>
      <span className="dc-studio-layer-number">
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={Number.isInteger(value) ? value : Number(value.toFixed(1))}
          onFocus={(event) => event.currentTarget.select()}
          onChange={(event) => {
            const next = event.currentTarget.valueAsNumber;
            if (Number.isFinite(next)) onUpdate(layer.id, patch(clamp(next, min, max)));
          }}
        />
        <small>{suffix}</small>
      </span>
    </label>
  );

  return (
    <aside className="dc-studio-layer-side dc-studio-text-side" aria-label={en ? "Text properties" : "Properti teks"}>
      <InvitationFonts families={studioTextFontFamilies} />
      <div className="dc-studio-layer-side-head">
        <strong>{en ? "Text box" : "Kotak teks"}</strong>
        <button type="button" onClick={onClose} aria-label={en ? "Close text properties" : "Tutup properti teks"} title={en ? "Close" : "Tutup"}>×</button>
      </div>

      <label className="dc-studio-layer-field">
        <span>{en ? "Text" : "Teks"}</span>
        <textarea
          value={layer.text ?? ""}
          rows={4}
          maxLength={180}
          onChange={(event) => onUpdate(layer.id, { text: event.target.value.slice(0, 180) })}
          className="dc-studio-text-content"
        />
      </label>

      <label className="dc-studio-layer-select">
        <span>{en ? "Section" : "Bagian"}</span>
        <select value={section} onChange={(event) => onUpdate(layer.id, { section: event.target.value as StudioObjectSection })}>
          {invitationSectionItems
            .filter((item) => studioObjectSections.includes(item.key as StudioObjectSection) && (sections[item.key] !== false || item.key === section))
            .map((item) => <option key={item.key} value={item.key}>{item.title}</option>)}
        </select>
      </label>

      <label className="dc-studio-layer-select dc-studio-text-font">
        <span>{en ? "Font" : "Font"}</span>
        <select
          value={family}
          style={{ fontFamily: family ? invitationFontFamily(family) : undefined }}
          onChange={(event) => onUpdate(layer.id, { fontFamily: event.target.value || undefined })}
        >
          <option value="">{en ? "Template font" : "Font template"}</option>
          {studioTextFontFamilies.map((font) => <option key={font} value={font}>{font}</option>)}
        </select>
      </label>

      <div className="dc-studio-layer-grid">
        {numberInput(en ? "Size" : "Ukuran", layer.fontSize ?? 24, 10, 144, 1, "px", (fontSize) => ({ fontSize }))}
        <label className="dc-studio-layer-select">
          <span>{en ? "Weight" : "Ketebalan"}</span>
          <select value={layer.fontWeight ?? 400} onChange={(event) => onUpdate(layer.id, { fontWeight: Number(event.target.value) })}>
            <option value="300">Light</option>
            <option value="400">Regular</option>
            <option value="500">Medium</option>
            <option value="600">Semi Bold</option>
            <option value="700">Bold</option>
            <option value="800">Extra Bold</option>
            <option value="900">Black</option>
          </select>
        </label>
      </div>

      <div className="dc-studio-layer-field">
        <span>{en ? "Alignment" : "Perataan"}</span>
        <div className="dc-studio-align-icons" role="group" aria-label={en ? "Text alignment" : "Perataan teks"}>
          {[
            ["left", en ? "Align left" : "Rata kiri", AlignLeft],
            ["center", en ? "Align center" : "Rata tengah", AlignCenter],
            ["right", en ? "Align right" : "Rata kanan", AlignRight],
          ].map(([value, label, Icon]) => {
            const AlignmentIcon = Icon as typeof AlignLeft;
            return (
              <button
                key={String(value)}
                type="button"
                aria-pressed={align === value}
                aria-label={String(label)}
                title={String(label)}
                onClick={() => onUpdate(layer.id, { textAlign: value as "left" | "center" | "right" })}
              >
                <AlignmentIcon size={15} />
              </button>
            );
          })}
        </div>
      </div>

      <div className="dc-studio-layer-field">
        <span>{en ? "Text color" : "Warna teks"}</span>
        <div className="dc-studio-text-color">
          <input type="color" value={layer.color ?? "#C07A84"} onChange={(event) => onUpdate(layer.id, { color: event.target.value })} aria-label={en ? "Text color" : "Warna teks"} />
          <output>{(layer.color ?? "#C07A84").toUpperCase()}</output>
        </div>
      </div>

      <div className="dc-studio-layer-grid">
        {numberInput(en ? "Letter spacing" : "Jarak huruf", layer.letterSpacing ?? 0, -2, 12, 0.1, "px", (letterSpacing) => ({ letterSpacing }))}
        {numberInput(en ? "Line height" : "Jarak baris", layer.lineHeight ?? 1.2, 0.8, 2.5, 0.1, "×", (lineHeight) => ({ lineHeight }))}
      </div>

      <div className="dc-studio-layer-grid">
        {numberInput("X", layer.x, 0, 100, 0.1, "%", (x) => ({ x }))}
        {numberInput("Y", layer.y, 0, 100, 0.1, "%", (y) => ({ y }))}
      </div>
      {numberInput(en ? "Box width" : "Lebar kotak", layer.width, 5, 85, 0.1, "%", (width) => ({ width }))}
      {numberInput(en ? "Rotation" : "Rotasi", layer.rotation ?? 0, -180, 180, 1, "°", (rotation) => ({ rotation }))}

      <label className="dc-studio-layer-opacity">
        <span>{en ? "Opacity" : "Opasitas"} <output>{Math.round(layer.opacity * 100)}%</output></span>
        <input type="range" min="0" max="1" step="0.05" value={layer.opacity} onChange={(event) => onUpdate(layer.id, { opacity: Number(event.target.value) })} />
      </label>

      <div className="dc-studio-layer-field">
        <span>{en ? "Layer order" : "Urutan layer"}</span>
        <div className="dc-studio-layer-order" role="group" aria-label={en ? "Layer order" : "Urutan layer"}>
          <button type="button" onClick={() => onPosition(layer.id, "front")} disabled={selectedIndex === layerCount - 1} aria-label={en ? "Bring to front" : "Paling depan"} title={en ? "Bring to Front" : "Paling depan"}><LayerStackIcon action="front" /></button>
          <button type="button" onClick={() => onPosition(layer.id, "forward")} disabled={selectedIndex === layerCount - 1} aria-label={en ? "Bring forward" : "Naik 1 layer"} title={en ? "Bring Forward" : "Naik 1 layer"}><LayerStackIcon action="forward" /></button>
          <button type="button" onClick={() => onPosition(layer.id, "backward")} disabled={selectedIndex === 0} aria-label={en ? "Send backward" : "Turun 1 layer"} title={en ? "Send Backward" : "Turun 1 layer"}><LayerStackIcon action="backward" /></button>
          <button type="button" onClick={() => onPosition(layer.id, "back")} disabled={selectedIndex === 0} aria-label={en ? "Send to back" : "Paling belakang"} title={en ? "Send to Back" : "Paling belakang"}><LayerStackIcon action="back" /></button>
        </div>
      </div>

      <p className="dc-studio-text-counter">{selectedIndex + 1}/{MAX_ASSET_LAYERS}</p>
    </aside>
  );
}
