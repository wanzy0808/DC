"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Home,
  LogOut,
  Mail,
  Menu,
  MessageCircle,
  MessageSquareHeart,
  QrCode,
  Receipt,
  RefreshCw,
  Settings2,
  Users,
  UserRound,
  X,
} from "lucide-react";
import { useTheme } from "@/components/Theme/ThemeContext";
import FeatureGate from "@/components/Dashboard/FeatureGate";
import RsvpAnalyticsPanel from "@/components/Dashboard/RsvpAnalyticsPanel";
import InvitationManagementPanel from "@/components/Dashboard/InvitationManagementPanel";
import EventPanelEditor from "@/components/Dashboard/EventPanel";
import SeatingChart from "@/components/Dashboard/SeatingChart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Context = {
  profile: { displayName: string; email: string };
  wedding: {
    invitationId: string | null;
    groomName: string;
    brideName: string;
    title: string;
    venue: string;
    address: string | null;
    mapUrl: string | null;
    timezone: string;
    eventDate: string;
    ceremonyTime: string | null;
    receptionTime: string | null;
    description: string | null;
  };
  package: { key: string; status: string };
  overview: {
    invitationsCreated: number;
    invitationsLimit: number;
    totalRsvp: number;
    totalGuests: number;
    invitationsShared: number;
    invitationPublished: boolean;
  };
  entitlements: {
    hasDigitalInvitation: boolean;
    hasGuestbook: boolean;
    canPublishInvitation: boolean;
    canUploadInvitationAssets: boolean;
    canUseGuestPlacement: boolean;
    canUseUsherApp: boolean;
  };
};
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
  checkedIn?: boolean;
  table?: { id: string; name: string; shape: string; capacity: number } | null;
  tableId?: string | null;
  seatNumber?: number | null;
};
type Tab = "overview" | "events" | "invitation" | "rsvp" | "placement" | "usher";

const nav = [
  { id: "overview" as Tab, label: "Beranda", icon: Home },
  { id: "events" as Tab, label: "Rangkaian Acara", icon: CalendarDays },
  { id: "invitation" as Tab, label: "Undangan Digital", icon: Mail },
  { id: "rsvp" as Tab, label: "RSVP", icon: MessageSquareHeart },
  { id: "placement" as Tab, label: "Manajemen Tamu", icon: Users },
  { id: "usher" as Tab, label: "Usher App", icon: QrCode },
];

const tabMeta: Record<Tab, { eyebrow: string; title: string }> = {
  overview: { eyebrow: "Workspace / 01", title: "Beranda" },
  events: { eyebrow: "Workspace / 02", title: "Rangkaian Acara" },
  invitation: { eyebrow: "Workspace / 03", title: "Undangan Digital" },
  rsvp: { eyebrow: "Workspace / 04", title: "RSVP" },
  placement: { eyebrow: "Workspace / 05", title: "Manajemen Tamu" },
  usher: { eyebrow: "Workspace / 06", title: "Usher App" },
};

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`border border-border bg-background ${className}`}>{children}</section>;
}

export default function DashboardPage() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const [tab, setTab] = useState<Tab>("overview");
  const [ctx, setCtx] = useState<Context | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [slug, setSlug] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileMenu, setProfileMenu] = useState(false);
  const [onboarding, setOnboarding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [onboardingError, setOnboardingError] = useState("");
  const [groom, setGroom] = useState("");
  const [bride, setBride] = useState("");
  const [nickname, setNickname] = useState("");

  const load = () => fetch("/api/invitations?type=WEDDING", { cache: "no-store" }).then(async (ir) => {
    const [cr, gr] = await Promise.all([
      fetch("/api/dashboard/context", { cache: "no-store" }),
      fetch("/api/guests", { cache: "no-store" }),
    ]);

    if (cr.ok) {
      const next = (await cr.json()) as Context;
      setCtx(next);
      setGroom(next.wedding?.groomName || "");
      setBride(next.wedding?.brideName || "");
      setNickname(next.profile.displayName || "");
      setOnboarding(
        !next.wedding?.groomName || !next.wedding?.brideName || !next.profile.displayName,
      );
    }

    if (gr.ok) {
      const data = await gr.json();
      setGuests(data.guests ?? []);
      setTables(data.tables ?? []);
    }

    if (ir.ok) setSlug((await ir.json()).invitation?.slug ?? "");
  });

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  const canDigital = ctx?.entitlements.hasDigitalInvitation ?? false;
  const canGuestbook = ctx?.entitlements.hasGuestbook ?? false;
  const accent = "text-primary";
  const button = "";
  const surface = isDarkMode ? "bg-[#0B0B0C]" : "bg-background";
  const savedProfileName = ctx?.profile.displayName?.trim();
  const profileLabel =
    savedProfileName && savedProfileName.toLowerCase() !== "dashboard"
      ? savedProfileName
      : ctx?.profile.email?.split("@")[0] || "Akun";

  async function saveOnboarding() {
    const groomName = groom.trim();
    const brideName = bride.trim();
    const displayName = nickname.trim();
    if (!groomName || !brideName || !displayName) {
      setOnboardingError("Nama pasangan dan nama panggilan wajib diisi.");
      return;
    }

    setSaving(true);
    setOnboardingError("");
    try {
      const invitationResponse = await fetch("/api/invitations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ type: "WEDDING", groomName, brideName }),
      });
      if (!invitationResponse.ok) {
        const data = await invitationResponse.json().catch(() => null);
        throw new Error(data?.error || "Data pasangan belum tersimpan.");
      }

      const profileResponse = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ firstName: displayName }),
      });
      if (!profileResponse.ok) {
        const data = await profileResponse.json().catch(() => null);
        throw new Error(data?.error || "Nama panggilan belum tersimpan.");
      }

      setOnboarding(false);
      setCtx((current) =>
        current
          ? {
              ...current,
              profile: { ...current.profile, displayName },
              wedding: {
                ...current.wedding,
                groomName,
                brideName,
                title: current.wedding.title || `${groomName} & ${brideName}`,
              },
            }
          : current,
      );
      setGroom(groomName);
      setBride(brideName);
      setNickname(displayName);
      await load();
    } catch (error) {
      setOnboardingError(
        error instanceof Error ? error.message : "Data belum tersimpan. Coba lagi.",
      );
      setOnboarding(true);
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  function go(id: Tab) {
    setTab(id);
    setMobileOpen(false);
    setProfileMenu(false);
  }

  const meta = tabMeta[tab];

  return (
    <div
      className={`dc-dashboard min-h-screen ${surface} font-[family-name:var(--font-fauna)] text-foreground`}
    >
      <div className="flex min-h-screen">
        <aside
          className={`${mobileOpen ? "fixed inset-y-0 left-0 z-50 flex" : "hidden"} w-64 shrink-0 flex-col border-r border-border lg:flex lg:min-h-screen`}
        >
          <nav className="flex-1 space-y-2 bg-primary/[0.045] p-3 dark:bg-primary/[0.07]">
            <p className="px-3 pb-3 pt-3 font-[family-name:var(--font-cinzel)] text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              Workspace
            </p>
            {nav.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  type="button"
                  aria-current={tab === item.id ? "page" : undefined}
                  onClick={() => go(item.id)}
                  className={`h-auto w-full min-w-0 justify-start rounded-[10px] border border-transparent bg-transparent px-3 py-3 text-left font-[family-name:var(--font-fauna)] text-[13px] font-medium shadow-none ${
                    tab === item.id
                      ? "border-primary/15 bg-primary/10 text-primary"
                      : "text-foreground hover:border-primary/10 hover:bg-primary/[0.07] hover:text-primary"
                  }`}
                >
                  <span className="grid size-5 shrink-0 place-items-center text-current">
                    <Icon className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
                  </span>
                  <span className="min-w-0 truncate">{item.label}</span>
                </Button>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl">
            <div className="mx-auto flex min-h-16 w-[min(92vw,1400px)] min-w-0 items-center gap-3 px-1">
              <Button
                type="button"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileOpen((value) => !value)}
                aria-label="Buka menu dashboard"
                title="Buka menu dashboard"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>

              <Link
                href="/"
                className="font-[family-name:var(--font-cinzel)] text-base font-bold tracking-[0.16em]"
              >
                <span className="text-primary">DC Organizer</span>
              </Link>

              <span className="hidden h-5 w-px bg-border sm:block" />
              <span className="hidden font-[family-name:var(--font-dm-mono)] text-[10px] uppercase tracking-[0.16em] text-muted-foreground sm:block">
                {meta.title}
              </span>

              <div className="relative ml-auto">
                <Button
                  type="button"
                  onClick={() => setProfileMenu((value) => !value)}
                  className="h-10 min-w-0 bg-transparent px-2.5 text-foreground shadow-none hover:bg-primary/[0.06] hover:text-primary"
                  aria-label={`Buka menu akun ${profileLabel}`}
                  title="Menu akun"
                >
                  <UserRound className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.8} />
                  <span className="max-w-36 truncate">{profileLabel}</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 shrink-0 text-primary transition ${profileMenu ? "rotate-180" : ""}`}
                  />
                </Button>

                {profileMenu && (
                  <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-xl border border-border bg-background p-2.5 text-foreground shadow-[0_18px_45px_rgba(0,0,0,0.12)] dark:shadow-black/40">
                    <div className="px-2 pb-3 pt-1">
                      <p className="font-[family-name:var(--font-cinzel)] text-sm font-semibold">
                        {profileLabel}
                      </p>
                      <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                        {ctx?.profile.email || ""}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <MenuItem
                        icon={Receipt}
                        text="Lihat transaksi"
                        onClick={() => router.push("/transactions")}
                      />
                      <MenuItem
                        icon={Settings2}
                        text="Kelola paket"
                        onClick={() => router.push("/packages")}
                      />
                      <MenuItem icon={CircleHelp} text="Buka FAQ" onClick={() => router.push("/faq")} />
                      <MenuItem
                        icon={MessageCircle}
                        text="Buka bantuan"
                        onClick={() => setProfileMenu(false)}
                      />
                      <div className="my-2 border-t border-border" />
                      <MenuItem icon={LogOut} text="Keluar akun" danger onClick={logout} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="min-w-0 overflow-x-clip">
            {tab !== "overview" && (
              <section className="border-b border-border bg-background">
                <div className="mx-auto flex w-[min(92vw,1400px)] min-w-0 items-center justify-between gap-6 px-1 py-5 sm:py-6">
                  <div className="min-w-0">
                    <p className="font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
                      {meta.eyebrow}
                    </p>
                    <h1 className="mt-1.5 font-[family-name:var(--font-cinzel)] text-2xl font-semibold leading-tight sm:text-3xl">
                      {meta.title}
                    </h1>
                  </div>
                  <div className="hidden min-w-0 text-right sm:block">
                    <p className="font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                      Wedding
                    </p>
                    <p className="mt-1 max-w-64 truncate text-xs text-foreground/70">
                      {ctx?.wedding?.groomName && ctx?.wedding?.brideName
                        ? `${ctx.wedding.groomName} & ${ctx.wedding.brideName}`
                        : "Belum diatur"}
                    </p>
                  </div>
                </div>
              </section>
            )}

            {tab === "overview" && (
              <WorkspaceOverview
                ctx={ctx}
                onGo={go}
                onUpgrade={() => router.push("/packages")}
              />
            )}
            {tab === "events" && <EventPanelEditor onSaved={load} accent={accent} />}
            {tab === "invitation" && (
              <InvitationManagementPanel accent={accent} button={button} paid={canDigital} />
            )}
            {tab === "rsvp" && <RsvpAnalyticsPanel guests={guests} slug={slug} accent={accent} />}
            {tab === "placement" && (
              <FeatureGate
                allowed={canDigital}
                title="Manajemen Tamu"
                description="Tersedia pada paket Digital Invitation."
                upgradeLabel="Lihat paket Digital Invitation"
                onUpgrade={() => router.push("/packages")}
              >
                <PlacementPanel
                  guests={guests}
                  tables={tables}
                  accent={accent}
                  onRefresh={load}
                />
              </FeatureGate>
            )}
            {tab === "usher" && (
              <FeatureGate
                allowed={canGuestbook}
                title="Usher App"
                description="Tersedia pada paket Guestbook Digital."
                upgradeLabel="Lihat paket Guestbook Digital"
                onUpgrade={() => router.push("/packages")}
              >
                <UsherPanel guests={guests} onRefresh={load} />
              </FeatureGate>
            )}
          </main>
        </div>
      </div>

      <Button asChild size="icon-lg" className="fixed bottom-5 right-5 z-50 rounded-full">
        <a
          href="https://wa.me/6281234567890"
          target="_blank"
          rel="noreferrer"
          aria-label="Buka bantuan WhatsApp"
          title="Buka bantuan WhatsApp"
        >
          <MessageCircle className="h-6 w-6" strokeWidth={2} />
        </a>
      </Button>

      {onboarding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg border border-border bg-background p-6 shadow-2xl dark:bg-[#0B0B0C] sm:p-8">
            <p className="font-[family-name:var(--font-dm-mono)] text-[10px] font-medium uppercase tracking-[0.2em] text-primary">
              Setup awal
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-cinzel)] text-2xl">Data pasangan</h2>
            <div className="mt-6 space-y-4">
              <Field
                label="Nama pasangan pria"
                value={groom}
                onChange={setGroom}
                placeholder="Contoh: Rio"
              />
              <Field
                label="Nama pasangan wanita"
                value={bride}
                onChange={setBride}
                placeholder="Contoh: Lyvia"
              />
              <Field
                label="Nama panggilan"
                value={nickname}
                onChange={setNickname}
                placeholder="Contoh: Hendro"
              />
            </div>
            {onboardingError && (
              <p className="mt-4 border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs text-red-700 dark:text-red-300">
                {onboardingError}
              </p>
            )}
            <Button disabled={saving} onClick={saveOnboarding} size="lg" className="mt-6 w-full">
              <CheckCircle2 className="h-4 w-4" />
              {saving ? "Menyimpan data..." : "Simpan data & masuk"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuItem({
  icon: Icon,
  text,
  onClick,
  danger = false,
}: {
  icon: typeof Home;
  text: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <Button
      type="button"
      onClick={onClick}
      className={`h-10 w-full min-w-0 justify-start rounded-[10px] border border-border/70 bg-background px-3 text-left text-xs shadow-none ${
        danger
          ? "text-red-700 hover:border-red-500/25 hover:bg-red-500/5 dark:text-red-300"
          : "text-foreground hover:border-primary/25 hover:bg-primary/[0.06] hover:text-primary"
      }`}
    >
      <Icon className="h-4 w-4" />
      {text}
    </Button>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium">{label}</span>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="border-border bg-transparent"
      />
    </label>
  );
}

function WorkspaceOverview({
  ctx,
  onGo,
  onUpgrade,
}: {
  ctx: Context | null;
  onGo: (id: Tab) => void;
  onUpgrade: () => void;
}) {
  const overview = ctx?.overview;
  const packageKey = ctx?.package.key;
  const packageStatus = ctx?.package.status;
  const packageLabel =
    packageStatus === "PAID"
      ? packageKey === "INVITATION_GUESTBOOK"
        ? "Digital Invitation + Guestbook"
        : packageKey === "GUESTBOOK_DIGITAL"
          ? "Guestbook Digital"
          : "Digital Invitation"
      : "Belum aktif";

  return (
    <div className="mx-auto w-[min(92vw,1400px)] min-w-0 px-1 pb-16 pt-7 sm:pt-8">
      <section className="flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
            Workspace / 01
          </p>
          <h1 className="mt-1.5 font-[family-name:var(--font-cinzel)] text-2xl font-semibold sm:text-3xl">
            Halo, {ctx?.profile.displayName || "Akun"}
          </h1>
        </div>
        <div className="min-w-0 sm:text-right">
          <p className="font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
            Wedding
          </p>
          <p className="mt-1 truncate text-sm font-medium">
            {ctx?.wedding?.groomName && ctx?.wedding?.brideName
              ? `${ctx.wedding.groomName} & ${ctx.wedding.brideName}`
              : "Belum diatur"}
          </p>
          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
            {ctx?.wedding?.venue || "Lokasi belum diatur"}
          </p>
        </div>
      </section>

      <section className="grid border-b border-border sm:grid-cols-4">
        <Stat label="Paket" value={packageLabel} />
        <Stat label="RSVP" value={String(overview?.totalRsvp ?? 0)} />
        <Stat label="Tamu" value={String(overview?.totalGuests ?? 0)} />
        <Stat label="Publish" value={overview?.invitationPublished ? "Aktif" : "Draft"} />
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-[family-name:var(--font-cinzel)] text-lg font-semibold">Akses cepat</h2>
          <Button onClick={onUpgrade} size="sm" title="Kelola paket">
            <Settings2 className="h-4 w-4" />
            Kelola paket
          </Button>
        </div>
        <div className="grid border-y border-border sm:grid-cols-2">
          <QuickAction icon={CalendarDays} label="Rangkaian Acara" onClick={() => onGo("events")} />
          <QuickAction icon={Mail} label="Undangan Digital" onClick={() => onGo("invitation")} />
          <QuickAction icon={MessageSquareHeart} label="RSVP" onClick={() => onGo("rsvp")} />
          <QuickAction icon={Users} label="Manajemen Tamu" onClick={() => onGo("placement")} />
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 border-b border-border px-0 py-4 last:border-b-0 sm:border-b-0 sm:border-r sm:px-5 sm:last:border-r-0 sm:first:pl-0">
      <p className="font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function QuickAction({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Home;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      onClick={onClick}
      className="h-auto w-full min-w-0 justify-start rounded-none border-b border-border bg-transparent px-1 py-4 text-left text-sm text-foreground shadow-none hover:bg-primary/[0.04] hover:text-primary sm:px-3 sm:[&:nth-child(odd)]:border-r"
    >
      <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
      <span className="truncate">{label}</span>
      <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
    </Button>
  );
}

function PlacementPanel({
  guests,
  tables,
  accent,
  onRefresh,
}: {
  guests: Guest[];
  tables: Table[];
  accent: string;
  onRefresh: () => void;
}) {
  const assigned = guests.filter((guest) => guest.tableId).length;
  const assignGuest = async (guestId: string, tableId: string, seatNumber: number) => {
    const response = await fetch(`/api/guests/${guestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ tableId, seatNumber }),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(data?.error || "Penempatan tamu gagal disimpan.");
    await onRefresh();
  };

  return (
    <div className="mx-auto w-[min(92vw,1400px)] min-w-0 px-1 pb-16 pt-7 sm:pt-8">
      <Card>
        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
            <h2 className="font-[family-name:var(--font-cinzel)] text-lg font-semibold">Tamu & seating</h2>
            <Button onClick={onRefresh} size="sm" title="Muat ulang data tamu dan meja">
              <RefreshCw className="h-4 w-4" />
              Muat ulang
            </Button>
          </div>
          <div className="grid border-b border-border sm:grid-cols-3">
            <Stat label="Tamu" value={String(guests.length)} />
            <Stat label="Meja" value={String(tables.length)} />
            <Stat label="Ditempatkan" value={`${assigned} / ${guests.length}`} />
          </div>
          <div className="pt-5">
            <SeatingChart guests={guests} tables={tables} accent={accent} onAssigned={assignGuest} />
          </div>
        </div>
      </Card>
    </div>
  );
}

function UsherPanel({ guests, onRefresh }: { guests: Guest[]; onRefresh: () => void }) {
  const checked = guests.filter((guest) => guest.checkedIn).length;

  return (
    <div className="mx-auto w-[min(92vw,1400px)] min-w-0 px-1 pb-16 pt-7 sm:pt-8">
      <Card>
        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
            <h2 className="font-[family-name:var(--font-cinzel)] text-lg font-semibold">Check-in</h2>
            <Button onClick={onRefresh} size="sm" title="Muat ulang status check-in">
              <RefreshCw className="h-4 w-4" />
              Muat ulang
            </Button>
          </div>
          <div className="grid sm:grid-cols-2">
            <Stat label="Total tamu" value={String(guests.length)} />
            <Stat label="Check-in" value={String(checked)} />
          </div>
        </div>
      </Card>
    </div>
  );
}