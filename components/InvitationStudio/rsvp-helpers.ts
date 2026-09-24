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

export function buildRsvpTicketQrUrl(slug: string, qrToken: string | null) {
  return qrToken
    ? `/api/invite/${encodeURIComponent(slug)}/rsvp/qr?token=${encodeURIComponent(qrToken)}`
    : "";
}
