/** One visibility contract for Studio and every ready invitation renderer. */
export const invitationSectionItems = [
  { key: "envelope", title: "Amplop Digital" },
  { key: "cover", title: "Sampul" },
  { key: "greeting", title: "Salam Pembuka" },
  { key: "identity", title: "Identitas" },
  { key: "event", title: "Detail Acara" },
  { key: "dateTime", title: "Tanggal & Waktu" },
  { key: "gallery", title: "Galeri / Media" },
  { key: "countdown", title: "Hitung Mundur" },
  { key: "location", title: "Lokasi" },
  { key: "rsvp", title: "RSVP" },
  { key: "wishes", title: "Ucapan Tamu" },
  { key: "gift", title: "Hadiah / E-Angpao" },
  { key: "closing", title: "Penutup" },
  { key: "footer", title: "Footer" },
  { key: "music", title: "Musik" },
] as const;

export type InvitationSectionKey = (typeof invitationSectionItems)[number]["key"];
type LegacySection = "rsvp" | "wishes" | "gift";
// Older callers only supply the original three flags. Missing flags remain ON.
export type InvitationSections = Record<LegacySection, boolean> & Partial<Record<InvitationSectionKey, boolean>>;
export const defaultInvitationSections: InvitationSections = Object.fromEntries(
  invitationSectionItems.map(({ key }) => [key, true]),
) as InvitationSections;
const legacyOrder: LegacySection[] = ["rsvp", "wishes", "gift"];

export function parseInvitationSections(templateKey: string): InvitationSections {
  const parts = templateKey.split("::");
  const legacy = parts.find((part) => part.startsWith("sections="));
  const hidden = new Set((parts.find((part) => part.startsWith("hidden=")) ?? "hidden=").slice(7).split(","));
  const sections = { ...defaultInvitationSections };
  if (legacy !== undefined) {
    const enabled = new Set(legacy.slice(9).split(","));
    for (const key of legacyOrder) sections[key] = enabled.has(key);
  }
  for (const { key } of invitationSectionItems) {
    if (hidden.has(key)) sections[key] = false;
  }
  return sections;
}

export function withInvitationSections(designKey: string, sections: InvitationSections) {
  const parts = designKey.split("::").filter((part) => !part.startsWith("sections=") && !part.startsWith("hidden="));
  const enabled = legacyOrder.filter((key) => sections[key]);
  const hidden = invitationSectionItems.filter(({ key }) => sections[key] === false && !legacyOrder.includes(key as LegacySection)).map(({ key }) => key);
  return `${parts.join("::")}::sections=${enabled.join(",")}${hidden.length ? `::hidden=${hidden.join(",")}` : ""}`;
}
