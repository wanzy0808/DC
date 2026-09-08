"use client";

import React, { useState } from "react";
import Link from "next/link";
import PintuSection from "@/components/Pintu/PintuSection";
import RomanticBackground from "@/components/Layout/background";
import { Button } from "@/components/ui/button";

const doorContents = {
  1: {
    badge: "[ Perencanaan Pernikahan ]",
    title: (
      <>
        Kami yang berdiri di belakang hari besarmu.
      </>
    ),
    description: "Dari konsep sampai vendor, dan rundown sampai menit terakhir resepsi: Kamu hanya perlu hadir dan menikmatinya.",
    features: [
      "Konsep acara & vendor match",
      "Manajemen anggaran & jadwal",
      "Tim eksekusi di lapangan"
    ],
    quote: "Rundown-nya rapi, kami berasa tenang tanpa harus lelah memikirkan detail.",
    quoteAuthor: "Riko & Sarah — WO Client",
    buttonText: "Pilih pintunya →",
    href: "/wedding-planner"
  },
  2: {
    badge: "[ Undangan Digital ]",
    title: (
      <>
        Undanganmu tak hanya cantik tetapi, cepat dan mudah.
      </>
    ),
    description: "Satu tautan berisi undangan, RSVP, buku tamu digital, dan galeri. Tamu cukup membuka ponsel, kamu langsung tahu siapa yang datang.",
    features: [
      "Undangan digital dengan desain kustom",
      "Buku Tamu Digital & QR Check-in",
      "RSVP realtime dan peta lokasi",
      "Katalog pilihan, galeri, dan cerita kamu"
    ],
    quote: "Tamu-tamu senang, absen tetap teratur tanpa antre di meja.",
    quoteAuthor: "Adit & Maya — Digital Client",
    buttonText: "Pilih pintunya →",
    href: "/d-invitation"
  },
  3: {
    badge: "[ Buku Tamu Digital ]",
    title: (
      <>
        Pencatatan tamu presisi tanpa antrean panjang.
      </>
    ),
    description: "Sistem buku tamu digital dengan QR Code check-in instan, ucapan digital real-time, dan laporan kehadiran tamu secara rinci.",
    features: [
      "QR Code Check-in kilat & WhatsApp scanner",
      "Laporan kehadiran tamu otomatis & real-time",
      "Display ucapan layar langsung di venue"
    ],
    quote: "Gak ada antrean menumpuk di meja penerima tamu, jadi serba cepat!",
    quoteAuthor: "Dion & Nina — Guestbook Client",
    buttonText: "Pilih pintunya →",
    href: "/guestbook"
  }
};

const idleHeadlineText = "Pernikahan terkadang terasa rumit tetapi kami hadir untuk menyederhanakannya. Dari konsep, vendor, hingga undangan digital: semua dalam satu platform.";

export default function Home() {
  const [activeDoor, setActiveDoor] = useState<1 | 2 | 3 | null>(null);

  const isIdle = activeDoor === null;
  const selectedDoor = activeDoor ?? 1;
  const currentContent = doorContents[selectedDoor as keyof typeof doorContents];

  const idleWords = idleHeadlineText.split(" ");

  return (
    <div className="h-[calc(100svh-80px)] min-h-[calc(100svh-80px)] max-h-[calc(100svh-80px)] w-full relative overflow-hidden select-none flex flex-col justify-between transition-colors duration-500 bg-[var(--background)] text-[var(--foreground)]">
      
      <RomanticBackground />

      {/* KONTEN UTAMA */}
      <main className="mx-auto px-4 flex-1 flex items-center relative z-10 pt-20 pb-12">
        <section className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-8 items-center w-full">
          
          {/* SISI KIRI: DESKRIPSI DINAMIS */}
          <div className="md:col-span-5 space-y-2 lg:space-y-3">
            <div 
              key={isIdle ? "idle" : selectedDoor} 
              className="animate-in fade-in slide-in-from-bottom-3 duration-500 ease-out space-y-2 lg:space-y-3"
            >
              {isIdle ? (
                <>
                  <span className="tracking-[0.22em] text-sm font-semibold uppercase font-mono block text-[var(--primary)]">
                    DC Wedding - Platform Digitalisasi Pernikahan Terpadu
                  </span>

                  {/* Headline dengan animasi stretch yang singkat dan bertahap */}
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-[family-name:var(--font-dc-heading)] leading-[1.2] tracking-tight text-[var(--foreground)] flex flex-wrap gap-x-[0.25em] gap-y-1">
                    {idleWords.map((word, index) => (
                      <span
                        key={index}
                        className="dc-snappy-word inline-block"
                        style={{
                          animationDelay: `${index * 55}ms`
                        }}
                      >
                        {word}
                      </span>
                    ))}
                  </h1>

                  <p className="text-sm lg:text-base leading-relaxed text-[color:var(--muted-foreground)] opacity-80">
                    Buka salah satu pintu di kanan untuk melihat. Biarkan kami membantu mewujudkan hari bahagiamu.
                  </p>
                </>
              ) : (
                <>
                  <span className="tracking-[0.22em] text-xs md:text-sm font-semibold uppercase font-mono block text-[var(--primary)]">
                    {currentContent.badge}
                  </span>

                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-[family-name:var(--font-dc-heading)] leading-[1.2] tracking-tight text-[var(--foreground)]">
                    {currentContent.title}
                  </h1>

                  <p className="text-sm lg:text-base leading-relaxed text-[color:var(--muted-foreground)] opacity-80">
                    {currentContent.description}
                  </p>

                  <ul className="space-y-1 pt-1">
                    {currentContent.features.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm lg:text-base text-[color:var(--muted-foreground)]">
                        <span className="inline-flex h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-1 pb-1 border-l-2 border-[var(--primary)] pl-3 my-1">
                    <p className="italic text-sm lg:text-base leading-relaxed text-[var(--foreground)]">
                      “{currentContent.quote}”
                    </p>
                    <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-[color:var(--muted-foreground)] block mt-0.5">
                      — {currentContent.quoteAuthor}
                    </span>
                  </div>

                  <div className="pt-1">
                    <Link href={currentContent.href}>
                      <Button className="rounded-full text-xs lg:text-sm tracking-[0.2em] uppercase px-5 py-3 font-semibold shadow-xl text-white transition-all duration-300 transform hover:scale-[1.02] bg-[var(--primary)] hover:brightness-110">
                        {currentContent.buttonText}
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* SISI KANAN: PINTU INTERAKTIF */}
          <div className="md:col-span-7 flex justify-center items-center">
            <PintuSection activeDoor={activeDoor} setActiveDoor={setActiveDoor} />
          </div>

        </section>
      </main>

    </div>
  );
}