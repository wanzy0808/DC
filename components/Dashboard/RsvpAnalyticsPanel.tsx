"use client";

import { useMemo, useState } from "react";
import { ArrowDownUp, CheckCircle2, Download, Gift, Heart, QrCode, Search, Users } from "lucide-react";
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

export default function RsvpAnalyticsPanel({ guests, slug, accent }: Props) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [ascending, setAscending] = useState(true);

  const stats = useMemo(() => ({
    total: guests.length,
    attending: guests.filter(g => g.rsvpStatus === "ATTENDING").length,
    pax: guests.reduce((sum, g) => sum + g.plusOnes + 1, 0),
    checkedIn: guests.filter(g => g.checkedIn).length,
  }), [guests]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = guests.filter(g => !q || g.name.toLowerCase().includes(q) || (g.phone ?? "").includes(q));
    return [...rows].sort((a, b) => {
      const av = sortKey === "name" ? a.name.toLowerCase() : sortKey === "status" ? (statusLabel[a.rsvpStatus] ?? a.rsvpStatus) : sortKey === "pax" ? a.plusOnes + 1 : a.checkedIn ? 1 : 0;
      const bv = sortKey === "name" ? b.name.toLowerCase() : sortKey === "status" ? (statusLabel[b.rsvpStatus] ?? b.rsvpStatus) : sortKey === "pax" ? b.plusOnes + 1 : b.checkedIn ? 1 : 0;
      if (av < bv) return ascending ? -1 : 1;
      if (av > bv) return ascending ? 1 : -1;
      return 0;
    });
  }, [guests, query, sortKey, ascending]);

  function changeSort(key: SortKey) {
    if (sortKey === key) setAscending(v => !v);
    else { setSortKey(key); setAscending(true); }
  }

  function exportCsv() {
    const header = ["#", "Nama Tamu", "Status RSVP", "QR", "Check In", "Acara", "Hadiah", "Pax"];
    const lines = [header, ...filtered.map((g, i) => [i + 1, g.name, statusLabel[g.rsvpStatus] ?? g.rsvpStatus, "Not tracked", g.checkedIn ? "Checked In" : "Belum Check In", "Undangan", "Belum tersedia", g.plusOnes + 1])];
    const csv = lines.map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "dc-wedding-rsvp.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  const metrics = [
    { label: "Total Undangan RSVP", value: stats.total, icon: Users, note: "Form RSVP masuk" },
    { label: "Konfirmasi Hadir", value: stats.attending, icon: CheckCircle2, note: "Status Hadir" },
    { label: "Total Keseluruhan Tamu", value: stats.pax, icon: Users, note: "Pax termasuk pendamping" },
    { label: "Tamu Sudah Check In", value: stats.checkedIn, icon: QrCode, note: "Scan QR berhasil" },
    { label: "Tamu Memberi Angpao", value: "—", icon: Heart, note: "Tracking hadiah belum tersedia" },
    { label: "Tamu Memberi Kado", value: "—", icon: Gift, note: "Tracking hadiah belum tersedia" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-5 p-5 sm:p-8">
      <section>
        <p className={`font-[family-name:var(--font-cinzel)] text-xs uppercase tracking-[.2em] ${accent}`}>RSVP & Analytics</p>
        <h2 className="mt-2 font-[family-name:var(--font-cinzel)] text-2xl">Rekap kehadiran tamu</h2>
        <p className="mt-1 max-w-2xl text-sm text-[#5A4545] dark:text-white/70">Ringkasan RSVP dan daftar tamu yang tersinkron dari formulir undangan publik.</p>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map(({ label, value, icon: Icon, note }) => (
          <section key={label} className="rounded-2xl border border-[#d9cbc2] bg-[#f3ede6] p-4 dark:border-white/10 dark:bg-[#121116]">
            <div className="flex items-start justify-between gap-3">
              <p className="max-w-[180px] font-[family-name:var(--font-fauna)] text-xs font-semibold text-[#5A4545] dark:text-white/70">{label}</p>
              <Icon className="h-4 w-4 shrink-0 text-[#7A1C25] dark:text-[#E8A5AE]" />
            </div>
            <p className="mt-4 font-[family-name:var(--font-dm-mono)] text-2xl font-medium">{value}</p>
            <p className="mt-1 font-[family-name:var(--font-fauna)] text-[10px] text-[#7B6767] dark:text-white/50">{note}</p>
          </section>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-[#d9cbc2] bg-[#f3ede6] dark:border-white/10 dark:bg-[#121116]">
        <div className="flex flex-col gap-3 border-b border-[#d9cbc2] p-5 dark:border-white/10 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="font-[family-name:var(--font-cinzel)] text-lg">Daftar Tamu RSVP</h3>
            <p className="mt-1 text-xs text-[#7B6767] dark:text-white/50">{filtered.length} dari {guests.length} data</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative sm:w-64"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#806f68]"/><Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Cari nama tamu" className="pl-9"/></div>
            <button onClick={exportCsv} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#cdbbb0] bg-[#fffaf6] px-3 py-2 font-[family-name:var(--font-fauna)] text-xs font-semibold hover:bg-white dark:border-white/10 dark:bg-white/5"><Download className="h-4 w-4"/>Export CSV</button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-[#d9cbc2] p-4 dark:border-white/10">
          <span className="mr-1 self-center font-[family-name:var(--font-dm-mono)] text-[10px] uppercase tracking-wider text-[#806f68]">Urutkan</span>
          {(["name", "status", "pax", "checkedIn"] as SortKey[]).map(key => (
            <button key={key} onClick={() => changeSort(key)} className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 font-[family-name:var(--font-fauna)] text-[10px] ${sortKey === key ? "bg-[#7A1C25]/10 font-semibold text-[#7A1C25] dark:bg-[#E8A5AE]/10 dark:text-[#E8A5AE]" : "bg-black/5 text-[#5A4545] dark:bg-white/5 dark:text-white/60"}`}>
              {key === "name" ? "Nama" : key === "status" ? "Status RSVP" : key === "pax" ? "Pax" : "Check In"}<ArrowDownUp className="h-3 w-3"/>
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="bg-[#eee5de] dark:bg-white/5"><tr className="font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-wider text-[#6f5d56] dark:text-white/55">
              <th className="px-4 py-3">#</th><th className="px-4 py-3">Nama Tamu</th><th className="px-4 py-3">Status RSVP</th><th className="px-4 py-3">Status Pengiriman QR</th><th className="px-4 py-3">Keterangan Scan</th><th className="px-4 py-3">Acara</th><th className="px-4 py-3">Hadiah</th><th className="px-4 py-3">Aksi</th>
            </tr></thead>
            <tbody>
              {filtered.map((guest, index) => <tr key={guest.id} className="border-t border-[#e4d8d1] font-[family-name:var(--font-fauna)] text-xs dark:border-white/10">
                <td className="px-4 py-3 font-[family-name:var(--font-dm-mono)] text-[#806f68]">{index + 1}</td>
                <td className="px-4 py-3"><p className="font-semibold">{guest.name}</p><p className="mt-0.5 text-[10px] text-[#806f68]">{guest.phone || "Tanpa nomor"}</p></td>
                <td className="px-4 py-3"><span className="rounded-full bg-black/5 px-2 py-1 text-[10px] dark:bg-white/5">{statusLabel[guest.rsvpStatus] ?? guest.rsvpStatus}</span></td>
                <td className="px-4 py-3 text-[#806f68]">Not tracked</td>
                <td className="px-4 py-3">{guest.checkedIn ? <span className="font-semibold text-[#28744a] dark:text-[#8ed5aa]">Checked In</span> : "Belum Check In"}</td>
                <td className="px-4 py-3">Undangan</td>
                <td className="px-4 py-3 text-[#806f68]">Belum tersedia</td>
                <td className="px-4 py-3"><div className="flex gap-1"><button title="Kode QR" className="rounded-lg p-2 hover:bg-black/5 dark:hover:bg-white/5"><QrCode className="h-3.5 w-3.5"/></button><button title="Check In Manual" className="rounded-lg p-2 hover:bg-black/5 dark:hover:bg-white/5"><CheckCircle2 className="h-3.5 w-3.5"/></button></div></td>
              </tr>)}
              {!filtered.length && <tr><td colSpan={8} className="px-4 py-12 text-center font-[family-name:var(--font-fauna)] text-sm text-[#806f68]">Belum ada data RSVP yang cocok.</td></tr>}
            </tbody>
          </table>
        </div>
        {slug && <p className="border-t border-[#d9cbc2] px-5 py-3 font-[family-name:var(--font-dm-mono)] text-[9px] text-[#7B6767] dark:border-white/10 dark:text-white/45">Sumber: /invite/{slug}</p>}
      </section>
    </div>
  );
}
