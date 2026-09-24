"use client";

import { type FormEvent, useMemo, useState } from "react";
import {
  RsvpInputPanel,
  RsvpSuccessPanel,
} from "@/components/InvitationStudio/RsvpPanels";
import {
  buildGoogleCalendarUrl,
  buildRsvpTicketQrUrl,
} from "@/components/InvitationStudio/rsvp-helpers";
import type {
  RsvpFormProps,
  RsvpFormState,
  RsvpTicketGuest,
} from "@/components/InvitationStudio/rsvp-types";

export default function RsvpForm({
  slug,
  appearance,
  preview = false,
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

  const ticketUrl = useMemo(() => buildRsvpTicketQrUrl(slug, qrToken), [slug, qrToken]);

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
    if (preview) return;
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
    <section className={appearance === "zen" ? "zen-rsvp mx-auto max-w-sm text-left" : "mx-auto max-w-xl border border-[#9b5b51]/20 bg-[#f3ede6] p-6 text-left shadow-sm dark:border-white/10 dark:bg-[#151116]"}>
      {ticketGuest ? (
        <RsvpSuccessPanel
          ticketGuest={ticketGuest}
          ticketUrl={ticketUrl}
          calendarUrl={calendarUrl}
        />
      ) : (
        <RsvpInputPanel
          appearance={appearance}
          preview={preview}
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
