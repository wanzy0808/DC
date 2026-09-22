/**
 * Shared, event-scoped media assignment. Stable asset IDs are persisted as part of
 * the invitation design key; templates own crops, frames, position and animations.
 * Existing invitations without photo data retain their legacy cover/gallery behavior.
 */
export type PhotoSlot = "cover" | "personOne" | "personTwo" | "gallery";
export type PhotoFocus = "top" | "center" | "bottom";

export type PhotoAssignments = {
  cover: string | null;
  personOne: string | null;
  personTwo: string | null;
  gallery: string[] | null;
  focus: Record<"cover" | "personOne" | "personTwo", PhotoFocus>;
};

export const defaultPhotoAssignments = (): PhotoAssignments => ({
  cover: null,
  personOne: null,
  personTwo: null,
  gallery: null,
  focus: { cover: "center", personOne: "center", personTwo: "center" },
});

const focusValues = new Set<PhotoFocus>(["top", "center", "bottom"]);
const sanitizeId = (id: unknown) =>
  typeof id === "string" && id.length > 0 && id.length <= 100 && /^[a-zA-Z0-9_-]+$/.test(id)
    ? id
    : null;

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
    const focus = (key: "cover" | "personOne" | "personTwo"): PhotoFocus =>
      focusValues.has(f[key] as PhotoFocus) ? f[key] as PhotoFocus : "center";
    return {
      cover: sanitizeId(value.cover),
      personOne: sanitizeId(value.personOne),
      personTwo: sanitizeId(value.personTwo),
      gallery: Array.isArray(value.gallery)
        ? [...new Set(value.gallery.map(sanitizeId).filter((id): id is string => Boolean(id)))].slice(0, 30)
        : null,
      focus: { cover: focus("cover"), personOne: focus("personOne"), personTwo: focus("personTwo") },
    };
  } catch {
    return defaultPhotoAssignments();
  }
}

export function withPhotoAssignments(designKey: string, assignments: PhotoAssignments) {
  const parts = designKey.split("::").filter((part) => !part.startsWith("photos="));
  const normalized = JSON.stringify(assignments);
  if (normalized === JSON.stringify(defaultPhotoAssignments())) return parts.join("::");
  return `${parts.join("::")}::photos=${encodeURIComponent(normalized)}`;
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
  // Old invitations can still select cover via ::decor=; resolve only their own assets.
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
