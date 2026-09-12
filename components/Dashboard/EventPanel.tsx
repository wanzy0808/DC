"use client";

import { useEffect, useState } from "react";
import { CalendarDays, MapPin, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type InvitationType = "WEDDING" | "ADAT_AKAD";
type Invitation = {
  id: string;
  type: InvitationType;
  title: string;
  groomName: string;
  brideName: string;
  venue: string;
  address: string | null;
  mapUrl: string | null;
  timezone: string;
  eventDate: string;
  ceremonyTime: string | null;
  receptionTime: string | null;
  description: string | null;
  eventNotes: string | null;
  isPublished: boolean;
};

type Props = { accent: string; button: string; onSaved: () => void };

const emptyForm = { title: "", groomName: "", brideName: "", venue: "", address: "", mapUrl: "", timezone: "Asia/Jakarta", eventDate: "", ceremonyTime: "", receptionTime: "", description: "", eventNotes: "" };

export default function EventPanel({ accent, button, onSaved }: Props) {
  const [type, setType] = useState<InvitationType>("WEDDING");
  const [form, setForm] = useState(emptyForm);
  const [isPublished, setIsPublished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("Memuat data acara...");

  async function getInvitation(nextType: InvitationType) {
    const response = await fetch(`/api/invitations?type=${nextType}`, { cache: "no-store" });
    const data = await response.json();
    if (!response.ok || !data.invitation) throw new Error(data.error || "Data acara belum dapat dimuat.");
    return data.invitation as Invitation;
  }

  async function load(nextType: InvitationType) {
    setLoading(true);
    setNotice("Memuat data acara...");
    try {
      const invitation = await getInvitation(nextType);
      let groomName = invitation.groomName || "";
      let brideName = invitation.brideName || "";

      // Couple identity is collected once during onboarding. A special-event draft
      // inherits it when empty instead of asking the user to type it again.
      if (nextType === "ADAT_AKAD" && (!groomName || !brideName)) {
        const wedding = await getInvitation("WEDDING");
        groomName ||= wedding.groomName || "";
        brideName ||= wedding.brideName || "";
      }

      setForm({ title: invitation.title || "", groomName, brideName, venue: invitation.venue || "", address: invitation.address || "", mapUrl: invitation.mapUrl || "", timezone: invitation.timezone || "Asia/Jakarta", eventDate: invitation.eventDate ? invitation.eventDate.slice(0, 10) : "", ceremonyTime: invitation.ceremonyTime || "", receptionTime: invitation.receptionTime || "", description: invitation.description || "", eventNotes: invitation.eventNotes || "" });
      setIsPublished(invitation.isPublished);
      setNotice(nextType === "ADAT_AKAD" && (!invitation.groomName || !invitation.brideName) ? "Nama pasangan mengikuti data onboarding." : "Data acara tersimpan di database.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Data acara belum dapat dimuat.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(type); }, [type]);

  function field(name: keyof typeof form, value: string) { setForm((current) => ({ ...current, [name]: value })); }

  async function save() {
    setSaving(true);
    setNotice("Menyimpan data acara...");
    try {
      const response = await fetch("/api/invitations", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, type, isPublished }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Data acara belum dapat disimpan.");
      setIsPublished(Boolean(data.invitation?.isPublished));
      setNotice("Data acara berhasil disimpan.");
      onSaved();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Data acara belum dapat disimpan.");
    } finally { setSaving(false); }
  }

  return <div className="mx-auto max-w-6xl space-y-4 p-5 sm:p-8"><section className="rounded-2xl border border-[#d9cbc2] bg-[#f3ede6] dark:border-white/10 dark:bg-[#121116]"><div className="border-b border-[#d9cbc2] p-5 dark:border-white/10 sm:p-6"><p className={`font-[family-name:var(--font-cinzel)] text-xs font-semibold uppercase tracking-[.16em] ${accent}`}>Rangkaian Acara</p><h2 className="mt-2 font-[family-name:var(--font-cinzel)] text-2xl font-semibold">Satu sumber data untuk setiap undangan</h2><p className="mt-2 max-w-3xl font-[family-name:var(--font-fauna)] text-sm text-[#5A4545] dark:text-white/75">Data pasangan, tanggal, waktu, lokasi, dan deskripsi diisi di sini. Invitation Studio hanya membaca data ini sehingga pengguna tidak perlu menginput ulang data acara.</p><div className="mt-5 flex rounded-2xl bg-[#e9ddd5] p-1.5 dark:bg-white/5"><TypeTab active={type === "WEDDING"} label="Undangan Pernikahan" onClick={() => setType("WEDDING")} /><TypeTab active={type === "ADAT_AKAD"} label="Akad & Sangjit" onClick={() => setType("ADAT_AKAD")} /></div></div><div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-2"><div className="space-y-4"><Field label="Nama acara" value={form.title} onChange={(value) => field("title", value)} placeholder="Contoh: Pernikahan Rio & Lyvia" /><div className="grid gap-4 sm:grid-cols-2"><Field label="Nama pasangan pria" value={form.groomName} onChange={(value) => field("groomName", value)} placeholder="Mengikuti data onboarding" readOnly={type === "WEDDING" || Boolean(form.groomName)} /><Field label="Nama pasangan wanita" value={form.brideName} onChange={(value) => field("brideName", value)} placeholder="Mengikuti data onboarding" readOnly={type === "WEDDING" || Boolean(form.brideName)} /></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Tanggal acara" type="date" value={form.eventDate} onChange={(value) => field("eventDate", value)} /><Field label="Zona waktu" value={form.timezone} onChange={(value) => field("timezone", value)} placeholder="Asia/Jakarta" /></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Waktu akad / pemberkatan" type="time" value={form.ceremonyTime} onChange={(value) => field("ceremonyTime", value)} /><Field label="Waktu resepsi" type="time" value={form.receptionTime} onChange={(value) => field("receptionTime", value)} /></div></div><div className="space-y-4"><Field label="Lokasi / venue" value={form.venue} onChange={(value) => field("venue", value)} placeholder="Nama gedung / venue" /><Field label="Alamat" value={form.address} onChange={(value) => field("address", value)} placeholder="Alamat lengkap acara" /><Field label="Google Maps URL" value={form.mapUrl} onChange={(value) => field("mapUrl", value)} placeholder="https://maps.google.com/..." /><TextArea label="Deskripsi acara" value={form.description} onChange={(value) => field("description", value)} placeholder="Cerita singkat atau informasi acara" rows={5} /><TextArea label="Catatan acara" value={form.eventNotes} onChange={(value) => field("eventNotes", value)} placeholder="Catatan tambahan untuk tamu" rows={3} /></div></div><div className="flex flex-col gap-3 border-t border-[#d9cbc2] px-5 py-4 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between sm:px-6"><div className="flex items-center gap-2 font-[family-name:var(--font-fauna)] text-xs text-[#5A4545] dark:text-white/70">{type === "WEDDING" ? <CalendarDays className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}<span>{loading ? "Memuat..." : notice}</span></div><Button disabled={loading || saving} onClick={save} className={`rounded-xl ${button} font-[family-name:var(--font-fauna)] text-sm font-semibold text-white`}><Save className="mr-2 h-4 w-4" />{saving ? "Menyimpan..." : "Simpan Data Acara"}</Button></div></section></div>;
}

function TypeTab({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) { return <button onClick={onClick} className={`flex-1 rounded-xl px-4 py-2.5 font-[family-name:var(--font-fauna)] text-xs font-semibold transition ${active ? "bg-white text-[#7A1C25] shadow-sm dark:bg-[#1d171b] dark:text-[#E8A5AE]" : "text-[#6c5a55] hover:text-[#3d2c28] dark:text-white/60 dark:hover:text-white"}`}>{label}</button>; }
function Field({ label, value, onChange, placeholder = "", type = "text", readOnly = false }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string; readOnly?: boolean }) { return <label className="block"><span className="mb-1.5 block font-[family-name:var(--font-fauna)] text-xs font-semibold">{label}</span><Input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} readOnly={readOnly} className={`border-[#d8cbc2] bg-white font-[family-name:var(--font-fauna)] dark:border-white/10 dark:bg-black/20 ${readOnly ? "cursor-not-allowed opacity-75" : ""}`} /></label>; }
function TextArea({ label, value, onChange, placeholder, rows }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; rows: number }) { return <label className="block"><span className="mb-1.5 block font-[family-name:var(--font-fauna)] text-xs font-semibold">{label}</span><textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows={rows} className="w-full resize-y rounded-xl border border-[#d8cbc2] bg-white px-3 py-2.5 font-[family-name:var(--font-fauna)] text-sm outline-none dark:border-white/10 dark:bg-black/20" /></label>; }
