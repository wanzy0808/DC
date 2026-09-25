import type { CSSProperties } from "react";
import type { InvitationSectionKey } from "@/lib/templates/sections";

export type StudioSectionElementKind = "input" | "button";
export type StudioSectionElementAlign = "left" | "center" | "right";

export type StudioSectionElementStyle = {
  width?: number;
  opacity?: number;
  background?: string;
  color?: string;
  borderColor?: string;
  fontSize?: number;
  align?: StudioSectionElementAlign;
};

export type StudioSectionElementStyles = Record<string, StudioSectionElementStyle>;

export function makeSectionElementKey(section: InvitationSectionKey, kind: StudioSectionElementKind) {
  return `${section}:${kind}`;
}

const cleanKey = (value: string) =>
  /^(location|wishes|gift):(input|button)$/.test(value) ? value : "";

const numberBetween = (value: unknown, min: number, max: number) =>
  typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : undefined;

const color = (value: unknown) =>
  typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value) ? value : undefined;

export function sanitizeSectionElementStyles(value: unknown): StudioSectionElementStyles {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const output: StudioSectionElementStyles = {};
  for (const [rawKey, rawStyle] of Object.entries(value)) {
    const key = cleanKey(rawKey);
    if (!key || !rawStyle || typeof rawStyle !== "object" || Array.isArray(rawStyle)) continue;
    const source = rawStyle as Record<string, unknown>;
    const style: StudioSectionElementStyle = {};
    const width = numberBetween(source.width, 30, 100);
    const opacity = numberBetween(source.opacity, 0.2, 1);
    const fontSize = numberBetween(source.fontSize, 10, 72);
    const background = color(source.background);
    const textColor = color(source.color);
    const borderColor = color(source.borderColor);
    if (width !== undefined && width !== 100) style.width = width;
    if (opacity !== undefined && opacity !== 1) style.opacity = opacity;
    if (fontSize !== undefined) style.fontSize = fontSize;
    if (background) style.background = background;
    if (textColor) style.color = textColor;
    if (borderColor) style.borderColor = borderColor;
    if (source.align === "left" || source.align === "center" || source.align === "right") style.align = source.align;
    if (Object.keys(style).length) output[key] = style;
  }
  return output;
}

export function parseSectionElementStyles(designKey: string): StudioSectionElementStyles {
  const token = designKey.split("::").find((part) => part.startsWith("sectionElements="));
  if (!token || token.length > 12000) return {};
  try {
    return sanitizeSectionElementStyles(JSON.parse(decodeURIComponent(token.slice("sectionElements=".length))));
  } catch {
    return {};
  }
}

export function withSectionElementStyles(designKey: string, styles: StudioSectionElementStyles) {
  const base = designKey.split("::").filter((part) => !part.startsWith("sectionElements=")).join("::");
  const normalized = sanitizeSectionElementStyles(styles);
  return Object.keys(normalized).length
    ? `${base}::sectionElements=${encodeURIComponent(JSON.stringify(normalized))}`
    : base;
}

export function sectionElementStyleCss(
  styles: StudioSectionElementStyles,
  section: InvitationSectionKey,
  kind: StudioSectionElementKind,
): CSSProperties {
  const style = styles[makeSectionElementKey(section, kind)];
  if (!style) return {};
  return {
    ...(style.width !== undefined ? { width: `${style.width}%`, maxWidth: "100%" } : {}),
    ...(style.opacity !== undefined ? { opacity: style.opacity } : {}),
    ...(style.background ? { backgroundColor: style.background } : {}),
    ...(style.color ? { color: style.color } : {}),
    ...(style.borderColor ? { borderColor: style.borderColor } : {}),
    ...(style.fontSize !== undefined ? { fontSize: style.fontSize } : {}),
    ...(style.align ? { textAlign: style.align } : {}),
  };
}
