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
  "photo:cover", "photo:envelope:cover", "photo:personOne", "photo:personTwo",
]);

export function isNativeVisualKey(key: string) {
  if (keys.has(key) || /^photo:gallery:[a-zA-Z0-9_-]{1,64}$/.test(key)) return true;
  const parts = key.split(":");
  const instanceId = parts.at(-1);
  if (!instanceId || !/^[a-zA-Z0-9_-]{1,64}$/.test(instanceId)) return false;
  if (parts.length === 3 && (parts[0] === "copy" || parts[0] === "heading")) {
    return keys.has(`${parts[0]}:${parts[1]}`);
  }
  if (parts.length === 4 && parts[0] === "element") {
    return keys.has(`element:${parts[1]}:${parts[2]}`);
  }
  if (parts.length === 3 && parts[0] === "rsvp") {
    return keys.has(`rsvp:${parts[1]}`);
  }
  return false;
}

const clamp = (value: unknown, min: number, max: number, fallback: number) =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.round(Math.min(max, Math.max(min, value)) * 100) / 100 : fallback;

export function sanitizeNativeVisualTransforms(value: unknown): NativeVisualTransforms {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const result: NativeVisualTransforms = {};
  for (const [key, raw] of Object.entries(value).slice(0, 40)) {
    if (!isNativeVisualKey(key) || !raw || typeof raw !== "object" || Array.isArray(raw)) continue;
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
  if (!isNativeVisualKey(key)) return null;
  const parts = key.split(":");
  const [kind, section, element] = parts;
  if (kind === "photo" && section === "gallery" && element) return `[data-invitation-photo-slot="gallery"][data-studio-photo-id="${element}"]`;
  if (kind === "photo") {
    const stage = section === "envelope" ? "envelope" : section === "cover" ? "cover" : "identity";
    const slot = section === "envelope" ? element : section;
    return `[data-invitation-section="${stage}"] [data-invitation-photo-slot="${slot}"]`;
  }
  const instanceId = kind === "element" ? parts[3] : parts[2];
  const prefix = instanceId ? `[data-section-instance-id="${instanceId}"] ` : "";
  if (kind === "copy") return `${prefix}[data-studio-copy-field="${section}"]`;
  if (kind === "heading") return section === "envelope"
    ? '[data-invitation-section="envelope"] h1'
    : `${prefix}[data-invitation-section="${section}"] [data-studio-native-heading]`;
  if (kind === "element") return `${prefix}[data-studio-section-element="${section}:${element}"]`;
  if (kind === "rsvp") return `${prefix}[data-invitation-section="rsvp"] [data-studio-rsvp-element="${section}"]`;
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
