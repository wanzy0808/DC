import { invitationFonts } from "@/lib/templates/design";

/** Template-safe, invitation-scoped artwork and optional decorative text. */
export const studioObjectSections = [
  "envelope", "cover", "greeting", "identity", "event", "dateTime", "gallery",
  "countdown", "location", "rsvp", "wishes", "gift", "closing", "footer",
] as const;
export type StudioObjectSection = (typeof studioObjectSections)[number];
export type InvitationAssetLayer = {
  id: string;
  /** Empty for text objects. Images always reference shipped public derivatives. */
  src: string;
  kind?: "text";
  text?: string;
  section?: StudioObjectSection;
  x: number;
  y: number;
  width: number;
  /** Optional height relative to section width; absent preserves original image proportions. */
  height?: number;
  opacity: number;
  rotation?: number;
  fontSize?: number;
  fontRole?: "heading" | "body";
  fontFamily?: string;
  fontWeight?: number;
  textAlign?: "left" | "center" | "right";
  letterSpacing?: number;
  lineHeight?: number;
  color?: string;
};

export const MAX_ASSET_LAYERS = 10;
export const studioTextFontFamilies = [...new Set(
  Object.values(invitationFonts).flatMap((item) => [item.heading, item.body]),
)].sort((a, b) => a.localeCompare(b));

const studioTextFontSet = new Set(studioTextFontFamilies);
const assetRoots = ["/template/", "/templates/"];
const numberBetween = (input: unknown, min: number, max: number, fallback: number) =>
  typeof input === "number" && Number.isFinite(input) ? Math.min(max, Math.max(min, input)) : fallback;

export function isTemplateIllustration(src: unknown): src is string {
  if (typeof src !== "string" || src.length > 260 || !assetRoots.some((root) => src.startsWith(root))) return false;
  const segments = src.split("/").slice(2);
  if (!segments.length || segments.some((part) => !part || part === "." || part === ".." || /[\\?#\x00-\x1f]/.test(part) || /%(?:2e|2f|5c|25)/i.test(part))) return false;
  return /\.(?:png|jpe?g|webp|gif|avif)$/i.test(src);
}

export function sanitizeAssetLayers(value: unknown): InvitationAssetLayer[] {
  if (!Array.isArray(value)) return [];
  const used = new Set<string>();
  const output: InvitationAssetLayer[] = [];
  for (const row of value) {
    if (!row || typeof row !== "object" || Array.isArray(row)) continue;
    const entry = row as Record<string, unknown>;
    const textObject = entry.kind === "text";
    const text = typeof entry.text === "string" ? entry.text.slice(0, 180) : "";
    if ((textObject ? !text.trim() : !isTemplateIllustration(entry.src)) ||
      typeof entry.id !== "string" || !/^[a-zA-Z0-9_-]{1,64}$/.test(entry.id) || used.has(entry.id)) continue;
    used.add(entry.id);
    const layer: InvitationAssetLayer = {
      id: entry.id,
      src: textObject ? "" : entry.src as string,
      x: numberBetween(entry.x, 0, 100, 50),
      y: numberBetween(entry.y, 0, 100, 50),
      width: numberBetween(entry.width, 5, 85, 28),
      opacity: numberBetween(entry.opacity, 0, 1, 1),
    };
    if (textObject) {
      layer.kind = "text";
      layer.text = text;
      layer.fontSize = numberBetween(entry.fontSize, 10, 144, 24);
      layer.fontRole = entry.fontRole === "body" ? "body" : "heading";
      if (typeof entry.fontFamily === "string" && studioTextFontSet.has(entry.fontFamily)) layer.fontFamily = entry.fontFamily;
      layer.fontWeight = numberBetween(entry.fontWeight, 300, 900, 400);
      if (entry.textAlign === "left" || entry.textAlign === "center" || entry.textAlign === "right") layer.textAlign = entry.textAlign;
      layer.letterSpacing = numberBetween(entry.letterSpacing, -2, 12, 0);
      layer.lineHeight = numberBetween(entry.lineHeight, 0.8, 2.5, 1.2);
      layer.color = typeof entry.color === "string" && /^#[a-fA-F0-9]{6}$/.test(entry.color) ? entry.color : "#C07A84";
    }
    if (entry.height !== undefined) layer.height = numberBetween(entry.height, 3, 200, layer.width);
    if (studioObjectSections.includes(entry.section as StudioObjectSection)) layer.section = entry.section as StudioObjectSection;
    if (entry.rotation !== undefined) layer.rotation = numberBetween(entry.rotation, -180, 180, 0);
    output.push(layer);
    if (output.length === MAX_ASSET_LAYERS) break;
  }
  return output;
}

export function parseAssetLayers(designKey: string): InvitationAssetLayer[] {
  const part = designKey.split("::").find((token) => token.startsWith("layers="));
  if (!part || part.length > 30000) return [];
  try {
    return sanitizeAssetLayers(JSON.parse(decodeURIComponent(part.slice("layers=".length))));
  } catch {
    return [];
  }
}

export function withAssetLayers(designKey: string, layers: InvitationAssetLayer[]): string {
  const base = designKey.split("::").filter((part) => !part.startsWith("layers=")).join("::");
  const normalized = sanitizeAssetLayers(layers);
  return normalized.length ? `${base}::layers=${encodeURIComponent(JSON.stringify(normalized))}` : base;
}
