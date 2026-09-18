"use client";

import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  LayoutGrid,
  Mail,
  MessageSquareHeart,
  QrCode,
  RefreshCw,
  Send,
  Users,
} from "lucide-react";
import EventScopePicker from "@/components/Dashboard/EventScopePicker";
import RsvpAnalyticsPanel from "@/components/Dashboard/RsvpAnalyticsPanel";
import SeatingChart from "@/components/Dashboard/SeatingChart";
import { useDashboardI18n } from "@/components/Dashboard/useDashboardI18n";
import { Button } from "@/components/ui/button";
import {
  DashboardEmptyState,
  DashboardMetricCard,
  DashboardMetricGrid,
  DashboardPage as DashboardPageShell,
  DashboardPageHeader,
  DashboardPanel,
  DashboardSectionHeader,
  DashboardStatusBadge,
  DashboardSurface,
} from "@/components/Dashboard/DashboardPrimitives";
import type {
  DashboardContext,
  DashboardEvent,
  DashboardGuest,
  DashboardTable,
  DashboardTab,
} from "@/components/Dashboard/dashboard-types";

function formatEventDate(value: string, locale: "id" | "en" = "id") {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

export function WorkspaceOverview({
  ctx,
  events,
  onGo,
}: {
  ctx: DashboardContext | null;
  events: DashboardEvent[];
  onGo: (id: DashboardTab) => void;
}) {
  const { d, locale } = useDashboardI18n();
  const overview = ctx?.overview;
  const active = events.filter((event) => event.accessPaid).length;
  const published = events.filter((event) => event.isPublished).length;
  const totalGuests = overview?.totalGuests ?? 0;
  const totalRsvp = overview?.totalRsvp ?? 0;
  const pendingRsvp = Math.max(totalGuests - totalRsvp, 0);
  const rsvpCoverage = totalGuests
    ? Math.min(100, Math.round((totalRsvp / totalGuests) * 100))
    : 0;
  const publishRate = events.length
    ? Math.min(100, Math.round((published / events.length) * 100))
    : 0;

  const stats = [
    { label: d("Total acara"), value: events.length, icon: CalendarDays },
    { label: d("Undangan aktif"), value: active, icon: Mail },
    { label: d("Total RSVP"), value: overview?.totalRsvp ?? 0, icon: MessageSquareHeart },
    { label: d("Total tamu"), value: overview?.totalGuests ?? 0, icon: Users },
  ];

  return (
    <DashboardPageShell>
      <DashboardPageHeader
        eyebrow={d("Beranda")}
        title={<>{d("Halo")}, {ctx?.profile.displayName || d("Akun")}</>}
        description={d("Pantau semua persiapan dan aktivitas terbaru dari sini.")}
        actions={<>
            <Button onClick={() => onGo("events")} size="sm">
              <CalendarDays className="h-4 w-4" />
              {d("Tambah acara")}
            </Button>
        </>}
      />

      <DashboardMetricGrid className="mt-4">
        {stats.map((item) => (
          <DashboardMetricCard
            key={item.label}
            icon={item.icon}
            label={item.label}
            value={String(item.value)}
          />
        ))}
      </DashboardMetricGrid>

      <section className="mt-4 grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.75fr)]">
        <DashboardSurface className="min-w-0 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-5 py-4 sm:px-6">
            <div>
              <h2 className="font-[family-name:var(--font-dc-heading)] text-lg font-semibold">{d("Terbaru")}</h2>
              <p className="mt-1 font-[family-name:var(--font-dc-mono)] text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                {active} {d("aktif")} · {published} {d("terbit")}
              </p>
            </div>
            <Button onClick={() => onGo("events")} size="sm">
              {d("Lihat semua")}
            </Button>
          </div>

          {events.length ? (
            <div className="overflow-x-auto px-4 pb-4 sm:px-5">
              <table className="w-full min-w-[760px] border-separate border-spacing-0 text-left">
                <thead>
                  <tr className="text-[11px] text-muted-foreground">
                    <th className="px-3 py-3 font-medium">{d("Acara")}</th>
                    <th className="px-3 py-3 font-medium">{d("Tanggal")}</th>
                    <th className="px-3 py-3 font-medium">{d("Lokasi")}</th>
                    <th className="px-3 py-3 font-medium">{d("Status")}</th>
                    <th className="px-3 py-3 text-right font-medium">{d("Aksi")}</th>
                  </tr>
                </thead>
                <tbody>
                  {events.slice(0, 6).map((event) => (
                    <tr key={event.id} className="border-t border-border/60">
                      <td className="max-w-64 px-3 py-3.5">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {event.title || d("Acara tanpa judul")}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3.5 text-xs text-muted-foreground">
                        {formatEventDate(event.eventDate, locale)}
                      </td>
                      <td className="max-w-52 px-3 py-3.5 text-xs text-muted-foreground">
                        <p className="truncate">{event.venue || "—"}</p>
                      </td>
                      <td className="px-3 py-3.5">
                        <DashboardStatusBadge active={event.isPublished}>
                          {event.isPublished ? d("Terbit") : event.accessPaid ? d("Aktif") : d("Draft")}
                        </DashboardStatusBadge>
                      </td>
                      <td className="px-3 py-3.5 text-right">
                        <Link
                          href={`/dashboard/editor?type=${event.type}&invitationId=${event.id}`}
                          className="text-xs font-semibold text-primary hover:underline"
                        >
                          {d("Undangan")}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-5 py-8 sm:px-6">
              <div className="flex max-w-xl items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                  <CalendarDays className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold">{d("Belum ada acara")}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {d("Buat acara pertama untuk mulai menyiapkan undangan digital.")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DashboardSurface>

        <DashboardSurface className="min-w-0 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-[family-name:var(--font-dc-mono)] text-[11px] uppercase tracking-[0.14em] text-primary">
                {d("Ringkasan data")}
              </p>
              <h2 className="mt-1 font-[family-name:var(--font-dc-heading)] text-lg font-semibold">
                {d("Ringkasan performa")}
              </h2>
            </div>
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
              <MessageSquareHeart className="h-4 w-4" />
            </span>
          </div>

          <div className="mt-5 rounded-xl border border-border/70 p-4">
            <div className="flex flex-col items-center gap-5 sm:flex-row xl:flex-col 2xl:flex-row">
              <figure
                className="relative size-32 shrink-0"
                aria-label={`Cakupan RSVP ${rsvpCoverage}%`}
              >
                <svg viewBox="0 0 42 42" className="size-32 -rotate-90" aria-hidden="true">
                  <circle
                    cx="21"
                    cy="21"
                    r="15.9155"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.4"
                    className="text-foreground/[0.07]"
                  />
                  <circle
                    cx="21"
                    cy="21"
                    r="15.9155"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.4"
                    strokeLinecap="round"
                    strokeDasharray={`${rsvpCoverage} ${100 - rsvpCoverage}`}
                    className="text-primary"
                  />
                </svg>
                <div className="absolute inset-0 grid place-items-center text-center">
                  <div>
                    <p className="text-2xl font-semibold leading-none">{rsvpCoverage}%</p>
                    <p className="mt-1 font-[family-name:var(--font-dc-mono)] text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                      RSVP
                    </p>
                  </div>
                </div>
              </figure>

              <div className="w-full min-w-0 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-muted-foreground">{d("Sudah merespons")}</span>
                  <span className="text-sm font-semibold">{totalRsvp}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-muted-foreground">{d("Belum merespons")}</span>
                  <span className="text-sm font-semibold">{pendingRsvp}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-muted-foreground">{d("Total tamu")}</span>
                  <span className="text-sm font-semibold">{totalGuests}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-border/70 p-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold">{d("Publikasi")}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{locale === "en" ? `${published} of ${events.length} events published` : `${published} dari ${events.length} acara sudah terbit`}</p>
              </div>
              <p className="font-[family-name:var(--font-dc-mono)] text-xs font-semibold text-primary">
                {publishRate}%
              </p>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-foreground/[0.07]">
              <div
                className="h-full rounded-full bg-primary transition-[width]"
                style={{ width: `${publishRate}%` }}
              />
            </div>
          </div>

          <p className="mt-5 font-[family-name:var(--font-dc-mono)] text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            Akses cepat
          </p>
          <div className="mt-2 divide-y divide-border/70 border-y border-border/70">
            {[
              { id: "invitation" as DashboardTab, label: "Undangan Digital", icon: Mail },
              { id: "rsvp" as DashboardTab, label: "RSVP", icon: MessageSquareHeart },
              { id: "placement" as DashboardTab, label: "Manajemen Tamu", icon: Users },
              { id: "waBlast" as DashboardTab, label: "WA Blast", icon: Send },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onGo(item.id)}
                  className="flex min-h-12 w-full items-center gap-3 py-3 text-left text-sm transition hover:text-primary"
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/[0.08] text-primary">
                    <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
                  </span>
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  <ChevronDown className="h-3.5 w-3.5 -rotate-90 text-muted-foreground" />
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between gap-4 rounded-xl bg-foreground/[0.018] px-4 py-3">
            <span className="text-xs text-muted-foreground">{locale === "en" ? "Total invitation visits" : "Total kunjungan undangan"}</span>
            <span className="text-sm font-semibold">{overview?.invitationsShared ?? 0}</span>
          </div>
        </DashboardSurface>
      </section>
    </DashboardPageShell>
  );
}

export function RsvpWorkspace({
  events,
  selectedId,
  onSelect,
  selectedEvent,
  guests,
  loading,
  onRefresh,
  accent,
}: {
  events: DashboardEvent[];
  selectedId: string;
  onSelect: (id: string) => void;
  selectedEvent: DashboardEvent | null;
  guests: DashboardGuest[];
  loading: boolean;
  onRefresh: () => Promise<void>;
  accent: string;
}) {
  const { d } = useDashboardI18n();
  return (
    <DashboardPageShell>
      <DashboardPageHeader eyebrow={d("Kehadiran")} title={d("RSVP")} description={d("Pantau respons dan konfirmasi tamu.")}>
      <EventScopePicker
        events={events}
        value={selectedId}
        onChange={onSelect}
        disabled={loading}
      />
      </DashboardPageHeader>
      {selectedEvent && (
        <div className="mt-4">
          {loading ? (
            <LoadingSurface />
          ) : (
            <RsvpAnalyticsPanel
              key={selectedEvent.id}
              guests={guests}
              slug={selectedEvent.slug}
              accent={accent}
              embedded
              onRefresh={onRefresh}
            />
          )}
        </div>
      )}
    </DashboardPageShell>
  );
}

export function PlacementWorkspace({
  events,
  selectedId,
  onSelect,
  selectedEvent,
  guests,
  tables,
  loading,
  accent,
  onRefresh,
}: {
  events: DashboardEvent[];
  selectedId: string;
  onSelect: (id: string) => void;
  selectedEvent: DashboardEvent | null;
  guests: DashboardGuest[];
  tables: DashboardTable[];
  loading: boolean;
  accent: string;
  onRefresh: () => Promise<void>;
}) {
  const { d } = useDashboardI18n();
  return (
    <DashboardPageShell>
      <DashboardPageHeader eyebrow={d("Tamu")} title={d("Manajemen Tamu")} description={d("Atur daftar tamu, meja, dan posisi duduk.")}>
      <EventScopePicker
        events={events}
        value={selectedId}
        onChange={onSelect}
        disabled={loading}
      />
      </DashboardPageHeader>
      {selectedEvent && (
        <div className="mt-4">
          {loading ? (
            <LoadingSurface />
          ) : (
            <PlacementPanel
              invitationId={selectedId}
              guests={guests}
              tables={tables}
              accent={accent}
              onRefresh={onRefresh}
            />
          )}
        </div>
      )}
    </DashboardPageShell>
  );
}

function PlacementPanel({
  invitationId,
  guests,
  tables,
  accent,
  onRefresh,
}: {
  invitationId: string;
  guests: DashboardGuest[];
  tables: DashboardTable[];
  accent: string;
  onRefresh: () => Promise<void>;
}) {
  const { d } = useDashboardI18n();
  const assigned = guests.filter((guest) => guest.tableId).length;

  const assignGuest = async (
    guestId: string,
    tableId: string,
    seatNumber: number,
  ) => {
    const response = await fetch(`/api/guests/${guestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ tableId, seatNumber }),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(data?.error || d("Penempatan tamu gagal disimpan."));
    }
    await onRefresh();
  };

  return (
    <div className="space-y-4">
        <DashboardSectionHeader
          eyebrow={d("Manajemen Tamu")}
          title={d("Tamu & seating")}
          description={d("Tarik tamu ke kursi untuk menyimpan posisi dan melihat distribusi meja secara visual.")}
          actions={
            <Button onClick={onRefresh} size="sm" title={d("Muat ulang data tamu dan meja")}>
              <RefreshCw className="h-4 w-4" />
              {d("Muat ulang")}
            </Button>
          }
        />
        <DashboardMetricGrid className="mt-4 xl:grid-cols-3">
          <DashboardMetricCard icon={Users} label={d("Tamu")} value={String(guests.length)} />
          <DashboardMetricCard icon={LayoutGrid} label={d("Meja")} value={String(tables.length)} />
          <DashboardMetricCard icon={CheckCircle2} label={d("Ditempatkan")} value={`${assigned} / ${guests.length}`} />
        </DashboardMetricGrid>
        <SeatingChart
          key={invitationId}
          invitationId={invitationId}
          guests={guests}
          tables={tables}
          accent={accent}
          onAssigned={assignGuest}
        />
    </div>
  );
}

function LoadingSurface() {
  const { d } = useDashboardI18n();
  return (
    <DashboardSurface className="p-5 font-[family-name:var(--font-dc-mono)] text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
      {d("Memuat data acara...")}
    </DashboardSurface>
  );
}

export function UsherPanel({
  guests,
  onRefresh,
}: {
  guests: DashboardGuest[];
  onRefresh: () => void;
}) {
  const { d } = useDashboardI18n();
  const checked = guests.filter((guest) => guest.checkedIn).length;
  return (
    <DashboardPageShell>
        <DashboardPageHeader
          eyebrow={d("Usher App")}
          title={d("Check-in")}
          description={d("Pantau check-in dan lanjutkan ke scanner saat siap.")}
          actions={
            <>
              <Button onClick={onRefresh} size="sm" title={d("Muat ulang status check-in")}>
                <RefreshCw className="h-4 w-4" />{d("Muat ulang")}
              </Button>
              <Button asChild size="sm"><Link href="/dashboard/usher"><QrCode className="size-4" />{d("Buka Usher App")}</Link></Button>
            </>
          }
        />
        <DashboardMetricGrid className="mt-4 xl:grid-cols-2">
          <DashboardMetricCard icon={Users} label={d("Total tamu")} value={String(guests.length)} />
          <DashboardMetricCard icon={CheckCircle2} label={d("Check-in")} value={String(checked)} />
        </DashboardMetricGrid>
        <DashboardPanel className="mt-4" title={d("Daftar tamu")} description={d("Pantau status check-in tamu sebelum membuka scanner.")}>
          {guests.length === 0 ? <DashboardEmptyState icon={Users} title={d("Belum ada tamu")} /> : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left">
                <thead><tr><th className="px-3 py-3">{d("Nama tamu")}</th><th className="px-3 py-3">WhatsApp</th><th className="px-3 py-3">{d("Status")}</th></tr></thead>
                <tbody>{guests.map(guest => (
                  <tr key={guest.id}>
                    <td className="px-3 py-4 text-sm font-semibold">{guest.name}</td>
                    <td className="px-3 py-4 text-sm text-muted-foreground">{guest.phone || "—"}</td>
                    <td className="px-3 py-4"><DashboardStatusBadge active={guest.checkedIn}>{guest.checkedIn ? d("Check-in") : d("Belum check-in")}</DashboardStatusBadge></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </DashboardPanel>
    </DashboardPageShell>
  );
}
