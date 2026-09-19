export const WEDDING_SESSION_LABELS = {
  CEREMONY: "Upacara Nikah",
  RECEPTION: "Resepsi",
} as const;

export type WeddingSessionKey = keyof typeof WEDDING_SESSION_LABELS;
export type WeddingSessionAccess = WeddingSessionKey | "BOTH";

export type WeddingSessionValues = {
  weddingCeremonyEnabled: boolean;
  weddingReceptionEnabled: boolean;
  weddingCeremonyStart: string | null;
  weddingCeremonyEnd: string | null;
  weddingCeremonyVenue: string | null;
  weddingCeremonyAddress: string | null;
  weddingCeremonyMapUrl: string | null;
  weddingReceptionStart: string | null;
  weddingReceptionEnd: string | null;
  weddingReceptionVenue: string | null;
  weddingReceptionAddress: string | null;
  weddingReceptionMapUrl: string | null;
};

export type WeddingSession = {
  key: WeddingSessionKey;
  label: string;
  start: string;
  end: string | null;
  venue: string;
  address: string | null;
  mapUrl: string | null;
};

export function hasWeddingSessions(value: Pick<WeddingSessionValues, "weddingCeremonyEnabled" | "weddingReceptionEnabled">) {
  return value.weddingCeremonyEnabled || value.weddingReceptionEnabled;
}

export function availableWeddingSessionAccess(value: Pick<WeddingSessionValues, "weddingCeremonyEnabled" | "weddingReceptionEnabled">): WeddingSessionAccess[] {
  if (value.weddingCeremonyEnabled && value.weddingReceptionEnabled) return ["CEREMONY", "RECEPTION", "BOTH"];
  if (value.weddingCeremonyEnabled) return ["CEREMONY"];
  if (value.weddingReceptionEnabled) return ["RECEPTION"];
  return [];
}

export function validWeddingSessionAccess(
  invitation: Pick<WeddingSessionValues, "weddingCeremonyEnabled" | "weddingReceptionEnabled">,
  raw: unknown,
): raw is WeddingSessionAccess {
  return typeof raw === "string" &&
    availableWeddingSessionAccess(invitation).some((value) => value === raw);
}

export function weddingSessionAccessLabel(value: WeddingSessionAccess) {
  return value === "BOTH" ? "Upacara Nikah & Resepsi" : WEDDING_SESSION_LABELS[value];
}

export function readWeddingSessionValues(source: WeddingSessionValues): WeddingSession[] {
  const sessions: WeddingSession[] = [];
  if (source.weddingCeremonyEnabled) sessions.push({
    key: "CEREMONY",
    label: WEDDING_SESSION_LABELS.CEREMONY,
    start: source.weddingCeremonyStart || "",
    end: source.weddingCeremonyEnd,
    venue: source.weddingCeremonyVenue || "",
    address: source.weddingCeremonyAddress,
    mapUrl: source.weddingCeremonyMapUrl,
  });
  if (source.weddingReceptionEnabled) sessions.push({
    key: "RECEPTION",
    label: WEDDING_SESSION_LABELS.RECEPTION,
    start: source.weddingReceptionStart || "",
    end: source.weddingReceptionEnd,
    venue: source.weddingReceptionVenue || "",
    address: source.weddingReceptionAddress,
    mapUrl: source.weddingReceptionMapUrl,
  });
  return sessions;
}

export function visibleWeddingSessions(source: WeddingSessionValues, access: WeddingSessionAccess | null | undefined) {
  if (!validWeddingSessionAccess(source, access)) return [];
  return readWeddingSessionValues(source).filter((session) => access === "BOTH" || session.key === access);
}

const hhmm = /^(?:[01]\\d|2[0-3]):[0-5]\\d$/;

export function parseWeddingSessions(body: Record<string, unknown>): { value?: WeddingSessionValues; error?: string } {
  if (["weddingCeremonyDate", "weddingReceptionDate", "ceremonyDate", "receptionDate"].some((key) => body[key] !== undefined)) {
    return { error: "Upacara Nikah dan Resepsi pada satu undangan harus memiliki tanggal yang sama. Buat acara dan paket undangan baru untuk tanggal berbeda." };
  }
  if (typeof body.weddingCeremonyEnabled !== "boolean" || typeof body.weddingReceptionEnabled !== "boolean") {
    return { error: "Pilih sesi Upacara Nikah, Resepsi, atau keduanya." };
  }
  const weddingCeremonyEnabled = body.weddingCeremonyEnabled;
  const weddingReceptionEnabled = body.weddingReceptionEnabled;
  if (!weddingCeremonyEnabled && !weddingReceptionEnabled) return { error: "Aktifkan minimal satu sesi pernikahan." };

  const optional = (value: unknown) => String(value ?? "").trim() || null;
  const value: WeddingSessionValues = {
    weddingCeremonyEnabled,
    weddingReceptionEnabled,
    weddingCeremonyStart: weddingCeremonyEnabled ? optional(body.weddingCeremonyStart) : null,
    weddingCeremonyEnd: weddingCeremonyEnabled ? optional(body.weddingCeremonyEnd) : null,
    weddingCeremonyVenue: weddingCeremonyEnabled ? optional(body.weddingCeremonyVenue) : null,
    weddingCeremonyAddress: weddingCeremonyEnabled ? optional(body.weddingCeremonyAddress) : null,
    weddingCeremonyMapUrl: weddingCeremonyEnabled ? optional(body.weddingCeremonyMapUrl) : null,
    weddingReceptionStart: weddingReceptionEnabled ? optional(body.weddingReceptionStart) : null,
    weddingReceptionEnd: weddingReceptionEnabled ? optional(body.weddingReceptionEnd) : null,
    weddingReceptionVenue: weddingReceptionEnabled ? optional(body.weddingReceptionVenue) : null,
    weddingReceptionAddress: weddingReceptionEnabled ? optional(body.weddingReceptionAddress) : null,
    weddingReceptionMapUrl: weddingReceptionEnabled ? optional(body.weddingReceptionMapUrl) : null,
  };
  for (const session of readWeddingSessionValues(value)) {
    if (!hhmm.test(session.start)) return { error: `Waktu mulai ${session.label} wajib diisi dengan format HH:mm.` };
    if (session.end && !hhmm.test(session.end)) return { error: `Waktu selesai ${session.label} harus menggunakan format HH:mm.` };
    if (!session.venue) return { error: `Nama lokasi ${session.label} wajib diisi.` };
    if (session.mapUrl && !/^https:\\/\\//i.test(session.mapUrl)) return { error: `Tautan peta ${session.label} harus diawali https://.` };
  }
  return { value };
}
