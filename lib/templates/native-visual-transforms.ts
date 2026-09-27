import type { CSSProperties } from "react";
import { editableInvitationCopyFields } from "@/lib/templates/editable-copy";
import { invitationContentSectionKeys } from "@/lib/templates/section-layout";

export type NativeVisualTransform = {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
};
export type NativeVisualTransforms = Record<string, NativeVisualTransform>;

export const defaultNativeVisualTransform: NativeVisualTransform = {
  x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0,
};

const keys = new Set<string>([
  ...editableInvitationCopyFields.map((field) => `copy:${field}`),
  ...invitationContentSectionKeys.map((section) => `heading:${section}`),
  "heading:envelope",
  "element:location:button", "element:gift:button",
  "rsvp:title", "rsvp:button", "rsvp:inputs",
  "photo:cover", "photo:personOne", "photo:personTwo",
]);

export function isNativeVisualKey(key: string) {
  return keys.has(key);
}

const clamp = (value: unknown, min: number, max: number, fallback: number) =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.round(Math.min(max, Math.max(min, value)) * 100) / 100 : fallback;

export function sanitizeNativeVisualTransforms(value: unknown): NativeVisualTransforms {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const result: NativeVisualTransforms = {};
  for (const [key, raw] of Object.entries(value).slice(0, 40)) {
    if (!keys.has(key) || !raw || typeof raw !== "object" || Array.isArray(raw)) continue;
    const source = raw as Record<string, unknown>;
    const transform = {
      x: clamp(source.x, -150, 150, 0),
      y: clamp(source.y, -150, 150, 0),
      scaleX: clamp(source.scaleX, 0.25, 3, 1),
      scaleY: clamp(source.scaleY, 0.25, 3, 1),
      rotation: clamp(source.rotation, -180, 180, 0),
    };
    if (Object.keys(transform).some((name) =>
      transform[name as keyof NativeVisualTransform] !== defaultNativeVisualTransform[name as keyof NativeVisualTransform])) {
      result[key] = transform;
    }
  }
  return result;
}

export function parseNativeVisualTransforms(designKey: string): NativeVisualTransforms {
  const token = designKey.split("::").find((part) => part.startsWith("nativeVisuals="));
  if (!token || token.length > 12000) return {};
  try {
    return sanitizeNativeVisualTransforms(JSON.parse(decodeURIComponent(token.slice(14))));
  } catch {
    return {};
  }
}

export function withNativeVisualTransforms(designKey: string, transforms: NativeVisualTransforms) {
  const base = designKey.split("::").filter((part) => !part.startsWith("nativeVisuals=")).join("::");
  const clean = sanitizeNativeVisualTransforms(transforms);
  return Object.keys(clean).length
    ? `${base}::nativeVisuals=${encodeURIComponent(JSON.stringify(clean))}`
    : base;
}

export function nativeVisualSelector(key: string) {
  if (!keys.has(key)) return null;
  const [kind, section, element] = key.split(":");
  if (kind === "copy") return `[data-studio-copy-field="${section}"]`;
  if (kind === "heading") return section === "envelope"
    ? `[data-invitation-section="envelope"] h1`
    : `[data-invitation-section="${section}"] [data-studio-native-heading]`;
  if (kind === "element") return `[data-studio-section-element="${section}:${element}"]`;
  if (kind === "rsvp") return `[data-invitation-section="rsvp"] [data-studio-rsvp-element="${section}"]`;
  if (kind === "photo") return `[data-invitation-photo-slot="${section}"]`;
  return null;
}

export function nativeVisualStyle(transform: NativeVisualTransform): CSSProperties {
  return {
    translate: `${transform.x}% ${transform.y}%`,
    rotate: `${transform.rotation}deg`,
    scale: `${transform.scaleX} ${transform.scaleY}`,
    transformOrigin: "center",
  };
}

export function nativeVisualScopeClass(designKey: string) {
  let hash = 2166136261;
  for (let index = 0; index < designKey.length; index++) {
    hash = Math.imul(hash ^ designKey.charCodeAt(index), 16777619);
  }
  return `dc-native-${(hash >>> 0).toString(36)}`;
}

/** The selector registry and bounded numeric values keep injected styles free of user CSS. */
export function nativeVisualStyleSheet(designKey: string) {
  const transforms = parseNativeVisualTransforms(designKey);
  const scope = nativeVisualScopeClass(designKey);
  return Object.entries(transforms).map(([key, transform]) => {
    const selector = nativeVisualSelector(key);
    if (!selector) return "";
    return `.${scope} ${selector}{translate:${transform.x}% ${transform.y}%;rotate:${transform.rotation}deg;scale:${transform.scaleX} ${transform.scaleY};transform-origin:center;}`;
  }).join("\n");
}
