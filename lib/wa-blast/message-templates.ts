export const WA_MESSAGE_CATEGORIES = [
  { id: "INVITATION", label: "Undangan", english: "Invitation" },
  { id: "RSVP_REMINDER", label: "Pengingat RSVP", english: "RSVP reminder" },
  { id: "EVENT_REMINDER", label: "Pengingat hari acara", english: "Event reminder" },
  { id: "THANK_YOU", label: "Ucapan terima kasih", english: "Thank you" },
] as const;

export type WaMessageCategory = (typeof WA_MESSAGE_CATEGORIES)[number]["id"];
export type WaMessageTemplate = {
  id: string;
  category: WaMessageCategory;
  name: string;
  title: string;
  body: string;
  updatedAt: string;
};

export type WaMessageForm = Pick<WaMessageTemplate, "category" | "name" | "title" | "body">;

export const WA_MESSAGE_DEFAULTS: Record<WaMessageCategory, WaMessageForm> = {
  INVITATION: {
    category: "INVITATION",
    name: "Undangan utama",
    title: "Undangan {acara}",
    body: "Halo {nama},\n\nKami mengundang Anda untuk hadir dalam acara {acara} pada {tanggal} di {lokasi}.\n\nInformasi lengkap dan konfirmasi kehadiran: {link}\n\nTerima kasih.",
  },
  RSVP_REMINDER: {
    category: "RSVP_REMINDER",
    name: "Pengingat konfirmasi",
    title: "Konfirmasi kehadiran · {acara}",
    body: "Halo {nama},\n\nKami ingin mengingatkan untuk mengonfirmasi kehadiran Anda pada acara {acara}, {tanggal}.\n\nSilakan isi RSVP melalui undangan berikut: {link}\n\nTerima kasih.",
  },
  EVENT_REMINDER: {
    category: "EVENT_REMINDER",
    name: "Pengingat hari acara",
    title: "Sampai bertemu di {acara}",
    body: "Halo {nama},\n\nKami menantikan kehadiran Anda di acara {acara} pada {tanggal}, bertempat di {lokasi}.\n\nDetail acara: {link}\n\nSampai bertemu!",
  },
  THANK_YOU: {
    category: "THANK_YOU",
    name: "Terima kasih",
    title: "Terima kasih sudah hadir",
    body: "Halo {nama},\n\nTerima kasih telah menjadi bagian dari acara {acara}. Kehadiran dan doa baik Anda sangat berarti bagi kami.\n\nSalam hangat.",
  },
};

export const WA_MESSAGE_PLACEHOLDERS = ["{nama}", "{acara}", "{tanggal}", "{lokasi}", "{link}"] as const;

export function fillWaMessage(source: string, values: Record<string, string>) {
  return source.replace(/\{(nama|acara|tanggal|lokasi|link)\}/g, (token) => values[token] ?? token);
}
