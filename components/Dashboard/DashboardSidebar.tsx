"use client";

import Link from "next/link";
import BrandWordmark from "@/components/Brand/BrandWordmark";
import { CalendarDays, ChevronDown, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDashboardI18n } from "@/components/Dashboard/useDashboardI18n";
import { invitationNav, secondaryNav } from "@/components/Dashboard/dashboard-navigation";
import type { DashboardTab } from "@/components/Dashboard/dashboard-types";

type DashboardSidebarProps = {
  tab: DashboardTab;
  onNavigate: (tab: DashboardTab) => void;
  invitationMenuOpen: boolean;
  onToggleInvitationMenu: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
};

export default function DashboardSidebar({
  tab,
  onNavigate,
  invitationMenuOpen,
  onToggleInvitationMenu,
  mobileOpen,
  onCloseMobile,
}: DashboardSidebarProps) {
  const { d } = useDashboardI18n();

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          className="absolute inset-0 z-40 bg-black/45 lg:hidden"
          aria-label={d("Tutup menu dashboard")}
          onClick={onCloseMobile}
        />
      )}
      <aside
        id="dc-dashboard-sidebar"
        className={`dc-dashboard-sidebar ${mobileOpen ? "absolute inset-y-0 left-0 z-50 flex" : "hidden"} w-64 shrink-0 flex-col border-r border-border lg:flex lg:min-h-0`}
      >
        <div className="dc-dashboard-sidebar-brand flex min-h-[72px] shrink-0 items-center border-b border-white/20 px-5">
          <Link href="/" aria-label="DC Organizer" className="inline-flex min-w-0 items-center">
            <BrandWordmark size="dashboard" />
          </Link>
        </div>
        <nav aria-label={d("Navigasi dashboard")} className="dc-dashboard-sidebar-nav flex flex-1 flex-col gap-3">
          <Button
            type="button"
            aria-current={tab === "overview" ? "page" : undefined}
            onClick={() => onNavigate("overview")}
            className={`dc-sidebar-link ${tab === "overview" ? "is-active" : ""}`}
          >
            <Home className="size-5 shrink-0" strokeWidth={1.9} />
            <span className="min-w-0 truncate">{d("Beranda")}</span>
          </Button>

          <div className="dc-sidebar-group mt-3 flex flex-col gap-3">
            <Button
              type="button"
              aria-expanded={invitationMenuOpen}
              aria-controls="dc-dashboard-event-nav"
              onClick={onToggleInvitationMenu}
              className="dc-sidebar-link dc-sidebar-group-trigger"
            >
              <CalendarDays className="size-5 shrink-0" strokeWidth={1.9} />
              <span className="min-w-0 flex-1 truncate">{d("Acara")}</span>
              <ChevronDown className={`size-4 shrink-0 transition-transform ${invitationMenuOpen ? "rotate-180" : ""}`} />
            </Button>
            {invitationMenuOpen && (
              <div id="dc-dashboard-event-nav" className="dc-sidebar-subnav flex flex-col gap-3">
                {invitationNav.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.id}
                      type="button"
                      aria-current={tab === item.id ? "page" : undefined}
                      onClick={() => onNavigate(item.id)}
                      className={`dc-sidebar-link dc-sidebar-sublink ${tab === item.id ? "is-active" : ""}`}
                    >
                      <Icon className="size-[18px] shrink-0" strokeWidth={1.9} />
                      <span className="min-w-0 truncate">{d(item.label)}</span>
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
                onClick={() => onNavigate(item.id)}
                className={`dc-sidebar-link ${tab === item.id ? "is-active" : ""}`}
              >
                <Icon className="size-5 shrink-0" strokeWidth={1.9} />
                <span className="min-w-0 truncate">{d(item.label)}</span>
              </Button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
