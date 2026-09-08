"use client";

import React, { useState } from "react";
import { useTheme } from "@/components/Theme/ThemeContext";
import { Button } from "@/components/ui/button";

const faqData = [
  {
    no: "01",
    question: "Apakah bisa custom tema sesuai keinginan saya?",
    answer: "Sangat bisa! Tim kami siap menyesuaikan warna, jenis font, background, hingga animasi sesuai dengan konsep dan tema pernikahan impianmu."
  },
  {
    no: "02",
    question: "Apakah ada tim yang membantu dalam proses pengeditan undangan digital?",
    answer: "Ya, kamu akan dibimbing langsung oleh tim support kami untuk pengisian data, upload foto prewedding, penyusunan musik, hingga undangan siap disebar."
  },
  {
    no: "03",
    question: "Berapa kali saya dapat meminta pengeditan dan input data?",
    answer: "Kami memberikan fasilitas revisi minor tanpa batas (unlimited) hingga hari-H untuk perubahan jadwal, lokasi, atau penambahan nama tamu."
  },
  {
    no: "04",
    question: "Bagaimana ketentuan pembayaran di DC?",
    answer: "DP sebesar 30% dilakukan di awal untuk pengerjaan draf, dan pelunasan dilakukan saat draf undangan sudah disetujui dan siap dipublikasikan."
  },
  {
    no: "05",
    question: "Apakah saya membuat undangan digital sendiri dari awal?",
    answer: "Tidak perlu pusing! Kamu cukup mengirimkan data dan foto, tim DC yang akan mengerjakan seluruh tampilan undangan hingga siap pakai."
  },
  {
    no: "06",
    question: "Kapan saya bisa menghubungi tim DC?",
    answer: "Tim customer service dan tim teknis kami siap melayani setiap hari dari pukul 08.00 hingga 21.00 WIB."
  },
  {
    no: "07",
    question: "Bisa ambil Digital Wedding saja tanpa jasa organizer?",
    answer: "Sangat bisa! Layanan Digital Wedding kami dapat dipesan secara berdiri sendiri lengkap dengan domain custom dan sistem QR Code."
  },
  {
    no: "08",
    question: "Berapa lama proses pembuatan undangan digital?",
    answer: "Pengerjaan draf awal memakan waktu 1-3 hari kerja setelah seluruh data dan media (foto/video) kamu lengkapi."
  }
];

export default function FaqSection() {
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
            Tanya dulu, <span className={`italic ${isDarkMode ? "text-[#C26B70]" : "text-[#7A1C25]"}`}>sebelum</span> bayar apa pun.
          </h2>
          <p className="opacity-70 text-sm font-light leading-relaxed">
            Belum menemukan jawaban yang kamu cari? Tanyakan langsung pada tim kami, kami siap membantu merencanakan undangan impianmu.
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
                HUBUNGI KAMI LEWAT WHATSAPP →
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