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

export default function EventPanel({ accent, onSaved }: Props) {
  const [type, setType] = useState<InvitationType>("WEDDING");
  const [form, setForm] = useState(emptyForm);
  const [isPublished, setIsPublished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("Memuat...");

  async function getInvitation(nextType: InvitationType) {
    const response = await fetch(`/api/invitations?type=${nextType}`, { cache: "no-store" });
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
      setIsPublished(invitation.isPublished);
      setNotice("Tersinkron");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Data acara belum dapat dimuat.");
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
      if (!response.ok) throw new Error(data.error || "Data acara belum dapat disimpan.");
      setIsPublished(Boolean(data.invitation?.isPublished));
      setNotice("Tersimpan");
      onSaved();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Data acara belum dapat disimpan.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto w-[min(92vw,1400px)] min-w-0 px-1 pb-16 pt-7 sm:pt-8">
      <section className="border-y border-border bg-background">
        <div className="flex flex-col gap-3 border-b border-border py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="grid min-w-0 flex-1 border border-border sm:grid-cols-2">
            <TypeTab
              active={type === "WEDDING"}
              label="Pernikahan"
              onClick={() => setType("WEDDING")}
            />
            <TypeTab
              active={type === "ADAT_AKAD"}
              label="Akad & Sangjit"
              onClick={() => setType("ADAT_AKAD")}
            />
          </div>
          <span className={`shrink-0 font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.12em] ${accent}`}>
            {loading ? "Loading" : notice}
          </span>
        </div>

        <div className="grid gap-8 py-6 lg:grid-cols-2 lg:gap-10">
          <div className="min-w-0 space-y-5">
            <SectionLabel>Acara</SectionLabel>
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

          <div className="min-w-0 space-y-5 lg:border-l lg:border-border lg:pl-10">
            <SectionLabel>Lokasi</SectionLabel>
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

        <div className="flex flex-col gap-3 border-t border-border py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
            <span className="grid h-8 w-8 shrink-0 place-items-center border border-border text-primary">
              {type === "WEDDING" ? (
                <CalendarDays className="h-4 w-4" />
              ) : (
                <MapPin className="h-4 w-4" />
              )}
            </span>
            <span className="truncate">{notice}</span>
          </div>
          <Button disabled={loading || saving} onClick={save} size="sm">
            <Save className="h-4 w-4" />
            {saving ? "Menyimpan..." : "Simpan"}
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

function TypeTab({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      onClick={onClick}
      className={`h-10 flex-1 rounded-none border-0 border-r border-border text-xs shadow-none last:border-r-0 ${
        active
          ? "bg-primary/10 text-primary hover:bg-primary/10"
          : "bg-transparent text-foreground hover:bg-primary/5"
      }`}
    >
      {label}
    </Button>
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
        className={`bg-transparent ${readOnly ? "cursor-not-allowed opacity-60" : ""}`}
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
        className="w-full resize-y rounded-xl border border-input bg-transparent px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
      />
    </label>
  );
}
