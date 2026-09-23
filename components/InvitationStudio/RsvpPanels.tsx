"use client";

import type { FormEvent } from "react";
import {
  CalendarPlus,
  CheckCircle2,
  Download,
  QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  RsvpFormState,
  RsvpTicketGuest,
} from "@/components/InvitationStudio/rsvp-types";

export function RsvpSuccessPanel({
  ticketGuest,
  ticketUrl,
  calendarUrl,
  onDownload,
}: {
  ticketGuest: RsvpTicketGuest;
  ticketUrl: string;
  calendarUrl: string;
  onDownload: () => void;
}) {
  return (
    <div className="text-center">
      <CheckCircle2 className="mx-auto h-8 w-8 text-[#7A1C25] dark:text-[#E8A5AE]" />
      <p className="mt-3 font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-[#7A1C25] dark:text-[#E8A5AE]">
        Smart RSVP berhasil
      </p>
      <h2 className="mt-2 font-[var(--font-cinzel)] text-3xl">
        Terima kasih, {ticketGuest.name}.
      </h2>
      <p className="mt-2 font-[var(--font-fauna)] text-sm text-[#5f4a4a] dark:text-white/65">
        Simpan Digital Ticket ini. QR di bawah adalah tiket unik untuk check-in
        hari H.
      </p>

      <div className="mx-auto mt-6 w-fit rounded-2xl border border-[#9b5b51]/20 bg-white p-3 dark:bg-[#f8f1ea]">
        <img
          src={ticketUrl}
          alt="QR Digital Ticket"
          className="h-64 w-64"
        />
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        <a
          href={ticketUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#7A1C25] px-4 py-3 font-[var(--font-fauna)] text-xs font-medium text-white"
        >
          <QrCode className="h-4 w-4" />
          Simpan QR
        </a>

        <Button
          type="button"
          onClick={onDownload}
          variant="outline"
          className="h-auto rounded-xl border-[#7A1C25]/20 py-3 font-[var(--font-fauna)] text-xs"
        >
          <Download className="h-4 w-4" />
          Download Ticket
        </Button>
      </div>

      <a
        href={calendarUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#7A1C25]/20 px-4 py-3 font-[var(--font-fauna)] text-xs text-[#7A1C25] dark:text-[#E8A5AE]"
      >
        <CalendarPlus className="h-4 w-4" />
        Tambah ke Google Calendar
      </a>

      <p className="mt-4 font-mono text-[10px] text-[#6c5a5a] dark:text-white/50">
        Tiket tetap dapat ditunjukkan langsung dari ponsel saat tiba di venue.
      </p>
    </div>
  );
}

export function RsvpInputPanel({
  guestId,
  guestName,
  invitedPax,
  form,
  setForm,
  message,
  submitting,
  onSubmit,
}: {
  guestId?: string;
  guestName?: string;
  invitedPax?: number;
  form: RsvpFormState;
  setForm: (next: RsvpFormState) => void;
  message: string;
  submitting: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 font-[var(--font-fauna)]">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#9b5b51]">
          Smart RSVP
        </p>
        <h2 className="mt-2 font-[var(--font-cinzel)] text-2xl">
          Konfirmasi Kehadiran
        </h2>
        {guestName && (
          <p className="mt-1 text-sm opacity-70">Untuk: {guestName}</p>
        )}
        {invitedPax !== undefined && (
          <p className="mt-1 text-sm opacity-70">Kuota undangan: {invitedPax} orang, termasuk penerima.</p>
        )}
      </div>

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

      <select
        aria-label="Status kehadiran"
        value={form.status}
        onChange={(event) =>
          setForm({ ...form, status: event.target.value })
        }
        className="w-full rounded-md border border-black/10 bg-transparent px-3 py-2.5 text-sm dark:border-white/10"
      >
        <option value="ATTENDING">Saya akan hadir</option>
        <option value="NOT_ATTENDING">Saya tidak hadir</option>
        <option value="TENTATIVE">Saya masih tentatif</option>
      </select>

      {(invitedPax === undefined || invitedPax > 1) && (
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

      <Button
        type="submit"
        disabled={submitting}
        className="rounded-xl bg-[#7A1C25] px-5 py-3 font-[var(--font-fauna)] text-xs text-white hover:bg-[#5E141C]"
      >
        {submitting ? "Menyimpan..." : "Konfirmasi Kehadiran"}
      </Button>

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
