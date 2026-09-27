"use client";

import { RotateCcw, X } from "lucide-react";
import { defaultNativeVisualTransform, type NativeVisualTransform } from "@/lib/templates/native-visual-transforms";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

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
  const current = { ...defaultNativeVisualTransform, ...value };
  const section = targetKey.split(":")[1] ?? "";
  const title = targetKey.startsWith("heading:")
    ? (en ? `${section} heading` : `Judul ${section}`)
    : (en ? "Visual element" : "Elemen visual");
  const fields = [
    { key: "x", label: "X", unit: "%", min: -150, max: 150, factor: 1 },
    { key: "y", label: "Y", unit: "%", min: -150, max: 150, factor: 1 },
    { key: "scaleX", label: en ? "Width" : "Lebar", unit: "%", min: 25, max: 300, factor: 100 },
    { key: "scaleY", label: en ? "Height" : "Tinggi", unit: "%", min: 25, max: 300, factor: 100 },
    { key: "rotation", label: en ? "Rotation" : "Rotasi", unit: "°", min: -180, max: 180, factor: 1 },
  ] as const;

  return (
    <aside className="dc-studio-layer-side dc-studio-native-inspector" aria-label={en ? "Visual properties" : "Properti visual"}>
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
      <button type="button" onClick={() => onChange(defaultNativeVisualTransform)}
        className="mt-4 inline-flex min-h-9 items-center gap-2 rounded-[var(--dc-control-radius)] border border-primary/40 px-3 text-xs text-primary hover:bg-primary/10">
        <RotateCcw size={14} />{en ? "Reset element" : "Reset elemen"}
      </button>
    </aside>
  );
}
