import type { CSSProperties } from "react";
import type { InvitationSectionKey } from "@/lib/templates/sections";
import { isInvitationSectionAnimation, type InvitationSectionAnimation } from "@/lib/templates/section-animations";

const visualSectionKeys = [
  "envelope", "cover", "greeting", "identity", "event", "dateTime", "gallery",
  "countdown", "location", "rsvp", "wishes", "gift", "closing", "footer", "music",
] as const satisfies readonly InvitationSectionKey[];

export type InvitationSectionAlign = "left" | "center" | "right";

export type InvitationSectionStyle = {
  paddingY?: number;
  opacity?: number;
  align?: InvitationSectionAlign;
  background?: string;
  /** undefined follows the template motion; "none" explicitly disables it. */
  animation?: InvitationSectionAnimation;
  animationDuration?: number;
  animationDelay?: number;
};

export type InvitationSectionStyles = Partial<Record<InvitationSectionKey, InvitationSectionStyle>>;

const sectionKeys = new Set<InvitationSectionKey>(visualSectionKeys);
const alignValues = new Set<InvitationSectionAlign>(["left", "center", "right"]);
const numberBetween = (value: unknown, min: number, max: number) =>
  typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : undefined;

function sanitizeColor(value: unknown) {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value) ? value : undefined;
}

export function sanitizeInvitationSectionStyles(value: unknown): InvitationSectionStyles {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const output: InvitationSectionStyles = {};
  for (const [key, raw] of Object.entries(value)) {
    if (!sectionKeys.has(key as InvitationSectionKey) || !raw || typeof raw !== "object" || Array.isArray(raw)) continue;
    const source = raw as Record<string, unknown>;
    const style: InvitationSectionStyle = {};
    const paddingY = numberBetween(source.paddingY, 0, 160);
    const opacity = numberBetween(source.opacity, 0.2, 1);
    const background = sanitizeColor(source.background);
    const animationDuration = numberBetween(source.animationDuration, 0.2, 2.5);
    const animationDelay = numberBetween(source.animationDelay, 0, 2);
    if (paddingY !== undefined) style.paddingY = paddingY;
    if (opacity !== undefined && opacity !== 1) style.opacity = opacity;
    if (alignValues.has(source.align as InvitationSectionAlign)) style.align = source.align as InvitationSectionAlign;
    if (background) style.background = background;
    if (isInvitationSectionAnimation(source.animation)) style.animation = source.animation;
    if (animationDuration !== undefined) style.animationDuration = animationDuration;
    if (animationDelay !== undefined) style.animationDelay = animationDelay;
    if (Object.keys(style).length) output[key as InvitationSectionKey] = style;
  }
  return output;
}

export function parseInvitationSectionStyles(designKey: string): InvitationSectionStyles {
  const token = designKey.split("::").find((part) => part.startsWith("sectionStyles="));
  if (!token || token.length > 12000) return {};
  try {
    return sanitizeInvitationSectionStyles(JSON.parse(decodeURIComponent(token.slice("sectionStyles=".length))));
  } catch {
    return {};
  }
}

export function withInvitationSectionStyles(designKey: string, styles: InvitationSectionStyles) {
  const base = designKey.split("::").filter((part) => !part.startsWith("sectionStyles=")).join("::");
  const normalized = sanitizeInvitationSectionStyles(styles);
  return Object.keys(normalized).length
    ? `${base}::sectionStyles=${encodeURIComponent(JSON.stringify(normalized))}`
    : base;
}

export function invitationSectionStyleCss(style?: InvitationSectionStyle): CSSProperties {
  if (!style) return {};
  return {
    ...(style.paddingY !== undefined ? { paddingTop: style.paddingY, paddingBottom: style.paddingY } : {}),
    ...(style.opacity !== undefined ? { opacity: style.opacity } : {}),
    ...(style.align ? { textAlign: style.align } : {}),
    // Background is authoritative: shorthand also clears a template gradient/image on the section root.
    ...(style.background ? { background: style.background } : {}),
  };
}
