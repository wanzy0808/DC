"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  ContactRound,
  CreditCard,
  Home,
  LogOut,
  Mail,
  Menu,
  MessageCircle,
  MessageSquareHeart,
  QrCode,
  Receipt,
  RefreshCw,
  Send,
  Settings2,
  Users,
  UserRound,
  X,
} from "lucide-react";
import { useTheme } from "@/components/Theme/ThemeContext";
import EventScopePicker, {
  type EventScopeOption,
} from "@/components/Dashboard/EventScopePicker";
import FeatureGate from "@/components/Dashboard/FeatureGate";
import RsvpAnalyticsPanel from "@/components/Dashboard/RsvpAnalyticsPanel";
import InvitationWorkspacePanel from "@/components/Dashboard/InvitationWorkspacePanel";
import EventPanelEditor from "@/components/Dashboard/EventPanel";
import SeatingChart from "@/components/Dashboard/SeatingChart";
import WhatsAppBlastPanel from "@/components/Dashboard/WhatsAppBlastPanel";
import PersonalInvitationPanel from "@/components/Dashboard/PersonalInvitationPanel";
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
    eventDate: string | null;
    ceremonyTime: string | null;
    receptionTime: string | null;
    description: string | null;
  };
  package: { key: string | null; status: string };
  overview: {
    invitationsCreated: number;
    invitationsLimit: number | null;
    unlimitedInvitations: boolean;
    activeInvitations: number;
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

type DashboardEvent = EventScopeOption & {
  type: "WEDDING" | "ADAT_AKAD";
  slug: string;
  eventConfigured: boolean;
  accessPaid: boolean;
  createdAt: string;
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
  source?: "RSVP" | "MANUAL";
  rsvpStatus: string;
  plusOnes: number;
  checkedIn?: boolean;
  table?: { id: string; name: string; shape: string; capacity: number } | null;
  tableId?: string | null;
  seatNumber?: number | null;
};

type Tab =
  | "overview"
  | "events"
  | "invitation"
  | "waBlast"
  | "personalInvitation"
  | "rsvp"
  | "placement"
  | "usher";

type EventGuestData = { guests: Guest[]; tables: Table[] };

const invitationTabs = new Set<Tab>(["events", "invitation", "personalInvitation"]);

const invitationNav = [
  { id: "events" as Tab, label: "Rangkaian Acara", icon: CalendarDays },
  { id: "invitation" as Tab, label: "Undangan", icon: Mail },
  {
    id: "personalInvitation" as Tab,
    label: "Personal Invitation",
    icon: ContactRound,
  },
];

const secondaryNav = [
  { id: "waBlast" as Tab, label: "WA Blast Add-on", icon: Send },
  { id: "rsvp" as Tab, label: "RSVP", icon: MessageSquareHeart },
  { id: "placement" as Tab, label: "Manajemen Tamu", icon: Users },
  { id: "usher" as Tab, label: "Usher App", icon: QrCode },
];

const tabMeta: Record<Tab, { eyebrow: string; title: string }> = {
  overview: { eyebrow: "Workspace", title: "Beranda" },
  events: { eyebrow: "Acara", title: "Rangkaian Acara" },
  invitation: { eyebrow: "Acara", title: "Undangan" },
  personalInvitation: { eyebrow: "Acara", title: "Personal Invitation" },
  waBlast: { eyebrow: "Add-on", title: "WA Blast" },
  rsvp: { eyebrow: "Workspace", title: "RSVP" },
  placement: { eyebrow: "Workspace", title: "Manajemen Tamu" },
  usher: { eyebrow: "Workspace", title: "Usher App" },
};

function sortEvents(items: DashboardEvent[]) {
  return [...items].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

async function fetchEventGuestData(invitationId: string): Promise<EventGuestData> {
  if (!invitationId) return { guests: [], tables: [] };
  const response = await fetch(
    `/api/guests?invitationId=${encodeURIComponent(invitationId)}`,
    { cache: "no-store" },
  );
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error || "Data acara belum dapat dimuat.");
  return { guests: data?.guests ?? [], tables: data?.tables ?? [] };
}

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border border-border/80 bg-foreground/[0.018] ${className}`}
    >
      {children}
    </section>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const [tab, setTab] = useState<Tab>("overview");
  const [invitationMenuOpen, setInvitationMenuOpen] = useState(true);
  const [ctx, setCtx] = useState<Context | null>(null);
  const [events, setEvents] = useState<DashboardEvent[]>([]);
  const [rsvpEventId, setRsvpEventId] = useState("");
  const [rsvpGuests, setRsvpGuests] = useState<Guest[]>([]);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [placementEventId, setPlacementEventId] = useState("");
  const [placementGuests, setPlacementGuests] = useState<Guest[]>([]);
  const [placementTables, setPlacementTables] = useState<Table[]>([]);
  const [placementLoading, setPlacementLoading] = useState(false);
  const [usherGuests, setUsherGuests] = useState<Guest[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileMenu, setProfileMenu] = useState(false);
  const [onboarding, setOnboarding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [onboardingError, setOnboardingError] = useState("");
  const [nickname, setNickname] = useState("");

  const load = async () => {
    const [contextResponse, invitationResponse] = await Promise.all([
      fetch("/api/dashboard/context", { cache: "no-store" }),
      fetch("/api/invitations?all=1", { cache: "no-store" }),
    ]);

    if (contextResponse.ok) {
      const next = (await contextResponse.json()) as Context;
      setCtx(next);
      setNickname(next.profile.displayName || "");
      setOnboarding(!next.profile.displayName?.trim());
    }

    if (invitationResponse.ok) {
      const data = await invitationResponse.json();
      const configured = sortEvents(
        ((data.invitations ?? []) as DashboardEvent[]).filter(
          (invitation) => invitation.eventConfigured,
        ),
      );
      setEvents(configured);
      const firstId = configured[0]?.id ?? "";
      setRsvpEventId((current) =>
        configured.some((event) => event.id === current) ? current : firstId,
      );
      setPlacementEventId((current) =>
        configured.some((event) => event.id === current) ? current : firstId,
      );

      const firstGuestbookEvent = configured.find((event) => event.accessPaid);
      if (firstGuestbookEvent) {
        const dataForUsher = await fetchEventGuestData(firstGuestbookEvent.id).catch(
          () => ({ guests: [], tables: [] }),
        );
        setUsherGuests(dataForUsher.guests);
      } else {
        setUsherGuests([]);
      }
    }
  };

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  useEffect(() => {
    let active = true;
    if (!rsvpEventId) {
      setRsvpGuests([]);
      setRsvpLoading(false);
      return () => {
        active = false;
      };
    }

    setRsvpLoading(true);
    fetchEventGuestData(rsvpEventId)
      .then((data) => {
        if (active) setRsvpGuests(data.guests);
      })
      .catch(() => {
        if (active) setRsvpGuests([]);
      })
      .finally(() => {
        if (active) setRsvpLoading(false);
      });

    return () => {
      active = false;
    };
  }, [rsvpEventId]);

  useEffect(() => {
    let active = true;
    if (!placementEventId) {
      setPlacementGuests([]);
      setPlacementTables([]);
      setPlacementLoading(false);
      return () => {
        active = false;
      };
    }

    setPlacementLoading(true);
    fetchEventGuestData(placementEventId)
      .then((data) => {
        if (!active) return;
        setPlacementGuests(data.guests);
        setPlacementTables(data.tables);
      })
      .catch(() => {
        if (!active) return;
        setPlacementGuests([]);
        setPlacementTables([]);
      })
      .finally(() => {
        if (active) setPlacementLoading(false);
      });

    return () => {
      active = false;
    };
  }, [placementEventId]);

  const canGuestbook = ctx?.entitlements.hasGuestbook ?? false;
  const hasAnyPaidInvitation = events.some((event) => event.accessPaid);
  const accent = "text-primary";
  const surface = isDarkMode ? "bg-[#0B0B0C]" : "bg-background";
  const savedProfileName = ctx?.profile.displayName?.trim();
  const profileLabel =
    savedProfileName && savedProfileName.toLowerCase() !== "dashboard"
      ? savedProfileName
      : ctx?.profile.email?.split("@")[0] || "Akun";
  const rsvpEvent = events.find((event) => event.id === rsvpEventId) ?? null;
  const placementEvent =
    events.find((event) => event.id === placementEventId) ?? null;

  async function refreshRsvp() {
    if (!rsvpEventId) return;
    const data = await fetchEventGuestData(rsvpEventId);
    setRsvpGuests(data.guests);
  }

  async function refreshPlacement() {
    if (!placementEventId) return;
    const data = await fetchEventGuestData(placementEventId);
    setPlacementGuests(data.guests);
    setPlacementTables(data.tables);
  }

  async function saveOnboarding() {
    const displayName = nickname.trim();
    if (!displayName) {
      setOnboardingError("Nama panggilan wajib diisi.");
      return;
    }

    setSaving(true);
    setOnboardingError("");
    try {
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
            }
          : current,
      );
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
    if (invitationTabs.has(id)) setInvitationMenuOpen(true);
    setMobileOpen(false);
    setProfileMenu(false);
  }

  const meta = tabMeta[tab];
  const invitationActive = invitationTabs.has(tab);
  const scopedHeaderEvent =
    tab === "rsvp" ? rsvpEvent : tab === "placement" ? placementEvent : null;

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

            <Button
              type="button"
              aria-current={tab === "overview" ? "page" : undefined}
              onClick={() => go("overview")}
              className={`h-auto w-full min-w-0 justify-start rounded-[10px] border border-transparent bg-transparent px-3 py-3 text-left font-[family-name:var(--font-fauna)] text-[13px] font-medium shadow-none ${
                tab === "overview"
                  ? "border-primary/15 bg-primary/10 text-primary"
                  : "text-foreground hover:border-primary/10 hover:bg-primary/[0.07] hover:text-primary"
              }`}
            >
              <span className="grid size-5 shrink-0 place-items-center text-current">
                <Home className="h-4 w-4" strokeWidth={1.8} />
              </span>
              <span className="min-w-0 truncate">Beranda</span>
            </Button>

            <div className="rounded-xl border border-primary/10 bg-background/35 p-1.5">
              <Button
                type="button"
                aria-expanded={invitationMenuOpen}
                onClick={() => setInvitationMenuOpen((value) => !value)}
                className={`h-auto w-full min-w-0 justify-start rounded-[9px] border border-transparent bg-transparent px-2.5 py-2.5 text-left text-[13px] font-medium shadow-none ${
                  invitationActive
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-primary/[0.06] hover:text-primary"
                }`}
              >
                <span className="grid size-5 shrink-0 place-items-center">
                  <CalendarDays className="h-4 w-4" strokeWidth={1.8} />
                </span>
                <span className="min-w-0 truncate">Acara</span>
                <ChevronDown
                  className={`ml-auto h-3.5 w-3.5 transition-transform ${invitationMenuOpen ? "rotate-180" : ""}`}
                />
              </Button>

              {invitationMenuOpen && (
                <div className="mt-1 space-y-1 pl-3">
                  {invitationNav.map((item) => {
                    const Icon = item.icon;
                    const active = tab === item.id;
                    return (
                      <Button
                        key={item.id}
                        type="button"
                        aria-current={active ? "page" : undefined}
                        onClick={() => go(item.id)}
                        className={`h-auto w-full min-w-0 justify-start rounded-[9px] border border-transparent bg-transparent px-2.5 py-2 text-left text-[12px] shadow-none ${
                          active
                            ? "border-primary/15 bg-primary/[0.09] text-primary"
                            : "text-foreground/75 hover:bg-primary/[0.06] hover:text-primary"
                        }`}
                      >
                        <span className="grid size-4 shrink-0 place-items-center">
                          <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
                        </span>
                        <span className="min-w-0 truncate">{item.label}</span>
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>

            {secondaryNav.map((item) => {
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
                    <Icon className="h-4 w-4" strokeWidth={1.8} />
                  </span>
                  <span className="min-w-0 truncate">{item.label}</span>
                </Button>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl">
            <div className="mx-auto flex min-h-16 w-[80vw] max-w-full min-w-0 items-center gap-3 px-1">
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
                        text="Beli layanan"
                        onClick={() => router.push("/packages")}
                      />
                      <MenuItem
                        icon={CircleHelp}
                        text="Buka FAQ"
                        onClick={() => router.push("/faq")}
                      />
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
              <section className="bg-background">
                <div className="mx-auto flex w-[80vw] max-w-full min-w-0 items-center justify-between gap-6 px-1 py-5 sm:py-6">
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
                      {scopedHeaderEvent ? "Acara aktif" : "Workspace"}
                    </p>
                    <p className="mt-1 max-w-64 truncate text-xs text-foreground/70">
                      {scopedHeaderEvent?.title || `${events.length} acara`}
                    </p>
                  </div>
                </div>
              </section>
            )}

            {tab === "overview" && (
              <WorkspaceOverview ctx={ctx} events={events} onGo={go} />
            )}
            {tab === "events" && <EventPanelEditor onSaved={load} accent={accent} />}
            {tab === "invitation" && (
              <InvitationWorkspacePanel onCreateSequence={() => go("events")} />
            )}
            {tab === "waBlast" && <WhatsAppBlastPanel />}
            {tab === "personalInvitation" && (
              <FeatureGate
                allowed={hasAnyPaidInvitation}
                title="Personal Invitation"
                description="Aktifkan minimal satu Undangan Digital untuk menggunakan Personal Invitation."
                upgradeLabel="Beli Undangan Digital"
                onUpgrade={() => router.push("/packages?package=INVITATION_BASIC")}
              >
                <PersonalInvitationPanel />
              </FeatureGate>
            )}
            {tab === "rsvp" && (
              <RsvpWorkspace
                events={events}
                selectedId={rsvpEventId}
                onSelect={setRsvpEventId}
                selectedEvent={rsvpEvent}
                guests={rsvpGuests}
                loading={rsvpLoading}
                onRefresh={refreshRsvp}
                accent={accent}
              />
            )}
            {tab === "placement" && (
              <PlacementWorkspace
                events={events}
                selectedId={placementEventId}
                onSelect={setPlacementEventId}
                selectedEvent={placementEvent}
                guests={placementGuests}
                tables={placementTables}
                loading={placementLoading}
                accent={accent}
                onRefresh={refreshPlacement}
              />
            )}
            {tab === "usher" && (
              <FeatureGate
                allowed={canGuestbook}
                title="Usher App"
                description="Tersedia pada layanan Guest Book Digital."
                upgradeLabel="Lihat Guest Book Digital"
                onUpgrade={() => router.push("/packages?package=GUESTBOOK_DIGITAL")}
              >
                <UsherPanel guests={usherGuests} onRefresh={load} />
              </FeatureGate>
            )}
          </main>
        </div>
      </div>

      <Button asChild size="icon-lg" className="fixed bottom-5 right-5 z-50 rounded-full">
        <a
          href="https://wa.me/6282124786516?text=Halo%2C%20aku%20ingin%20tanya2%20mengenai%20DC%20Organizer."
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
          <div className="w-full max-w-lg rounded-xl border border-border bg-background p-6 shadow-2xl dark:bg-[#0B0B0C] sm:p-8">
            <p className="font-[family-name:var(--font-dm-mono)] text-[10px] font-medium uppercase tracking-[0.2em] text-primary">
              Setup awal
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-cinzel)] text-2xl">
              Profil workspace
            </h2>
            <div className="mt-6">
              <Field
                label="Nama panggilan"
                value={nickname}
                onChange={setNickname}
                placeholder="Contoh: Hendro"
              />
            </div>
            {onboardingError && (
              <p className="mt-4 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs text-red-700 dark:text-red-300">
                {onboardingError}
              </p>
            )}
            <Button disabled={saving} onClick={saveOnboarding} size="lg" className="mt-6 w-full">
              <CheckCircle2 className="h-4 w-4" />
              {saving ? "Menyimpan data..." : "Simpan & masuk"}
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
  icon: any;
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
  events,
  onGo,
}: {
  ctx: Context | null;
  events: DashboardEvent[];
  onGo: (id: Tab) => void;
}) {
  const overview = ctx?.overview;
  const published = events.filter((event) => event.isPublished).length;
  const active = events.filter((event) => event.accessPaid).length;

  return (
    <div className="mx-auto w-[80vw] max-w-full min-w-0 px-1 pb-16 pt-7 sm:pt-8">
      <section className="rounded-xl border border-border/80 bg-foreground/[0.018] p-4 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-5">
        <div className="min-w-0">
          <p className="font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
            Workspace
          </p>
          <h1 className="mt-1.5 font-[family-name:var(--font-cinzel)] text-2xl font-semibold sm:text-3xl">
            Halo, {ctx?.profile.displayName || "Akun"}
          </h1>
        </div>
        <div className="mt-4 min-w-0 sm:mt-0 sm:text-right">
          <p className="font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
            Event workspace
          </p>
          <p className="mt-1 text-sm font-medium">
            {events.length ? `${events.length} acara` : "Belum ada acara"}
          </p>
        </div>
      </section>

      <section className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Acara" value={String(events.length)} />
        <Stat label="Undangan aktif" value={String(active)} />
        <Stat label="RSVP" value={String(overview?.totalRsvp ?? 0)} />
        <Stat label="Tamu" value={String(overview?.totalGuests ?? 0)} />
      </section>

      <section className="mt-6 rounded-xl border border-border/80 bg-foreground/[0.018] p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-[family-name:var(--font-cinzel)] text-lg font-semibold">
              Acara
            </h2>
            <p className="mt-1 font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
              {active} aktif · {published} terbit
            </p>
          </div>
          <Button onClick={() => onGo("events")} size="sm">
            <CalendarDays className="h-4 w-4" />
            Kelola acara
          </Button>
        </div>

        {events.length ? (
          <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {events.map((event) => (
              <article
                key={event.id}
                className="rounded-xl border border-border/75 bg-background/75 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-[family-name:var(--font-dm-mono)] text-[8px] uppercase tracking-[0.12em] text-muted-foreground">
                      Acara
                    </p>
                    <p className="mt-1 truncate text-sm font-semibold text-foreground">
                      {event.title || "Acara tanpa judul"}
                    </p>
                    <p className="mt-1 truncate text-[11px] text-muted-foreground">
                      {event.venue || "Lokasi belum diisi"}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-lg bg-primary/[0.07] px-2 py-1 font-[family-name:var(--font-dm-mono)] text-[8px] uppercase tracking-[0.1em] text-primary">
                    {event.isPublished ? "Terbit" : event.accessPaid ? "Aktif" : "Belum aktif"}
                  </span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-border/70 bg-background/70 p-4 text-sm text-muted-foreground">
            Belum ada acara. Buat acara pertama untuk mulai menyiapkan undangan digital.
          </div>
        )}
      </section>

      <section className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <Button onClick={() => onGo("events")} size="sm">
          <CalendarDays className="h-4 w-4" />
          Tambah acara
        </Button>
        <Button onClick={() => onGo("invitation")} size="sm">
          <Mail className="h-4 w-4" />
          Undangan
        </Button>
        <Button onClick={() => onGo("rsvp")} size="sm">
          <MessageSquareHeart className="h-4 w-4" />
          RSVP
        </Button>
        <Button onClick={() => onGo("placement")} size="sm">
          <Users className="h-4 w-4" />
          Manajemen tamu
        </Button>
        <Button onClick={() => onGo("waBlast")} size="sm">
          <Send className="h-4 w-4" />
          WA Blast Add-on
        </Button>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-border/80 bg-foreground/[0.018] p-4">
      <p className="font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 truncate text-base font-semibold text-foreground">{value}</p>
    </div>
  );
}

function EventActivationNotice({ event }: { event: DashboardEvent }) {
  return (
    <div className="rounded-xl border border-border/80 bg-foreground/[0.018] p-5">
      <p className="font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
        Undangan belum aktif
      </p>
      <h3 className="mt-1 font-[family-name:var(--font-cinzel)] text-lg font-semibold">
        {event.title || "Acara ini"}
      </h3>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        RSVP dan Manajemen Tamu aktif bersama Undangan Digital untuk acara ini.
      </p>
      <Button asChild size="sm" className="mt-4">
        <Link
          href={`/packages?package=INVITATION_BASIC&invitationId=${encodeURIComponent(event.id)}`}
        >
          <CreditCard className="h-4 w-4" />
          Aktifkan Rp150.000
        </Link>
      </Button>
    </div>
  );
}

function RsvpWorkspace({
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
  guests: Guest[];
  loading: boolean;
  onRefresh: () => Promise<void>;
  accent: string;
}) {
  return (
    <div className="mx-auto w-[80vw] max-w-full min-w-0 px-1 pb-16 pt-7 sm:pt-8">
      <EventScopePicker
        events={events}
        value={selectedId}
        onChange={onSelect}
        disabled={loading}
      />
      {selectedEvent && (
        <div className="mt-4">
          {!selectedEvent.accessPaid ? (
            <EventActivationNotice event={selectedEvent} />
          ) : loading ? (
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
    </div>
  );
}

function PlacementWorkspace({
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
  guests: Guest[];
  tables: Table[];
  loading: boolean;
  accent: string;
  onRefresh: () => Promise<void>;
}) {
  return (
    <div className="mx-auto w-[80vw] max-w-full min-w-0 px-1 pb-16 pt-7 sm:pt-8">
      <EventScopePicker
        events={events}
        value={selectedId}
        onChange={onSelect}
        disabled={loading}
      />
      {selectedEvent && (
        <div className="mt-4">
          {!selectedEvent.accessPaid ? (
            <EventActivationNotice event={selectedEvent} />
          ) : loading ? (
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
    </div>
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
  guests: Guest[];
  tables: Table[];
  accent: string;
  onRefresh: () => Promise<void>;
}) {
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
      throw new Error(data?.error || "Penempatan tamu gagal disimpan.");
    }
    await onRefresh();
  };

  return (
    <Card>
      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-[family-name:var(--font-cinzel)] text-lg font-semibold">
            Tamu & seating
          </h2>
          <Button onClick={onRefresh} size="sm" title="Muat ulang data tamu dan meja">
            <RefreshCw className="h-4 w-4" />
            Muat ulang
          </Button>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <Stat label="Tamu" value={String(guests.length)} />
          <Stat label="Meja" value={String(tables.length)} />
          <Stat label="Ditempatkan" value={`${assigned} / ${guests.length}`} />
        </div>
        <SeatingChart
          key={invitationId}
          invitationId={invitationId}
          guests={guests}
          tables={tables}
          accent={accent}
          onAssigned={assignGuest}
        />
      </div>
    </Card>
  );
}

function LoadingSurface() {
  return (
    <div className="rounded-xl border border-border/80 bg-foreground/[0.018] p-5 font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
      Memuat data acara...
    </div>
  );
}

function UsherPanel({
  guests,
  onRefresh,
}: {
  guests: Guest[];
  onRefresh: () => void;
}) {
  const checked = guests.filter((guest) => guest.checkedIn).length;
  return (
    <div className="mx-auto w-[80vw] max-w-full min-w-0 px-1 pb-16 pt-7 sm:pt-8">
      <Card>
        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-[family-name:var(--font-cinzel)] text-lg font-semibold">
              Check-in
            </h2>
            <Button onClick={onRefresh} size="sm" title="Muat ulang status check-in">
              <RefreshCw className="h-4 w-4" />
              Muat ulang
            </Button>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <Stat label="Total tamu" value={String(guests.length)} />
            <Stat label="Check-in" value={String(checked)} />
          </div>
        </div>
      </Card>
    </div>
  );
}
