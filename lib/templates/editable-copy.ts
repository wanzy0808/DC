/**
 * Template-owned narrative slots. Event identity, parents, date, venue, RSVP,
 * payment and section headings are NOT editable through Studio's Isi panel.
 * Keep this registry aligned with text that the real public renderer actually uses.
 */
export const editableInvitationCopyFields = ["greeting", "closing", "ourStory", "zenQuote"] as const;
export type EditableInvitationCopyField = (typeof editableInvitationCopyFields)[number];
export type EditableInvitationCopy = Partial<Record<EditableInvitationCopyField, string>>;

export const editableCopyMaxLength: Record<EditableInvitationCopyField, number> = {
  greeting: 360,
  closing: 320,
  ourStory: 1600,
  zenQuote: 240,
};

export function availableEditableCopyFields(templateKey: string, isWedding = true): EditableInvitationCopyField[] {
  return isWedding
    ? templateKey === "zen-atelier"
      ? ["greeting", "closing", "ourStory", "zenQuote"]
      : ["greeting", "closing", "ourStory"]
    : ["greeting", "closing"];
}

export function invitationCopyDefaults(templateKey: string, eventDescription?: string | null): EditableInvitationCopy {
  return {
    greeting: eventDescription?.trim() ||
      (templateKey === "romantic-rose"
        ? "Kami mengundang Anda untuk hadir dan berbagi kebahagiaan dalam perayaan pernikahan kami."
        : "Dengan penuh sukacita, kami mengundang Anda untuk berbagi kebahagiaan bersama kami."),
    closing: templateKey === "zen-atelier"
      ? "Atas doa, restu, dan kehadiran Anda dalam perjalanan istimewa ini."
      : templateKey === "romantic-rose"
        ? "Kehadiran dan doa baik Anda berarti bagi kami. Sampai bertemu di hari bahagia!"
        : "Kehadiran dan doa baik Anda sangat berarti. Sampai bertemu!",
    ...(templateKey === "zen-atelier" ? {
      zenQuote: "Cinta bukan tentang menemukan seseorang yang sempurna, tetapi tentang berjalan bersama dalam ketidaksempurnaan dengan hati yang tenang.",
    } : {}),
  };
}

export function sanitizeEditableCopy(value: unknown, templateKey: string): EditableInvitationCopy {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const source = value as Record<string, unknown>;
  const result: EditableInvitationCopy = {};
  for (const key of availableEditableCopyFields(templateKey)) {
    if (typeof source[key] !== "string") continue;
    const text = source[key].trim();
    if (text && text.length <= editableCopyMaxLength[key]) result[key] = text;
  }
  return result;
}

export function parseEditableCopy(designKey: string): EditableInvitationCopy {
  const token = designKey.split("::").find((part) => part.startsWith("copy="));
  if (!token) return {};
  try {
    return sanitizeEditableCopy(
      JSON.parse(decodeURIComponent(token.slice(5))),
      designKey.split("::")[0] || "",
    );
  } catch {
    return {};
  }
}

export function withEditableCopy(designKey: string, value: EditableInvitationCopy): string {
  const base = designKey.split("::").filter((part) => !part.startsWith("copy=")).join("::");
  const overrides = sanitizeEditableCopy(value, base.split("::")[0] || "");
  return Object.keys(overrides).length
    ? `${base}::copy=${encodeURIComponent(JSON.stringify(overrides))}`
    : base;
}

export function resolveEditableCopy(
  designKey: string,
  templateKey: string,
  eventDescription?: string | null,
): EditableInvitationCopy {
  return { ...invitationCopyDefaults(templateKey, eventDescription), ...parseEditableCopy(designKey) };
}
