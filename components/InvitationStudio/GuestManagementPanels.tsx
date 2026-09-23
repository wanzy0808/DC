"use client";

import type { FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Armchair, Lock, Plus, Users } from "lucide-react";
import type {
  GuestForm,
  GuestManagementGuest,
  GuestManagementTable,
  GuestTableForm,
} from "@/components/InvitationStudio/guest-management-types";

export function GuestManagementLockedState() {
  return (
    <div className="mx-auto flex min-h-[65vh] w-full max-w-5xl items-center justify-center p-8">
      <div className="w-full max-w-xl rounded-3xl border border-black/10 bg-white p-8 text-center shadow-sm dark:border-white/10 dark:bg-[#121116] sm:p-12">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#E60087]/10 text-[#E60087]">
          <Lock className="h-6 w-6" />
        </div>
        <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#E60087]">
          Guestbook Digital
        </p>
        <h1 className="mt-2 font-serif text-3xl">
          Manajemen tamu belum aktif
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 opacity-60">
          Atur nama tamu, nomor meja, posisi kursi, RSVP, dan plus one setelah
          paket Guestbook Digital aktif.
        </p>
        <Button asChild size="lg" className="mt-7">
          <Link href="/packages"><Lock className="h-4 w-4" /> Upgrade Guestbook Digital</Link>
        </Button>
      </div>
    </div>
  );
}

export function TableSetupPanel({
  tables,
  form,
  setForm,
  onSubmit,
}: {
  tables: GuestManagementTable[];
  form: GuestTableForm;
  setForm: (next: GuestTableForm) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5 rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#121116]"
    >
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#7A1C25]/10 text-[#7A1C25]">
          <Armchair className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-serif text-xl">Pengaturan Meja</h2>
          <p className="mt-1 text-xs opacity-60">
            Buat meja dan tentukan kapasitas kursinya.
          </p>
        </div>
      </div>

      <label className="block text-xs font-semibold">
        Nama meja
        <input
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-3 text-sm outline-none focus:border-[#7A1C25] dark:border-white/10 dark:bg-white/5"
          placeholder="Contoh: Meja VIP 01"
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block text-xs font-semibold">
          Bentuk meja
          <select
            value={form.shape}
            onChange={(event) => setForm({ ...form, shape: event.target.value })}
            className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-3 text-sm dark:border-white/10 dark:bg-white/5"
          >
            <option value="ROUND">Bulat</option>
            <option value="RECTANGLE">Persegi panjang</option>
            <option value="SQUARE">Kotak</option>
          </select>
        </label>

        <label className="block text-xs font-semibold">
          Jumlah kursi
          <input
            type="number"
            min="1"
            value={form.capacity}
            onChange={(event) =>
              setForm({ ...form, capacity: event.target.value })
            }
            className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-3 text-sm dark:border-white/10 dark:bg-white/5"
          />
        </label>
      </div>

      <Button type="submit" size="sm">
        <Plus className="h-4 w-4" /> Tambah Meja
      </Button>

      <div className="flex flex-wrap gap-2 border-t border-black/5 pt-4 dark:border-white/10">
        {tables.map((table) => (
          <span
            key={table.id}
            className="rounded-full bg-black/5 px-3 py-1.5 text-[10px] dark:bg-white/10 dark:text-white/80"
          >
            {table.name} · {table.capacity} kursi · {table._count?.guests ?? 0} tamu
          </span>
        ))}
      </div>
    </form>
  );
}

export function GuestInputPanel({
  tables,
  form,
  setForm,
  onSubmit,
}: {
  tables: GuestManagementTable[];
  form: GuestForm;
  setForm: (next: GuestForm) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5 rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#121116]"
    >
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#E60087]/10 text-[#E60087]">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-serif text-xl">Input Data Tamu</h2>
          <p className="mt-1 text-xs opacity-60">
            Masukkan nama, kontak, meja, dan jumlah plus one.
          </p>
        </div>
      </div>

      <label className="block text-xs font-semibold">
        Nama lengkap tamu
        <input
          required
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-3 text-sm outline-none focus:border-[#7A1C25] dark:border-white/10 dark:bg-white/5"
          placeholder="Contoh: Budi Santoso"
        />
      </label>

      <label className="block text-xs font-semibold">
        Nomor WhatsApp
        <input
          value={form.phone}
          onChange={(event) => setForm({ ...form, phone: event.target.value })}
          className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-3 text-sm outline-none focus:border-[#7A1C25] dark:border-white/10 dark:bg-white/5"
          placeholder="08xxxxxxxxxx"
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block text-xs font-semibold">
          Nomor meja
          <select
            value={form.tableId}
            onChange={(event) => setForm({ ...form, tableId: event.target.value })}
            className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-3 text-sm dark:border-white/10 dark:bg-white/5"
          >
            <option value="">Belum ditentukan</option>
            {tables.map((table) => (
              <option key={table.id} value={table.id}>
                {table.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-xs font-semibold">
          Jumlah plus one
          <input
            type="number"
            min="0"
            value={form.plusOnes}
            onChange={(event) =>
              setForm({ ...form, plusOnes: event.target.value })
            }
            className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-3 text-sm dark:border-white/10 dark:bg-white/5"
          />
        </label>
      </div>

      <Button type="submit" size="sm">
        <Plus className="h-4 w-4" /> Simpan Data Tamu
      </Button>
    </form>
  );
}

export function GuestListTable({
  guests,
}: {
  guests: GuestManagementGuest[];
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm dark:border-white/10 dark:bg-[#121116]">
      <div className="border-b border-black/10 p-5 dark:border-white/10">
        <h2 className="font-serif text-xl">Daftar Tamu</h2>
        <p className="mt-1 text-xs opacity-60">
          Pantau RSVP, meja, dan jumlah plus one dari satu tabel.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-black/10 bg-black/[0.03] text-[10px] uppercase tracking-wider opacity-70 dark:border-white/10 dark:bg-white/[0.04]">
            <tr>
              <th className="p-4">Nama Tamu</th>
              <th className="p-4">WhatsApp</th>
              <th className="p-4">Meja</th>
              <th className="p-4">RSVP</th>
              <th className="p-4">Plus One</th>
            </tr>
          </thead>
          <tbody>
            {guests.map((guest) => (
              <tr
                key={guest.id}
                className="border-b border-black/5 transition-colors hover:bg-black/[0.03] dark:border-white/10 dark:hover:bg-white/[0.04]"
              >
                <td className="p-4 font-medium">{guest.name}</td>
                <td className="p-4">{guest.phone ?? "-"}</td>
                <td className="p-4">{guest.table?.name ?? "Belum ada meja"}</td>
                <td className="p-4">{guest.rsvpStatus}</td>
                <td className="p-4">{guest.plusOnes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
