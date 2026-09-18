"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Clock3,
  MapPin,
  PenLine,
  Plus,
  Save,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DashboardEmptyState,
  DashboardMetricCard,
  DashboardMetricGrid,
  DashboardNotice,
  DashboardPage,
  DashboardSectionHeader,
  DashboardStatusBadge,
  DashboardSurface,
} from "@/components/Dashboard/DashboardPrimitives";
import { useDashboardI18n } from "@/components/Dashboard/useDashboardI18n";
import { weddingParentLine, type WeddingChildKind } from "@/lib/events/parents";
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
  groomFatherName: string | null;
  groomMotherName: string | null;
  groomChildOrder: number | null;
  brideFatherName: string | null;
  brideMotherName: string | null;
  brideChildOrder: number | null;
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
  groomFatherName: string;
  groomMotherName: string;
  groomChildOrder: string;
  brideFatherName: string;
  brideMotherName: string;
  brideChildOrder: string;
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
  groomFatherName: "",
  groomMotherName: "",
  groomChildOrder: "",
  brideFatherName: "",
  brideMotherName: "",
  brideChildOrder: "",
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

const END_TIME_SENTINEL = "END";

const timeHours = Array.from({ length: 24 }, (_, index) =>
  String(index).padStart(2, "0"),
);
const timeMinutes = Array.from({ length: 60 }, (_, index) =>
  String(index).padStart(2, "0"),
);

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

function isoDateToDisplay(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : "";
}

function displayDateToIso(value: string) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  if (!match) return "";
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return "";
  }
  return `${match[3]}-${match[2]}-${match[1]}`;
}

function formatDateInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function formatTimeInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

function isValidTime24(value: string) {
  return /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value.trim());
}

function isValidChildOrder(value: string) {
  if (!value.trim()) return true;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0;
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
    groomFatherName: invitation.groomFatherName || "",
    groomMotherName: invitation.groomMotherName || "",
    groomChildOrder: invitation.groomChildOrder ? String(invitation.groomChildOrder) : "",
    brideFatherName: invitation.brideFatherName || "",
    brideMotherName: invitation.brideMotherName || "",
    brideChildOrder: invitation.brideChildOrder ? String(invitation.brideChildOrder) : "",
    venue: invitation.venue || "",
    address: invitation.address || "",
    mapUrl: invitation.mapUrl || "",
    timezone: invitation.timezone || "Asia/Jakarta",
    eventDate:
      invitation.eventConfigured && invitation.eventDate
        ? isoDateToDisplay(invitation.eventDate)
        : "",
    ceremonyTime: invitation.ceremonyTime || "",
    receptionTime: invitation.receptionTime || "",
    description: invitation.description || "",
    eventNotes: invitation.eventNotes || "",
  };
}

function formatDateId(value: string, locale: "id" | "en") {
  const iso = displayDateToIso(value);
  if (!iso) return locale === "en" ? "Invalid date" : "Tanggal belum valid";
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date(`${iso}T12:00:00+07:00`));
}

export default function EventPanel({ onSaved }: Props) {
  const { d, locale } = useDashboardI18n();
  const [events, setEvents] = useState<Invitation[]>([]);
  const [activeId, setActiveId] = useState("");
  const [editorMode, setEditorMode] = useState<EditorMode>("closed");
  const [form, setForm] = useState<EventForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [notice, setNotice] = useState("");
  const editorRef = useRef<HTMLElement | null>(null);

  function activate(invitation: Invitation) {
    if (invitation.isPublished) {
      setNotice(d("Acara yang sudah dipublish tidak dapat diedit."));
      return;
    }
    setActiveId(invitation.id);
    setForm(toForm(invitation));
    setEditorMode(invitation.eventConfigured ? "edit" : "new");
    setNotice("");
  }

  function closeEditor() {
    setActiveId("");
    setForm(emptyForm);
    setEditorMode("closed");
    setNotice("");
  }

  async function load(preferredId?: string) {
    setLoading(true);
    try {
      const response = await fetch("/api/invitations?all=1", { cache: "no-store" });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || d("Data acara belum dapat dimuat."));
      const next = sortInvitations((data?.invitations ?? []) as Invitation[]);
      setEvents(next);
      const targetId = preferredId || activeId;
      const target = targetId ? next.find((item) => item.id === targetId) : null;
      if (target) activate(target);
      setNotice("");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : d("Data acara belum dapat dimuat."));
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
    if (saving || deletingId) return;
    setActiveId("");
    setForm(emptyForm);
    setEditorMode("new");
    setNotice("");
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
      groomFatherName: value === "WEDDING" ? current.groomFatherName : "",
      groomMotherName: value === "WEDDING" ? current.groomMotherName : "",
      groomChildOrder: value === "WEDDING" ? current.groomChildOrder : "",
      brideFatherName: value === "WEDDING" ? current.brideFatherName : "",
      brideMotherName: value === "WEDDING" ? current.brideMotherName : "",
      brideChildOrder: value === "WEDDING" ? current.brideChildOrder : "",
    }));
  }

  async function save() {
    if (!form.eventCategory) return setNotice(d("Pilih jenis acara."));
    const category = getEventCategory(form.eventCategory);
    if (category.nameMode === "couple" && (!form.groomName.trim() || !form.brideName.trim())) {
      return setNotice(d("Lengkapi kedua nama."));
    }
    if (category.nameMode === "single" && !form.groomName.trim()) {
      return setNotice(d("Nama utama wajib diisi."));
    }
    if (form.eventCategory === "OTHER" && !form.customTitle.trim()) {
      return setNotice(d("Nama event wajib diisi."));
    }
    if (!isValidChildOrder(form.groomChildOrder) || !isValidChildOrder(form.brideChildOrder)) {
      return setNotice(d("Anak keberapa harus berupa angka lebih dari 0."));
    }
    const eventDateIso = displayDateToIso(form.eventDate);
    if (!eventDateIso) return setNotice(d("Tanggal harus menggunakan format dd/mm/yyyy yang valid."));
    if (!isValidTime24(form.ceremonyTime)) {
      return setNotice(d("Waktu mulai harus menggunakan format HH:mm."));
    }
    if (
      form.receptionTime &&
      form.receptionTime !== END_TIME_SENTINEL &&
      !isValidTime24(form.receptionTime)
    ) {
      return setNotice(d("Waktu selesai harus menggunakan format HH:mm atau opsi - end."));
    }
    if (!form.venue.trim()) return setNotice(d("Nama tempat wajib diisi."));

    setSaving(true);
    setNotice(d("Menyimpan..."));
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
          groomFatherName: form.groomFatherName,
          groomMotherName: form.groomMotherName,
          groomChildOrder: form.groomChildOrder,
          brideFatherName: form.brideFatherName,
          brideMotherName: form.brideMotherName,
          brideChildOrder: form.brideChildOrder,
          venue: form.venue,
          address: form.address,
          mapUrl: form.mapUrl,
          timezone: form.timezone,
          eventDate: eventDateIso,
          ceremonyTime: form.ceremonyTime,
          receptionTime: form.receptionTime,
          description: form.description,
          eventNotes: form.eventNotes,
          eventConfigured: true,
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.invitation?.id) {
        throw new Error(data?.error || d("Data acara belum dapat disimpan."));
      }
      await load(String(data.invitation.id));
      setNotice(d("Tersimpan."));
      onSaved();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : d("Data acara belum dapat disimpan."));
    } finally {
      setSaving(false);
    }
  }

  async function removeEvent(invitation: Invitation) {
    if (saving || deletingId) return;
    if (invitation.isPublished) {
      setNotice(d("Acara yang sudah dipublish tidak dapat dihapus."));
      return;
    }

    const label = invitation.title?.trim() || "Acara baru";
    const confirmed = window.confirm(
      locale === "en"
        ? `Delete “${label}”?\n\nThe event, invitation design, guest list, and related unpublished data will also be deleted.`
        : `Hapus “${label}”?\n\nAcara, desain undangan, daftar tamu, dan data terkait yang belum dipublish akan ikut dihapus.`,
    );
    if (!confirmed) return;

    setDeletingId(invitation.id);
    setNotice(d("Menghapus acara..."));
    try {
      const response = await fetch(
        `/api/invitations?id=${encodeURIComponent(invitation.id)}`,
        { method: "DELETE" },
      );
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error || d("Acara belum dapat dihapus."));
      }
      if (activeId === invitation.id) closeEditor();
      await load();
      setNotice(d("Acara dihapus."));
      onSaved();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : d("Acara belum dapat dihapus."));
    } finally {
      setDeletingId("");
    }
  }

  const category = form.eventCategory ? getEventCategory(form.eventCategory) : null;
  const active = events.find((item) => item.id === activeId) || null;
  const timezone = getIndonesiaTimezone(form.timezone);
  const draftCount = events.filter((event) => !event.eventConfigured).length;
  const designedCount = events.filter((event) => Boolean(event.templateKey?.trim())).length;
  const publishedCount = events.filter((event) => event.isPublished).length;

  return (
    <DashboardPage>
      <DashboardSurface className="overflow-hidden">
        <div className="border-l-4 border-primary p-4 sm:p-5">
          <DashboardSectionHeader
            eyebrow={d("Rangkaian acara")}
            title={loading ? d("Memuat acara...") : events.length ? d("Kelola acara di workspace") : d("Buat acara pertama")}
            description={d("Atur identitas, waktu, lokasi, dan status acara sebelum melanjutkan ke Undangan Digital.")}
            actions={
              <Button
                type="button"
                size="sm"
                onClick={startNewEvent}
                disabled={saving || Boolean(deletingId)}
              >
                <Plus className="h-4 w-4" />
                {d("Tambah acara")}
              </Button>
            }
          />
        </div>
      </DashboardSurface>

      <DashboardMetricGrid className="mt-4">
        <DashboardMetricCard icon={CalendarDays} label={d("Total acara")} value={String(events.length)} />
        <DashboardMetricCard icon={PenLine} label={d("Draft")} value={String(draftCount)} />
        <DashboardMetricCard icon={Save} label={d("Sudah desain")} value={String(designedCount)} />
        <DashboardMetricCard icon={Send} label={d("Terbit")} value={String(publishedCount)} />
      </DashboardMetricGrid>

      {editorMode === "closed" && notice && (
        <DashboardNotice className="mt-4">{notice}</DashboardNotice>
      )}

      {events.length > 0 && (
        <DashboardSurface className="mt-4 overflow-hidden">
          <div className="overflow-x-auto p-4 sm:p-5">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="text-[10px] text-muted-foreground">
                  <th className="px-3 py-3 font-medium">{d("Acara")}</th>
                  <th className="px-3 py-3 font-medium">{d("Tanggal")}</th>
                  <th className="px-3 py-3 font-medium">{d("Lokasi")}</th>
                  <th className="px-3 py-3 font-medium">{d("Status")}</th>
                  <th className="px-3 py-3 text-right font-medium">{d("Aksi")}</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => {
                  const draft = !event.eventConfigured;
                  const hasDesign = Boolean(event.templateKey?.trim());
                  const status = event.isPublished
                    ? d("Terbit")
                    : hasDesign
                      ? d("Siap")
                      : draft
                        ? d("Draft")
                        : d("Belum desain");
                  return (
                    <tr key={event.id} className="text-xs">
                      <td className="max-w-72 px-3 py-3.5">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {draft ? d("Acara baru") : event.title || d("Acara tanpa judul")}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3.5 text-muted-foreground">
                        {event.eventDate ? isoDateToDisplay(event.eventDate) : "—"}
                      </td>
                      <td className="max-w-56 px-3 py-3.5 text-muted-foreground">
                        <p className="truncate">{draft ? d("Belum dilengkapi") : event.venue || "—"}</p>
                      </td>
                      <td className="px-3 py-3.5">
                        <DashboardStatusBadge active={event.isPublished || hasDesign}>
                          {status}
                        </DashboardStatusBadge>
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="flex justify-end gap-2">
                          {!event.isPublished && (
                            <>
                              <Button type="button" size="xs" onClick={() => activate(event)}>
                                <PenLine className="h-3.5 w-3.5" />
                                {d("Edit")}
                              </Button>
                              <Button
                                type="button"
                                size="xs"
                                onClick={() => removeEvent(event)}
                                disabled={saving || Boolean(deletingId)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                {deletingId === event.id ? d("Menghapus...") : d("Hapus")}
                              </Button>
                            </>
                          )}
                          {!draft && (
                            <Button asChild size="xs">
                              <Link href={`/dashboard/editor?type=${event.type}&invitationId=${event.id}`}>
                                <PenLine className="h-3.5 w-3.5" />
                                {hasDesign ? d("Undangan") : d("Buat undangan")}
                              </Link>
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </DashboardSurface>
      )}

      {!loading && !events.length && editorMode === "closed" && (
        <DashboardSurface className="mt-4 p-4 sm:p-5">
          <DashboardEmptyState
            icon={CalendarDays}
            title={d("Belum ada acara")}
            description={d("Tambahkan acara untuk mulai menyiapkan detail, desain undangan, RSVP, dan operasional tamu.")}
            action={
              <Button type="button" size="sm" onClick={startNewEvent}>
                <Plus className="h-4 w-4" />
                {d("Tambah acara")}
              </Button>
            }
          />
        </DashboardSurface>
      )}

      {editorMode !== "closed" && (editorMode === "new" || active) && (
        <section
          ref={editorRef}
          className="dc-dashboard-surface mt-4 scroll-mt-24 rounded-2xl border border-border/70 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] sm:p-6"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold">
              {editorMode === "new" ? d("Acara baru") : d("Edit acara")}
            </p>
            <Button type="button" size="sm" onClick={closeEditor} disabled={saving}>
              <X className="h-4 w-4" />
              {d("Tutup")}
            </Button>
          </div>

          <div className="mt-6 grid gap-x-10 gap-y-8 xl:grid-cols-2">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold">{d("Data acara")}</h3>
              <label className="mt-4 block">
                <span className="mb-1.5 block text-xs font-semibold">{d("Jenis acara")}</span>
                <select
                  value={form.eventCategory}
                  onChange={(event) => selectCategory(event.target.value)}
                  className="h-11 w-full rounded-[10px] border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                >
                  <option value="">{d("Pilih jenis acara")}</option>
                  {eventCategoryOptions.map((item) => (
                    <option key={item.key} value={item.key}>{locale === "en" ? ({ WEDDING: "Wedding", SILVER_WEDDING: "Silver Wedding", GOLDEN_WEDDING: "Golden Wedding", BIRTHDAY: "Birthday", BABY_SHOWER: "Baby Shower", OTHER: "Other Event" } as Record<string, string>)[item.key] || item.label : item.label}</option>
                  ))}
                </select>
              </label>

              {category && (
                <div className="mt-4 space-y-4">
                  {category.nameMode === "couple" && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field
                        label={form.eventCategory === "WEDDING" ? d("Nama pengantin pria") : d("Nama pasangan 1")}
                        value={form.groomName}
                        onChange={(value) => field("groomName", value)}
                        placeholder={d("Nama lengkap")}
                      />
                      <Field
                        label={form.eventCategory === "WEDDING" ? d("Nama pengantin wanita") : d("Nama pasangan 2")}
                        value={form.brideName}
                        onChange={(value) => field("brideName", value)}
                        placeholder={d("Nama lengkap")}
                      />
                    </div>
                  )}

                  {form.eventCategory === "WEDDING" && (
                    <div className="grid gap-6 border-t border-border/70 pt-5 sm:grid-cols-2">
                      <WeddingFamilyFields
                        title={d("Pengantin pria")}
                        kind="putra"
                        father={form.groomFatherName}
                        mother={form.groomMotherName}
                        order={form.groomChildOrder}
                        onFather={(value) => field("groomFatherName", value)}
                        onMother={(value) => field("groomMotherName", value)}
                        onOrder={(value) => field("groomChildOrder", value)}
                      />
                      <WeddingFamilyFields
                        title={d("Pengantin wanita")}
                        kind="putri"
                        father={form.brideFatherName}
                        mother={form.brideMotherName}
                        order={form.brideChildOrder}
                        onFather={(value) => field("brideFatherName", value)}
                        onMother={(value) => field("brideMotherName", value)}
                        onOrder={(value) => field("brideChildOrder", value)}
                      />
                    </div>
                  )}

                  {category.nameMode === "single" && (
                    <Field
                      label={form.eventCategory === "BIRTHDAY" ? d("Nama yang berulang tahun") : d("Nama keluarga / calon bayi")}
                      value={form.groomName}
                      onChange={(value) => field("groomName", value)}
                      placeholder={d("Nama")}
                    />
                  )}

                  {category.nameMode === "optional" && (
                    <Field
                      label={d("Nama utama (opsional)")}
                      value={form.groomName}
                      onChange={(value) => field("groomName", value)}
                    />
                  )}

                  {form.eventCategory === "OTHER" && (
                    <Field
                      label={d("Nama event")}
                      value={form.customTitle}
                      onChange={(value) => field("customTitle", value)}
                    />
                  )}
                </div>
              )}
            </div>

            {category && (
              <div className="min-w-0">
                <h3 className="text-sm font-semibold">{d("Waktu & tempat")}</h3>
                <div className="mt-4 grid gap-4 md:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
                  <DateField label={d("Tanggal")} value={form.eventDate} onChange={(value) => field("eventDate", value)} />
                  <TimeField label={`${d("Mulai")} (${timezone.label})`} value={form.ceremonyTime} onChange={(value) => field("ceremonyTime", value)} />
                  <div>
                    <TimeField
                      label={`${d("Selesai")} (${timezone.label})`}
                      value={form.receptionTime === END_TIME_SENTINEL ? "" : form.receptionTime}
                      onChange={(value) => field("receptionTime", value)}
                      disabled={form.receptionTime === END_TIME_SENTINEL}
                    />
                    <label className="mt-2 flex min-h-8 cursor-pointer items-center gap-2 text-[11px] text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={form.receptionTime === END_TIME_SENTINEL}
                        onChange={(event) =>
                          field(
                            "receptionTime",
                            event.target.checked ? END_TIME_SENTINEL : "",
                          )
                        }
                        className="h-4 w-4 accent-[var(--primary)]"
                      />
                      <span>{d("Tampilkan “- end” di undangan")}</span>
                    </label>
                  </div>
                </div>

                <label className="mt-4 block">
                  <span className="mb-1.5 block text-xs font-semibold">{d("Zona waktu")}</span>
                  <select
                    value={form.timezone}
                    onChange={(event) => field("timezone", event.target.value)}
                    className="h-11 w-full rounded-[10px] border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                  >
                    {indonesiaTimezones.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label} · {item.description}
                      </option>
                    ))}
                  </select>
                </label>

                {(form.eventDate || form.ceremonyTime) && (
                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4 text-primary" />{form.eventDate ? formatDateId(form.eventDate, locale) : d("Tanggal")}</span>
                    <span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4 text-primary" />{form.ceremonyTime || "--:--"}{form.receptionTime === END_TIME_SENTINEL ? " - end" : form.receptionTime ? `–${form.receptionTime}` : ""} {timezone.label}</span>
                  </div>
                )}

                <div className="mt-4 space-y-4">
                  <Field label={d("Nama tempat")} value={form.venue} onChange={(value) => field("venue", value)} />
                  <Field label={d("Alamat")} value={form.address} onChange={(value) => field("address", value)} />
                  <Field label={d("Google Maps")} value={form.mapUrl} onChange={(value) => field("mapUrl", value)} />
                </div>
              </div>
            )}
          </div>

          {category && (
            <details className="mt-7 border-t border-border/70 pt-4">
              <summary className="cursor-pointer text-xs font-semibold">{locale === "en" ? "Additional details" : "Tambahan"}</summary>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <TextArea label={d("Deskripsi")} value={form.description} onChange={(value) => field("description", value)} />
                <TextArea label={d("Catatan")} value={form.eventNotes} onChange={(value) => field("eventNotes", value)} />
              </div>
            </details>
          )}

          <div className="mt-6 flex flex-col gap-3 border-t border-border/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="min-h-5 text-xs text-muted-foreground" role="status">{notice}</p>
            <Button disabled={saving || !category} onClick={save} size="sm">
              <Save className="h-4 w-4" />
              {saving ? d("Menyimpan...") : d("Simpan")}
            </Button>
          </div>
        </section>
      )}
    </DashboardPage>
  );
}

function WeddingFamilyFields({
  title,
  kind,
  father,
  mother,
  order,
  onFather,
  onMother,
  onOrder,
}: {
  title: string;
  kind: WeddingChildKind;
  father: string;
  mother: string;
  order: string;
  onFather: (value: string) => void;
  onMother: (value: string) => void;
  onOrder: (value: string) => void;
}) {
  const { d } = useDashboardI18n();
  const parsedOrder = order.trim() ? Number(order) : null;
  const familyLine = weddingParentLine(
    father,
    mother,
    Number.isInteger(parsedOrder) ? parsedOrder : null,
    kind,
  );

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold">{title}</p>
      <ChildOrderField value={order} onChange={onOrder} />
      <Field label={d("Nama bapak")} value={father} onChange={onFather} />
      <Field label={d("Nama ibu")} value={mother} onChange={onMother} />
      {familyLine && (
        <p className="rounded-lg border border-border/70 bg-background px-3 py-2 text-[11px] leading-5 text-muted-foreground">
          {familyLine}
        </p>
      )}
    </div>
  );
}

function ChildOrderField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const { d } = useDashboardI18n();
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold">{d("Anak keberapa")} ({d("opsional")})</span>
      <Input
        type="number"
        min={1}
        step={1}
        inputMode="numeric"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={d("Contoh: 1")}
      />
    </label>
  );
}

function DateField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const { d } = useDashboardI18n();
  const pickerRef = useRef<HTMLInputElement | null>(null);
  const isoValue = displayDateToIso(value);

  function openCalendar() {
    const picker = pickerRef.current;
    if (!picker) return;
    if (typeof picker.showPicker === "function") picker.showPicker();
    else picker.click();
  }

  return (
    <div>
      <span className="mb-1.5 block text-xs font-semibold">{label}</span>
      <div className="relative flex gap-2">
        <Input
          inputMode="numeric"
          maxLength={10}
          value={value}
          onChange={(event) => onChange(formatDateInput(event.target.value))}
          placeholder="dd/mm/yyyy"
        />
        <Button type="button" size="icon" onClick={openCalendar} aria-label={d("Pilih tanggal")}>
          <CalendarDays className="h-4 w-4" />
        </Button>
        <input
          ref={pickerRef}
          type="date"
          value={isoValue}
          onChange={(event) => onChange(isoDateToDisplay(event.target.value))}
          className="pointer-events-none absolute right-0 top-0 h-11 w-11 opacity-0"
          tabIndex={-1}
        />
      </div>
    </div>
  );
}

function TimeField({
  label,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const { d } = useDashboardI18n();
  const [open, setOpen] = useState(false);
  const [hour, minute] = isValidTime24(value) ? value.split(":") : ["00", "00"];

  return (
    <div className="relative">
      <span className="mb-1.5 block text-xs font-semibold">{label}</span>
      <div className="flex gap-2">
        <Input
          disabled={disabled}
          inputMode="numeric"
          maxLength={5}
          value={value}
          onChange={(event) => onChange(formatTimeInput(event.target.value))}
          placeholder="00:00"
          className="font-[family-name:var(--font-dc-mono)]"
        />
        <Button type="button" size="icon" disabled={disabled} onClick={() => setOpen((current) => !current)} aria-label={d("Pilih waktu")}>
          <Clock3 className="h-4 w-4" />
        </Button>
      </div>
      {open && !disabled && (
        <div className="absolute right-0 z-40 mt-2 grid w-full min-w-52 grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-xl border border-border bg-background p-3 shadow-xl">
          <select value={hour} onChange={(event) => onChange(`${event.target.value}:${minute}`)} className="h-11 rounded-[10px] border border-border bg-background px-2 text-sm">
            {timeHours.map((item) => <option key={item}>{item}</option>)}
          </select>
          <span>:</span>
          <select value={minute} onChange={(event) => onChange(`${hour}:${event.target.value}`)} className="h-11 rounded-[10px] border border-border bg-background px-2 text-sm">
            {timeMinutes.map((item) => <option key={item}>{item}</option>)}
          </select>
          <Button type="button" size="sm" className="col-span-3" onClick={() => setOpen(false)}>{d("Selesai")}</Button>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, placeholder = "" }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold">{label}</span>
      <Input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        className="w-full resize-y rounded-[10px] border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}
