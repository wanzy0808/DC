"use client";

import { useEffect, useMemo, useState } from "react";
import { CreditCard, MessageCircle, Plus, RefreshCw, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDashboardI18n } from "@/components/Dashboard/useDashboardI18n";
import {
  DashboardEmptyState,
  DashboardMetricCard,
  DashboardMetricGrid,
  DashboardNotice,
  DashboardPage,
  DashboardSectionHeader,
  DashboardSurface,
} from "@/components/Dashboard/DashboardPrimitives";

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
  const { d } = useDashboardI18n();
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
    if (!response.ok) throw new Error(data?.error || d("Daftar acara belum dapat dimuat."));
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
      if (!queueResponse.ok) throw new Error(queueData?.error || d("WA Blast belum dapat dimuat."));
      setQuota(queueData?.quota ?? 0);
      setRemaining(queueData?.remaining ?? 0);
      setSelected((queueData?.selected ?? []) as SelectedGuest[]);
      setGuests((guestData?.guests ?? []) as Guest[]);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : d("WA Blast belum dapat dimuat."));
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
        setNotice(error instanceof Error ? error.message : d("Daftar acara belum dapat dimuat."));
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
      if (!response.ok) throw new Error(data?.error || d("Order add-on belum dapat dibuat."));
      if (data?.invoiceUrl) window.location.href = data.invoiceUrl;
    } catch (error) {
      setNotice(error instanceof Error ? error.message : d("Order add-on belum dapat dibuat."));
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
      if (!response.ok) throw new Error(data?.error || d("Tamu belum dapat ditambahkan."));
      setExistingGuestId("");
      await loadEventData(eventId);
      setNotice(d("Tamu ditambahkan ke daftar WA Blast."));
    } catch (error) {
      setNotice(error instanceof Error ? error.message : d("Tamu belum dapat ditambahkan."));
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
      if (!response.ok) throw new Error(data?.error || d("Tamu belum dapat ditambahkan."));
      setName("");
      setPhone("");
      await loadEventData(eventId);
      setNotice(d("Tamu baru ditambahkan ke daftar WA Blast."));
    } catch (error) {
      setNotice(error instanceof Error ? error.message : d("Tamu belum dapat ditambahkan."));
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
      if (!response.ok) throw new Error(data?.error || d("Tamu belum dapat dihapus."));
      await loadEventData(eventId);
      setNotice(d("Tamu dihapus dari daftar WA Blast."));
    } catch (error) {
      setNotice(error instanceof Error ? error.message : d("Tamu belum dapat dihapus."));
      setBusy(false);
    }
  }

  return (
    <DashboardPage className="pt-7 sm:pt-8">
      {notice && <DashboardNotice className="mb-4">{notice}</DashboardNotice>}

      <DashboardSurface className="p-4 sm:p-5">
        <DashboardSectionHeader
          eyebrow={d("WA Blast Add-on")}
          title={d("Distribusi WhatsApp")}
          description={d("Pilih acara aktif, cek quota, lalu siapkan daftar penerima yang akan dikirim.")}
          actions={
            eventId ? (
              <Button type="button" size="sm" onClick={purchaseAddon} disabled={busy}>
                <CreditCard className="h-4 w-4" />
                Beli 50 quota · Rp75.000
              </Button>
            ) : null
          }
        />

        <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
          <label className="block min-w-0 flex-1 sm:max-w-md">
            <span className="mb-1.5 block font-[family-name:var(--font-dc-mono)] text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
              {d("Acara")}
            </span>
            <select
              value={eventId}
              onChange={(event) => setEventId(event.target.value)}
              disabled={busy || events.length === 0}
              className="w-full px-3 text-sm outline-none"
              aria-label={d("Pilih acara untuk WA Blast")}
            >
              {events.length === 0 ? (
                <option value="">{d("Belum ada undangan aktif")}</option>
              ) : (
                events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title || d("Acara tanpa judul")}
                  </option>
                ))
              )}
            </select>
          </label>

        </div>

        {events.length === 0 && (
          <p className="mt-3 text-xs text-muted-foreground">
            Aktifkan minimal satu Undangan Digital untuk membeli add-on WA Blast.
          </p>
        )}
      </DashboardSurface>

      {eventId && (
        <>
          <DashboardMetricGrid className="mt-4 xl:grid-cols-3">
            <Metric icon={MessageCircle} label={d("Kuota")} value={String(quota)} />
            <Metric icon={Users} label={d("Dipilih")} value={String(selected.length)} />
            <Metric icon={Plus} label={d("Sisa")} value={String(remaining)} />
          </DashboardMetricGrid>

          {quota === 0 ? (
            <DashboardSurface className="mt-5 p-4 sm:p-5">
              <DashboardSectionHeader
                eyebrow={d("Add-on")}
                title={d("WA Blast belum aktif")}
                description={d("WA Blast tidak termasuk dalam harga Undangan Digital. Setiap pembelian menambah 50 quota untuk acara yang dipilih.")}
                actions={
                  <Button type="button" size="sm" onClick={purchaseAddon} disabled={busy}>
                    <CreditCard className="h-4 w-4" />
                    Beli 50 quota · Rp75.000
                  </Button>
                }
              />
            </DashboardSurface>
          ) : (
            <div className="mt-5 grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
              <DashboardSurface className="space-y-4 p-4 sm:p-5">
                <DashboardSectionHeader
                  eyebrow={d("Penerima")}
                  title={d("Tambah penerima")}
                  description={d("Gunakan data tamu yang sudah ada atau tambahkan penerima baru.")}
                />

                <div className="rounded-xl border border-border/70 bg-background p-3">
                  <p className="text-xs font-semibold text-foreground">{d("Dari daftar tamu")}</p>
                  <select
                    value={existingGuestId}
                    onChange={(event) => setExistingGuestId(event.target.value)}
                    className="mt-2 w-full px-3 text-sm"
                    disabled={busy || !canAddRecipients}
                  >
                    <option value="">{d("Pilih tamu")}</option>
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
                    {d("Tambahkan penerima")}
                  </Button>
                </div>

                <div className="rounded-xl border border-border/70 bg-background p-3">
                  <p className="text-xs font-semibold text-foreground">{d("Tamu belum ada")}</p>
                  <div className="mt-2 space-y-2">
                    <Input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder={d("Nama tamu")}
                      disabled={busy || !canAddRecipients}
                    />
                    <Input
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder={d("Nomor WhatsApp")}
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
                      {d("Tambah tamu & penerima")}
                    </Button>
                  </div>
                </div>
              </DashboardSurface>

              <DashboardSurface className="p-4 sm:p-5">
                <DashboardSectionHeader
                  eyebrow={d("Queue")}
                  title={d("Tamu yang akan diblast")}
                  description={d("Daftar ini memakai quota dari acara yang sedang aktif.")}
                  actions={
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => loadEventData(eventId)}
                      disabled={busy}
                    >
                      <RefreshCw className="h-4 w-4" />
                      {d("Muat ulang")}
                    </Button>
                  }
                />

                <div className="mt-4 space-y-2">
                  {selected.length === 0 && (
                    <DashboardEmptyState
                      icon={Users}
                      title={d("Belum ada penerima")}
                      description={d("Tambahkan tamu dari daftar atau buat penerima baru untuk acara ini.")}
                    />
                  )}
                  {selected.map((guest) => (
                    <div
                      key={guest.id}
                      className="flex items-center gap-3 rounded-xl border border-border/70 bg-background px-3 py-2.5"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-foreground">{guest.name}</p>
                        <p className="mt-0.5 truncate font-[family-name:var(--font-dc-mono)] text-[9px] text-muted-foreground">
                          {guest.phone || d("Nomor belum ada")}
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="icon-sm"
                        onClick={() => removeGuest(guest.id)}
                        disabled={busy}
                        title={d("Hapus dari daftar WA Blast")}
                        aria-label={`${d("Hapus")} ${guest.name} · WA Blast`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </DashboardSurface>
            </div>
          )}
        </>
      )}
    </DashboardPage>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof MessageCircle; label: string; value: string }) {
  return <DashboardMetricCard icon={Icon} label={label} value={value} />;
}
