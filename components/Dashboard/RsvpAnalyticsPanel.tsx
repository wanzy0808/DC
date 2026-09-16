"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownUp,
  CheckCircle2,
  Download,
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
  name: "Nama",
  status: "RSVP",
  pax: "Pax",
  checkedIn: "Check-in",
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
    const header = ["#", "Nama Tamu", "Telepon", "Status RSVP", "Pax", "Check In", "Meja"];
    const lines = [
      header,
      ...filtered.map((guest, index) => [
        index + 1,
        guest.name,
        guest.phone || "",
        statusLabel[guest.rsvpStatus] ?? guest.rsvpStatus,
        guest.plusOnes + 1,
        guest.checkedIn ? "Checked In" : "Belum Check In",
        guest.table?.name || "Belum ditempatkan",
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
    { label: "RSVP", value: stats.total, icon: Users },
    { label: "Hadir", value: stats.attending, icon: CheckCircle2 },
    { label: "Total pax", value: stats.pax, icon: Users },
    { label: "Check-in", value: stats.checkedIn, icon: QrCode },
  ];

  return (
    <div className="mx-auto w-[min(92vw,1400px)] min-w-0 overflow-x-clip pb-16 pt-7 text-foreground sm:pt-8">
      {notice && (
        <div
          className="mb-4 flex min-w-0 items-center gap-2 border border-border px-3 py-2.5 text-xs text-muted-foreground"
          role="status"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
          <span>{notice}</span>
        </div>
      )}

      <section className="grid min-w-0 border-y border-border sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon }) => (
          <article
            key={label}
            className="min-w-0 border-b border-border px-0 py-4 last:border-b-0 sm:border-r sm:px-5 sm:last:border-r-0 xl:border-b-0 xl:first:pl-0"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                {label}
              </p>
              <Icon className="h-4 w-4 shrink-0 text-primary" />
            </div>
            <p className="mt-1 font-[family-name:var(--font-dm-mono)] text-2xl font-medium text-foreground">
              {value}
            </p>
          </article>
        ))}
      </section>

      <section className="mt-8 min-w-0 border-t border-border">
        <div className="flex flex-col gap-4 border-b border-border py-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-baseline gap-3">
              <h2 className="font-[family-name:var(--font-cinzel)] text-lg font-semibold">Daftar tamu</h2>
              <span className="font-[family-name:var(--font-dm-mono)] text-[9px] text-muted-foreground">
                {filtered.length}/{guests.length}
              </span>
            </div>
          </div>

          <div className="grid min-w-0 gap-2 sm:grid-cols-[minmax(14rem,1fr)_minmax(10rem,auto)_auto_auto] sm:items-end">
            <div className="relative min-w-0">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/45" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari nama / telepon"
                className="min-w-0 pl-9"
              />
            </div>

            <select
              value={sortKey}
              onChange={(event) => setSortKey(event.target.value as SortKey)}
              className="h-10 w-full min-w-0 rounded-[10px] border border-border bg-background px-3 text-xs text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              aria-label="Urutkan tamu"
            >
              {(Object.keys(sortLabel) as SortKey[]).map((key) => (
                <option key={key} value={key}>
                  {sortLabel[key]}
                </option>
              ))}
            </select>

            <Button
              size="icon"
              onClick={() => setAscending((value) => !value)}
              title={ascending ? "Urutan naik" : "Urutan turun"}
              aria-label={ascending ? "Ubah ke urutan turun" : "Ubah ke urutan naik"}
            >
              <ArrowDownUp className="h-4 w-4" />
            </Button>

            <Button onClick={exportCsv} size="sm">
              <Download className="h-4 w-4" />
              CSV
            </Button>
          </div>
        </div>

        <div className="min-w-0 overflow-x-auto">
          <table className="w-full min-w-[820px] text-left">
            <thead>
              <tr className="border-b border-border font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.12em] text-foreground/50">
                <th className="px-3 py-3 font-medium">#</th>
                <th className="px-3 py-3 font-medium">Nama</th>
                <th className="px-3 py-3 font-medium">RSVP</th>
                <th className="px-3 py-3 font-medium">Pax</th>
                <th className="px-3 py-3 font-medium">Check-in</th>
                <th className="px-3 py-3 font-medium">Meja</th>
                <th className="px-3 py-3 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((guest, index) => (
                <tr
                  key={guest.id}
                  className="border-b border-border/80 text-xs transition-colors hover:bg-foreground/[0.025]"
                >
                  <td className="px-3 py-3 font-[family-name:var(--font-dm-mono)] text-foreground/45">
                    {String(index + 1).padStart(2, "0")}
                  </td>
                  <td className="px-3 py-3">
                    <p className="font-semibold text-foreground">{guest.name}</p>
                    <p className="mt-0.5 text-[10px] text-foreground/50">
                      {guest.phone || "Tanpa nomor"}
                    </p>
                  </td>
                  <td className="px-3 py-3">
                    <span className="font-[family-name:var(--font-dm-mono)] text-[10px] text-foreground/70">
                      {statusLabel[guest.rsvpStatus] ?? guest.rsvpStatus}
                    </span>
                  </td>
                  <td className="px-3 py-3 font-[family-name:var(--font-dm-mono)] text-foreground/70">
                    {guest.plusOnes + 1}
                  </td>
                  <td className="px-3 py-3">
                    {guest.checkedIn ? (
                      <span className="font-semibold text-emerald-700 dark:text-emerald-300">Sudah</span>
                    ) : (
                      <span className="text-foreground/55">Belum</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-foreground/65">
                    {guest.table?.name || "—"}
                  </td>
                  <td className="px-3 py-3">
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
                        title="Check-in manual"
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
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-foreground/50">
                    Tidak ada data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {slug && (
          <p className="border-b border-border px-1 py-3 font-[family-name:var(--font-dm-mono)] text-[9px] text-foreground/45">
            /invite/{slug}
          </p>
        )}
      </section>

      {qr && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-black/70 p-4"
          onClick={() => setQr(null)}
        >
          <div
            className="relative w-full max-w-sm rounded-xl border border-border bg-background p-6 text-center text-foreground shadow-2xl"
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
            <div className="mx-auto mt-5 w-fit border border-border bg-white p-3">
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
