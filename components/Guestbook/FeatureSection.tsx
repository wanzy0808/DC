"use client";

import { useState } from "react";
import SectionHeading from "@/components/Marketing/SectionHeading";

const features = [
  {
    title: "QR Check-in Resmi",
    badge: "Venue Entry",
    description:
      "Setiap tamu masuk melalui QR yang valid. Sistem menolak check-in tanpa credential QR resmi.",
    highlights: [
      "QR unik per tamu",
      "Scanner kamera atau input token",
      "Anti double check-in",
    ],
  },
  {
    title: "Verifikasi Tamu",
    badge: "Usher App",
    description:
      "Jika tamu belum RSVP atau belum membawa QR, usher dapat mencari data tamu acara untuk memastikan identitas dan menerbitkan QR resmi.",
    highlights: [
      "Cari nama / WhatsApp",
      "Verifikasi daftar tamu",
      "Terbitkan QR lalu scan",
    ],
  },
  {
    title: "Realtime Attendance",
    badge: "Live Monitoring",
    description:
      "Pantau siapa yang sudah datang, siapa yang belum, dan komposisi plus one secara realtime dari dashboard.",
    highlights: [
      "Statistik hadir realtime",
      "Status RSVP & check-in",
      "Data terpusat",
    ],
  },
  {
    title: "Table & VIP Management",
    badge: "Seating",
    description:
      "Atur meja, jumlah kursi, nomor meja, dan prioritas tamu VIP agar tim penerima tamu dapat memberi arahan dengan cepat.",
    highlights: ["Nama & bentuk meja", "Jumlah kursi", "Nomor meja & plus one"],
  },
  {
    title: "Guest Greeting",
    badge: "Experience",
    description:
      "Hadirkan penyambutan yang lebih personal dengan nama tamu dan ucapan yang dapat ditampilkan di layar venue.",
    highlights: ["Nama tamu", "Ucapan digital", "Tampilan custom"],
  },
  {
    title: "Gift Corner & Giving",
    badge: "After Check-in",
    description:
      "Catat kebutuhan gift corner dan pengelolaan pemberian agar tim acara memiliki data yang lebih rapi selama acara berlangsung.",
    highlights: ["Gift tracking", "Giving management", "Riwayat terpusat"],
  },
];

export default function FeatureSection() {
  const [active, setActive] = useState(0);
  const selected = features[active];

  return (
    <section id="fitur-guestbook" className="scroll-mt-24 border-y border-primary/25 py-14 md:py-20">
      <SectionHeading
        eyebrow="Guestbook System"
        title="Satu alur untuk tamu, usher, meja, dan hari acara"
        description="Guestbook Digital bukan sekadar buku tamu online. Sistem ini dirancang untuk membuat proses masuk venue lebih terkontrol sekaligus memberi tim acara data yang bisa langsung dipakai."
      />
      <div className="mt-12 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-20">
        <div className="border-t border-primary/30">
          {features.map((feature, index) => (
            <button
              key={feature.title}
              type="button"
              onClick={() => setActive(index)}
              className={`flex w-full items-center justify-between border-b border-primary/25 px-2 py-5 text-left transition-colors duration-300 md:py-6 ${
                active === index
                  ? "text-primary"
                  : "text-foreground/70 hover:text-primary"
              }`}
            >
              <span className="font-[family-name:var(--font-undara-heading)] text-xl md:text-2xl">
                {feature.title}
              </span>
              <span className="text-primary">→</span>
            </button>
          ))}
        </div>
        <div aria-live="polite" className="relative border-l border-primary/30 py-5 pl-7 md:pl-12 lg:sticky lg:top-8">
          <span className="font-[family-name:var(--font-undara-mono)] text-[10px] uppercase tracking-[0.2em] text-primary">
            {selected.badge}
          </span>
          <h3 className="mt-5 font-[family-name:var(--font-undara-heading)] text-3xl text-primary md:text-5xl">
            {selected.title}
          </h3>
          <p className="mt-6 max-w-xl font-[family-name:var(--font-undara-body)] text-base leading-8 text-muted-foreground">
            {selected.description}
          </p>
          <ul className="mt-6 space-y-3 border-t border-primary/25 pt-5">
            {selected.highlights.map((item) => (
              <li key={item} className="flex gap-3 font-[family-name:var(--font-undara-body)] text-sm">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
