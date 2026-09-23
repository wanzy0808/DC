"use client";

import { type FormEvent, useMemo, useState } from "react";
import {
  RsvpInputPanel,
  RsvpSuccessPanel,
} from "@/components/InvitationStudio/RsvpPanels";
import {
  buildGoogleCalendarUrl,
  buildRsvpTicketQrUrl,
  downloadRsvpTicket,
} from "@/components/InvitationStudio/rsvp-helpers";
import type {
  RsvpFormProps,
  RsvpFormState,
  RsvpTicketGuest,
} from "@/components/InvitationStudio/rsvp-types";

export default function RsvpForm({
  slug,
  guestId,
  guestName,
  guestToken,
  invitedPax,
  eventDate,
  venue,
  title,
  start,
  end,
  description,
}: RsvpFormProps) {
  const [form, setForm] = useState<RsvpFormState>({
    name: guestName ?? "",
    phone: "",
    status: "ATTENDING",
    plusOnes: "0",
  });
  const [message, setMessage] = useState("");
  const [ticketGuest, setTicketGuest] = useState<RsvpTicketGuest | null>(null);
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const ticketUrl = useMemo(() => buildRsvpTicketQrUrl(qrToken), [qrToken]);

  const calendarUrl = useMemo(
    () =>
      buildGoogleCalendarUrl({
        title: title || "Acara",
        eventDate: String(eventDate || ""),
        start,
        end,
        venue,
        description,
      }),
    [title, eventDate, start, end, venue, description],
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const response = await fetch(`/api/invite/${slug}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          guestId,
          guestToken,
          plusOnes: Number(form.plusOnes),
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error ?? "RSVP belum dapat disimpan.");
        return;
      }

      setTicketGuest(data.guest);
      setQrToken(data.qrToken ?? null);
      setMessage(
        form.status === "ATTENDING"
          ? "Konfirmasi hadir berhasil."
          : "Konfirmasi kehadiran tersimpan.",
      );
    } catch {
      setMessage("Koneksi bermasalah. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-xl border border-[#9b5b51]/20 bg-[#f3ede6] p-6 text-left shadow-sm dark:border-white/10 dark:bg-[#151116]">
      {ticketGuest && qrToken ? (
        <RsvpSuccessPanel
          ticketGuest={ticketGuest}
          ticketUrl={ticketUrl}
          calendarUrl={calendarUrl}
          onDownload={() =>
            downloadRsvpTicket({
              ticketGuest,
              ticketUrl,
              title,
              venue,
            })
          }
        />
      ) : (
        <RsvpInputPanel
          guestId={guestId}
          guestName={guestName}
          invitedPax={invitedPax}
          form={form}
          setForm={setForm}
          message={message}
          submitting={submitting}
          onSubmit={submit}
        />
      )}
    </section>
  );
}
