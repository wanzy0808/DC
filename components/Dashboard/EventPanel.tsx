"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, PenLine, Plus, Save } from "lucide-react";
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
  createdAt: string;
};
type Props = { accent: string; onSaved: () => void };

const MAX_SEQUENCES = 3;
const emptyForm = {
  title: "",
  groomName: "",
  brideName: "",
  venue: "",
  address: "",
  mapUrl: "",
  timezone: "Asia/Jakarta",
  eventDate: "",
  ceremonyTime: "",
  receptionTime: "",
  description: "",
  eventNotes: "",
};

function sortInvitations(items: Invitation[]) {
  return [...items].sort((a, b) => {
    if (a.type === "WEDDING" && b.type !== "WEDDING") return -1;
    if (a.type !== "WEDDING" && b.type === "WEDDING") return 1;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
}

function toForm(invitation: Invitation) {
  return {
    title: invitation.title || "",
    groomName: invitation.groomName || "",
    brideName: invitation.brideName || "",
    venue: invitation.venue || "",
    address: invitation.address || "",
    mapUrl: invitation.mapUrl || "",
    timezone: invitation.timezone || "Asia/Jakarta",
    eventDate: invitation.eventDate ? invitation.eventDate.slice(0, 10) : "",
    ceremonyTime: invitation.ceremonyTime || "",
    receptionTime: invitation.receptionTime || "",
    description: invitation.description || "",
    eventNotes: invitation.eventNotes || "",
  };
}

export default function EventPanel({ accent, onSaved }: Props) {
  const [events, setEvents] = useState<Invitation[]>([]);
  const [activeId, setActiveId] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [isPublished, setIsPublished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [notice, setNotice] = useState("Memuat...");

  function activate(invitation: Invitation) {
    setActiveId(invitation.id);
    setForm(toForm(invitation));
    setIsPublished(invitation.isPublished);
  }

  async function load(preferredId?: string) {
    setLoading(true);
    setNotice("Memuat...");
    try {
      const response = await fetch("/api/invitations?all=1", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Data acara belum dapat dimuat.");
      const next = sortInvitations((data.invitations ?? []) as Invitation[]).slice(0, MAX_SEQUENCES);
      setEvents(next);
      const active = next.find((item) => item.id === (preferredId || activeId)) || next[0];
      if (active) activate(active);
      setNotice("Tersinkron");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Data acara belum dapat dimuat.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  function field(name: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function selectEvent(id: string) {
    const invitation = events.find((item) => item.id === id);
    if (invitation) activate(invitation);
  }

  async function addSequence() {
    if (events.length >= MAX_SEQUENCES) return;
    setCreating(true);
    setNotice("Membuat rangkaian...");
    try {
      const response = await fetch("/api/invitations", { method: "POST" });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || "Rangkaian baru belum dapat dibuat.");
      await load(data.invitation?.id);
      setNotice("Rangkaian baru siap diedit");
      onSaved();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Rangkaian baru belum dapat dibuat.");
    } finally {
      setCreating(false);
    }
  }

  async function save() {
    if (!activeId) return;
    setSaving(true);
    setNotice("Menyimpan...");
    try {
      const response = await fetch("/api/invitations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, id: activeId, isPublished }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Data acara belum dapat disimpan.");
      const updated = data.invitation as Invitation;
      setEvents((current) => sortInvitations(current.map((item) => (item.id === updated.id ? updated : item))));
      activate(updated);
      setNotice("Tersimpan");
      onSaved();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Data acara belum dapat disimpan.");
    } finally {
      setSaving(false);
    }
  }

  const active = events.find((item) => item.id === activeId) || null;
  const activeIndex = Math.max(0, events.findIndex((item) => item.id === activeId));
  const studioHref = active
    ? `/dashboard/editor?type=${active.type}&invitationId=${active.id}`
    : "/dashboard/editor?type=WEDDING";
  const activeTitle = form.title.trim() || `Rangkaian ${activeIndex + 1}`;

  return (
    <div className="mx-auto w-[min(92vw,1400px)] min-w-0 px-1 pb-16 pt-7 sm:pt-8">
      <section className="bg-background">
        <div className="rounded-xl border border-border/80 bg-foreground/[0.018] p-4 sm:flex sm:items-center sm:justify-between sm:gap-5">
          <div className="min-w-0">
            <p className="font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
              Rangkaian {String(activeIndex + 1).padStart(2, "0")} / {MAX_SEQUENCES}
            </p>
            <h2 className="mt-1 truncate font-[family-name:var(--font-cinzel)] text-lg font-semibold text-foreground">
              {activeTitle}
            </h2>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 sm:mt-0 sm:justify-end">
            <span className={`rounded-lg border border-primary/15 bg-primary/[0.045] px-3 py-2 font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.12em] ${accent}`}>
              {loading ? "Loading" : notice}
            </span>
            <Button asChild size="sm">
              <Link href={studioHref}>
                <PenLine className="h-4 w-4" />
                Buat undangan di Studio
              </Link>
            </Button>
            {events.length < MAX_SEQUENCES && (
              <Button type="button" size="sm" onClick={addSequence} disabled={loading || creating}>
                <Plus className="h-4 w-4" />
                {creating ? "Membuat..." : "Tambah rangkaian"}
              </Button>
            )}
          </div>
        </div>

        {events.length > 1 && (
          <label className="mt-3 block max-w-md rounded-xl border border-border/80 bg-foreground/[0.018] p-3">
            <span className="mb-1.5 block font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
              Rangkaian aktif
            </span>
            <select
              value={activeId}
              onChange={(event) => selectEvent(event.target.value)}
              disabled={loading || saving}
              aria-label="Pilih rangkaian acara"
              className="w-full px-3 text-sm outline-none"
            >
              {events.map((item, index) => (
                <option key={item.id} value={item.id}>
                  {item.title.trim() || `Rangkaian ${index + 1}`}
                </option>
              ))}
            </select>
          </label>
        )}

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="min-w-0 rounded-xl border border-border/80 bg-foreground/[0.018] p-4 sm:p-5">
            <SectionLabel>Detail acara</SectionLabel>
            <div className="mt-4 space-y-4">
              <Field label="Nama acara" value={form.title} onChange={(value) => field("title", value)} placeholder="Nama acara" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Pasangan pria" value={form.groomName} onChange={() => undefined} placeholder="Data onboarding" readOnly />
                <Field label="Pasangan wanita" value={form.brideName} onChange={() => undefined} placeholder="Data onboarding" readOnly />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Tanggal" type="date" value={form.eventDate} onChange={(value) => field("eventDate", value)} />
                <Field label="Zona waktu" value={form.timezone} onChange={(value) => field("timezone", value)} placeholder="Asia/Jakarta" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Akad / pemberkatan" type="time" value={form.ceremonyTime} onChange={(value) => field("ceremonyTime", value)} />
                <Field label="Resepsi" type="time" value={form.receptionTime} onChange={(value) => field("receptionTime", value)} />
              </div>
            </div>
          </div>

          <div className="min-w-0 rounded-xl border border-border/80 bg-foreground/[0.018] p-4 sm:p-5">
            <SectionLabel>Lokasi</SectionLabel>
            <div className="mt-4 space-y-4">
              <Field label="Venue" value={form.venue} onChange={(value) => field("venue", value)} placeholder="Nama venue" />
              <Field label="Alamat" value={form.address} onChange={(value) => field("address", value)} placeholder="Alamat lengkap" />
              <Field label="Google Maps URL" value={form.mapUrl} onChange={(value) => field("mapUrl", value)} placeholder="https://maps.google.com/..." />
              <TextArea label="Deskripsi" value={form.description} onChange={(value) => field("description", value)} placeholder="Informasi acara" rows={4} />
              <TextArea label="Catatan" value={form.eventNotes} onChange={(value) => field("eventNotes", value)} placeholder="Catatan tambahan" rows={3} />
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-border/80 bg-foreground/[0.018] p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/[0.08] text-primary">
              <CalendarDays className="h-4 w-4" />
            </span>
            <span className="truncate">{events.length} / {MAX_SEQUENCES} rangkaian · {notice}</span>
          </div>
          <Button disabled={loading || saving || !activeId} onClick={save} size="sm">
            <Save className="h-4 w-4" />
            {saving ? "Menyimpan rangkaian..." : "Simpan rangkaian"}
          </Button>
        </div>
      </section>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.14em] text-muted-foreground">{children}</p>;
}

function Field({ label, value, onChange, placeholder = "", type = "text", readOnly = false }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string; readOnly?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold">{label}</span>
      <Input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} readOnly={readOnly} className={readOnly ? "cursor-not-allowed" : ""} />
    </label>
  );
}

function TextArea({ label, value, onChange, placeholder, rows }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; rows: number }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold">{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows={rows} className="w-full resize-y px-3 py-2.5 text-sm outline-none" />
    </label>
  );
}