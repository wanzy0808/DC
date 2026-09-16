"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, CreditCard, PenLine, Plus, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Invitation = {
  id: string;
  type: "WEDDING" | "ADAT_AKAD";
  title: string;
  venue: string;
  address: string | null;
  mapUrl: string | null;
  timezone: string;
  eventDate: string;
  eventConfigured: boolean;
  ceremonyTime: string | null;
  receptionTime: string | null;
  description: string | null;
  eventNotes: string | null;
  isPublished: boolean;
  accessPaid: boolean;
  createdAt: string;
};

type Props = { accent: string; onSaved: () => void };

const emptyForm = {
  title: "",
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
  return [...items].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

function toForm(invitation: Invitation) {
  return {
    title: invitation.title || "",
    venue: invitation.venue || "",
    address: invitation.address || "",
    mapUrl: invitation.mapUrl || "",
    timezone: invitation.timezone || "Asia/Jakarta",
    eventDate:
      invitation.eventConfigured && invitation.eventDate
        ? invitation.eventDate.slice(0, 10)
        : "",
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [notice, setNotice] = useState("Memuat...");

  function activate(invitation: Invitation) {
    setActiveId(invitation.id);
    setForm(toForm(invitation));
  }

  async function load(preferredId?: string) {
    setLoading(true);
    setNotice("Memuat...");
    try {
      const response = await fetch("/api/invitations?all=1", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Data acara belum dapat dimuat.");
      const next = sortInvitations((data.invitations ?? []) as Invitation[]);
      setEvents(next);
      const active =
        next.find((item) => item.id === (preferredId || activeId)) || next[0];
      if (active) activate(active);
      else {
        setActiveId("");
        setForm(emptyForm);
      }
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

  async function addEvent() {
    setCreating(true);
    setNotice("Membuat acara...");
    try {
      const response = await fetch("/api/invitations", { method: "POST" });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || "Acara baru belum dapat dibuat.");
      await load(data.invitation?.id);
      setNotice("Acara baru siap diisi");
      onSaved();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Acara baru belum dapat dibuat.");
    } finally {
      setCreating(false);
    }
  }

  async function save() {
    if (!activeId) return;
    if (!form.title.trim()) {
      setNotice("Nama acara wajib diisi.");
      return;
    }

    setSaving(true);
    setNotice("Menyimpan...");
    try {
      const response = await fetch("/api/invitations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, id: activeId, eventConfigured: true }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Data acara belum dapat disimpan.");
      const updated = data.invitation as Invitation;
      setEvents((current) =>
        sortInvitations(
          current.map((item) => (item.id === updated.id ? updated : item)),
        ),
      );
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
  const purchaseHref = active
    ? `/packages?package=INVITATION_BASIC&invitationId=${encodeURIComponent(active.id)}`
    : "/packages?package=INVITATION_BASIC";
  const activeTitle = form.title.trim() || `Acara ${activeIndex + 1}`;

  return (
    <div className="mx-auto w-[min(92vw,1400px)] min-w-0 px-1 pb-16 pt-7 sm:pt-8">
      <section className="bg-background">
        <div className="rounded-xl border border-border/80 bg-foreground/[0.018] p-4 sm:flex sm:items-center sm:justify-between sm:gap-5">
          <div className="min-w-0">
            <p className="font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
              {active ? `Acara ${String(activeIndex + 1).padStart(2, "0")}` : "Acara baru"}
            </p>
            <h2 className="mt-1 truncate font-[family-name:var(--font-cinzel)] text-lg font-semibold text-foreground">
              {active ? activeTitle : "Belum ada acara"}
            </h2>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 sm:mt-0 sm:justify-end">
            {active && (
              <span
                className={`rounded-lg border border-primary/15 bg-primary/[0.045] px-3 py-2 font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.12em] ${accent}`}
              >
                {active.accessPaid ? "Undangan aktif" : "Belum dibeli"}
              </span>
            )}
            {active && !active.accessPaid && (
              <Button asChild size="sm">
                <Link href={purchaseHref}>
                  <CreditCard className="h-4 w-4" />
                  Aktifkan Rp150.000
                </Link>
              </Button>
            )}
            {active && (
              <Button asChild size="sm">
                <Link href={studioHref}>
                  <PenLine className="h-4 w-4" />
                  Buka Studio
                </Link>
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              onClick={addEvent}
              disabled={loading || creating}
            >
              <Plus className="h-4 w-4" />
              {creating ? "Membuat..." : "Tambah acara"}
            </Button>
          </div>
        </div>

        {events.length > 0 && (
          <label className="mt-3 block max-w-md rounded-xl border border-border/80 bg-foreground/[0.018] p-3">
            <span className="mb-1.5 block font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
              Acara aktif
            </span>
            <select
              value={activeId}
              onChange={(event) => selectEvent(event.target.value)}
              disabled={loading || saving}
              aria-label="Pilih acara"
              className="w-full px-3 text-sm outline-none"
            >
              {events.map((item, index) => (
                <option key={item.id} value={item.id}>
                  {item.title.trim() || `Acara ${index + 1}`}
                </option>
              ))}
            </select>
          </label>
        )}

        {!active ? (
          <div className="mt-4 rounded-xl border border-border/80 bg-foreground/[0.018] p-6 text-sm text-muted-foreground">
            Belum ada acara. Klik <strong className="text-foreground">Tambah acara</strong> untuk membuat rangkaian pertama.
          </div>
        ) : (
          <>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div className="min-w-0 rounded-xl border border-border/80 bg-foreground/[0.018] p-4 sm:p-5">
                <SectionLabel>Detail acara</SectionLabel>
                <div className="mt-4 space-y-4">
                  <Field
                    label="Nama acara"
                    value={form.title}
                    onChange={(value) => field("title", value)}
                    placeholder="Contoh: Birthday Dinner, Baby Shower, Wedding Reception"
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label="Tanggal"
                      type="date"
                      value={form.eventDate}
                      onChange={(value) => field("eventDate", value)}
                    />
                    <Field
                      label="Zona waktu"
                      value={form.timezone}
                      onChange={(value) => field("timezone", value)}
                      placeholder="Asia/Jakarta"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label="Waktu mulai"
                      type="time"
                      value={form.ceremonyTime}
                      onChange={(value) => field("ceremonyTime", value)}
                    />
                    <Field
                      label="Waktu selesai"
                      type="time"
                      value={form.receptionTime}
                      onChange={(value) => field("receptionTime", value)}
                    />
                  </div>
                  <TextArea
                    label="Deskripsi"
                    value={form.description}
                    onChange={(value) => field("description", value)}
                    placeholder="Informasi singkat acara"
                    rows={4}
                  />
                </div>
              </div>

              <div className="min-w-0 rounded-xl border border-border/80 bg-foreground/[0.018] p-4 sm:p-5">
                <SectionLabel>Lokasi & catatan</SectionLabel>
                <div className="mt-4 space-y-4">
                  <Field
                    label="Venue"
                    value={form.venue}
                    onChange={(value) => field("venue", value)}
                    placeholder="Nama venue"
                  />
                  <Field
                    label="Alamat"
                    value={form.address}
                    onChange={(value) => field("address", value)}
                    placeholder="Alamat lengkap"
                  />
                  <Field
                    label="Google Maps URL"
                    value={form.mapUrl}
                    onChange={(value) => field("mapUrl", value)}
                    placeholder="https://maps.google.com/..."
                  />
                  <TextArea
                    label="Catatan"
                    value={form.eventNotes}
                    onChange={(value) => field("eventNotes", value)}
                    placeholder="Catatan tambahan"
                    rows={4}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 rounded-xl border border-border/80 bg-foreground/[0.018] p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/[0.08] text-primary">
                  <CalendarDays className="h-4 w-4" />
                </span>
                <span className="truncate">
                  {events.length} acara · {notice}
                </span>
              </div>
              <Button disabled={loading || saving || !activeId} onClick={save} size="sm">
                <Save className="h-4 w-4" />
                {saving ? "Menyimpan acara..." : "Simpan acara"}
              </Button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
      {children}
    </p>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold">{label}</span>
      <Input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  rows,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  rows: number;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full resize-y px-3 py-2.5 text-sm outline-none"
      />
    </label>
  );
}
