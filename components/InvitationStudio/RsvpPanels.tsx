"use client";

import type { FormEvent } from "react";
import {
  CalendarPlus,
  CheckCircle2,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { displayTitleCase } from "@/lib/text/display-title-case";
import { Input } from "@/components/ui/input";
import type {
  RsvpFormState,
  RsvpTicketGuest,
} from "@/components/InvitationStudio/rsvp-types";
import { rsvpElementStyleCss, type InvitationRsvpConfig } from "@/lib/templates/rsvp-config";

export function RsvpSuccessPanel({ ticketGuest, ticketUrl, calendarUrl }: {
  ticketGuest: RsvpTicketGuest;
  ticketUrl: string;
  calendarUrl: string;
}) {
  const attending = ticketGuest.rsvpStatus === "ATTENDING";
  return (
    <div className="text-center" role="status" aria-live="polite">
      <CheckCircle2 aria-hidden="true" className="mx-auto h-8 w-8 text-[var(--inv-accent,#7A1C25)]" />
      <h2 className="mt-4 font-[var(--inv-heading,var(--font-cinzel))] text-3xl">
        Terima kasih, {displayTitleCase(ticketGuest.name)}
      </h2>
      <p className="mt-3 text-sm leading-relaxed opacity-75">
        {attending
          ? "Kehadiran Anda telah berhasil dikonfirmasi. Kami menantikan kehadiran Anda di hari istimewa kami."
          : ticketGuest.rsvpStatus === "NOT_ATTENDING"
            ? "Konfirmasi Anda telah tersimpan. Terima kasih telah memberi kabar bahwa Anda belum dapat hadir."
            : "Konfirmasi Anda telah tersimpan dengan status masih tentatif."}
      </p>
      {attending && ticketUrl && <>
        <div className="mx-auto mt-6 w-fit rounded-2xl bg-white p-3">
          <img src={ticketUrl} alt="QR check-in tamu" width={280} height={280} className="h-auto max-w-full" />
        </div>
        <Button asChild className="mt-5">
          <a href={`${ticketUrl}&download=1`} download="dc-organizer-qr.png">
            <Download aria-hidden="true" className="h-4 w-4" /> Unduh QR Code
          </a>
        </Button>
        <p className="mt-3 text-xs opacity-60">Simpan QR ini dan tunjukkan kepada petugas saat tiba di acara.</p>
      </>}
      {attending && !ticketUrl && <p className="mt-4 text-sm opacity-70">RSVP Anda sudah tersimpan. QR belum tersedia; hubungi pemilik undangan untuk bantuan.</p>}
      {attending && calendarUrl && calendarUrl !== "#" && <div className="mt-3">
        <Button asChild>
          <a href={calendarUrl} target="_blank" rel="noreferrer">
            <CalendarPlus aria-hidden="true" className="h-4 w-4" /> Tambah ke Kalender
          </a>
        </Button>
      </div>}
    </div>
  );
}

export function RsvpInputPanel({
  appearance,
  preview = false,
  guestId,
  guestName,
  invitedPax,
  eventCategory,
  rsvpConfig,
  form,
  setForm,
  message,
  submitting,
  onSubmit,
}: {
  appearance?: "zen";
  preview?: boolean;
  guestId?: string;
  guestName?: string;
  invitedPax?: number;
  eventCategory?: string | null;
  rsvpConfig: InvitationRsvpConfig;
  form: RsvpFormState;
  setForm: (next: RsvpFormState) => void;
  message: string;
  submitting: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 font-[var(--font-fauna)]">
      {(guestName || invitedPax !== undefined) && (
        <div>
          {guestName && (
            <p className="mt-1 text-sm opacity-70">Untuk: {displayTitleCase(guestName)}</p>
          )}
          {invitedPax !== undefined && (
            <p className="mt-1 text-sm opacity-70">Kuota undangan: {invitedPax} orang, termasuk penerima.</p>
          )}
        </div>
      )}

      <div
        data-studio-rsvp-element="inputs"
        style={rsvpElementStyleCss(rsvpConfig, "inputs")}
        className="space-y-4"
      >
      {!guestId && (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-medium">
            Nama
            <Input
              value={form.name}
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
              className="mt-1.5"
              placeholder="Nama lengkap"
              required
            />
          </label>

          <label className="text-xs font-medium">
            No. WhatsApp
            <Input
              value={form.phone}
              onChange={(event) =>
                setForm({ ...form, phone: event.target.value })
              }
              className="mt-1.5"
              placeholder="08xxxxxxxxxx"
              required
            />
          </label>
        </div>
      )}

      {eventCategory === "WEDDING" && form.status === "ATTENDING" && (rsvpConfig.ceremony || rsvpConfig.reception) && (
        <label className="block text-xs font-medium">
          Acara yang akan dihadiri
          <select
            aria-label="Acara yang akan dihadiri"
            value={form.eventChoice}
            onChange={(event) => setForm({ ...form, eventChoice: event.target.value as RsvpFormState["eventChoice"] })}
            className="mt-1.5 w-full rounded-md border border-black/10 bg-transparent px-3 py-2.5 text-sm dark:border-white/10"
            required
          >
            <option value="">Pilih acara</option>
            {rsvpConfig.ceremony && <option value="ceremony">Upacara Nikah</option>}
            {rsvpConfig.reception && <option value="reception">Resepsi</option>}
            {rsvpConfig.attendAll && rsvpConfig.ceremony && rsvpConfig.reception && <option value="all">Hadir Semua Acara</option>}
          </select>
        </label>
      )}

      {appearance === "zen" ? <fieldset className="zen-status-options">
        <legend className="sr-only">Status kehadiran</legend>
        {([["ATTENDING", "Saya Akan Hadir"], ["TENTATIVE", "Saya Mungkin Hadir"], ["NOT_ATTENDING", "Saya Tidak Dapat Hadir"]] as const).map(([value, label]) => <label key={value}>
          <input type="radio" name="attendance" value={value} checked={form.status === value} onChange={() => setForm({ ...form, status: value })} />
          <span>{label}</span>
        </label>)}
      </fieldset> : (<select
        aria-label="Status kehadiran"
        value={form.status}
        onChange={(event) =>
          setForm({ ...form, status: event.target.value })
        }
        className="w-full rounded-md border border-black/10 bg-transparent px-3 py-2.5 text-sm dark:border-white/10"
      >
        <option value="ATTENDING">Saya Akan Hadir</option>
        <option value="NOT_ATTENDING">Saya Tidak Hadir</option>
        <option value="TENTATIVE">Saya Masih Tentatif</option>
      </select>)}

      {form.status === "ATTENDING" && (invitedPax === undefined || invitedPax > 1) && (
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Jumlah pendamping</legend>
        {invitedPax !== undefined && invitedPax > 2 ? (
          <Input
            type="number"
            min={0}
            max={invitedPax - 1}
            step={1}
            value={form.plusOnes}
            onChange={(event) => setForm({ ...form, plusOnes: event.target.value })}
            className="max-w-28"
            aria-label="Jumlah pendamping"
          />
        ) : (
        <>
        <div className="flex gap-5 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="plusOnes"
              value="1"
              checked={form.plusOnes === "1"}
              onChange={(event) =>
                setForm({ ...form, plusOnes: event.target.value })
              }
            />
            Ya
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="plusOnes"
              value="0"
              checked={form.plusOnes === "0"}
              onChange={(event) =>
                setForm({ ...form, plusOnes: event.target.value })
              }
            />
            Tidak
          </label>
        </div>
        </>
        )}
      </fieldset>
      )}

      {rsvpConfig.customFields.length > 0 && (
        <div className="space-y-3">
          {rsvpConfig.customFields.map((field) => (
            <label key={field.id} className="block text-xs font-medium">
              {field.label}
              <Input
                value={form.customAnswers[field.id] ?? ""}
                onChange={(event) => setForm({
                  ...form,
                  customAnswers: { ...form.customAnswers, [field.id]: event.target.value },
                })}
                className="mt-1.5"
                maxLength={200}
                required={field.required && form.status === "ATTENDING"}
              />
            </label>
          ))}
        </div>
      )}

      <Button
        type="submit"
        disabled={submitting}
        aria-disabled={submitting || preview}
        className="rounded-xl bg-[#7A1C25] px-5 py-3 font-[var(--font-fauna)] text-xs text-white hover:bg-[#5E141C]"
      >
        {submitting ? "Menyimpan..." : appearance === "zen" ? "Kirim RSVP" : "Konfirmasi Kehadiran"}
      </Button>
      </div>

      {message && (
        <p
          role="status"
          className="text-sm text-[#5f4a4a] dark:text-white/65"
        >
          {message}
        </p>
      )}
    </form>
  );
}
