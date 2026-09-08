"use client";

import { FormEvent, useState } from "react";

function whatsappNumber(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("0") ? `62${digits.slice(1)}` : digits;
}

export default function RsvpForm({ slug, guestId, guestName }: { slug: string; guestId?: string; guestName?: string }) {
  const [form, setForm] = useState({
    status: "ATTENDING",
    plusOnes: "0",
  });
  const [message, setMessage] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [guestPhone, setGuestPhone] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch(`/api/invite/${slug}/rsvp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, guestId, plusOnes: Number(form.plusOnes) }),
    });
    const data = await response.json();
    if (response.ok) {
      setConfirmed(form.status === "ATTENDING");
      setGuestPhone(data.guest?.phone ?? "");
      setMessage("Konfirmasi kehadiran tersimpan. Terima kasih.");
    } else setMessage(data.error ?? "RSVP belum dapat disimpan.");
  }

  return (
    <form
      onSubmit={submit}
      className="mx-auto max-w-xl space-y-3 border border-[#9b5b51]/20 bg-white/60 p-6 text-left"
    >
      <h2 className="font-serif text-2xl">Konfirmasi Kehadiran</h2>
      {guestName && <p className="text-sm opacity-70">Untuk: {guestName}</p>}
      {confirmed && guestId && <div className="space-y-4 border border-[#7A1C25]/20 bg-[#fff8f5] p-4 dark:bg-white/5"><div><p className="font-serif text-xl text-[#7A1C25]">Terima kasih, {guestName ?? "tamu undangan"}.</p><p className="mt-1 text-sm opacity-70">Konfirmasi hadir kamu sudah kami terima. Simpan QR ini untuk check-in di hari acara.</p></div><img src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(`${window.location.origin}/invite/${slug}?guestId=${guestId}`)}`} alt="QR check-in tamu" className="mx-auto h-44 w-44" />{guestPhone && <a href={`https://wa.me/${whatsappNumber(guestPhone)}?text=${encodeURIComponent(`Terima kasih, ${guestName ?? "tamu"}. Konfirmasi hadir kamu sudah kami terima. QR check-in: ${window.location.origin}/invite/${slug}?guestId=${guestId}`)}`} target="_blank" rel="noreferrer" className="block bg-[#7A1C25] px-4 py-2.5 text-center text-sm text-white">Kirim feedback via WhatsApp</a>}</div>}
      <select
        value={form.status}
        onChange={(event) => setForm({ ...form, status: event.target.value })}
        className="w-full border border-black/10 bg-white px-3 py-2.5 text-sm"
      >
        <option value="ATTENDING">Saya akan hadir</option>
        <option value="NOT_ATTENDING">Saya tidak hadir</option>
        <option value="TENTATIVE">Saya masih tentatif</option>
      </select>
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Bring Plus One?</legend>
        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="plusOnes"
              value="1"
              checked={form.plusOnes === "1"}
              onChange={(event) =>
                setForm({ ...form, plusOnes: event.target.value })
              }
              className="h-4 w-4 accent-dc-maroon"
            />
            Yes
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
              className="h-4 w-4 accent-dc-maroon"
            />
            No
          </label>
        </div>
      </fieldset>
      <button className="bg-dc-maroon px-4 py-2.5 text-sm text-white">
        Konfirmasi
      </button>
      {message && <p className="text-sm opacity-70">{message}</p>}
    </form>
  );
}
