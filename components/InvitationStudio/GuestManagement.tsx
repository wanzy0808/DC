"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Lock, Users, Armchair, Plus } from "lucide-react";

type Table = {
  id: string;
  name: string;
  shape: string;
  capacity: number;
  _count?: { guests: number };
};
type Guest = {
  id: string;
  name: string;
  phone: string | null;
  rsvpStatus: string;
  plusOnes: number;
  table: { name: string } | null;
};

export default function GuestManagement() {
  const [tables, setTables] = useState<Table[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [tableForm, setTableForm] = useState({ name: "Meja 1", shape: "ROUND", capacity: "8" });
  const [guestForm, setGuestForm] = useState({ name: "", phone: "", tableId: "", plusOnes: "0" });
  const [message, setMessage] = useState("Memuat data...");
  const [locked, setLocked] = useState(false);

  async function readResponse(response: Response) {
    const body = await response.text();
    if (!body) return {} as { error?: string; tables?: Table[]; guests?: Guest[] };
    try { return JSON.parse(body) as { error?: string; tables?: Table[]; guests?: Guest[] }; }
    catch { return { error: `Server mengembalikan respons yang tidak valid (HTTP ${response.status}).` }; }
  }

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/guests", { cache: "no-store" });
      const data = await readResponse(response);
      if (!response.ok) {
        if (response.status === 402) setLocked(true);
        setMessage(data.error ?? `Data tamu belum dapat dimuat (HTTP ${response.status}).`);
        return;
      }
      setTables(data.tables ?? []);
      setGuests(data.guests ?? []);
      setLocked(!Boolean((data as { canManageGuests?: boolean }).canManageGuests));
      setMessage("");
    } catch {
      setMessage("Tidak dapat terhubung ke server. Coba muat ulang halaman.");
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function addTable(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch("/api/tables", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...tableForm, capacity: Number(tableForm.capacity) }),
    });
    if (response.ok) {
      setTableForm({ ...tableForm, name: `Meja ${tables.length + 2}` });
      await load();
    } else {
      const data = await readResponse(response);
      setMessage(data.error ?? "Meja belum dapat dibuat.");
    }
  }

  async function addGuest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch("/api/guests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...guestForm, plusOnes: Number(guestForm.plusOnes) }),
    });
    if (response.ok) {
      setGuestForm({ ...guestForm, name: "", phone: "" });
      await load();
    } else {
      const data = await readResponse(response);
      setMessage(data.error ?? "Tamu belum dapat ditambahkan.");
    }
  }

  if (locked) {
    return (
      <div className="mx-auto flex min-h-[65vh] w-full max-w-5xl items-center justify-center p-8">
        <div className="w-full max-w-xl rounded-3xl border border-black/10 bg-white p-8 text-center shadow-sm dark:border-white/10 dark:bg-[#121116] sm:p-12">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#E60087]/10 text-[#E60087]"><Lock className="h-6 w-6" /></div>
          <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#E60087]">Guestbook Digital</p>
          <h1 className="mt-2 font-serif text-3xl">Manajemen tamu belum aktif</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 opacity-60">Atur nama tamu, nomor meja, posisi kursi, RSVP, dan plus one setelah paket Guestbook Digital aktif.</p>
          <Link href="/packages" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#E60087] px-5 py-3 text-xs font-medium text-white"><Lock className="h-4 w-4" /> Upgrade Guestbook Digital</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-5 sm:p-8">
      <section>
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#E60087]">Guestbook Digital</p>
        <h1 className="mt-2 font-serif text-3xl">Tamu &amp; Table Arrangement</h1>
        <p className="mt-1 text-sm opacity-60">Masukkan daftar tamu dengan rapi, lalu tentukan meja dan jumlah kursi yang akan digunakan saat acara.</p>
      </section>

      {message && <p className="rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-800">{message}</p>}

      <div className="grid gap-5 lg:grid-cols-2">
        <form onSubmit={addTable} className="space-y-5 rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#121116]">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#7A1C25]/10 text-[#7A1C25]"><Armchair className="h-5 w-5" /></div>
            <div><h2 className="font-serif text-xl">Pengaturan Meja</h2><p className="mt-1 text-xs opacity-60">Buat meja dan tentukan kapasitas kursinya.</p></div>
          </div>
          <label className="block text-xs font-semibold">Nama meja<input value={tableForm.name} onChange={(event) => setTableForm({ ...tableForm, name: event.target.value })} className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-3 text-sm outline-none focus:border-[#7A1C25] dark:border-white/10 dark:bg-white/5" placeholder="Contoh: Meja VIP 01" /></label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs font-semibold">Bentuk meja<select value={tableForm.shape} onChange={(event) => setTableForm({ ...tableForm, shape: event.target.value })} className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-3 text-sm dark:border-white/10 dark:bg-white/5"><option value="ROUND">Bulat</option><option value="RECTANGLE">Persegi panjang</option><option value="SQUARE">Kotak</option></select></label>
            <label className="block text-xs font-semibold">Jumlah kursi<input type="number" min="1" value={tableForm.capacity} onChange={(event) => setTableForm({ ...tableForm, capacity: event.target.value })} className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-3 text-sm dark:border-white/10 dark:bg-white/5" /></label>
          </div>
          <button className="inline-flex items-center gap-2 rounded-xl bg-[#7A1C25] px-4 py-3 text-xs font-medium text-white"><Plus className="h-4 w-4" /> Tambah meja</button>
          <div className="flex flex-wrap gap-2 border-t border-black/5 pt-4 dark:border-white/10">
            {tables.map((table) => <span key={table.id} className="rounded-full bg-black/5 px-3 py-1.5 text-[10px] dark:bg-white/10 dark:text-white/80">{table.name} · {table.capacity} kursi · {table._count?.guests ?? 0} tamu</span>)}
          </div>
        </form>

        <form onSubmit={addGuest} className="space-y-5 rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#121116]">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#E60087]/10 text-[#E60087]"><Users className="h-5 w-5" /></div>
            <div><h2 className="font-serif text-xl">Input Data Tamu</h2><p className="mt-1 text-xs opacity-60">Masukkan nama, kontak, meja, dan jumlah plus one.</p></div>
          </div>
          <label className="block text-xs font-semibold">Nama lengkap tamu<input required value={guestForm.name} onChange={(event) => setGuestForm({ ...guestForm, name: event.target.value })} className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-3 text-sm outline-none focus:border-[#7A1C25] dark:border-white/10 dark:bg-white/5" placeholder="Contoh: Budi Santoso" /></label>
          <label className="block text-xs font-semibold">Nomor WhatsApp<input value={guestForm.phone} onChange={(event) => setGuestForm({ ...guestForm, phone: event.target.value })} className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-3 text-sm outline-none focus:border-[#7A1C25] dark:border-white/10 dark:bg-white/5" placeholder="08xxxxxxxxxx" /></label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs font-semibold">Nomor meja<select value={guestForm.tableId} onChange={(event) => setGuestForm({ ...guestForm, tableId: event.target.value })} className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-3 text-sm dark:border-white/10 dark:bg-white/5"><option value="">Belum ditentukan</option>{tables.map((table) => <option key={table.id} value={table.id}>{table.name}</option>)}</select></label>
            <label className="block text-xs font-semibold">Jumlah plus one<input type="number" min="0" value={guestForm.plusOnes} onChange={(event) => setGuestForm({ ...guestForm, plusOnes: event.target.value })} className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-3 text-sm dark:border-white/10 dark:bg-white/5" /></label>
          </div>
          <button className="inline-flex items-center gap-2 rounded-xl bg-[#7A1C25] px-4 py-3 text-xs font-medium text-white"><Plus className="h-4 w-4" /> Simpan data tamu</button>
        </form>
      </div>

      <div className="flex justify-end"><Link href="/api/guests/export" className="rounded-xl border border-black/10 bg-white px-4 py-2.5 text-xs transition-colors hover:bg-black/5 dark:border-white/10 dark:bg-[#121116] dark:hover:bg-white/10">Download CSV RSVP</Link></div>

      <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm dark:border-white/10 dark:bg-[#121116]">
        <div className="border-b border-black/10 p-5 dark:border-white/10"><h2 className="font-serif text-xl">Daftar Tamu</h2><p className="mt-1 text-xs opacity-60">Pantau RSVP, meja, dan jumlah plus one dari satu tabel.</p></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-black/10 bg-black/[0.03] text-[10px] uppercase tracking-wider opacity-70 dark:border-white/10 dark:bg-white/[0.04]"><tr><th className="p-4">Nama Tamu</th><th className="p-4">WhatsApp</th><th className="p-4">Meja</th><th className="p-4">RSVP</th><th className="p-4">Plus One</th></tr></thead>
            <tbody>{guests.map((guest) => <tr key={guest.id} className="border-b border-black/5 transition-colors hover:bg-black/[0.03] dark:border-white/10 dark:hover:bg-white/[0.04]"><td className="p-4 font-medium">{guest.name}</td><td className="p-4">{guest.phone ?? "-"}</td><td className="p-4">{guest.table?.name ?? "Belum ada meja"}</td><td className="p-4">{guest.rsvpStatus}</td><td className="p-4">{guest.plusOnes}</td></tr>)}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
