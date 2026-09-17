"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Clock3,
  MapPin,
  PenLine,
  Plus,
  Save,
  UserRound,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  buildEventTitle,
  eventCategoryOptions,
  getEventCategory,
  getIndonesiaTimezone,
  indonesiaTimezones,
  isEventCategory,
  type EventCategory,
} from "@/lib/events/catalog";

type Invitation = {
  id: string;
  type: "WEDDING" | "ADAT_AKAD";
  title: string;
  eventCategory: EventCategory;
  groomName: string;
  brideName: string;
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
  templateKey: string;
  isPublished: boolean;
  accessPaid: boolean;
  createdAt: string;
};

type Props = { accent: string; onSaved: () => void };
type EditorMode = "closed" | "new" | "edit";

type EventForm = {
  eventCategory: EventCategory | "";
  customTitle: string;
  groomName: string;
  brideName: string;
  venue: string;
  address: string;
  mapUrl: string;
  timezone: string;
  eventDate: string;
  ceremonyTime: string;
  receptionTime: string;
  description: string;
  eventNotes: string;
};

const emptyForm: EventForm = {
  eventCategory: "",
  customTitle: "",
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
  return [...items].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

function isBlankDraft(invitation: Invitation) {
  return (
    !invitation.eventConfigured &&
    !invitation.title.trim() &&
    !invitation.venue.trim() &&
    !invitation.groomName.trim() &&
    !invitation.brideName.trim()
  );
}

function toForm(invitation: Invitation): EventForm {
  const blankDraft = isBlankDraft(invitation);
  const category = isEventCategory(invitation.eventCategory)
    ? invitation.eventCategory
    : "OTHER";

  return {
    eventCategory: blankDraft ? "" : category,
    customTitle: !blankDraft && category === "OTHER" ? invitation.title || "" : "",
    groomName: invitation.groomName || "",
    brideName: invitation.brideName || "",
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

function formatDateId(value: string) {
  if (!value) return "Tanggal belum dipilih";
  const date = new Date(`${value}T12:00:00+07:00`);
  if (Number.isNaN(date.getTime())) return "Tanggal belum dipilih";
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

function formatTime(value: string) {
  return value ? value.replace(":", ".") : "--.--";
}

export default function EventPanel({ accent, onSaved }: Props) {
  const [events, setEvents] = useState<Invitation[]>([]);
  const [activeId, setActiveId] = useState("");
  const [editorMode, setEditorMode] = useState<EditorMode>("closed");
  const [form, setForm] = useState<EventForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("Memuat...");
  const editorRef = useRef<HTMLElement | null>(null);

  const configuredCount = useMemo(
    () => events.filter((event) => event.eventConfigured).length,
    [events],
  );

  function activate(invitation: Invitation) {
    setActiveId(invitation.id);
    setForm(toForm(invitation));
    setEditorMode(invitation.eventConfigured ? "edit" : "new");
    setNotice(invitation.eventConfigured ? "Siap diedit" : "Lengkapi acara ini.");
  }

  function closeEditor() {
    setActiveId("");
    setForm(emptyForm);
    setEditorMode("closed");
    setNotice("Tersinkron");
  }

  async function load(preferredId?: string) {
    setLoading(true);
    setNotice("Memuat...");
    try {
      const response = await fetch("/api/invitations?all=1", { cache: "no-store" });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || "Data acara belum dapat dimuat.");
      const next = sortInvitations((data?.invitations ?? []) as Invitation[]);
      setEvents(next);
      if (preferredId) {
        const preferred = next.find((item) => item.id === preferredId);
        if (preferred) activate(preferred);
      } else if (activeId) {
        const current = next.find((item) => item.id === activeId);
        if (current) activate(current);
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

  useEffect(() => {
    if (editorMode === "closed") return;
    const frame = window.requestAnimationFrame(() => {
      editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeId, editorMode]);

  function field(name: keyof EventForm, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function startNewEvent() {
    if (saving) return;
    setActiveId("");
    setForm(emptyForm);
    setEditorMode("new");
    setNotice("Isi data acara lalu simpan.");
  }

  function selectCategory(value: string) {
    if (!isEventCategory(value)) return;
    const mode = getEventCategory(value).nameMode;
    setForm((current) => ({
      ...current,
      eventCategory: value,
      customTitle: value === "OTHER" ? current.customTitle : "",
      brideName: mode === "couple" ? current.brideName : "",
      groomName: mode === "optional" ? "" : current.groomName,
    }));
  }

  async function save() {
    if (!form.eventCategory) {
      setNotice("Pilih nama acara terlebih dahulu.");
      return;
    }

    const category = getEventCategory(form.eventCategory);
    if (category.nameMode === "couple" && (!form.groomName.trim() || !form.brideName.trim())) {
      setNotice("Lengkapi kedua nama untuk acara ini.");
      return;
    }
    if (category.nameMode === "single" && !form.groomName.trim()) {
      setNotice("Nama utama acara wajib diisi.");
      return;
    }
    if (form.eventCategory === "OTHER" && !form.customTitle.trim()) {
      setNotice("Nama event lainnya wajib diisi.");
      return;
    }
    if (!form.eventDate) {
      setNotice("Tanggal acara wajib diisi.");
      return;
    }
    if (!form.ceremonyTime) {
      setNotice("Waktu mulai wajib diisi.");
      return;
    }
    if (!form.venue.trim()) {
      setNotice("Nama tempat wajib diisi.");
      return;
    }

    setSaving(true);
    setNotice("Menyimpan...");
    try {
      const title = buildEventTitle(
        form.eventCategory,
        form.groomName,
        form.brideName,
        form.customTitle,
      );
      const creatingNew = editorMode === "new" && !activeId;
      const response = await fetch("/api/invitations", {
        method: creatingNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(activeId ? { id: activeId } : {}),
          eventCategory: form.eventCategory,
          title,
          groomName: form.groomName,
          brideName: form.brideName,
          venue: form.venue,
          address: form.address,
          mapUrl: form.mapUrl,
          timezone: form.timezone,
          eventDate: form.eventDate,
          ceremonyTime: form.ceremonyTime,
          receptionTime: form.receptionTime,
          description: form.description,
          eventNotes: form.eventNotes,
          eventConfigured: true,
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.invitation?.id) {
        throw new Error(data?.error || "Data acara belum dapat disimpan.");
      }
      const savedId = String(data.invitation.id);
      await load(savedId);
      setNotice("Acara tersimpan. Sekarang buat undangan.");
      onSaved();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Data acara belum dapat disimpan.");
    } finally {
      setSaving(false);
    }
  }

  const category = form.eventCategory ? getEventCategory(form.eventCategory) : null;
  const active = events.find((item) => item.id === activeId) || null;
  const timezone = getIndonesiaTimezone(form.timezone);
  const previewTitle = form.eventCategory
    ? buildEventTitle(form.eventCategory, form.groomName, form.brideName, form.customTitle)
    : "Acara baru";
  const showTopNotice =
    editorMode === "closed" && notice !== "Tersinkron" && notice !== "Memuat...";

  return (
    <div className="mx-auto w-[min(92vw,1400px)] min-w-0 px-1 pb-16 pt-7 sm:pt-8">
      <section className="rounded-xl border border-border/80 bg-foreground/[0.018] p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
              Rangkaian acara
            </p>
            <h2 className="mt-1 font-[family-name:var(--font-cinzel)] text-lg font-semibold text-foreground">
              {events.length ? `${configuredCount} acara · ${events.length - configuredCount} draft` : "Belum ada acara"}
            </h2>
          </div>
          <Button type="button" size="sm" onClick={startNewEvent} disabled={saving}>
            <Plus className="h-4 w-4" />
            Tambah acara
          </Button>
        </div>

        {showTopNotice && (
          <div
            className="mt-3 rounded-lg border border-primary/15 bg-primary/[0.035] px-3 py-2 text-xs text-muted-foreground"
            role="status"
          >
            {notice}
          </div>
        )}

        {events.length ? (
          <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {events.map((event, index) => {
              const studioHref = `/dashboard/editor?type=${event.type}&invitationId=${event.id}`;
              const draft = !event.eventConfigured;
              const hasDesign = Boolean(event.templateKey?.trim());
              return (
                <article key={event.id} className="rounded-xl border border-border/75 bg-background/80 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-[family-name:var(--font-dm-mono)] text-[8px] uppercase tracking-[0.12em] text-muted-foreground">
                        Acara {String(index + 1).padStart(2, "0")}
                      </p>
                      <h3 className="mt-1 truncate text-sm font-semibold text-foreground">
                        {draft ? "Acara baru" : event.title || `Acara ${index + 1}`}
                      </h3>
                      <p className="mt-1 truncate text-[11px] text-muted-foreground">
                        {draft ? "Belum dilengkapi" : event.venue || "Tempat belum diisi"}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-lg border border-primary/15 bg-primary/[0.045] px-2 py-1 font-[family-name:var(--font-dm-mono)] text-[8px] uppercase tracking-[0.1em] ${accent}`}>
                      {event.isPublished
                        ? "Terbit"
                        : draft
                          ? "Belum lengkap"
                          : hasDesign
                            ? "Undangan siap"
                            : "Siap desain"}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button type="button" size="sm" onClick={() => activate(event)}>
                      <PenLine className="h-4 w-4" />
                      {draft ? "Lengkapi acara" : "Edit acara"}
                    </Button>
                    {!draft && (
                      <Button asChild size="sm">
                        <Link href={studioHref}>
                          <PenLine className="h-4 w-4" />
                          {hasDesign ? "Edit undangan" : "Buat undangan"}
                        </Link>
                      </Button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-border/70 bg-background/70 p-4 text-sm text-muted-foreground">
            Belum ada acara.
          </div>
        )}
      </section>

      {editorMode !== "closed" && (editorMode === "new" || active) && (
        <section
          ref={editorRef}
          className="mt-4 scroll-mt-24 rounded-xl border border-border/80 bg-background p-4 sm:p-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                {editorMode === "new" ? "Acara baru" : "Edit acara"}
              </p>
              <h2 className="mt-1 truncate font-[family-name:var(--font-cinzel)] text-lg font-semibold text-foreground">
                {previewTitle || "Pilih jenis acara"}
              </h2>
            </div>
            <Button type="button" size="sm" onClick={closeEditor} disabled={saving}>
              <X className="h-4 w-4" />
              Tutup form
            </Button>
          </div>

          <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
            <div className="rounded-xl border border-border/75 bg-foreground/[0.018] p-4">
              <SectionLabel>1 · Acara</SectionLabel>
              <label className="mt-4 block">
                <span className="mb-1.5 block text-xs font-semibold">Nama acara</span>
                <select
                  value={form.eventCategory}
                  onChange={(event) => selectCategory(event.target.value)}
                  className="w-full px-3 text-sm outline-none"
                  aria-label="Pilih nama acara"
                >
                  <option value="">Pilih jenis acara</option>
                  {eventCategoryOptions.map((item) => (
                    <option key={item.key} value={item.key}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>

              {category && (
                <div className="mt-4 space-y-4">
                  {category.nameMode === "couple" && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field
                        label={form.eventCategory === "WEDDING" ? "Nama pengantin pria" : "Nama pasangan 1"}
                        value={form.groomName}
                        onChange={(value) => field("groomName", value)}
                        placeholder="Nama lengkap"
                      />
                      <Field
                        label={form.eventCategory === "WEDDING" ? "Nama pengantin wanita" : "Nama pasangan 2"}
                        value={form.brideName}
                        onChange={(value) => field("brideName", value)}
                        placeholder="Nama lengkap"
                      />
                    </div>
                  )}

                  {category.nameMode === "single" && (
                    <Field
                      label={form.eventCategory === "BIRTHDAY" ? "Nama yang berulang tahun" : "Nama keluarga / calon bayi"}
                      value={form.groomName}
                      onChange={(value) => field("groomName", value)}
                      placeholder={form.eventCategory === "BIRTHDAY" ? "Contoh: Olivia" : "Contoh: Keluarga Wijaya"}
                    />
                  )}

                  {category.nameMode === "optional" && (
                    <Field
                      label="Nama utama (opsional)"
                      value={form.groomName}
                      onChange={(value) => field("groomName", value)}
                      placeholder="Contoh: PT DC Organizer"
                    />
                  )}

                  {form.eventCategory === "OTHER" && (
                    <Field
                      label="Nama event"
                      value={form.customTitle}
                      onChange={(value) => field("customTitle", value)}
                      placeholder="Contoh: Company Gathering 2026"
                    />
                  )}
                </div>
              )}
            </div>

            {category && (
              <div className="rounded-xl border border-border/75 bg-foreground/[0.018] p-4">
                <SectionLabel>2 · Waktu & tempat</SectionLabel>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <Field
                    label="Tanggal acara"
                    type="date"
                    value={form.eventDate}
                    onChange={(value) => field("eventDate", value)}
                  />
                  <Field
                    label={`Waktu mulai (${timezone.label})`}
                    type="time"
                    value={form.ceremonyTime}
                    onChange={(value) => field("ceremonyTime", value)}
                  />
                  <Field
                    label={`Waktu selesai (${timezone.label})`}
                    type="time"
                    value={form.receptionTime}
                    onChange={(value) => field("receptionTime", value)}
                  />
                </div>

                <label className="mt-4 block">
                  <span className="mb-1.5 block text-xs font-semibold">Zona waktu Indonesia</span>
                  <select
                    value={form.timezone}
                    onChange={(event) => field("timezone", event.target.value)}
                    className="w-full px-3 text-sm outline-none"
                  >
                    {indonesiaTimezones.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label} · {item.description}
                      </option>
                    ))}
                  </select>
                </label>

                {(form.eventDate || form.ceremonyTime) && (
                  <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-primary/10 bg-primary/[0.035] px-3 py-3 text-xs text-foreground/75">
                    <span className="inline-flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-primary" />
                      {formatDateId(form.eventDate)}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Clock3 className="h-4 w-4 text-primary" />
                      {formatTime(form.ceremonyTime)}{form.receptionTime ? `–${formatTime(form.receptionTime)}` : ""} {timezone.label}
                    </span>
                  </div>
                )}

                <div className="mt-4 space-y-4">
                  <Field
                    label="Nama tempat"
                    value={form.venue}
                    onChange={(value) => field("venue", value)}
                    placeholder="Contoh: Grand Ballroom Hotel ABC"
                  />
                  <Field
                    label="Alamat"
                    value={form.address}
                    onChange={(value) => field("address", value)}
                    placeholder="Alamat lengkap acara"
                  />
                  <Field
                    label="Google Maps"
                    value={form.mapUrl}
                    onChange={(value) => field("mapUrl", value)}
                    placeholder="Tempel link Google Maps"
                  />
                </div>
              </div>
            )}
          </div>

          {category && (
            <details className="mt-4 rounded-xl border border-border/75 bg-foreground/[0.018] p-4">
              <summary className="cursor-pointer text-xs font-semibold text-foreground">
                Tambahan opsional
              </summary>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <TextArea
                  label="Deskripsi"
                  value={form.description}
                  onChange={(value) => field("description", value)}
                  placeholder="Informasi singkat untuk tamu"
                  rows={3}
                />
                <TextArea
                  label="Catatan"
                  value={form.eventNotes}
                  onChange={(value) => field("eventNotes", value)}
                  placeholder="Catatan internal atau informasi tambahan"
                  rows={3}
                />
              </div>
            </details>
          )}

          <div className="mt-4 flex flex-col gap-3 rounded-xl border border-border/80 bg-foreground/[0.018] p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3 text-xs text-muted-foreground">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/[0.08] text-primary">
                {form.venue ? <MapPin className="h-4 w-4" /> : <UserRound className="h-4 w-4" />}
              </span>
              <span className="min-w-0 truncate">{notice}</span>
            </div>
            <Button disabled={saving || !category} onClick={save} size="sm">
              <Save className="h-4 w-4" />
              {saving ? "Menyimpan acara..." : editorMode === "new" ? "Simpan acara" : "Simpan perubahan"}
            </Button>
          </div>
        </section>
      )}

      {active && editorMode === "edit" && (
        <div className="mt-3 flex justify-end">
          <Button asChild size="sm">
            <Link href={`/dashboard/editor?type=${active.type}&invitationId=${active.id}`}>
              <PenLine className="h-4 w-4" />
              {active.templateKey?.trim() ? "Edit undangan" : "Buat undangan"}
            </Link>
          </Button>
        </div>
      )}
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
