"use client";

import type { RefObject } from "react";
import {
  Camera,
  CheckCircle2,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DashboardMetricCard,
  DashboardPageHeader,
  DashboardStatusBadge,
} from "@/components/Dashboard/DashboardPrimitives";
import type { UsherGuest } from "@/components/Usher/types";

export function CheckinPanel({
  scannerOpen,
  scannerError,
  videoRef,
  scanInput,
  setScanInput,
  startScanner,
  stopScanner,
  checkInWithQr,
  checkingIn,
  checkedIn,
  guests,
  attendancePercent,
  selectedGuest,
}: {
  scannerOpen: boolean;
  scannerError: string;
  videoRef: RefObject<HTMLVideoElement | null>;
  scanInput: string;
  setScanInput: (value: string) => void;
  startScanner: () => void;
  stopScanner: () => void;
  checkInWithQr: (value: string) => void;
  checkingIn: boolean;
  checkedIn: UsherGuest[];
  guests: UsherGuest[];
  attendancePercent: number;
  selectedGuest: UsherGuest | null;
}) {
  return (
    <section className="space-y-6">
      <DashboardPageHeader
        eyebrow="Hari-H Guest Check-in"
        title="QR adalah tiket masuk"
        description="Scan QR resmi tamu. Pencarian nama tidak bisa melakukan check-in; pencarian hanya tersedia di Daftar Tamu Diundang untuk verifikasi dan penerbitan QR."
      />
      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-2xl border border-border bg-background p-5 shadow-sm sm:p-7">
          <div className="relative overflow-hidden rounded-2xl bg-[#151315]">
            {scannerOpen && !scannerError ? (
              <div className="relative aspect-[4/3]">
                <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
                <div className="pointer-events-none absolute inset-0 grid place-items-center">
                  <div className="h-52 w-52 rounded-2xl border-2 border-primary shadow-[0_0_0_999px_rgba(0,0,0,.25)]" />
                </div>
                <Button onClick={stopScanner} className="absolute right-3 top-3 p-2">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex aspect-[4/3] flex-col items-center justify-center px-8 text-center text-white">
                <div className="mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-primary/15 text-primary">
                  <Camera className="h-8 w-8" />
                </div>
                <h2 className="font-[family-name:var(--font-dc-heading)] text-2xl">
                  Siap menerima tamu?
                </h2>
                <p className="mt-2 max-w-sm text-xs leading-5 text-white/50">
                  Gunakan kamera belakang perangkat untuk memindai QR.
                </p>
                {scannerError && (
                  <p className="mt-4 max-w-sm text-xs text-pink-300">{scannerError}</p>
                )}
                <Button onClick={startScanner} className="mt-5 px-5 py-3 text-xs font-medium">
                  Buka kamera scanner
                </Button>
              </div>
            )}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
            <input
              value={scanInput}
              onChange={(event) => setScanInput(event.target.value)}
              placeholder="Tempel token / link QR resmi"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-xs outline-none focus:border-primary"
            />
            <Button
              onClick={() => checkInWithQr(scanInput)}
              disabled={!scanInput.trim() || checkingIn}
              className="rounded-xl bg-primary px-5 py-3 text-xs font-medium text-white disabled:opacity-40"
            >
              Verifikasi QR
            </Button>
          </div>
        </section>

        <section className="space-y-5">
          <div className="rounded-2xl border border-border bg-background p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Status hari-H
                </p>
                <p className="mt-1 font-[family-name:var(--font-dc-heading)] text-2xl">
                  {checkedIn.length} / {guests.length} tamu
                </p>
              </div>
              <CheckCircle2 className="h-7 w-7 text-primary" />
            </div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-foreground/5">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${attendancePercent}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {attendancePercent}% sudah check-in
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-background p-6">
            <p className="text-xs font-semibold text-foreground">Tamu datang tanpa RSVP?</p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Jangan check-in langsung. Buka <b>Daftar Tamu Diundang</b>, cari namanya,
              pastikan memang diundang, lalu klik <b>Buat QR</b>. Setelah QR muncul,
              scan QR tersebut di sini.
            </p>
          </div>

          {selectedGuest && (
            <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">
                Check-in berhasil
              </p>
              <h2 className="mt-2 font-[family-name:var(--font-dc-heading)] text-3xl text-foreground">
                Selamat datang, {selectedGuest.name}
              </h2>
              <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-300">
                QR valid dan kehadiran sudah tercatat.
              </p>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}

export function UsherStat({ label, value }: { label: string; value: number }) {
  return <DashboardMetricCard label={label} value={value} icon={Users} />;
}

export function RsvpBadge({ status }: { status: string }) {
  const label =
    status === "ATTENDING"
      ? "Hadir"
      : status === "NOT_ATTENDING"
        ? "Tidak hadir"
        : "Belum konfirmasi";

  return (
    <DashboardStatusBadge active={status === "ATTENDING"}>
      {label}
    </DashboardStatusBadge>
  );
}

export function GuestTable({
  guests,
  empty,
}: {
  guests: UsherGuest[];
  empty: string;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-background">
      <div className="border-b border-border px-5 py-4 text-xs font-semibold">
        Tamu ({guests.length})
      </div>
      {guests.length === 0 ? (
        <div className="p-10 text-center text-xs text-muted-foreground">{empty}</div>
      ) : (
        <div className="divide-y divide-border/70">
          {guests.map((guest) => (
            <div
              key={guest.id}
              className="flex items-center justify-between gap-4 px-5 py-4"
            >
              <div>
                <p className="text-sm font-medium">{guest.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {guest.phone || "Nomor tidak tersedia"} · +{guest.plusOnes} pendamping
                </p>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-700 dark:text-emerald-300">
                CHECKED IN
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function FeaturePanel({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <section className="grid min-h-[520px] place-items-center rounded-2xl border border-border bg-background p-8 text-center">
      <div className="max-w-lg">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-background text-primary">
          <Icon className="h-8 w-8" />
        </div>
        <p className="mt-6 text-xs uppercase tracking-[0.22em] text-primary">
          Usher feature
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-dc-heading)] text-4xl">
          {title}
        </h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
    </section>
  );
}
