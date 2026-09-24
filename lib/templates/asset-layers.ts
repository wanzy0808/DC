/** Theme illustration layers on the invitation Cover. Stored with the existing design key. */
export type InvitationAssetLayer = {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  opacity: number;
};

export const MAX_ASSET_LAYERS = 12;
const assetRoots = ["/template/", "/templates/"];
const numberBetween = (input: unknown, min: number, max: number, fallback: number) =>
  typeof input === "number" && Number.isFinite(input) ? Math.min(max, Math.max(min, input)) : fallback;

export function isTemplateIllustration(src: unknown): src is string {
  if (typeof src !== "string" || src.length > 260 || !assetRoots.some((root) => src.startsWith(root))) return false;
  const segments = src.split("/").slice(2);
  if (!segments.length || segments.some((part) => !part || part === "." || part === ".." || /%(?:2e|2f|5c)/i.test(part))) return false;
  return /\.(?:png|jpe?g|webp|gif|avif)$/i.test(src);
}

export function sanitizeAssetLayers(value: unknown): InvitationAssetLayer[] {
  if (!Array.isArray(value)) return [];
  const used = new Set<string>();
  const output: InvitationAssetLayer[] = [];
  for (const row of value) {
    if (!row || typeof row !== "object" || Array.isArray(row)) continue;
    const entry = row as Record<string, unknown>;
    if (!isTemplateIllustration(entry.src) || typeof entry.id !== "string" || !/^[a-zA-Z0-9_-]{1,64}$/.test(entry.id) || used.has(entry.id)) continue;
    used.add(entry.id);
    output.push({
      id: entry.id,
      src: entry.src,
      x: numberBetween(entry.x, 0, 100, 50),
      y: numberBetween(entry.y, 0, 100, 50),
      width: numberBetween(entry.width, 5, 85, 28),
      opacity: numberBetween(entry.opacity, 0, 1, 1),
    });
    if (output.length === MAX_ASSET_LAYERS) break;
  }
  return output;
}

export function parseAssetLayers(designKey: string): InvitationAssetLayer[] {
  const part = designKey.split("::").find((token) => token.startsWith("layers="));
  if (!part || part.length > 12000) return [];
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
