"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTheme } from "@/components/Theme/ThemeContext";
import { Button } from "@/components/ui/button";

// Data fitur Buku Tamu Digital dari Screenshot (Disesuaikan dengan branding)
const guestbookFeatures = [
  {
    id: "device-support",
    title: "Device Support & Scanner",
    badge: "Hardware & App",
    description: "Dukungan perangkat pemindai fleksibel via iPad, Tablet, Smartphone, maupun Scanner Barcode khusus untuk proses check-in tercepat di area meja penerima tamu.",
    highlights: ["Mendukung iOS, Android, & PC", "Pemindaian kilat < 2 detik", "Opsi cetak label nama / souvenir"]
  },
  {
    id: "personalized-invitation",
    title: "Personalized Invitation & QR",
    badge: "Unique Pass",
    description: "Setiap tamu mendapatkan tautan unik berisi QR Code eksklusif sebagai tiket masuk resmi ke venue pernikahan yang dikirim langsung via WhatsApp atau Email.",
    highlights: ["QR Code khusus per tamu/keluarga", "Integrasi WhatsApp Gateways", "Penyapaan nama tamu secara presisi"]
  },
  {
    id: "crew-support",
    title: "Crew & Operator Support",
    badge: "On-Site Team",
    description: "Tim profesional DC siap hadir mendampingi di lokasi acara untuk memandu alur registrasi, membantu tamu, dan memastikan sistem berjalan tanpa kendala.",
    highlights: ["Tim operator berpengalaman di D-Day", "Briefing penerima tamu lokal", "Peralatan teknis cadangan lengkap"]
  },
  {
    id: "rsvp-qr",
    title: "RSVP & Realtime Check-in",
    badge: "Live Monitoring",
    description: "Pantau jumlah tamu yang sudah hadir secara langsung dari Dashboard. Bebas keraguan terkait kuota katering dan kapasitas kursi resepsi.",
    highlights: ["Grafik kehadiran realtime", "Kategori VIP & Tamu Reguler", "Notifikasi kehadiran ke HP pengantin"]
  },
  {
    id: "table-management",
    title: "Table & VIP Management",
    badge: "Seating Arrangement",
    description: "Atur penataan meja dan nomor duduk tamu VIP dengan cepat. Begitu QR discan, sistem akan menampilkan nomor meja tujuan tamu secara otomatis.",
    highlights: ["Peta lokasi meja dinamis", "Prioritas penyambutan VIP", "Sistem alokasi tempat duduk kilat"]
  },
  {
    id: "layar-sapa",
    title: "Layar Sapa & Live Greeting",
    badge: "Interactive Display",
    description: "Tampilkan ucapan selamat dan nama tamu yang baru tiba di layar monitor utama/LED venue sebagai wujud sambutan hangat dan eksklusif.",
    highlights: ["Display animasi penyambutan custom", "Ucap selamat interaktif dari tamu", "Layout menyatu dengan dekorasi"]
  }
];

export default function GuestbookPage() {
  const { isDarkMode } = useTheme();
  // Active feature tab index (Default 0: Device Support)
  const [activeFeature, setActiveFeature] = useState(0);

  const selectedData = guestbookFeatures[activeFeature];

  return (
    <div className="relative z-10 min-h-screen w-full px-6 pb-16 pt-24 text-[var(--foreground)] transition-colors duration-500">
      {/* AMBIENT GLOW BACKGROUND */}
      <div className={`fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] rounded-full blur-[160px] pointer-events-none transition-all duration-700 ${
        isDarkMode 
          ? "bg-gradient-to-b from-[#C26B70]/15 via-[#C26B70]/05 to-transparent" 
          : "bg-gradient-to-b from-[#7A1C25]/10 via-[#C5A059]/15 to-transparent"
      }`} />

      <div className="w-full max-w-[75%] mx-auto relative z-10">
        
        {/* HEADER SECTION */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className={`tracking-[0.22em] text-xs font-semibold uppercase font-mono block ${
            isDarkMode ? "text-[var(--primary)]" : "text-[var(--primary)]"
          }`}>
            [ DIGITAL GUESTBOOK SYSTEM ]
          </span>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-[family-name:var(--font-dc-heading)] tracking-tight">
            Pencatatan Tamu Modern <br />
            <span className="italic font-serif opacity-90">Tanpa Antrean Panjang.</span>
          </h1>

          <p className="text-sm md:text-base leading-relaxed text-[color:var(--muted-foreground)]">
            Hadirkan pengalaman penyambutan tamu yang elegan, rapi, dan cepat dengan teknologi QR Check-in & sistem manajemen presensi otomatis dari DC.
          </p>
        </div>

        {/* KONTEN UTAMA: LAYOUT 2 KOLOM (ACCORDION vs HIGHLIGHT CARD) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* KOLOM KIRI: DAFTAR FITUR (ACCORDION SELECTOR) */}
          <div className="lg:col-span-5 space-y-3">
            {guestbookFeatures.map((feature, idx) => {
              const isActive = activeFeature === idx;
              return (
                <button
                  key={feature.id}
                  onClick={() => setActiveFeature(idx)}
                  className={`w-full text-left p-4 md:p-5 rounded-2xl border transition-all duration-300 flex items-center justify-between group ${
                    isActive
                      ? isDarkMode
                        ? "bg-[#C26B70]/15 border-[#C26B70] shadow-[0_10px_30px_rgba(194,107,112,0.15)]"
                        : "bg-[#7A1C25]/10 border-[#7A1C25] shadow-[0_10px_30px_rgba(122,28,37,0.1)]"
                      : isDarkMode
                        ? "bg-[color:var(--card)] border-[color:var(--border)] hover:border-white/30"
                        : "bg-white/80 border-[color:var(--border)] hover:border-black/20"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`text-xs font-mono font-bold w-6 h-6 rounded-full flex items-center justify-center border ${
                      isActive 
                        ? "bg-[var(--primary)] text-white border-transparent" 
                        : "border-[color:var(--border)] text-[color:var(--muted-foreground)]"
                    }`}>
                      {idx + 1}
                    </span>
                    <span className={`font-serif text-sm md:text-base font-semibold transition-colors ${
                      isActive ? "text-[var(--foreground)]" : "text-[color:var(--muted-foreground)] group-hover:text-[var(--foreground)]"
                    }`}>
                      {feature.title}
                    </span>
                  </div>

                  <span className={`text-lg transition-transform duration-300 ${
                    isActive ? "rotate-90 text-[var(--primary)]" : "text-[color:var(--muted-foreground)]"
                  }`}>
                    →
                  </span>
                </button>
              );
            })}
          </div>

          {/* KOLOM KANAN: CARD DETAIL HIGHLIGHT (Sesuai Konsep Screenshot) */}
          <div className="lg:col-span-7">
            <div className={`p-8 md:p-10 rounded-3xl border relative overflow-hidden transition-all duration-500 ${
              isDarkMode 
                ? "bg-[color:var(--card)] border-[#C26B70]/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)]" 
                : "bg-white border-[#7A1C25]/20 shadow-[0_20px_50px_rgba(122,28,37,0.08)]"
            }`}>
              
              {/* Decorative Watermark / Glow Internal */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--primary)]/10 rounded-full blur-3xl pointer-events-none" />

              <div key={selectedData.id} className="animate-in fade-in slide-in-from-bottom-3 duration-500 space-y-6 relative z-10">
                
                {/* Badge Category */}
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-mono tracking-widest uppercase px-3 py-1 rounded-full border ${
                    isDarkMode 
                      ? "bg-[#C26B70]/20 border-[#C26B70]/40 text-[#E8A5AE]" 
                      : "bg-[#7A1C25]/10 border-[#7A1C25]/30 text-[#7A1C25]"
                  }`}>
                    {selectedData.badge}
                  </span>
                  <span className="text-xs font-mono text-[color:var(--muted-foreground)]">
                    FEATURE 0{activeFeature + 1} OF 06
                  </span>
                </div>

                {/* Title & Description */}
                <h2 className="text-2xl md:text-3xl font-[family-name:var(--font-dc-heading)] font-bold text-[var(--foreground)]">
                  {selectedData.title}
                </h2>

                <p className="text-sm md:text-base leading-relaxed text-[color:var(--muted-foreground)]">
                  {selectedData.description}
                </p>

                {/* Highlight Points */}
                <div className="pt-2">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--foreground)] mb-3 font-semibold">
                    Keunggulan Fitur Ini:
                  </h4>
                  <ul className="space-y-2.5">
                    {selectedData.highlights.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-sm text-[color:var(--muted-foreground)]">
                        <span className="inline-flex h-2 w-2 rounded-full bg-[var(--primary)] shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Call To Actions (CTA) */}
                <div className="pt-6 flex flex-wrap gap-4 items-center border-t border-[color:var(--border)]">
                  <Link href="https://wa.me/6281234567890?text=Halo%20DC,%20saya%20ingin%20konsultasi%20Buku%20Tamu%20Digital" target="_blank">
                    <Button className={`rounded-full text-xs tracking-[0.2em] uppercase px-7 py-5 font-semibold shadow-xl text-white transition-all transform hover:scale-105 ${
                      isDarkMode 
                        ? "bg-[var(--primary)] hover:brightness-110 shadow-[#C26B70]/20" 
                        : "bg-[var(--primary)] hover:brightness-110 shadow-[#7A1C25]/20"
                    }`}>
                      PESAN SEKARANG →
                    </Button>
                  </Link>

                  <Link href="/D-invitation">
                    <Button variant="outline" className="rounded-full text-xs tracking-[0.2em] uppercase px-6 py-5 font-semibold border-[color:var(--border)]">
                      LIHAT DEMO LAINNYA
                    </Button>
                  </Link>
                </div>

              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}