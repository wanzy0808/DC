import type { RsvpTicketGuest } from "@/components/InvitationStudio/rsvp-types";

export function buildGoogleCalendarUrl({
  title,
  eventDate,
  start,
  end,
  venue,
  description,
}: {
  title: string;
  eventDate: string;
  start?: string | null;
  end?: string | null;
  venue?: string | null;
  description?: string | null;
}) {
  const date = eventDate ? new Date(eventDate) : null;
  if (!date || Number.isNaN(date.getTime())) return "#";

  const ymd = date.toISOString().slice(0, 10).replaceAll("-", "");
  const time = (value?: string | null) =>
    value && /^\d{2}:\d{2}$/.test(value)
      ? value.replace(":", "") + "00"
      : "000000";

  const dates = `${ymd}T${time(start)}/${ymd}T${time(end || start)}`;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title || "Acara",
    dates,
    location: venue || "",
    details: description || "",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function buildRsvpTicketQrUrl(qrToken: string | null) {
  return qrToken
    ? `https://api.qrserver.com/v1/create-qr-code/?size=420x420&margin=12&data=${encodeURIComponent(qrToken)}`
    : "";
}

function escapeTicketHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function downloadRsvpTicket({
  ticketGuest,
  ticketUrl,
  title,
  venue,
}: {
  ticketGuest: RsvpTicketGuest;
  ticketUrl: string;
  title?: string | null;
  venue?: string | null;
}) {
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>DC Organizer Ticket - ${escapeTicketHtml(ticketGuest.name)}</title><style>body{font-family:Georgia,serif;background:#f7f0ea;padding:40px;color:#2c2020}.ticket{max-width:420px;margin:auto;background:#fffaf6;padding:32px;border:1px solid #dec9c1;text-align:center}.qr{width:260px;height:260px;margin:24px auto}.meta{font:14px Arial,sans-serif;line-height:1.6;color:#604b4b}</style></head><body><div class="ticket"><div style="font:11px Arial,sans-serif;letter-spacing:.25em;text-transform:uppercase;color:#7A1C25">Digital Ticket</div><h1>${escapeTicketHtml(ticketGuest.name)}</h1><div class="meta">${1 + ticketGuest.plusOnes} pax<br>${escapeTicketHtml(title || "Acara")}<br>${escapeTicketHtml(venue || "")}</div><img class="qr" src="${ticketUrl}" alt="QR Check-in"><div class="meta">Tunjukkan QR ini kepada usher pada hari acara.</div></div></body></html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `dc-organizer-ticket-${ticketGuest.id}.html`;
  anchor.click();
  URL.revokeObjectURL(url);
}
