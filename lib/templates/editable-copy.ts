/**
 * Template-owned narrative slots. Event identity, parents, date, venue, RSVP,
 * payment and section headings are NOT editable through Studio's Isi panel.
 * Keep this registry aligned with text that the real public renderer actually uses.
 */
export const editableInvitationCopyFields = ["greeting", "closing", "ourStory", "zenQuote", "attendanceRequest", "prayerWish"] as const;
export type EditableInvitationCopyField = (typeof editableInvitationCopyFields)[number];
export type EditableInvitationCopy = Partial<Record<EditableInvitationCopyField, string>>;

export const editableCopyMaxLength: Record<EditableInvitationCopyField, number> = {
  greeting: 360,
  closing: 320,
  ourStory: 1600,
  zenQuote: 240,
  attendanceRequest: 360,
  prayerWish: 320,
};

export function availableEditableCopyFields(templateKey: string, isWedding = true): EditableInvitationCopyField[] {
  const common: EditableInvitationCopyField[] = ["greeting", "attendanceRequest", "prayerWish", "closing"];
  if (!isWedding) return common;
  return templateKey === "zen-atelier"
    ? [...common, "ourStory", "zenQuote"]
    : [...common, "ourStory"];
}

export function invitationCopyDefaults(templateKey: string, eventDescription?: string | null): EditableInvitationCopy {
  if (templateKey === "midnight-romance") return {
    greeting: eventDescription?.trim() || "Saat malam turun dan cahaya menjadi lebih pelan, kami mengundang Anda untuk hadir di satu perayaan yang kami simpan dekat di hati.",
    attendanceRequest: "Kehadiran Anda akan menjadi bagian hangat dari malam yang ingin kami kenang selamanya.",
    prayerWish: "Semoga perjalanan baru ini selalu menemukan cahaya, bahkan pada malam yang paling sunyi.",
    closing: "Terima kasih telah hadir, mendoakan, dan tinggal sejenak bersama kami di malam yang berarti ini. Sampai bertemu.",
  };
  if (templateKey === "garden-light") return {
    greeting: eventDescription?.trim() || "Menjelang senja, di antara cahaya kecil dan udara taman, kami mengundang Anda untuk hadir di hari yang kami nantikan.",
    attendanceRequest: "Kehadiran Anda akan membuat taman ini terasa lebih hangat dan cerita hari itu menjadi lebih lengkap.",
    prayerWish: "Semoga langkah baru ini selalu menemukan cahaya, keteduhan, dan ruang untuk tumbuh bersama.",
    closing: "Terima kasih telah datang, mendoakan, dan berbagi cahaya pada hari yang begitu berarti bagi kami. Sampai bertemu di taman.",
  };
  if (templateKey === "botanical-ivory") return {
    greeting: eventDescription?.trim() || "Dengan hati yang hangat, kami mengundang Anda untuk merayakan hari ketika dua cerita memilih berjalan bersama.",
    attendanceRequest: "Kehadiran Anda akan menjadi bagian hangat dari hari yang kami rayakan bersama.",
    prayerWish: "Semoga langkah baru ini selalu dipenuhi kasih, ketenangan, dan doa yang baik.",
    closing: "Terima kasih telah hadir, mendoakan, dan menjadi bagian dari awal yang kami pilih bersama. Sampai bertemu.",
  };
  if (templateKey === "serein") return {
    greeting: eventDescription?.trim() || "Di antara hari-hari yang datang dan pergi, ada satu yang ingin kami rayakan bersama Anda.",
    attendanceRequest: "Kami mengundang Anda untuk berbagi waktu, cerita, dan kebahagiaan pada hari istimewa ini.",
    prayerWish: "Semoga langkah baru ini selalu dikelilingi kasih, kebaikan, dan doa yang tulus.",
    closing: "Terima kasih untuk setiap doa dan kehadiran yang menghangatkan hari kami. Sampai bertemu.",
  };
  return {
    greeting: eventDescription?.trim() ||
      (templateKey === "pencil-reverie"
        ? "Sebuah cerita kecil membawa kami menuju hari yang istimewa ini."
        : templateKey === "romantic-rose"
        ? "Dengan penuh sukacita, kami berbagi kabar bahagia ini bersama Anda."
        : templateKey === "zen-atelier"
          ? "Dengan hati yang tenang, kami berbagi satu langkah penting dalam perjalanan kami."
          : "Dengan penuh sukacita, kami berbagi kabar bahagia ini bersama Anda."),
    attendanceRequest: templateKey === "pencil-reverie"
      ? "Dengan senang hati, kami mengundang Anda untuk hadir dan merayakan hari istimewa ini bersama kami."
      : templateKey === "romantic-rose"
        ? "Kami berharap Anda berkenan hadir dan menjadi bagian dari perayaan kami."
        : templateKey === "zen-atelier"
          ? "Merupakan kebahagiaan bagi kami apabila Anda berkenan hadir pada hari istimewa ini."
          : "Kehadiran Anda akan menjadi bagian berarti dari perayaan ini.",
    prayerWish: templateKey === "pencil-reverie"
      ? "Semoga hari ini menjadi awal dari perjalanan yang penuh kasih dan kebaikan."
      : templateKey === "zen-atelier"
        ? "Doa dan harapan baik Anda kami terima dengan penuh syukur."
        : "Doa dan harapan baik Anda menjadi hadiah yang kami syukuri.",
    closing: templateKey === "pencil-reverie"
      ? "Terima kasih telah menjadi bagian dari cerita kami. Sampai bertemu!"
      : templateKey === "zen-atelier"
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

export function parseEnglishEditableCopy(designKey: string): EditableInvitationCopy {
  const token = designKey.split("::").find((part) => part.startsWith("copyEn="));
  if (!token) return {};
  try {
    return sanitizeEditableCopy(JSON.parse(decodeURIComponent(token.slice(7))), designKey.split("::")[0] || "");
  } catch {
    return {};
  }
}

export function withEnglishEditableCopy(designKey: string, value: EditableInvitationCopy): string {
  const base = designKey.split("::").filter((part) => !part.startsWith("copyEn=")).join("::");
  const overrides = sanitizeEditableCopy(value, base.split("::")[0] || "");
  return Object.keys(overrides).length ? `${base}::copyEn=${encodeURIComponent(JSON.stringify(overrides))}` : base;
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
