"use client";

import { useState } from "react";
import SectionHeading from "@/components/Marketing/SectionHeading";

const features = [
  { title: "QR Check-in Resmi", badge: "Venue Entry", description: "Setiap tamu masuk melalui QR yang valid. Sistem menolak check-in tanpa credential QR resmi.", highlights: ["QR unik per tamu", "Scanner kamera atau input token", "Anti double check-in"] },
  { title: "Verifikasi Tamu", badge: "Usher App", description: "Jika tamu belum RSVP atau belum membawa QR, usher mencari data undangan untuk memastikan identitas dan menerbitkan QR resmi.", highlights: ["Cari nama / WhatsApp", "Verifikasi daftar undangan", "Terbitkan QR lalu scan"] },
  { title: "Realtime Attendance", badge: "Live Monitoring", description: "Pantau siapa yang sudah datang, siapa yang belum, dan komposisi plus one secara realtime dari dashboard.", highlights: ["Statistik hadir realtime", "Status RSVP & check-in", "Data terpusat"] },
  { title: "Table & VIP Management", badge: "Seating", description: "Atur meja, jumlah kursi, nomor meja, dan prioritas tamu VIP agar penerima tamu dapat memberi arahan dengan cepat.", highlights: ["Nama & bentuk meja", "Jumlah kursi", "Nomor meja & plus one"] },
  { title: "Guest Greeting", badge: "Experience", description: "Hadirkan penyambutan yang lebih personal dengan nama tamu dan ucapan selamat yang dapat ditampilkan di layar venue.", highlights: ["Nama tamu", "Ucapan digital", "Tampilan custom"] },
  { title: "Gift Corner & Giving", badge: "After Check-in", description: "Catat kebutuhan gift corner dan pengelolaan pemberian agar tim keluarga memiliki data yang lebih rapi selama acara.", highlights: ["Gift tracking", "Giving management", "Riwayat terpusat"] },
];

export default function FeatureSection() {
  const [active, setActive] = useState(0);
  const selected = features[active];

  return (
    <section className="space-y-10">
      <SectionHeading eyebrow="Guestbook System" title="Satu alur untuk tamu, usher, meja, dan hari-H" description="Guestbook Digital bukan sekadar buku tamu online. Sistem ini dirancang untuk membuat proses masuk venue lebih terkontrol sekaligus memberi tim keluarga data yang bisa langsung dipakai." />
      <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
        <div className="space-y-2 lg:col-span-5">
          {features.map((feature, index) => (
            <button key={feature.title} type="button" onClick={() => setActive(index)} className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition md:p-5 ${active === index ? "border-[var(--primary)] bg-[var(--primary)]/[0.07]" : "border-[var(--border)] bg-[var(--card)]/60 hover:border-[var(--primary)]/50"}`}>
              <span className="flex items-center gap-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--border)] text-xs font-mono">{String(index + 1).padStart(2, "0")}</span>
                <span className="font-[family-name:var(--font-dc-heading)] text-sm font-semibold md:text-base">{feature.title}</span>
              </span>
              <span className="text-[var(--primary)]">→</span>
            </button>
          ))}
        </div>
        <div className="lg:col-span-7 rounded-3xl border border-[var(--border)] bg-[var(--card)]/80 p-7 md:p-10">
          <span className="rounded-full border border-[var(--primary)]/30 bg-[var(--primary)]/10 px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-[var(--primary)]">{selected.badge}</span>
          <h3 className="mt-5 font-[family-name:var(--font-dc-heading)] text-2xl md:text-3xl">{selected.title}</h3>
          <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">{selected.description}</p>
          <ul className="mt-6 space-y-3 border-t border-[var(--border)] pt-5">
            {selected.highlights.map((item) => <li key={item} className="flex gap-3 text-sm"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />{item}</li>)}
          </ul>
        </div>
      </div>
    </section>
  );
}
