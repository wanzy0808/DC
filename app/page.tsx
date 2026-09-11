"use client";

import React, { useState } from "react";
import Link from "next/link";
import PintuSection from "@/components/Pintu/PintuSection";
import RomanticBackground from "@/components/Layout/background";
import { Button } from "@/components/ui/button";

const doorContents = {
  1: {
    badge: "[ Perencanaan Pernikahan ]",
    title: <>Kami yang berdiri di belakang hari besarmu.</>,
    description:
      "Dari konsep sampai vendor, dan rundown sampai menit terakhir resepsi: Kamu hanya perlu hadir dan menikmatinya.",
    features: [
      "Konsep acara & vendor match",
      "Manajemen anggaran & jadwal",
      "Tim eksekusi di lapangan",
    ],
    quote:
      "Rundown-nya rapi, kami berasa tenang tanpa harus lelah memikirkan detail.",
    quoteAuthor: "Riko & Sarah — WO Client",
    buttonText: "Pilih pintunya →",
    href: "/wedding-planner",
  },
  2: {
    badge: "[ Undangan Digital ]",
    title: <>Undanganmu tak hanya cantik tetapi, cepat dan mudah.</>,
    description:
      "Satu tautan berisi undangan, RSVP, buku tamu digital, dan galeri. Tamu cukup membuka ponsel, kamu langsung tahu siapa yang datang.",
    features: [
      "Undangan digital dengan desain kustom",
      "Buku Tamu Digital & QR Check-in",
      "RSVP realtime dan peta lokasi",
      "Katalog pilihan, galeri, dan cerita kamu",
    ],
    quote:
      "Tamu-tamu senang, absen tetap teratur tanpa antre di meja penerima tamu.",
    quoteAuthor: "Adit & Maya — Digital Client",
    buttonText: "Pilih pintunya →",
    href: "/d-invitation",
  },
  3: {
    badge: "[ Buku Tamu Digital ]",
    title: <>Pencatatan tamu presisi tanpa antrean panjang.</>,
    description:
      "Sistem buku tamu digital dengan QR Code check-in instan, ucapan digital real-time, dan laporan kehadiran tamu secara rinci.",
    features: [
      "QR Code Check-in kilat & WhatsApp scanner",
      "Laporan kehadiran tamu otomatis & real-time",
      "Display ucapan layar langsung di venue",
    ],
    quote: "Gak ada antrean menumpuk di meja penerima tamu, jadi serba cepat!",
    quoteAuthor: "Dion & Nina — Guestbook Client",
    buttonText: "Pilih pintunya →",
    href: "/guestbook",
  },
};

const idleHeadlineText =
  "Pernikahan terkadang terasa rumit tetapi kami hadir untuk menyederhanakannya. Dari konsep, vendor, hingga undangan digital: semua dalam satu platform.";

export default function Home() {
  const [activeDoor, setActiveDoor] = useState<1 | 2 | 3 | null>(null);
  const isIdle = activeDoor === null;
  const selectedDoor = activeDoor ?? 1;
  const currentContent =
    doorContents[selectedDoor as keyof typeof doorContents];
  const idleWords = idleHeadlineText.split(" ");

  return (
    <div className="relative flex h-[calc(100svh-80px)] min-h-[calc(100svh-80px)] max-h-[calc(100svh-80px)] w-full select-none flex-col justify-between overflow-hidden bg-[var(--background)] text-[var(--foreground)] transition-colors duration-500">
      <RomanticBackground />

      <main className="relative z-10 mx-auto flex w-[75vw] max-w-[1400px] flex-1 items-center px-0 pt-6 pb-5 lg:pt-8 lg:pb-6">
        <section className="grid w-full grid-cols-1 items-center gap-3 md:grid-cols-12 lg:gap-6">
          <div className="space-y-2 md:col-span-5 lg:space-y-4">
            <div
              key={isIdle ? "idle" : selectedDoor}
              className="animate-in fade-in slide-in-from-bottom-3 space-y-2 duration-500 ease-out lg:space-y-4"
            >
              {isIdle ? (
                <>
                  <span className="block font-mono text-[15px] font-semibold uppercase tracking-[0.24em] text-[var(--primary)] sm:text-xs">
                    DC Wedding · Platform Digitalisasi Pernikahan Terpadu
                  </span>
                  <h1 className="flex max-w-xl flex-wrap gap-x-[0.25em] gap-y-1 font-[family-name:var(--font-dc-heading)] text-2xl leading-[1.15] tracking-tight text-[var(--foreground)] sm:text-3xl lg:text-4xl">
                    {idleWords.map((word, index) => (
                      <span
                        key={index}
                        className="dc-snappy-word inline-block"
                        style={{ animationDelay: `${index * 45}ms` }}
                      >
                        {word}
                      </span>
                    ))}
                  </h1>
                  <p className="max-w-lg text-sm leading-relaxed text-[color:var(--muted-foreground)] sm:text-base">
                    Buka salah satu pintu di kanan untuk melihat. Biarkan kami
                    membantu mewujudkan hari bahagiamu.
                  </p>
                </>
              ) : (
                <>
                  <span className="block font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--primary)] sm:text-xs">
                    {currentContent.badge}
                  </span>
                  <h1 className="max-w-xl font-[family-name:var(--font-dc-heading)] text-2xl leading-[1.15] tracking-tight text-[var(--foreground)] sm:text-3xl lg:text-4xl">
                    {currentContent.title}
                  </h1>
                  <p className="max-w-lg text-sm leading-relaxed text-[color:var(--muted-foreground)] sm:text-base">
                    {currentContent.description}
                  </p>
                  <ul className="space-y-1.5 pt-1">
                    {currentContent.features.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2 text-sm text-[color:var(--muted-foreground)] sm:text-base"
                      >
                        <span className="inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="my-1 border-l-2 border-[var(--primary)] py-1 pl-3">
                    <p className="text-sm italic leading-relaxed text-[var(--foreground)] sm:text-base">
                      “{currentContent.quote}”
                    </p>
                    <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--muted-foreground)]">
                      — {currentContent.quoteAuthor}
                    </span>
                  </div>
                  <Link href={currentContent.href} className="inline-flex pt-1">
                    <Button className="rounded-full bg-primary px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground shadow-lg transition hover:bg-primary/85">
                      {currentContent.buttonText}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center md:col-span-7">
            <PintuSection
              activeDoor={activeDoor}
              setActiveDoor={setActiveDoor}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
