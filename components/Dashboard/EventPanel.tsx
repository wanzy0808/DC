"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Plus, Save } from "lucide-react";
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
type Props = { accent: string; onSaved: () => void };

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

function hasAdditionalEventData(invitation: Invitation) {
  return Boolean(
    invitation.title.trim() ||
      invitation.venue.trim() ||
      invitation.address?.trim() ||
      invitation.mapUrl?.trim() ||
      invitation.description?.trim() ||
      invitation.eventNotes?.trim() ||
      invitation.isPublished,
  );
}

export default function EventPanel({ accent, onSaved }: Props) {
  const [type, setType] = useState<InvitationType>("WEDDING");
  const [form, setForm] = useState(emptyForm);
  const [eventTitles, setEventTitles] = useState<Record<InvitationType, string>>({
    WEDDING: "",
    ADAT_AKAD: "",
  });
  const [hasAdditional, setHasAdditional] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("Memuat...");

  async function getInvitation(nextType: InvitationType) {
    const response = await fetch(`/api/invitations?type=${nextType}`, {
      cache: "no-store",
    });
    const data = await response.json();
    if (!response.ok || !data.invitation) {
      throw new Error(data.error || "Data acara belum dapat dimuat.");
    }
    return data.invitation as Invitation;
  }

  async function load(nextType: InvitationType) {
    setLoading(true);
    setNotice("Memuat...");
    try {
      const invitation = await getInvitation(nextType);
      let groomName = invitation.groomName || "";
      let brideName = invitation.brideName || "";

      if (nextType === "ADAT_AKAD" && (!groomName || !brideName)) {
        const wedding = await getInvitation("WEDDING");
        groomName ||= wedding.groomName || "";
        brideName ||= wedding.brideName || "";
        setEventTitles((current) => ({
          ...current,
          WEDDING: wedding.title || "",
        }));
      }

      setForm({
        title: invitation.title || "",
        groomName,
        brideName,
        venue: invitation.venue || "",
        address: invitation.address || "",
        mapUrl: invitation.mapUrl || "",
        timezone: invitation.timezone || "Asia/Jakarta",
        eventDate: invitation.eventDate ? invitation.eventDate.slice(0, 10) : "",
        ceremonyTime: invitation.ceremonyTime || "",
        receptionTime: invitation.receptionTime || "",
        description: invitation.description || "",
        eventNotes: invitation.eventNotes || "",
      });
      setEventTitles((current) => ({
        ...current,
        [nextType]: invitation.title || "",
      }));
      setIsPublished(invitation.isPublished);

      if (nextType === "WEDDING") {
        try {
          const additional = await getInvitation("ADAT_AKAD");
          setEventTitles((current) => ({
            ...current,
            ADAT_AKAD: additional.title || "",
          }));
          if (hasAdditionalEventData(additional)) setHasAdditional(true);
        } catch {
          // Acara utama tetap dapat diedit walau pengecekan acara tambahan gagal.
        }
      }

      setNotice("Tersinkron");
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Data acara belum dapat dimuat.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(type);
  }, [type]);

  function field(name: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function addSequence() {
    setHasAdditional(true);
    setType("ADAT_AKAD");
  }

  async function save() {
    setSaving(true);
    setNotice("Menyimpan...");
    try {
      const response = await fetch("/api/invitations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, type, isPublished }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Data acara belum dapat disimpan.");
      }

      const updated = data.invitation as Invitation | undefined;
      if (updated) {
        setIsPublished(Boolean(updated.isPublished));
        setEventTitles((current) => ({
          ...current,
          [type]: updated.title || "",
        }));
      }
      if (type === "ADAT_AKAD") setHasAdditional(true);

      setNotice("Tersimpan");
      onSaved();
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Data acara belum dapat disimpan.",
      );
    } finally {
      setSaving(false);
    }
  }

  const activeTitle =
    form.title.trim() ||
    (type === "WEDDING" ? "Rangkaian utama" : "Rangkaian tambahan");

  return (
    <div className="mx-auto w-[min(92vw,1400px)] min-w-0 px-1 pb-16 pt-7 sm:pt-8">
      <section className="bg-background">
        <div className="rounded-xl border border-border/80 bg-foreground/[0.018] p-4 sm:flex sm:items-center sm:justify-between sm:gap-5">
          <div className="min-w-0">
            <p className="font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
              {type === "WEDDING" ? "Rangkaian / 01" : "Rangkaian / 02"}
            </p>
            <h2 className="mt-1 truncate font-[family-name:var(--font-cinzel)] text-lg font-semibold text-foreground">
              {activeTitle}
            </h2>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 sm:mt-0 sm:justify-end">
            <span
              className={`rounded-lg border border-primary/15 bg-primary/[0.045] px-3 py-2 font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.12em] ${accent}`}
            >
              {loading ? "Loading" : notice}
            </span>
            {!hasAdditional && type === "WEDDING" && (
              <Button
                type="button"
                size="sm"
                onClick={addSequence}
                disabled={loading}
                title="Tambahkan rangkaian acara kedua"
              >
                <Plus className="h-4 w-4" />
                Tambah rangkaian acara
              </Button>
            )}
          </div>
        </div>

        {hasAdditional && (
          <label className="mt-3 block max-w-md rounded-xl border border-border/80 bg-foreground/[0.018] p-3">
            <span className="mb-1.5 block font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
              Rangkaian aktif
            </span>
            <select
              value={type}
              onChange={(event) => setType(event.target.value as InvitationType)}
              disabled={loading || saving}
              aria-label="Pilih rangkaian acara"
              className="w-full px-3 text-sm outline-none"
            >
              <option value="WEDDING">
                {eventTitles.WEDDING.trim() || "Rangkaian utama"}
              </option>
              <option value="ADAT_AKAD">
                {eventTitles.ADAT_AKAD.trim() || "Rangkaian tambahan"}
              </option>
            </select>
          </label>
        )}

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="min-w-0 rounded-xl border border-border/80 bg-foreground/[0.018] p-4 sm:p-5">
            <SectionLabel>Detail acara</SectionLabel>
            <div className="mt-4 space-y-4">
              <Field
                label="Nama acara"
                value={form.title}
                onChange={(value) => field("title", value)}
                placeholder="Nama acara"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Pasangan pria"
                  value={form.groomName}
                  onChange={() => undefined}
                  placeholder="Data onboarding"
                  readOnly
                />
                <Field
                  label="Pasangan wanita"
                  value={form.brideName}
                  onChange={() => undefined}
                  placeholder="Data onboarding"
                  readOnly
                />
              </div>
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
                  label="Akad / pemberkatan"
                  type="time"
                  value={form.ceremonyTime}
                  onChange={(value) => field("ceremonyTime", value)}
                />
                <Field
                  label="Resepsi"
                  type="time"
                  value={form.receptionTime}
                  onChange={(value) => field("receptionTime", value)}
                />
              </div>
            </div>
          </div>

          <div className="min-w-0 rounded-xl border border-border/80 bg-foreground/[0.018] p-4 sm:p-5">
            <SectionLabel>Lokasi</SectionLabel>
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
                label="Deskripsi"
                value={form.description}
                onChange={(value) => field("description", value)}
                placeholder="Informasi acara"
                rows={4}
              />
              <TextArea
                label="Catatan"
                value={form.eventNotes}
                onChange={(value) => field("eventNotes", value)}
                placeholder="Catatan tambahan"
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-border/80 bg-foreground/[0.018] p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/[0.08] text-primary">
              <CalendarDays className="h-4 w-4" />
            </span>
            <span className="truncate">{notice}</span>
          </div>
          <Button
            disabled={loading || saving}
            onClick={save}
            size="sm"
            title="Simpan data rangkaian acara"
          >
            <Save className="h-4 w-4" />
            {saving ? "Menyimpan rangkaian..." : "Simpan rangkaian"}
          </Button>
        </div>
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
  readOnly = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  readOnly?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold">{label}</span>
      <Input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        className={readOnly ? "cursor-not-allowed" : ""}
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