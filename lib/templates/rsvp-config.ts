import type { CSSProperties } from "react";

export type RsvpEventOption = "ceremony" | "reception";
export type RsvpElementAlign = "left" | "center" | "right";

export type RsvpCustomField = {
  id: string;
  label: string;
  required: boolean;
};

export type RsvpElementStyle = {
  width?: number;
  opacity?: number;
  background?: string;
  color?: string;
  borderColor?: string;
  fontSize?: number;
  align?: RsvpElementAlign;
};

export type InvitationRsvpConfig = {
  ceremony: boolean;
  reception: boolean;
  attendAll: boolean;
  customFields: RsvpCustomField[];
  title?: string;
  elementStyles: Record<string, RsvpElementStyle>;
};

export const MAX_RSVP_CUSTOM_FIELDS = 5;

export const defaultInvitationRsvpConfig: InvitationRsvpConfig = {
  ceremony: false,
  reception: false,
  attendAll: false,
  customFields: [],
  elementStyles: {},
};

const cleanId = (value: unknown) =>
  typeof value === "string" && /^[a-zA-Z0-9_-]{1,40}$/.test(value) ? value : "";

const cleanElementKey = (value: string) =>
  /^[a-zA-Z0-9:_-]{1,64}$/.test(value) ? value : "";

const cleanLabel = (value: unknown, max = 60) =>
  typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, max) : "";

const numberBetween = (value: unknown, min: number, max: number) =>
  typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : undefined;

const color = (value: unknown) =>
  typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value) ? value : undefined;

function sanitizeElementStyles(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {} as Record<string, RsvpElementStyle>;
  const output: Record<string, RsvpElementStyle> = {};
  for (const [rawKey, rawStyle] of Object.entries(value)) {
    const key = cleanElementKey(rawKey);
    if (!key || !rawStyle || typeof rawStyle !== "object" || Array.isArray(rawStyle)) continue;
    const source = rawStyle as Record<string, unknown>;
    const style: RsvpElementStyle = {};
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

export function sanitizeInvitationRsvpConfig(value: unknown): InvitationRsvpConfig {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ...defaultInvitationRsvpConfig, customFields: [], elementStyles: {} };
  }
  const source = value as Record<string, unknown>;
  const customFields = Array.isArray(source.customFields)
    ? source.customFields.slice(0, MAX_RSVP_CUSTOM_FIELDS).flatMap((raw) => {
        if (!raw || typeof raw !== "object" || Array.isArray(raw)) return [];
        const field = raw as Record<string, unknown>;
        const id = cleanId(field.id);
        const label = cleanLabel(field.label);
        if (!id || !label) return [];
        return [{ id, label, required: field.required === true }];
      })
    : [];
  const unique = customFields.filter((field, index) => customFields.findIndex((item) => item.id === field.id) === index);
  const title = cleanLabel(source.title, 80);
  return {
    ceremony: source.ceremony === true,
    reception: source.reception === true,
    attendAll: source.attendAll === true,
    customFields: unique,
    ...(title ? { title } : {}),
    elementStyles: sanitizeElementStyles(source.elementStyles),
  };
}

export function parseInvitationRsvpConfig(designKey: string): InvitationRsvpConfig {
  const token = designKey.split("::").find((part) => part.startsWith("rsvpConfig="));
  if (!token || token.length > 16000) return { ...defaultInvitationRsvpConfig, customFields: [], elementStyles: {} };
  try {
    return sanitizeInvitationRsvpConfig(JSON.parse(decodeURIComponent(token.slice("rsvpConfig=".length))));
  } catch {
    return { ...defaultInvitationRsvpConfig, customFields: [], elementStyles: {} };
  }
}

export function withInvitationRsvpConfig(designKey: string, config: InvitationRsvpConfig) {
  const base = designKey.split("::").filter((part) => !part.startsWith("rsvpConfig=")).join("::");
  const normalized = sanitizeInvitationRsvpConfig(config);
  const isDefault =
    !normalized.ceremony &&
    !normalized.reception &&
    !normalized.attendAll &&
    normalized.customFields.length === 0 &&
    !normalized.title &&
    Object.keys(normalized.elementStyles).length === 0;
  return isDefault
    ? base
    : `${base}::rsvpConfig=${encodeURIComponent(JSON.stringify(normalized))}`;
}

export function normalizeRsvpEvents(value: unknown, config: InvitationRsvpConfig) {
  if (!Array.isArray(value)) return [] as RsvpEventOption[];
  const allowed = new Set<RsvpEventOption>([
    ...(config.ceremony ? ["ceremony" as const] : []),
    ...(config.reception ? ["reception" as const] : []),
  ]);
  return [...new Set(value.filter((item): item is RsvpEventOption => item === "ceremony" || item === "reception"))]
    .filter((item) => allowed.has(item));
}

export function sanitizeRsvpAnswers(value: unknown, config: InvitationRsvpConfig) {
  const source = value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
  const output: Record<string, string> = {};
  for (const field of config.customFields) {
    const answer = typeof source[field.id] === "string" ? String(source[field.id]).trim().slice(0, 200) : "";
    if (answer) output[field.id] = answer;
  }
  return output;
}

export function rsvpElementStyleCss(config: InvitationRsvpConfig, key: string): CSSProperties {
  const style = config.elementStyles[key];
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
