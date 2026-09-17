"use client";

import { useEffect, useMemo, useState } from "react";
import { CreditCard, MessageCircle, Plus, RefreshCw, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardMetricCard, DashboardNotice } from "@/components/Dashboard/DashboardPrimitives";

type EventOption = {
  id: string;
  title: string;
  eventConfigured: boolean;
  accessPaid: boolean;
};

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
  const [events, setEvents] = useState<EventOption[]>([]);
  const [eventId, setEventId] = useState("");
  const [guests, setGuests] = useState<Guest[]>([]);
  const [selected, setSelected] = useState<SelectedGuest[]>([]);
  const [quota, setQuota] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [existingGuestId, setExistingGuestId] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  async function loadEvents() {
    const response = await fetch("/api/invitations?all=1", { cache: "no-store" });
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(data?.error || "Daftar acara belum dapat dimuat.");
    const available = ((data?.invitations ?? []) as EventOption[]).filter(
      (event) => event.eventConfigured && event.accessPaid,
    );
    setEvents(available);
    setEventId((current) =>
      available.some((event) => event.id === current) ? current : available[0]?.id || "",
    );
  }

  async function loadEventData(targetId: string) {
    if (!targetId) {
      setGuests([]);
      setSelected([]);
      setQuota(0);
      setRemaining(0);
      return;
    }

    setBusy(true);
    try {
      const [queueResponse, guestResponse] = await Promise.all([
        fetch(`/api/wa-blast?invitationId=${encodeURIComponent(targetId)}`, {
          cache: "no-store",
        }),
        fetch(`/api/guests?invitationId=${encodeURIComponent(targetId)}`, {
          cache: "no-store",
        }),
      ]);
      const queueData = await queueResponse.json().catch(() => null);
      const guestData = await guestResponse.json().catch(() => null);
      if (!queueResponse.ok) throw new Error(queueData?.error || "WA Blast belum dapat dimuat.");
      setQuota(queueData?.quota ?? 0);
      setRemaining(queueData?.remaining ?? 0);
      setSelected((queueData?.selected ?? []) as SelectedGuest[]);
      setGuests((guestData?.guests ?? []) as Guest[]);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "WA Blast belum dapat dimuat.");
      setGuests([]);
      setSelected([]);
      setQuota(0);
      setRemaining(0);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    setBusy(true);
    loadEvents()
      .catch((error) => {
        setNotice(error instanceof Error ? error.message : "Daftar acara belum dapat dimuat.");
      })
      .finally(() => setBusy(false));
  }, []);

  useEffect(() => {
    setExistingGuestId("");
    setNotice("");
    loadEventData(eventId).catch(() => undefined);
  }, [eventId]);

  const selectedIds = useMemo(() => new Set(selected.map((guest) => guest.id)), [selected]);
  const availableGuests = useMemo(
    () => guests.filter((guest) => guest.phone && !selectedIds.has(guest.id)),
    [guests, selectedIds],
  );
  const canAddRecipients = Boolean(eventId && quota > 0 && remaining > 0);

  async function purchaseAddon() {
    if (!eventId) return;
    setBusy(true);
    setNotice("");
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageKey: "WA_BLAST_50", invitationId: eventId }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || "Order add-on belum dapat dibuat.");
      if (data?.invoiceUrl) window.location.href = data.invoiceUrl;
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Order add-on belum dapat dibuat.");
      setBusy(false);
    }
  }

  async function addExisting() {
    if (!existingGuestId || !eventId) return;
    setBusy(true);
    setNotice("");
    try {
      const response = await fetch("/api/wa-blast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invitationId: eventId, guestId: existingGuestId }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || "Tamu belum dapat ditambahkan.");
      setExistingGuestId("");
      await loadEventData(eventId);
      setNotice("Tamu ditambahkan ke daftar WA Blast.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Tamu belum dapat ditambahkan.");
      setBusy(false);
    }
  }

  async function addNew() {
    if (!name.trim() || !phone.trim() || !eventId) return;
    setBusy(true);
    setNotice("");
    try {
      const response = await fetch("/api/wa-blast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invitationId: eventId,
          name: name.trim(),
          phone: phone.trim(),
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || "Tamu belum dapat ditambahkan.");
      setName("");
      setPhone("");
      await loadEventData(eventId);
      setNotice("Tamu baru ditambahkan ke daftar WA Blast.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Tamu belum dapat ditambahkan.");
      setBusy(false);
    }
  }

  async function removeGuest(id: string) {
    if (!eventId) return;
    setBusy(true);
    setNotice("");
    try {
      const response = await fetch(
        `/api/wa-blast?invitationId=${encodeURIComponent(eventId)}&guestId=${encodeURIComponent(id)}`,
        { method: "DELETE" },
      );
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || "Tamu belum dapat dihapus.");
      await loadEventData(eventId);
      setNotice("Tamu dihapus dari daftar WA Blast.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Tamu belum dapat dihapus.");
      setBusy(false);
    }
  }

  return (
    <div className="dc-dashboard-page mx-auto w-[80vw] max-w-full min-w-0 pb-16 pt-7 sm:pt-8">
      {notice && <DashboardNotice className="mb-4">{notice}</DashboardNotice>}

      <section className="rounded-2xl border border-border/70 bg-background shadow-[0_1px_2px_rgba(0,0,0,0.03)] p-4 sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <label className="block min-w-0 flex-1 sm:max-w-md">
            <span className="mb-1.5 block font-[family-name:var(--font-dc-mono)] text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
              Acara
            </span>
            <select
              value={eventId}
              onChange={(event) => setEventId(event.target.value)}
              disabled={busy || events.length === 0}
              className="w-full px-3 text-sm outline-none"
              aria-label="Pilih acara untuk WA Blast"
            >
              {events.length === 0 ? (
                <option value="">Belum ada undangan aktif</option>
              ) : (
                events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title || "Acara tanpa judul"}
                  </option>
                ))
              )}
            </select>
          </label>

          {eventId && (
            <Button type="button" size="sm" onClick={purchaseAddon} disabled={busy}>
              <CreditCard className="h-4 w-4" />
              Beli 50 quota · Rp75.000
            </Button>
          )}
        </div>

        {events.length === 0 && (
          <p className="mt-3 text-xs text-muted-foreground">
            Aktifkan minimal satu Undangan Digital untuk membeli add-on WA Blast.
          </p>
        )}
      </section>

      {eventId && (
        <>
          <section className="mt-3 grid gap-3 sm:grid-cols-3">
            <Metric icon={MessageCircle} label="Kuota" value={String(quota)} />
            <Metric icon={Users} label="Dipilih" value={String(selected.length)} />
            <Metric icon={Plus} label="Sisa" value={String(remaining)} />
          </section>

          {quota === 0 ? (
            <section className="mt-5 rounded-2xl border border-border/70 bg-background shadow-[0_1px_2px_rgba(0,0,0,0.03)] p-5">
              <p className="font-[family-name:var(--font-dc-mono)] text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                Add-on
              </p>
              <h2 className="mt-1 font-[family-name:var(--font-dc-heading)] text-lg font-semibold text-foreground">
                WA Blast belum aktif
              </h2>
              <p className="mt-2 max-w-xl text-xs leading-5 text-muted-foreground">
                WA Blast tidak termasuk dalam harga Undangan Digital. Setiap pembelian menambah 50 quota untuk acara yang dipilih.
              </p>
              <Button type="button" size="sm" className="mt-4" onClick={purchaseAddon} disabled={busy}>
                <CreditCard className="h-4 w-4" />
                Beli 50 quota · Rp75.000
              </Button>
            </section>
          ) : (
            <div className="mt-5 grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
              <section className="space-y-4 rounded-2xl border border-border/70 bg-background shadow-[0_1px_2px_rgba(0,0,0,0.03)] p-4 sm:p-5">
                <div>
                  <p className="font-[family-name:var(--font-dc-mono)] text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                    Penerima
                  </p>
                  <h2 className="mt-1 font-[family-name:var(--font-dc-heading)] text-lg font-semibold text-foreground">
                    Tambah penerima
                  </h2>
                </div>

                <div className="rounded-xl border border-border/70 bg-background p-3">
                  <p className="text-xs font-semibold text-foreground">Dari daftar tamu</p>
                  <select
                    value={existingGuestId}
                    onChange={(event) => setExistingGuestId(event.target.value)}
                    className="mt-2 w-full px-3 text-sm"
                    disabled={busy || !canAddRecipients}
                  >
                    <option value="">Pilih tamu</option>
                    {availableGuests.map((guest) => (
                      <option key={guest.id} value={guest.id}>
                        {guest.name} · {guest.phone}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    size="sm"
                    className="mt-2 w-full"
                    disabled={!existingGuestId || busy || !canAddRecipients}
                    onClick={addExisting}
                  >
                    <Plus className="h-4 w-4" />
                    Tambahkan penerima
                  </Button>
                </div>

                <div className="rounded-xl border border-border/70 bg-background p-3">
                  <p className="text-xs font-semibold text-foreground">Tamu belum ada</p>
                  <div className="mt-2 space-y-2">
                    <Input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Nama tamu"
                      disabled={busy || !canAddRecipients}
                    />
                    <Input
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="Nomor WhatsApp"
                      disabled={busy || !canAddRecipients}
                    />
                    <Button
                      type="button"
                      size="sm"
                      className="w-full"
                      disabled={!name.trim() || !phone.trim() || busy || !canAddRecipients}
                      onClick={addNew}
                    >
                      <Plus className="h-4 w-4" />
                      Tambah tamu & penerima
                    </Button>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-border/70 bg-background shadow-[0_1px_2px_rgba(0,0,0,0.03)] p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-[family-name:var(--font-dc-mono)] text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                      Queue
                    </p>
                    <h2 className="mt-1 font-[family-name:var(--font-dc-heading)] text-lg font-semibold text-foreground">
                      Tamu yang akan diblast
                    </h2>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => loadEventData(eventId)}
                    disabled={busy}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Muat ulang
                  </Button>
                </div>

                <div className="mt-4 space-y-2">
                  {selected.length === 0 && (
                    <div className="rounded-xl border border-border/70 bg-background px-3 py-6 text-center text-xs text-muted-foreground">
                      Belum ada penerima WA Blast.
                    </div>
                  )}
                  {selected.map((guest) => (
                    <div
                      key={guest.id}
                      className="flex items-center gap-3 rounded-xl border border-border/70 bg-background px-3 py-2.5"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-foreground">{guest.name}</p>
                        <p className="mt-0.5 truncate font-[family-name:var(--font-dc-mono)] text-[9px] text-muted-foreground">
                          {guest.phone || "Nomor belum ada"}
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="icon-sm"
                        onClick={() => removeGuest(guest.id)}
                        disabled={busy}
                        title="Hapus dari daftar WA Blast"
                        aria-label={`Hapus ${guest.name} dari daftar WA Blast`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof MessageCircle; label: string; value: string }) {
  return <DashboardMetricCard icon={Icon} label={label} value={value} />;
}
