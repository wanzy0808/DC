"use client";

import { type FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  GuestInputPanel,
  GuestListTable,
  GuestManagementLockedState,
  TableSetupPanel,
} from "@/components/InvitationStudio/GuestManagementPanels";
import { readGuestManagementResponse } from "@/components/InvitationStudio/guest-management-client";
import type {
  GuestForm,
  GuestManagementGuest,
  GuestManagementTable,
  GuestTableForm,
} from "@/components/InvitationStudio/guest-management-types";

export default function GuestManagement() {
  const [tables, setTables] = useState<GuestManagementTable[]>([]);
  const [guests, setGuests] = useState<GuestManagementGuest[]>([]);
  const [tableForm, setTableForm] = useState<GuestTableForm>({
    name: "Meja 1",
    shape: "ROUND",
    capacity: "8",
  });
  const [guestForm, setGuestForm] = useState<GuestForm>({
    name: "",
    phone: "",
    tableId: "",
    plusOnes: "0",
  });
  const [message, setMessage] = useState("Memuat data...");
  const [locked, setLocked] = useState(false);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/guests", { cache: "no-store" });
      const data = await readGuestManagementResponse(response);

      if (!response.ok) {
        if (response.status === 402) setLocked(true);
        setMessage(
          data.error ??
            `Data tamu belum dapat dimuat (HTTP ${response.status}).`,
        );
        return;
      }

      setTables(data.tables ?? []);
      setGuests(data.guests ?? []);
      setLocked(!Boolean(data.canManageGuests));
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
      body: JSON.stringify({
        ...tableForm,
        capacity: Number(tableForm.capacity),
      }),
    });

    if (response.ok) {
      setTableForm((current) => ({
        ...current,
        name: `Meja ${tables.length + 2}`,
      }));
      await load();
      return;
    }

    const data = await readGuestManagementResponse(response);
    setMessage(data.error ?? "Meja belum dapat dibuat.");
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
      setGuestForm((current) => ({
        ...current,
        name: "",
        phone: "",
      }));
      await load();
      return;
    }

    const data = await readGuestManagementResponse(response);
    setMessage(data.error ?? "Tamu belum dapat ditambahkan.");
  }

  if (locked) {
    return <GuestManagementLockedState />;
  }

  return (
    <div className="mx-auto w-full space-y-6 p-5 sm:p-8">
      <section>
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#E60087]">
          Guestbook Digital
        </p>
        <h1 className="mt-2 font-serif text-3xl">
          Tamu &amp; Table Arrangement
        </h1>
        <p className="mt-1 text-sm opacity-60">
          Masukkan daftar tamu dengan rapi, lalu tentukan meja dan jumlah kursi
          yang akan digunakan saat acara.
        </p>
      </section>

      {message && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-800">
          {message}
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <TableSetupPanel
          tables={tables}
          form={tableForm}
          setForm={setTableForm}
          onSubmit={addTable}
        />
        <GuestInputPanel
          tables={tables}
          form={guestForm}
          setForm={setGuestForm}
          onSubmit={addGuest}
        />
      </div>

      <div className="flex justify-end">
        <Button asChild size="sm">
          <Link href="/api/guests/export">Download CSV RSVP</Link>
        </Button>
      </div>

      <GuestListTable guests={guests} />
    </div>
  );
}
