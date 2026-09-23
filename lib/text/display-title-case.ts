/** Format standalone UI names/option labels without changing stored customer values. */
const canonicalWords: Record<string, string> = {
  dc: "DC",
  rsvp: "RSVP",
  vip: "VIP",
  vvip: "VVIP",
  qr: "QR",
  wa: "WA",
  whatsapp: "WhatsApp",
  id: "ID",
  en: "EN",
};

/** Apply Title Case only when rendering a standalone name, heading or dropdown option. */
export function displayTitleCase(value: string): string {
  return value.replace(
    /(^|[^\p{L}\p{N}])([\p{L}][\p{L}\p{M}\p{N}]*)/gu,
    (_match, separator: string, word: string) =>
      separator + (canonicalWords[word.toLocaleLowerCase("id-ID")] ?? word[0].toLocaleUpperCase("id-ID") + word.slice(1)),
  );
}
