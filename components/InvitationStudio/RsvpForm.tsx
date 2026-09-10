"use client";

import { FormEvent, useMemo, useState } from "react";
import { CalendarPlus, CheckCircle2, Download, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function googleCalendarUrl({ title, eventDate, start, end, venue, description }: { title: string; eventDate: string; start?: string | null; end?: string | null; venue?: string | null; description?: string | null }) {
  const date = eventDate ? new Date(eventDate) : null;
  if (!date || Number.isNaN(date.getTime())) return "#";
  const ymd = date.toISOString().slice(0, 10).replaceAll("-", "");
  const time = (value?: string | null) => (value && /^\d{2}:\d{2}$/.test(value) ? value.replace(":", "") + "00" : "000000");
  const dates = `${ymd}T${time(start)}/${ymd}T${time(end || start)}`;
  const params = new URLSearchParams({ action: "TEMPLATE", text: title || "Wedding", dates, location: venue || "", details: description || "" });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export default function RsvpForm({ slug, guestId, guestName, eventDate, venue, title, start, end, description }: { slug: string; guestId?: string; guestName?: string; eventDate?: string | Date; venue?: string | null; title?: string | null; start?: string | null; end?: string | null; description?: string | null }) {
  const [form, setForm] = useState({ name: guestName ?? "", phone: "", status: "ATTENDING", plusOnes: "0" });
  const [message, setMessage] = useState("");
  const [ticketGuest, setTicketGuest] = useState<{ id: string; name: string; phone?: string | null; plusOnes: number } | null>(null);
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const ticketUrl = useMemo(() => qrToken ? `https://api.qrserver.com/v1/create-qr-code/?size=420x420&margin=12&data=${encodeURIComponent(qrToken)}` : "", [qrToken]);
  const calendarUrl = useMemo(() => googleCalendarUrl({ title: title || "The Wedding", eventDate: String(eventDate || ""), start, end, venue, description }), [title, eventDate, start, end, venue, description]);

  async function downloadTicket() {
    if (!ticketGuest || !qrToken) return;
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>DC Wedding Ticket - ${ticketGuest.name}</title><style>body{font-family:Georgia,serif;background:#f7f0ea;padding:40px;color:#2c2020}.ticket{max-width:420px;margin:auto;background:#fffaf6;padding:32px;border:1px solid #dec9c1;text-align:center}.qr{width:260px;height:260px;margin:24px auto}.meta{font:14px Arial,sans-serif;line-height:1.6;color:#604b4b}</style></head><body><div class="ticket"><div style="font:11px Arial,sans-serif;letter-spacing:.25em;text-transform:uppercase;color:#7A1C25">Digital Ticket</div><h1>${ticketGuest.name.replaceAll("<", "&lt;")}</h1><div class="meta">${1 + ticketGuest.plusOnes} pax<br>${(title || "The Wedding").replaceAll("<", "&lt;")}<br>${(venue || "").replaceAll("<", "&lt;")}</div><img class="qr" src="${ticketUrl}" alt="QR Check-in"><div class="meta">Tunjukkan QR ini kepada usher pada hari acara.</div></div></body></html>`;
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `dc-wedding-ticket-${ticketGuest.id}.html`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    try {
      const response = await fetch(`/api/invite/${slug}/rsvp`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, guestId, plusOnes: Number(form.plusOnes) }) });
      const data = await response.json();
      if (!response.ok) { setMessage(data.error ?? "RSVP belum dapat disimpan."); return; }
      setTicketGuest(data.guest);
      setQrToken(data.qrToken ?? null);
      setMessage(form.status === "ATTENDING" ? "Konfirmasi hadir berhasil." : "Konfirmasi kehadiran tersimpan.");
    } catch { setMessage("Koneksi bermasalah. Silakan coba lagi."); }
    finally { setSubmitting(false); }
  }

  return (
    <section className="mx-auto max-w-xl border border-[#9b5b51]/20 bg-[#f3ede6] p-6 text-left shadow-sm dark:border-white/10 dark:bg-[#151116]">
      {ticketGuest && qrToken ? (
        <div className="text-center">
          <CheckCircle2 className="mx-auto h-8 w-8 text-[#7A1C25] dark:text-[#E8A5AE]" />
          <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#7A1C25] dark:text-[#E8A5AE]">Smart RSVP berhasil</p>
          <h2 className="mt-2 font-serif text-3xl">Terima kasih, {ticketGuest.name}.</h2>
          <p className="mt-2 text-sm text-[#5f4a4a] dark:text-white/65">Simpan Digital Ticket ini. QR di bawah adalah tiket unik untuk check-in hari H.</p>
          <div className="mx-auto mt-6 w-fit rounded-2xl border border-[#9b5b51]/20 bg-white p-3 dark:bg-[#f8f1ea]"><img src={ticketUrl} alt="QR Digital Ticket" className="h-64 w-64" /></div>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <a href={ticketUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#7A1C25] px-4 py-3 text-xs font-medium text-white"><QrCode className="h-4 w-4" />Simpan QR</a>
            <Button type="button" onClick={downloadTicket} variant="outline" className="h-auto rounded-xl border-[#7A1C25]/20 py-3 text-xs"><Download className="h-4 w-4" />Download Ticket</Button>
          </div>
          <a href={calendarUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#7A1C25]/20 px-4 py-3 text-xs text-[#7A1C25] dark:text-[#E8A5AE]"><CalendarPlus className="h-4 w-4" />Tambah ke Google Calendar</a>
          <p className="mt-4 text-[10px] text-[#6c5a5a] dark:text-white/50">Tiket tetap dapat ditunjukkan langsung dari ponsel saat tiba di venue.</p>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div><p className="text-[10px] uppercase tracking-[0.25em] text-[#9b5b51]">Smart RSVP</p><h2 className="mt-2 font-serif text-2xl">Konfirmasi Kehadiran</h2>{guestName && <p className="mt-1 text-sm opacity-70">Untuk: {guestName}</p>}</div>
          {!guestId && <div className="grid gap-3 sm:grid-cols-2"><label className="text-xs font-medium">Nama<Input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="mt-1.5" placeholder="Nama lengkap" required /></label><label className="text-xs font-medium">No. WhatsApp<Input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} className="mt-1.5" placeholder="08xxxxxxxxxx" required /></label></div>}
          <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} className="w-full rounded-md border border-black/10 bg-transparent px-3 py-2.5 text-sm dark:border-white/10"><option value="ATTENDING">Saya akan hadir</option><option value="NOT_ATTENDING">Saya tidak hadir</option><option value="TENTATIVE">Saya masih tentatif</option></select>
          <fieldset className="space-y-2"><legend className="text-sm font-medium">Membawa plus one?</legend><div className="flex gap-5 text-sm"><label className="flex items-center gap-2"><input type="radio" name="plusOnes" value="1" checked={form.plusOnes === "1"} onChange={e=>setForm({...form,plusOnes:e.target.value})} />Ya</label><label className="flex items-center gap-2"><input type="radio" name="plusOnes" value="0" checked={form.plusOnes === "0"} onChange={e=>setForm({...form,plusOnes:e.target.value})} />Tidak</label></div></fieldset>
          <Button disabled={submitting} className="rounded-xl bg-[#7A1C25] px-5 py-3 text-xs text-white hover:bg-[#5E141C]">{submitting ? "Menyimpan..." : "Konfirmasi Kehadiran"}</Button>
          {message && <p className="text-sm text-[#5f4a4a] dark:text-white/65">{message}</p>}
        </form>
      )}
    </section>
  );
}
