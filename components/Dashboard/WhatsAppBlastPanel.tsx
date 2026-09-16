"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MessageCircle, Plus, RefreshCw, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Guest = {
  id: string;
  name: string;
  phone: string | null;
};

type SelectedGuest = Guest & {
  waBlastSelected: boolean;
  waBlastSentAt: string | null;
};

export default function WhatsAppBlastPanel() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [selected, setSelected] = useState<SelectedGuest[]>([]);
  const [quota, setQuota] = useState(100);
  const [remaining, setRemaining] = useState(100);
  const [existingGuestId, setExistingGuestId] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const [queueResponse, guestResponse] = await Promise.all([
        fetch("/api/wa-blast", { cache: "no-store" }),
        fetch("/api/guests", { cache: "no-store" }),
      ]);
      const queueData = await queueResponse.json().catch(() => null);
      const guestData = await guestResponse.json().catch(() => null);
      if (!queueResponse.ok) throw new Error(queueData?.error || "WA Blast belum dapat dimuat.");
      setQuota(queueData?.quota ?? 100);
      setRemaining(queueData?.remaining ?? 100);
      setSelected((queueData?.selected ?? []) as SelectedGuest[]);
      setGuests((guestData?.guests ?? []) as Guest[]);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "WA Blast belum dapat dimuat.");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    load().catch(() => undefined);
  }, [load]);

  const selectedIds = useMemo(() => new Set(selected.map((guest) => guest.id)), [selected]);
  const availableGuests = useMemo(
    () => guests.filter((guest) => guest.phone && !selectedIds.has(guest.id)),
    [guests, selectedIds],
  );

  async function addExisting() {
    if (!existingGuestId) return;
    setBusy(true);
    setNotice("");
    try {
      const response = await fetch("/api/wa-blast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestId: existingGuestId }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || "Tamu belum dapat ditambahkan.");
      setExistingGuestId("");
      await load();
      setNotice("Tamu ditambahkan ke daftar WA Blast.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Tamu belum dapat ditambahkan.");
      setBusy(false);
    }
  }

  async function addNew() {
    if (!name.trim() || !phone.trim()) return;
    setBusy(true);
    setNotice("");
    try {
      const response = await fetch("/api/wa-blast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim() }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || "Tamu belum dapat ditambahkan.");
      setName("");
      setPhone("");
      await load();
      setNotice("Tamu baru ditambahkan ke daftar WA Blast.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Tamu belum dapat ditambahkan.");
      setBusy(false);
    }
  }

  async function removeGuest(id: string) {
    setBusy(true);
    setNotice("");
    try {
      const response = await fetch(`/api/wa-blast?guestId=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || "Tamu belum dapat dihapus.");
      await load();
      setNotice("Tamu dihapus dari daftar WA Blast.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Tamu belum dapat dihapus.");
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-[min(92vw,1400px)] min-w-0 pb-16 pt-7 sm:pt-8">
      {notice && <div className="mb-4 rounded-xl border border-primary/15 bg-primary/[0.035] px-3 py-2.5 text-xs text-muted-foreground" role="status">{notice}</div>}

      <section className="grid gap-3 sm:grid-cols-3">
        <Metric icon={MessageCircle} label="Kuota" value={String(quota)} />
        <Metric icon={Users} label="Dipilih" value={String(selected.length)} />
        <Metric icon={Plus} label="Sisa" value={String(remaining)} />
      </section>

      <div className="mt-5 grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
        <section className="space-y-4 rounded-xl border border-border/80 bg-foreground/[0.018] p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.12em] text-muted-foreground">Penerima</p>
              <h2 className="mt-1 font-[family-name:var(--font-cinzel)] text-lg font-semibold text-foreground">Tambah ke WA Blast</h2>
            </div>
            <Button asChild size="sm">
              <Link href="/packages?feature=wa-blast">
                <Plus className="h-4 w-4" />
                Tambah quota
              </Link>
            </Button>
          </div>

          <div className="rounded-xl border border-border/70 bg-background/80 p-3">
            <p className="text-xs font-semibold text-foreground">Dari daftar tamu</p>
            <select value={existingGuestId} onChange={(event) => setExistingGuestId(event.target.value)} className="mt-2 w-full px-3 text-sm" disabled={busy}>
              <option value="">Pilih tamu</option>
              {availableGuests.map((guest) => <option key={guest.id} value={guest.id}>{guest.name} · {guest.phone}</option>)}
            </select>
            <Button type="button" size="sm" className="mt-2 w-full" disabled={!existingGuestId || busy} onClick={addExisting}>
              <Plus className="h-4 w-4" />
              Tambahkan penerima
            </Button>
          </div>

          <div className="rounded-xl border border-border/70 bg-background/80 p-3">
            <p className="text-xs font-semibold text-foreground">Tamu belum ada</p>
            <div className="mt-2 space-y-2">
              <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nama tamu" disabled={busy} />
              <Input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Nomor WhatsApp" disabled={busy} />
              <Button type="button" size="sm" className="w-full" disabled={!name.trim() || !phone.trim() || busy} onClick={addNew}>
                <Plus className="h-4 w-4" />
                Tambah tamu & penerima
              </Button>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-border/80 bg-foreground/[0.018] p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.12em] text-muted-foreground">Queue</p>
              <h2 className="mt-1 font-[family-name:var(--font-cinzel)] text-lg font-semibold text-foreground">Tamu yang akan diblast</h2>
            </div>
            <Button type="button" size="sm" onClick={() => load()} disabled={busy}>
              <RefreshCw className="h-4 w-4" />
              Muat ulang
            </Button>
          </div>

          <div className="mt-4 space-y-2">
            {selected.length === 0 && <div className="rounded-lg border border-border/70 bg-background/70 px-3 py-6 text-center text-xs text-muted-foreground">Belum ada penerima WA Blast.</div>}
            {selected.map((guest) => (
              <div key={guest.id} className="flex items-center gap-3 rounded-lg border border-border/70 bg-background/80 px-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-foreground">{guest.name}</p>
                  <p className="mt-0.5 truncate font-[family-name:var(--font-dm-mono)] text-[9px] text-muted-foreground">{guest.phone || "Nomor belum ada"}</p>
                </div>
                <Button type="button" size="icon-sm" onClick={() => removeGuest(guest.id)} disabled={busy} title="Hapus dari daftar WA Blast" aria-label={`Hapus ${guest.name} dari daftar WA Blast`}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof MessageCircle; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-primary/10 bg-foreground/[0.022] px-4 py-3.5">
      <div className="flex items-center justify-between gap-3">
        <p className="font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <p className="mt-1 text-xl font-semibold text-foreground">{value}</p>
    </div>
  );
}