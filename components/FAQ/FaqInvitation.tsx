"use client";

import React, { useState } from "react";
import { useTheme } from "@/components/Theme/ThemeContext";
import { Button } from "@/components/ui/button";

const faqData = [
  {
    no: "01",
    question: "Apakah template undangan digital bisa disesuaikan?",
    answer: "Sangat bisa! Nama, foto prewedding, skema warna, teks cerita, lagu latar (musik), jadwal, lokasi peta, hingga daftar RSVP dapat disesuaikan dengan mudah melalui editor DC Studio atau dibantu oleh tim kami."
  },
  {
    no: "02",
    question: "Apakah saya harus membuat dan mengedit undangan sendiri dari awal?",
    answer: "Tidak harus. Kamu memiliki dua pilihan: kamu bisa mengeditnya sendiri secara bebas & fleksibel di DC Studio, atau cukup kirimkan data & foto kepada tim kami untuk diproses sampai siap dibagikan."
  },
  {
    no: "03",
    question: "Apakah tersedia fitur RSVP online dan QR Check-in tamu?",
    answer: "Ya, sudah termasuk! Tamu dapat melakukan konfirmasi kehadiran (RSVP) langsung melalui link undangan. Setiap tamu yang dikonfirmasi hadir juga akan menerima kode QR unik untuk proses check-in cepat di lokasi acara."
  },
  {
    no: "04",
    question: "Berapa lama proses pengerjaan undangan digital hingga siap sebar?",
    answer: "Draft awal biasanya siap dalam 1-3 hari kerja setelah seluruh data dan media (foto/video) selesai dilengkapi. Waktu final bergantung pada proses revisi dan kelengkapan konten kamu."
  },
  {
    no: "05",
    question: "Berapa kali saya bisa mengajukan revisi atau update data?",
    answer: "Kami menyediakan fasilitas revisi data minor (seperti perubahan jam, lokasi, penambahan daftar nama tamu, atau pergantian lagu) secara gratis hingga hari-H pernikahan."
  },
  {
    no: "06",
    question: "Berapa lama masa aktif link undangan digital ini?",
    answer: "Masa aktif undangan digital berlaku hingga 1 tahun setelah hari-H acara selesai, sehingga momen dan ucapan dari para tamu tetap bisa diakses dan dikenang."
  },
  {
    no: "07",
    question: "Bagaimana sistem pembayaran untuk pemesanan undangan digital?",
    answer: "Pembayaran dilakukan dengan DP sebesar 30% di awal untuk memulai pembuatan draft, dan pelunasan 70% sisanya dilakukan saat undangan digital sudah siap untuk dipublikasikan."
  },
  {
    no: "08",
    question: "Bisa pesan undangan digital saja tanpa layanan Wedding Organizer?",
    answer: "Tentu saja! Layanan undangan digital DC bersifat independen dan dapat dipesan terpisah lengkap dengan link custom name, fitur RSVP, serta sistem QR Code."
  }
];

export default function FaqInvitation() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { isDarkMode } = useTheme();

  const toggleFaq = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className={`border-t pt-24 md:pt-32 space-y-12 ${
      isDarkMode ? "border-white/10" : "border-[#7A1C25]/15"
    }`}>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
        {/* KOLOM KIRI */}
        <div className="md:col-span-5 space-y-5 md:sticky md:top-10">
          <span className={`tracking-[0.25em] text-xs font-mono uppercase block ${
            isDarkMode ? "text-[#C26B70]" : "text-[#7A1C25]"
          }`}>
            [ YANG PALING SERING DITANYA ]
          </span>
          <h2 className="text-3xl md:text-5xl font-serif leading-tight">
            Tanya dulu, <span className={`italic ${isDarkMode ? "text-[#C26B70]" : "text-[#7A1C25]"}`}>sebelum</span> buat undanganmu.
          </h2>
          <p className="opacity-70 text-sm font-light leading-relaxed">
            Punya pertanyaan mengenai fitur editor, sistem RSVP, atau kustomisasi desain? Tanyakan langsung pada tim kami, kami siap membantu.
          </p>
          
          <div className="pt-2">
            <a
              href="https://wa.me/628123456789"
              target="_blank"
              rel="noreferrer"
              className="inline-block"
            >
              <Button
                variant="outline"
                className={`border text-xs font-mono uppercase rounded-full px-7 py-6 transition-all ${
                  isDarkMode 
                    ? "border-[#C26B70]/40 bg-transparent text-[#E8A5AE] hover:bg-[#C26B70] hover:text-white" 
                    : "border-[#7A1C25]/40 bg-transparent text-[#7A1C25] hover:bg-[#7A1C25] hover:text-white"
                }`}
              >
                KONSULTASI LEWAT WHATSAPP →
              </Button>
            </a>
          </div>
        </div>

        {/* KOLOM KANAN: ACCORDION */}
        <div className="md:col-span-7">
          <div className="max-h-[520px] overflow-y-auto pr-3 space-y-4 scrollbar-thin scrollbar-thumb-[#C26B70]/30 scrollbar-track-transparent">
            {faqData.map((item, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  onClick={() => toggleFaq(idx)}
                  className={`p-6 rounded-2xl border transition-all duration-300 cursor-pointer ${
                    isDarkMode
                      ? isOpen
                        ? "bg-[#0A090D] border-[#C26B70] shadow-lg shadow-[#C26B70]/10"
                        : "bg-[#0A090D] border-white/10 hover:border-[#C26B70]/40"
                      : isOpen
                        ? "bg-white border-[#7A1C25] shadow-lg shadow-[#7A1C25]/10"
                        : "bg-white border-[#7A1C25]/15 hover:border-[#7A1C25]/40"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <span className={`font-mono text-xs font-semibold ${
                        isDarkMode ? "text-[#C26B70]" : "text-[#7A1C25]"
                      }`}>
                        {item.no}
                      </span>
                      <h3 className="text-sm md:text-base font-serif">
                        {item.question}
                      </h3>
                    </div>

                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all ${
                        isDarkMode
                          ? isOpen
                            ? "bg-[#C26B70] text-white rotate-180"
                            : "bg-[#C26B70]/20 text-[#E8A5AE] hover:bg-[#C26B70] hover:text-white"
                          : isOpen
                            ? "bg-[#7A1C25] text-white rotate-180"
                            : "bg-[#7A1C25]/10 text-[#7A1C25] hover:bg-[#7A1C25] hover:text-white"
                      }`}
                    >
                      <span className="text-base font-bold font-mono leading-none">
                        {isOpen ? "−" : "+"}
                      </span>
                    </div>
                  </div>

                  {isOpen && (
                    <div className={`mt-4 pt-4 border-t text-xs font-light leading-relaxed opacity-80 ${
                      isDarkMode ? "border-white/10" : "border-black/10"
                    }`}>
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}