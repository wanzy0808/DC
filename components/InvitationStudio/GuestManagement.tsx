"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";

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
  const [tableForm, setTableForm] = useState({
    name: "Meja 1",
    shape: "ROUND",
    capacity: "8",
  });
  const [guestForm, setGuestForm] = useState({
    name: "",
    phone: "",
    tableId: "",
    plusOnes: "0",
  });
  const [message, setMessage] = useState("Memuat data...");
  const [locked, setLocked] = useState(false);

  async function readResponse(response: Response) {
    const body = await response.text();
    if (!body) return {} as { error?: string; tables?: Table[]; guests?: Guest[] };
    try {
      return JSON.parse(body) as { error?: string; tables?: Table[]; guests?: Guest[] };
    } catch {
      return { error: `Server mengembalikan respons yang tidak valid (HTTP ${response.status}).` };
    }
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
      setMessage("");
    } catch {
      setMessage("Tidak dapat terhubung ke server. Coba muat ulang halaman.");
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function addTable(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch("/api/tables", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...tableForm,
        capacity: Number(tableForm.capacity),
      }),
    });
    if (response.ok) {
      setTableForm({ ...tableForm, name: `Meja ${tables.length + 2}` });
      await load();
    } else setMessage("Meja belum dapat dibuat.");
  }

  async function addGuest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch("/api/guests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...guestForm,
        plusOnes: Number(guestForm.plusOnes),
      }),
    });
    if (response.ok) {
      setGuestForm({ ...guestForm, name: "", phone: "" });
      await load();
    } else setMessage("Tamu belum dapat ditambahkan.");
  }

  if (locked)
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-8">
        <div className="max-w-md space-y-4 text-center">
          <Lock className="mx-auto h-10 w-10 text-[#7A1C25]" />
          <h1 className="font-serif text-3xl">Fitur belum aktif</h1>
          <p className="text-sm opacity-70">
            Manajemen tamu, table arrangement, dan daftar RSVP akan terbuka
            setelah paket Undangan Digital dibayar dan dikonfirmasi admin.
          </p>
          <p className="text-xs opacity-50">{message}</p>
        </div>
      </div>
    );

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-5 sm:p-8">
      <div>
        <h1 className="font-serif text-3xl">Tamu &amp; Table Arrangement</h1>
        <p className="mt-1 text-sm opacity-60">
          Atur meja, kapasitas, dan pantau RSVP dalam satu tempat.
        </p>
      </div>
      {message && <p className="text-sm opacity-60">{message}</p>}
      <div className="grid gap-5 lg:grid-cols-2">
        <form
          onSubmit={addTable}
          className="space-y-4 rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#121116]"
        >
          <div><h2 className="font-serif text-xl">Tambah meja</h2><p className="mt-1 text-xs opacity-60">Atur kapasitas dan bentuk meja.</p></div>
          <input
            value={tableForm.name}
            onChange={(event) =>
              setTableForm({ ...tableForm, name: event.target.value })
            }
            className="w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm"
            placeholder="Nama meja"
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              value={tableForm.shape}
              onChange={(event) =>
                setTableForm({ ...tableForm, shape: event.target.value })
              }
              className="rounded-xl border border-black/10 px-3 py-2.5 text-sm"
            >
              <option value="ROUND">Bulat</option>
              <option value="RECTANGLE">Persegi panjang</option>
              <option value="SQUARE">Kotak</option>
            </select>
            <input
              type="number"
              min="1"
              value={tableForm.capacity}
              onChange={(event) =>
                setTableForm({ ...tableForm, capacity: event.target.value })
              }
              className="rounded-xl border border-black/10 px-3 py-2.5 text-sm"
              placeholder="Kapasitas"
            />
          </div>
          <button className="rounded-xl bg-[#7A1C25] px-4 py-2.5 text-sm text-white">
            Tambah meja
          </button>
          <div className="flex flex-wrap gap-2">
            {tables.map((table) => (
              <span
                key={table.id}
                className="rounded-full bg-black/5 px-3 py-1 text-xs dark:bg-white/10 dark:text-white/80"
              >
                {table.name} · {table.capacity} kursi
              </span>
            ))}
          </div>
        </form>
        <form
          onSubmit={addGuest}
          className="space-y-4 rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#121116]"
        >
          <div><h2 className="font-serif text-xl">Tambah tamu</h2><p className="mt-1 text-xs opacity-60">Tambahkan tamu dan posisi mejanya.</p></div>
          <input
            required
            value={guestForm.name}
            onChange={(event) =>
              setGuestForm({ ...guestForm, name: event.target.value })
            }
            className="w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm"
            placeholder="Nama tamu"
          />
          <input
            value={guestForm.phone}
            onChange={(event) =>
              setGuestForm({ ...guestForm, phone: event.target.value })
            }
            className="w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm"
            placeholder="Nomor WhatsApp"
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              value={guestForm.tableId}
              onChange={(event) =>
                setGuestForm({ ...guestForm, tableId: event.target.value })
              }
              className="rounded-xl border border-black/10 px-3 py-2.5 text-sm"
            >
              <option value="">Belum ada meja</option>
              {tables.map((table) => (
                <option key={table.id} value={table.id}>
                  {table.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              min="0"
              value={guestForm.plusOnes}
              onChange={(event) =>
                setGuestForm({ ...guestForm, plusOnes: event.target.value })
              }
              className="rounded-xl border border-black/10 px-3 py-2.5 text-sm"
              placeholder="Plus one"
            />
          </div>
          <button className="rounded-xl bg-[#7A1C25] px-4 py-2.5 text-sm text-white">
            Tambah tamu
          </button>
        </form>
      </div>
      <div className="flex justify-end">
        <Link
          href="/api/guests/export"
          className="rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm transition-colors hover:bg-black/5 dark:border-white/10 dark:bg-[#121116] dark:hover:bg-white/10"
        >
          Download CSV RSVP
        </Link>
      </div>
      <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm dark:border-white/10 dark:bg-[#121116]">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="border-b border-black/10 bg-black/[0.03] text-xs uppercase tracking-wider opacity-70 dark:border-white/10 dark:bg-white/[0.04] dark:text-[#e8a5ae]">
            <tr>
              <th className="p-4">Nama</th>
              <th className="p-4">Telepon</th>
              <th className="p-4">Meja</th>
              <th className="p-4">RSVP</th>
              <th className="p-4">Plus one</th>
            </tr>
          </thead>
          <tbody>
            {guests.map((guest) => (
              <tr key={guest.id} className="border-b border-black/5 transition-colors hover:bg-black/[0.03] dark:border-white/10 dark:hover:bg-white/[0.04]">
                <td className="p-4 font-medium">{guest.name}</td>
                <td className="p-4">{guest.phone ?? "-"}</td>
                <td className="p-4">{guest.table?.name ?? "-"}</td>
                <td className="p-4">{guest.rsvpStatus}</td>
                <td className="p-4">{guest.plusOnes}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
