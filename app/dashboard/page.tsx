"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  LogOut,
  Menu,
  Receipt,
  Settings2,
  X,
} from "lucide-react";
import ThemeToggle from "@/components/Theme/ThemeToggle";
import LanguageToggle from "@/components/I18n/LanguageToggle";
import { useDashboardI18n } from "@/components/Dashboard/useDashboardI18n";
import FeatureGate from "@/components/Dashboard/FeatureGate";
import InvitationWorkspacePanel from "@/components/Dashboard/InvitationWorkspacePanel";
import EventPanelEditor from "@/components/Dashboard/EventPanel";
import WhatsAppBlastPanel from "@/components/Dashboard/WhatsAppBlastPanel";
import PersonalInvitationPanel from "@/components/Dashboard/PersonalInvitationPanel";
import { Button } from "@/components/ui/button";
import BrandWordmark from "@/components/Brand/BrandWordmark";
import {
  DashboardField,
  DashboardMenuItem,
} from "@/components/Dashboard/DashboardControls";
import {
  PlacementWorkspace,
  RsvpWorkspace,
  UsherPanel,
  WorkspaceOverview,
} from "@/components/Dashboard/DashboardWorkspaces";
import { dashboardTabMeta, invitationTabs } from "@/components/Dashboard/dashboard-navigation";
import DashboardSidebar from "@/components/Dashboard/DashboardSidebar";
import DashboardWhatsAppHelp from "@/components/Dashboard/DashboardWhatsAppHelp";
import {
  fetchEventGuestData,
  sortDashboardEvents,
} from "@/components/Dashboard/dashboard-client";
import type {
  DashboardContext,
  DashboardEvent,
  DashboardGuest,
  DashboardTable,
  DashboardTab,
} from "@/components/Dashboard/dashboard-types";

export default function DashboardPage() {
  const router = useRouter();
  const { d } = useDashboardI18n();
  const [tab, setTab] = useState<DashboardTab>("overview");
  const [invitationMenuOpen, setInvitationMenuOpen] = useState(true);
  const [ctx, setCtx] = useState<DashboardContext | null>(null);
  const [events, setEvents] = useState<DashboardEvent[]>([]);
  const [rsvpEventId, setRsvpEventId] = useState("");
  const [rsvpGuests, setRsvpGuests] = useState<DashboardGuest[]>([]);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [placementEventId, setPlacementEventId] = useState("");
  const [placementGuests, setPlacementGuests] = useState<DashboardGuest[]>([]);
  const [placementTables, setPlacementTables] = useState<DashboardTable[]>([]);
  const [placementLoading, setPlacementLoading] = useState(false);
  const [usherGuests, setUsherGuests] = useState<DashboardGuest[]>([]);
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
      const next = (await contextResponse.json()) as DashboardContext;
      setCtx(next);
      setNickname(next.profile.displayName || "");
      setOnboarding(!next.profile.displayName?.trim());
    }

    if (invitationResponse.ok) {
      const data = await invitationResponse.json();
      const configured = sortDashboardEvents(
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
        const dataForUsher = await fetchEventGuestData(firstGuestbookEvent.id, d("Data acara belum dapat dimuat.")).catch(
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
    fetchEventGuestData(rsvpEventId, d("Data acara belum dapat dimuat."))
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
    fetchEventGuestData(placementEventId, d("Data acara belum dapat dimuat."))
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
  const accent = "text-primary";

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
    const data = await fetchEventGuestData(rsvpEventId, d("Data acara belum dapat dimuat."));
    setRsvpGuests(data.guests);
  }

  async function refreshPlacement() {
    if (!placementEventId) return;
    const data = await fetchEventGuestData(placementEventId, d("Data acara belum dapat dimuat."));
    setPlacementGuests(data.guests);
    setPlacementTables(data.tables);
  }

  async function saveOnboarding() {
    const displayName = nickname.trim();
    if (!displayName) {
      setOnboardingError(d("Nama panggilan wajib diisi."));
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
        throw new Error(data?.error || d("Nama panggilan belum tersimpan."));
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
        error instanceof Error ? error.message : d("Data belum tersimpan. Coba lagi."),
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

  function go(id: DashboardTab) {
    setTab(id);
    if (invitationTabs.has(id)) setInvitationMenuOpen(true);
    setMobileOpen(false);
    setProfileMenu(false);
  }

  const meta = dashboardTabMeta[tab];
  const invitationActive = invitationTabs.has(tab);
  const scopedHeaderEvent =
    tab === "rsvp" ? rsvpEvent : tab === "placement" ? placementEvent : null;

  return (
    <div
      className="dc-dashboard dc-dashboard--redesign min-h-screen font-[family-name:var(--font-dc-sans)] text-foreground"
    >
      <div className="flex min-h-screen">
        <DashboardSidebar
          tab={tab}
          onNavigate={go}
          invitationMenuOpen={invitationMenuOpen}
          onToggleInvitationMenu={() => setInvitationMenuOpen((value) => !value)}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />

        <div className="min-w-0 flex-1">
          <header className="dc-dashboard-header sticky top-0 z-40 border-b border-border/70 bg-background/95 backdrop-blur-xl">
            <div className="flex min-h-16 w-full min-w-0 items-stretch">
              <div className="dc-dashboard-brand hidden w-64 shrink-0 items-center border-r border-border/70 px-5 lg:flex">
                <Link href="/" className="group block min-w-0">
                  <BrandWordmark
                    size="dashboard"
                    className="transition-transform group-hover:scale-[1.01]"
                  />
                </Link>
              </div>

              <div className="min-w-0 flex-1">
                <div className="dc-dashboard-header-inner mx-auto flex min-h-16 w-[80vw] max-w-[calc(100%-2rem)] min-w-0 items-center gap-3">
                  <Button
                    type="button"
                    size="icon"
                    className="h-11 w-11 border-primary/35 bg-transparent text-primary shadow-none hover:border-primary hover:bg-primary/5 hover:text-primary lg:hidden"
                    onClick={() => setMobileOpen((value) => !value)}
                    aria-label={mobileOpen ? d("Tutup menu dashboard") : d("Buka menu dashboard")}
                    aria-expanded={mobileOpen}
                    aria-controls="dc-dashboard-sidebar"
                    title={d("Buka menu dashboard")}
                  >
                    {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                  </Button>

                  <Link href="/" className="group min-w-0 shrink-0 lg:hidden">
                    <BrandWordmark size="mobile" />
                  </Link>

                  <div className="hidden h-8 w-px bg-border/70 sm:block lg:hidden" />

                  <div className="min-w-0">
                    <div className="flex min-w-0 items-center gap-2">
                      <p className="dc-dashboard-header-title truncate text-base font-semibold text-foreground sm:text-lg">
                        {d(meta.title)}
                      </p>
                      {scopedHeaderEvent && (
                        <span className="hidden max-w-56 truncate border-l border-border pl-2 text-[13px] text-muted-foreground xl:inline">
                          {scopedHeaderEvent.title}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="dc-dashboard-header-controls ml-auto hidden items-center gap-1 sm:flex">
                    <ThemeToggle />
                    <LanguageToggle />
                  </div>

                  <div className="dc-dashboard-account relative">
                    <Button
                      type="button"
                      onClick={() => setProfileMenu((value) => !value)}
                      className="dc-dashboard-account-button h-11 min-w-0 border-primary/35 bg-transparent px-2 text-primary shadow-none hover:border-primary hover:bg-primary/5 hover:text-primary dark:border-white/20 dark:text-white dark:hover:border-white/35 dark:hover:bg-white/[0.07] dark:hover:text-white"
                      aria-label={`${d("Menu akun")}: ${profileLabel}`}
                      title={d("Menu akun")}
                    >
                      <span className="dc-dashboard-account-avatar grid size-9 shrink-0 place-items-center rounded-full border border-current/25 bg-transparent font-[family-name:var(--font-dc-mono)] text-[12px] font-semibold uppercase text-current">
                        {profileLabel.slice(0, 2)}
                      </span>
                      <span className="hidden max-w-36 truncate text-sm font-medium sm:inline">{profileLabel}</span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-foreground/75 transition ${profileMenu ? "rotate-180" : ""}`}
                      />
                    </Button>

                    {profileMenu && (
                      <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-xl border border-border bg-background p-2.5 text-foreground shadow-[0_18px_45px_rgba(0,0,0,0.12)] dark:shadow-black/40">
                        <div className="px-2 pb-3 pt-1">
                          <p className="font-[family-name:var(--font-dc-heading)] text-base font-semibold">
                            {profileLabel}
                          </p>
                          <p className="mt-1 truncate text-xs text-muted-foreground">
                            {ctx?.profile.email || ""}
                          </p>
                        </div>
                        <div className="mb-2 flex items-center gap-2 px-2 sm:hidden">
                          <ThemeToggle />
                          <LanguageToggle />
                        </div>
                        <div className="space-y-1.5">
                          <DashboardMenuItem
                            icon={Receipt}
                            text={d("Lihat transaksi")}
                            onClick={() => router.push("/transactions")}
                          />
                          <DashboardMenuItem
                            icon={Settings2}
                            text={d("Beli layanan")}
                            onClick={() => router.push("/packages")}
                          />
                          <DashboardMenuItem
                            icon={CircleHelp}
                            text={d("Buka FAQ")}
                            onClick={() => router.push("/faq")}
                          />
                          <div className="my-2 border-t border-border" />
                          <DashboardMenuItem icon={LogOut} text={d("Keluar akun")} danger onClick={logout} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="min-w-0 overflow-x-clip">
            {tab === "overview" && (
              <WorkspaceOverview ctx={ctx} events={events} onGo={go} />
            )}
            {tab === "events" && <EventPanelEditor onSaved={load} accent={accent} />}
            {tab === "invitation" && (
              <InvitationWorkspacePanel onCreateSequence={() => go("events")} />
            )}
            {tab === "waBlast" && <WhatsAppBlastPanel />}
            {tab === "personalInvitation" && <PersonalInvitationPanel />}
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
                description={d("Tersedia pada layanan DashboardGuest Book Digital.")}
                upgradeLabel={d("Lihat DashboardGuest Book Digital")}
                onUpgrade={() => router.push("/packages?package=GUESTBOOK_DIGITAL")}
              >
                <UsherPanel guests={usherGuests} onRefresh={load} />
              </FeatureGate>
            )}
          </main>
        </div>
      </div>

      <DashboardWhatsAppHelp />

      {onboarding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-xl border border-border bg-background p-6 shadow-2xl dark:bg-[#0B0B0C] sm:p-8">
            <p className="font-[family-name:var(--font-dc-mono)] text-[11px] font-medium uppercase tracking-[0.2em] text-primary">
              {d("Setup awal")}
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-dc-heading)] text-2xl">
              {d("Profil akun")}
            </h2>
            <div className="mt-6">
              <DashboardField
                label={d("Nama panggilan")}
                value={nickname}
                onChange={setNickname}
                placeholder={d("Contoh: Hendro")}
              />
            </div>
            {onboardingError && (
              <p className="mt-4 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs text-red-700 dark:text-red-300">
                {onboardingError}
              </p>
            )}
            <Button disabled={saving} onClick={saveOnboarding} size="lg" className="mt-6 w-full">
              <CheckCircle2 className="h-4 w-4" />
              {saving ? d("Menyimpan data...") : d("Simpan & masuk")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
