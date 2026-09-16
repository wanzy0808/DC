"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownUp,
  CheckCircle2,
  Download,
  Gift,
  Heart,
  QrCode,
  Search,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type RsvpGuest = {
  id: string;
  name: string;
  phone: string | null;
  rsvpStatus: string;
  plusOnes: number;
  checkedIn?: boolean;
  table?: { id: string; name: string; shape: string; capacity: number } | null;
  tableId?: string | null;
};

type Props = { guests: RsvpGuest[]; slug: string; accent: string };
type SortKey = "name" | "status" | "pax" | "checkedIn";

const statusLabel: Record<string, string> = {
  ATTENDING: "Hadir",
  NOT_ATTENDING: "Tidak Hadir",
  TENTATIVE: "Ragu",
};

const sortLabel: Record<SortKey, string> = {
  name: "Nama tamu",
  status: "Status RSVP",
  pax: "Jumlah pax",
  checkedIn: "Status check-in",
};

export default function RsvpAnalyticsPanel({ guests, slug }: Props) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [ascending, setAscending] = useState(true);
  const [qr, setQr] = useState<{ name: string; token: string } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const stats = useMemo(
    () => ({
      total: guests.length,
      attending: guests.filter((guest) => guest.rsvpStatus === "ATTENDING").length,
      pax: guests.reduce((sum, guest) => sum + guest.plusOnes + 1, 0),
      checkedIn: guests.filter((guest) => guest.checkedIn).length,
    }),
    [guests],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = guests.filter(
      (guest) =>
        !q ||
        guest.name.toLowerCase().includes(q) ||
        (guest.phone ?? "").includes(q),
    );

    return [...rows].sort((a, b) => {
      const av =
        sortKey === "name"
          ? a.name.toLowerCase()
          : sortKey === "status"
            ? (statusLabel[a.rsvpStatus] ?? a.rsvpStatus)
            : sortKey === "pax"
              ? a.plusOnes + 1
              : a.checkedIn
                ? 1
                : 0;
      const bv =
        sortKey === "name"
          ? b.name.toLowerCase()
          : sortKey === "status"
            ? (statusLabel[b.rsvpStatus] ?? b.rsvpStatus)
            : sortKey === "pax"
              ? b.plusOnes + 1
              : b.checkedIn
                ? 1
                : 0;

      if (av < bv) return ascending ? -1 : 1;
      if (av > bv) return ascending ? 1 : -1;
      return 0;
    });
  }, [ascending, guests, query, sortKey]);

  function exportCsv() {
    const header = [
      "#",
      "Nama Tamu",
      "Status RSVP",
      "QR",
      "Check In",
      "Acara",
      "Hadiah",
      "Pax",
    ];
    const lines = [
      header,
      ...filtered.map((guest, index) => [
        index + 1,
        guest.name,
        statusLabel[guest.rsvpStatus] ?? guest.rsvpStatus,
        "Not tracked",
        guest.checkedIn ? "Checked In" : "Belum Check In",
        "Undangan",
        "Belum tersedia",
        guest.plusOnes + 1,
      ]),
    ];
    const csv = lines
      .map((row) =>
        row
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(","),
      )
      .join("\n");
    const url = URL.createObjectURL(
      new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "dc-organizer-rsvp.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function showQr(guest: RsvpGuest) {
    setBusyId(guest.id);
    setNotice("");
    try {
      const response = await fetch("/api/usher/qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestId: guest.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "QR gagal dibuat.");
      setQr({ name: guest.name, token: data.token });
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "QR gagal dibuat.");
    } finally {
      setBusyId(null);
    }
  }

  async function manualCheckIn(guest: RsvpGuest) {
    if (guest.checkedIn || !confirm(`Check-in manual ${guest.name}?`)) return;
    setBusyId(guest.id);
    setNotice("");
    try {
      const response = await fetch("/api/usher/manual-checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestId: guest.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Check-in gagal.");
      setNotice(`${guest.name} berhasil check-in.`);
      window.location.reload();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Check-in gagal.");
    } finally {
      setBusyId(null);
    }
  }

  const metrics = [
    {
      label: "Total Undangan RSVP",
      value: stats.total,
      icon: Users,
      note: "Form RSVP masuk",
    },
    {
      label: "Konfirmasi Hadir",
      value: stats.attending,
      icon: CheckCircle2,
      note: "Status hadir",
    },
    {
      label: "Total Keseluruhan Tamu",
      value: stats.pax,
      icon: Users,
      note: "Pax termasuk pendamping",
    },
    {
      label: "Tamu Sudah Check In",
      value: stats.checkedIn,
      icon: QrCode,
      note: "Scan QR berhasil",
    },
    {
      label: "Tamu Memberi Angpao",
      value: "—",
      icon: Heart,
      note: "Tracking hadiah belum tersedia",
    },
    {
      label: "Tamu Memberi Kado",
      value: "—",
      icon: Gift,
      note: "Tracking hadiah belum tersedia",
    },
  ];

  return (
    <div className="mx-auto w-[min(92vw,1400px)] min-w-0 overflow-x-clip pb-16 pt-8 text-foreground sm:pt-12">
      <section className="border-y border-border py-9 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(18rem,.9fr)] lg:items-end">
          <div className="min-w-0">
            <p className="font-[family-name:var(--font-dm-mono)] text-[10px] uppercase tracking-[0.18em] text-foreground/60">
              RSVP / Analytics
            </p>
            <h2 className="mt-3 max-w-3xl font-[family-name:var(--font-cinzel)] text-3xl font-semibold leading-tight tracking-tight text-primary sm:text-4xl">
              Rekap kehadiran tamu
            </h2>
          </div>
          <div className="min-w-0 lg:border-l lg:border-border lg:pl-8">
            <p className="max-w-xl font-[family-name:var(--font-fauna)] text-sm leading-7 text-foreground/70">
              Ringkasan RSVP, check-in, dan daftar tamu yang tersinkron dari formulir undangan publik.
            </p>
            <p className="mt-4 font-[family-name:var(--font-dm-mono)] text-[10px] uppercase tracking-[0.14em] text-foreground/50">
              {guests.length} data tamu tersimpan
            </p>
          </div>
        </div>
      </section>

      {notice && (
        <div
          className="flex min-w-0 items-center gap-2 border-b border-border px-1 py-3 font-[family-name:var(--font-dm-mono)] text-[10px] text-foreground/70"
          role="status"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
          <span>{notice}</span>
        </div>
      )}

      <section className="mt-12 min-w-0">
        <div className="mb-5 flex items-end justify-between gap-4 border-b border-border pb-4">
          <div>
            <p className="font-[family-name:var(--font-dm-mono)] text-[10px] uppercase tracking-[0.18em] text-foreground/60">
              01 / Ringkasan
            </p>
            <h3 className="mt-2 font-[family-name:var(--font-cinzel)] text-2xl font-semibold text-primary">
              Kehadiran dalam angka
            </h3>
          </div>
        </div>

        <div className="grid min-w-0 border-b border-border sm:grid-cols-2 xl:grid-cols-3">
          {metrics.map(({ label, value, icon: Icon, note }, index) => (
            <article
              key={label}
              className={`min-w-0 border-t border-border py-6 sm:px-5 xl:px-6 ${
                index % 2 === 0 ? "sm:border-r" : ""
              } ${index % 3 !== 2 ? "xl:border-r" : "xl:border-r-0"}`}
            >
              <div className="flex items-start justify-between gap-4">
                <p className="max-w-[15rem] font-[family-name:var(--font-fauna)] text-xs leading-5 text-foreground/65">
                  {label}
                </p>
                <Icon className="h-4 w-4 shrink-0 text-primary" />
              </div>
              <p className="mt-5 font-[family-name:var(--font-dm-mono)] text-3xl font-medium tracking-tight text-foreground">
                {value}
              </p>
              <p className="mt-2 font-[family-name:var(--font-fauna)] text-[11px] leading-5 text-foreground/50">
                {note}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-14 min-w-0 border-t border-border pt-8">
        <div className="flex flex-col gap-6 border-b border-border pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="font-[family-name:var(--font-dm-mono)] text-[10px] uppercase tracking-[0.18em] text-foreground/60">
              02 / Guest directory
            </p>
            <h3 className="mt-2 font-[family-name:var(--font-cinzel)] text-2xl font-semibold text-primary">
              Daftar tamu RSVP
            </h3>
            <p className="mt-2 font-[family-name:var(--font-fauna)] text-xs text-foreground/55">
              Menampilkan {filtered.length} dari {guests.length} data.
            </p>
          </div>

          <div className="grid min-w-0 gap-3 sm:grid-cols-[minmax(14rem,1fr)_minmax(12rem,auto)_auto_auto] sm:items-end">
            <label className="min-w-0">
              <span className="mb-2 block font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.14em] text-foreground/50">
                Cari tamu
              </span>
              <div className="relative min-w-0">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/45" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Nama atau nomor telepon"
                  className="min-w-0 pl-9"
                />
              </div>
            </label>

            <label className="min-w-0">
              <span className="mb-2 block font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.14em] text-foreground/50">
                Urutkan
              </span>
              <select
                value={sortKey}
                onChange={(event) => setSortKey(event.target.value as SortKey)}
                className="h-10 w-full min-w-0 rounded-[10px] border border-border bg-background px-3 font-[family-name:var(--font-fauna)] text-xs text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              >
                {(Object.keys(sortLabel) as SortKey[]).map((key) => (
                  <option key={key} value={key}>
                    {sortLabel[key]}
                  </option>
                ))}
              </select>
            </label>

            <Button
              size="icon"
              onClick={() => setAscending((value) => !value)}
              title={ascending ? "Urutan naik" : "Urutan turun"}
              aria-label={ascending ? "Ubah ke urutan turun" : "Ubah ke urutan naik"}
            >
              <ArrowDownUp className="h-4 w-4" />
            </Button>

            <Button onClick={exportCsv}>
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        <div className="min-w-0 overflow-x-auto">
          <table className="w-full min-w-[920px] text-left">
            <thead>
              <tr className="border-b border-border font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.12em] text-foreground/50">
                <th className="px-3 py-4 font-medium">#</th>
                <th className="px-3 py-4 font-medium">Nama Tamu</th>
                <th className="px-3 py-4 font-medium">Status RSVP</th>
                <th className="px-3 py-4 font-medium">QR</th>
                <th className="px-3 py-4 font-medium">Check In</th>
                <th className="px-3 py-4 font-medium">Acara</th>
                <th className="px-3 py-4 font-medium">Hadiah</th>
                <th className="px-3 py-4 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((guest, index) => (
                <tr
                  key={guest.id}
                  className="border-b border-border/80 font-[family-name:var(--font-fauna)] text-xs transition-colors hover:bg-foreground/[0.025]"
                >
                  <td className="px-3 py-4 font-[family-name:var(--font-dm-mono)] text-foreground/45">
                    {String(index + 1).padStart(2, "0")}
                  </td>
                  <td className="px-3 py-4">
                    <p className="font-semibold text-foreground">{guest.name}</p>
                    <p className="mt-1 text-[10px] text-foreground/50">
                      {guest.phone || "Tanpa nomor"}
                    </p>
                  </td>
                  <td className="px-3 py-4">
                    <span className="inline-flex border-b border-primary/40 pb-0.5 font-[family-name:var(--font-dm-mono)] text-[10px] text-foreground/70">
                      {statusLabel[guest.rsvpStatus] ?? guest.rsvpStatus}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-foreground/55">Not tracked</td>
                  <td className="px-3 py-4">
                    {guest.checkedIn ? (
                      <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                        Checked In
                      </span>
                    ) : (
                      <span className="text-foreground/60">Belum Check In</span>
                    )}
                  </td>
                  <td className="px-3 py-4 text-foreground/70">Undangan</td>
                  <td className="px-3 py-4 text-foreground/50">Belum tersedia</td>
                  <td className="px-3 py-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="icon-sm"
                        title="Kode QR"
                        aria-label={`Buat QR untuk ${guest.name}`}
                        disabled={busyId === guest.id}
                        onClick={() => showQr(guest)}
                      >
                        <QrCode className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon-sm"
                        title="Check In Manual"
                        aria-label={`Check-in manual ${guest.name}`}
                        disabled={busyId === guest.id || Boolean(guest.checkedIn)}
                        onClick={() => manualCheckIn(guest)}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

              {!filtered.length && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-16 text-center font-[family-name:var(--font-fauna)] text-sm text-foreground/50"
                  >
                    Belum ada data RSVP yang cocok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {slug && (
          <p className="border-b border-border px-1 py-4 font-[family-name:var(--font-dm-mono)] text-[9px] text-foreground/45">
            Sumber: /invite/{slug}
          </p>
        )}
      </section>

      {qr && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-black/70 p-4"
          onClick={() => setQr(null)}
        >
          <div
            className="relative w-full max-w-sm border border-border bg-background p-6 text-center text-foreground shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <Button
              size="icon-sm"
              onClick={() => setQr(null)}
              className="absolute right-3 top-3"
              aria-label="Tutup QR ticket"
            >
              <X className="h-4 w-4" />
            </Button>
            <p className="pr-10 font-[family-name:var(--font-cinzel)] text-lg font-semibold text-primary">
              {qr.name}
            </p>
            <p className="mt-1 font-[family-name:var(--font-fauna)] text-xs text-foreground/55">
              Guest QR Ticket
            </p>
            <div className="mx-auto mt-6 w-fit border border-border bg-white p-3">
              <img
                className="h-56 w-56"
                alt="QR guest ticket"
                src={`https://api.qrserver.com/v1/create-qr-code/?size=560x560&data=${encodeURIComponent(qr.token)}`}
              />
            </div>
            <p className="mt-4 break-all font-[family-name:var(--font-dm-mono)] text-[8px] leading-4 text-foreground/45">
              {qr.token}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
