"use client";

import { AlignCenter, AlignLeft, AlignRight, RotateCcw, X } from "lucide-react";
import InvitationFonts from "@/components/PublicInvitation/InvitationFonts";
import { invitationFontOptions } from "@/components/InvitationStudio/designer-config";
import { invitationFontFamily } from "@/lib/templates/presentation";
import {
  defaultNativeVisualTransform,
  nativeVisualCapabilities,
  type NativeVisualTextAlign,
  type NativeVisualTransform,
} from "@/lib/templates/native-visual-transforms";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const nativeFontFamilies = [...new Set(
  invitationFontOptions.flatMap(([, item]) => [item.heading, item.body]),
)].sort((a, b) => a.localeCompare(b));

export default function StudioNativeVisualInspector({
  locale, targetKey, value, onChange, onClose,
}: {
  locale: string;
  targetKey: string;
  value?: NativeVisualTransform;
  onChange: (value: NativeVisualTransform) => void;
  onClose: () => void;
}) {
  const en = locale === "en";
  const current: NativeVisualTransform = { ...defaultNativeVisualTransform, ...value };
  const capabilities = nativeVisualCapabilities(targetKey);
  const section = targetKey.split(":")[1] ?? "";
  const title = targetKey.startsWith("heading:")
    ? (en ? `${section} heading` : `Judul ${section}`)
    : (en ? "Visual element" : "Elemen visual");
  const fields = [
    { key: "x", label: "X", unit: "%", min: -2000, max: 2000, factor: 1 },
    { key: "y", label: "Y", unit: "%", min: -2000, max: 2000, factor: 1 },
    { key: "scaleX", label: en ? "Width" : "Lebar", unit: "%", min: 25, max: 300, factor: 100 },
    { key: "scaleY", label: en ? "Height" : "Tinggi", unit: "%", min: 25, max: 300, factor: 100 },
    { key: "rotation", label: en ? "Rotation" : "Rotasi", unit: "°", min: -180, max: 180, factor: 1 },
  ] as const;
  const colors = [
    { key: "color", label: en ? "Color" : "Warna", fallback: "#222222" },
    { key: "background", label: en ? "Background" : "Latar", fallback: "#ffffff" },
    { key: "borderColor", label: en ? "Border" : "Garis", fallback: "#c07a84" },
  ] as const;
  const aligns: { value: NativeVisualTextAlign; label: string; Icon: typeof AlignLeft }[] = [
    { value: "left", label: en ? "Align left" : "Rata kiri", Icon: AlignLeft },
    { value: "center", label: en ? "Align center" : "Rata tengah", Icon: AlignCenter },
    { value: "right", label: en ? "Align right" : "Rata kanan", Icon: AlignRight },
  ];

  function patch(patchValue: Partial<NativeVisualTransform>) {
    onChange({ ...current, ...patchValue });
  }

  return (
    <aside className="dc-studio-layer-side dc-studio-native-inspector" aria-label={en ? "Visual properties" : "Properti visual"}>
      <InvitationFonts families={current.fontFamily ? [current.fontFamily] : []} />
      <div className="flex items-center justify-between gap-2">
        <h3 className="truncate text-sm font-semibold capitalize text-primary">{title}</h3>
        <button type="button" onClick={onClose} aria-label={en ? "Close properties" : "Tutup properti"}
          className="grid h-8 w-8 place-items-center rounded-lg hover:bg-primary/10"><X size={16} /></button>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {fields.map(({ key, label, unit, min, max, factor }) => (
          <label key={key} className="text-xs text-foreground">
            <span className="mb-1 block">{label}</span>
            <span className="flex items-center rounded-lg border border-primary/30 px-2">
              <input type="number" min={min} max={max} step={1}
                value={Math.round(current[key] * factor)}
                onChange={(event) => {
                  const number = Number(event.currentTarget.value);
                  if (!Number.isFinite(number)) return;
                  onChange({ ...current, [key]: clamp(number, min, max) / factor });
                }}
                className="h-9 min-w-0 w-full bg-transparent text-sm outline-none"
                aria-label={label} />
              <span className="text-xs text-muted-foreground">{unit}</span>
            </span>
          </label>
        ))}
      </div>

      {capabilities.opacity && (
        <label className="mt-4 block text-xs text-foreground">
          <span className="mb-1 flex items-center justify-between gap-2">
            <span>{en ? "Opacity" : "Opasitas"}</span>
            <output>{Math.round((current.opacity ?? 1) * 100)}%</output>
          </span>
          <input type="range" min="0.2" max="1" step="0.05"
            value={current.opacity ?? 1}
            onChange={(event) => patch({ opacity: Number(event.currentTarget.value) })}
            className="w-full" />
        </label>
      )}

      {capabilities.colors && (
        <div className="mt-4 space-y-3 border-t border-primary/20 pt-4">
          {colors.map(({ key, label, fallback }) => (
            <div key={key} className="text-xs text-foreground">
              <span className="mb-1 block">{label}</span>
              <div className="flex items-center gap-2">
                <input type="color" value={current[key] ?? fallback} aria-label={label}
                  onChange={(event) => patch({ [key]: event.currentTarget.value } as Partial<NativeVisualTransform>)}
                  className="h-9 w-12 rounded-lg border border-primary/30 bg-background p-1" />
                <button type="button"
                  onClick={() => patch({ [key]: undefined } as Partial<NativeVisualTransform>)}
                  className="min-h-9 flex-1 rounded-[var(--dc-control-radius)] border border-primary/30 px-3 text-xs hover:bg-primary/10">
                  Default
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {capabilities.typography && (
        <div className="mt-4 space-y-3 border-t border-primary/20 pt-4">
          <label className="block text-xs text-foreground">
            <span className="mb-1 block">Font</span>
            <select value={current.fontFamily ?? ""}
              style={{ fontFamily: current.fontFamily ? invitationFontFamily(current.fontFamily) : undefined }}
              onChange={(event) => patch({ fontFamily: event.currentTarget.value || undefined })}
              className="h-10 w-full rounded-[var(--dc-control-radius)] border border-primary/30 bg-background px-2 text-sm outline-none">
              <option value="">{en ? "Template font" : "Font template"}</option>
              {nativeFontFamilies.map((family) => (
                <option key={family} value={family} style={{ fontFamily: invitationFontFamily(family) }}>{family}</option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs text-foreground">
              <span className="mb-1 block">{en ? "Text size" : "Ukuran teks"}</span>
              <span className="flex items-center rounded-lg border border-primary/30 px-2">
                <input type="number" min={8} max={160} step={1}
                  value={current.fontSize ?? ""} placeholder="Template"
                  onChange={(event) => patch({ fontSize: event.currentTarget.value ? event.currentTarget.valueAsNumber : undefined })}
                  className="h-9 min-w-0 w-full bg-transparent text-sm outline-none" />
                <span className="text-xs text-muted-foreground">px</span>
              </span>
            </label>
            <label className="text-xs text-foreground">
              <span className="mb-1 block">{en ? "Weight" : "Ketebalan"}</span>
              <select value={current.fontWeight ?? ""}
                onChange={(event) => patch({ fontWeight: event.currentTarget.value ? Number(event.currentTarget.value) : undefined })}
                className="h-9 w-full rounded-lg border border-primary/30 bg-background px-2 text-sm outline-none">
                <option value="">Template</option>
                {[300,400,500,600,700,800,900].map((weight) => <option key={weight} value={weight}>{weight}</option>)}
              </select>
            </label>
          </div>

          <div className="text-xs text-foreground">
            <span className="mb-1 block">{en ? "Alignment" : "Perataan"}</span>
            <div className="dc-studio-align-icons" role="group" aria-label={en ? "Text alignment" : "Perataan teks"}>
              {aligns.map(({ value: align, label, Icon }) => (
                <button key={align} type="button" aria-pressed={current.textAlign === align}
                  aria-label={label} title={label}
                  onClick={() => patch({ textAlign: current.textAlign === align ? undefined : align })}>
                  <Icon size={15} />
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs text-foreground">
              <span className="mb-1 block">{en ? "Letter spacing" : "Jarak huruf"}</span>
              <span className="flex items-center rounded-lg border border-primary/30 px-2">
                <input type="number" min={-5} max={20} step={0.1}
                  value={current.letterSpacing ?? ""} placeholder="Template"
                  onChange={(event) => patch({ letterSpacing: event.currentTarget.value ? event.currentTarget.valueAsNumber : undefined })}
                  className="h-9 min-w-0 w-full bg-transparent text-sm outline-none" />
                <span className="text-xs text-muted-foreground">px</span>
              </span>
            </label>
            <label className="text-xs text-foreground">
              <span className="mb-1 block">{en ? "Line height" : "Jarak baris"}</span>
              <span className="flex items-center rounded-lg border border-primary/30 px-2">
                <input type="number" min={0.7} max={3} step={0.1}
                  value={current.lineHeight ?? ""} placeholder="Template"
                  onChange={(event) => patch({ lineHeight: event.currentTarget.value ? event.currentTarget.valueAsNumber : undefined })}
                  className="h-9 min-w-0 w-full bg-transparent text-sm outline-none" />
                <span className="text-xs text-muted-foreground">×</span>
              </span>
            </label>
          </div>
        </div>
      )}

      <button type="button" onClick={() => onChange(defaultNativeVisualTransform)}
        className="mt-4 inline-flex min-h-9 items-center gap-2 rounded-[var(--dc-control-radius)] border border-primary/40 px-3 text-xs text-primary hover:bg-primary/10">
        <RotateCcw size={14} />{en ? "Reset element" : "Reset elemen"}
      </button>
    </aside>
  );
}
