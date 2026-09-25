import type { CSSProperties } from "react";

/**
 * Shared, event-scoped media assignment. Stable asset IDs are persisted as part of
 * the invitation design key; templates own frames and may provide default motion.
 * Crop data is non-destructive: the original uploaded asset is never rewritten.
 */
export type PhotoSlot = "cover" | "personOne" | "personTwo" | "gallery";
export type PhotoFocus = "top" | "center" | "bottom";
export type CroppablePhotoSlot = Exclude<PhotoSlot, "gallery">;
export type PhotoCrop = { x: number; y: number; zoom: number };

export type PhotoAssignments = {
  cover: string | null;
  personOne: string | null;
  personTwo: string | null;
  gallery: string[] | null;
  focus: Record<CroppablePhotoSlot, PhotoFocus>;
  crop: Record<CroppablePhotoSlot, PhotoCrop | null>;
};

export const defaultPhotoAssignments = (): PhotoAssignments => ({
  cover: null,
  personOne: null,
  personTwo: null,
  gallery: null,
  focus: { cover: "center", personOne: "center", personTwo: "center" },
  crop: { cover: null, personOne: null, personTwo: null },
});

const focusValues = new Set<PhotoFocus>(["top", "center", "bottom"]);
const sanitizeId = (id: unknown) =>
  typeof id === "string" && id.length > 0 && id.length <= 100 && /^[a-zA-Z0-9_-]+$/.test(id)
    ? id
    : null;
const bounded = (value: unknown, min: number, max: number, fallback: number) =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.min(max, Math.max(min, value))
    : fallback;

function sanitizeCrop(value: unknown): PhotoCrop | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const source = value as Record<string, unknown>;
  const crop = {
    x: bounded(source.x, 0, 100, 50),
    y: bounded(source.y, 0, 100, 50),
    zoom: bounded(source.zoom, 1, 3, 1),
  };
  return crop.x === 50 && crop.y === 50 && crop.zoom === 1 ? null : crop;
}

export function parsePhotoAssignments(designKey: string): PhotoAssignments {
  const entry = designKey.split("::").find((part) => part.startsWith("photos="));
  if (!entry) return defaultPhotoAssignments();
  try {
    const source: unknown = JSON.parse(decodeURIComponent(entry.slice("photos=".length)));
    if (!source || typeof source !== "object" || Array.isArray(source)) return defaultPhotoAssignments();
    const value = source as Record<string, unknown>;
    const f = value.focus && typeof value.focus === "object" && !Array.isArray(value.focus)
      ? value.focus as Record<string, unknown>
      : {};
    const c = value.crop && typeof value.crop === "object" && !Array.isArray(value.crop)
      ? value.crop as Record<string, unknown>
      : {};
    const focus = (key: CroppablePhotoSlot): PhotoFocus =>
      focusValues.has(f[key] as PhotoFocus) ? f[key] as PhotoFocus : "center";
    return {
      cover: sanitizeId(value.cover),
      personOne: sanitizeId(value.personOne),
      personTwo: sanitizeId(value.personTwo),
      gallery: Array.isArray(value.gallery)
        ? [...new Set(value.gallery.map(sanitizeId).filter((id): id is string => Boolean(id)))].slice(0, 30)
        : null,
      focus: { cover: focus("cover"), personOne: focus("personOne"), personTwo: focus("personTwo") },
      crop: {
        cover: sanitizeCrop(c.cover),
        personOne: sanitizeCrop(c.personOne),
        personTwo: sanitizeCrop(c.personTwo),
      },
    };
  } catch {
    return defaultPhotoAssignments();
  }
}

export function withPhotoAssignments(designKey: string, assignments: PhotoAssignments) {
  const parts = designKey.split("::").filter((part) => !part.startsWith("photos="));
  const normalized: PhotoAssignments = {
    ...assignments,
    crop: assignments.crop ?? { cover: null, personOne: null, personTwo: null },
  };
  if (JSON.stringify(normalized) === JSON.stringify(defaultPhotoAssignments())) return parts.join("::");
  return `${parts.join("::")}::photos=${encodeURIComponent(JSON.stringify(normalized))}`;
}

export function photoCropStyle(
  assignments: PhotoAssignments,
  slot: CroppablePhotoSlot,
): CSSProperties {
  const crop = assignments.crop?.[slot] ?? null;
  if (crop) {
    return {
      objectPosition: `${crop.x}% ${crop.y}%`,
      transform: crop.zoom === 1 ? undefined : `scale(${crop.zoom})`,
      transformOrigin: `${crop.x}% ${crop.y}%`,
    };
  }
  const focusY = assignments.focus[slot] === "top" ? 0 : assignments.focus[slot] === "bottom" ? 100 : 50;
  return { objectPosition: `50% ${focusY}%` };
}

export type InvitationPhotoAsset = { id: string; type: "IMAGE" | "AUDIO"; url: string; title: string | null };

export function resolveInvitationPhotos(
  assets: InvitationPhotoAsset[],
  designKey: string,
  coverUrl?: string,
  override?: PhotoAssignments,
) {
  const photos = assets.filter((asset) => asset.type === "IMAGE");
  const assignment = override ?? parsePhotoAssignments(designKey);
  const byId = new Map(photos.map((photo) => [photo.id, photo]));
  const selected = (id: string | null) => id ? byId.get(id)?.url : undefined;
  const selectedLegacy = coverUrl && photos.some((photo) => photo.url === coverUrl)
    ? coverUrl
    : undefined;
  const legacyCover = selectedLegacy ?? photos[0]?.url;
  const cover = selected(assignment.cover) ?? legacyCover;
  const personOne = selected(assignment.personOne)
    ?? photos.find((asset) => asset.title?.toLowerCase().startsWith("pria-"))?.url
    ?? photos[1]?.url ?? cover;
  const personTwo = selected(assignment.personTwo)
    ?? photos.find((asset) => asset.title?.toLowerCase().startsWith("wanita-"))?.url
    ?? photos[2]?.url ?? cover;
  const gallery = assignment.gallery === null
    ? photos
    : assignment.gallery.map((id) => byId.get(id)).filter((item): item is InvitationPhotoAsset => Boolean(item));
  return { cover, personOne, personTwo, gallery, assignment, photos };
}
