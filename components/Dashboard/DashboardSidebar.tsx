"use client";

import { Fragment } from "react";
import Link from "next/link";
import BrandWordmark from "@/components/Brand/BrandWordmark";
import { CalendarDays, ChevronDown, Home, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDashboardI18n } from "@/components/Dashboard/useDashboardI18n";
import { guestManagementNav, invitationNav, secondaryNav } from "@/components/Dashboard/dashboard-navigation";
import type { DashboardTab } from "@/components/Dashboard/dashboard-types";

type DashboardSidebarProps = {
  tab: DashboardTab;
  onNavigate: (tab: DashboardTab) => void;
  invitationMenuOpen: boolean;
  onToggleInvitationMenu: () => void;
  guestMenuOpen: boolean;
  onToggleGuestMenu: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
};

export default function DashboardSidebar({
  tab,
  onNavigate,
  invitationMenuOpen,
  onToggleInvitationMenu,
  guestMenuOpen,
  onToggleGuestMenu,
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
        id="undara-dashboard-sidebar"
        className={`undara-dashboard-sidebar ${mobileOpen ? "absolute inset-y-0 left-0 z-50 flex" : "hidden"} w-64 shrink-0 flex-col border-r border-border lg:flex lg:min-h-0`}
      >
        <div className="undara-dashboard-sidebar-brand flex min-h-[72px] shrink-0 items-center border-b border-white/20 px-5">
          <Link href="/" aria-label="Undara" className="inline-flex min-w-0 items-center">
            <BrandWordmark size="dashboard" />
          </Link>
        </div>
        <nav aria-label={d("Navigasi dashboard")} className="undara-dashboard-sidebar-nav flex flex-1 flex-col gap-3">
          <Button
            type="button"
            aria-current={tab === "overview" ? "page" : undefined}
            onClick={() => onNavigate("overview")}
            className={`undara-sidebar-link ${tab === "overview" ? "is-active" : ""}`}
          >
            <Home className="size-5 shrink-0" strokeWidth={1.9} />
            <span className="min-w-0 truncate">{d("Beranda")}</span>
          </Button>

          <div className="undara-sidebar-group mt-3 flex flex-col gap-3">
            <Button
              type="button"
              aria-expanded={invitationMenuOpen}
              aria-controls="undara-dashboard-event-nav"
              onClick={onToggleInvitationMenu}
              className="undara-sidebar-link undara-sidebar-group-trigger"
            >
              <CalendarDays className="size-5 shrink-0" strokeWidth={1.9} />
              <span className="min-w-0 flex-1 truncate">{d("Acara")}</span>
              <ChevronDown className={`size-4 shrink-0 transition-transform ${invitationMenuOpen ? "rotate-180" : ""}`} />
            </Button>
            {invitationMenuOpen && (
              <div id="undara-dashboard-event-nav" className="undara-sidebar-subnav flex flex-col gap-3">
                {invitationNav.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.id}
                      type="button"
                      aria-current={tab === item.id ? "page" : undefined}
                      onClick={() => onNavigate(item.id)}
                      className={`undara-sidebar-link undara-sidebar-sublink ${tab === item.id ? "is-active" : ""}`}
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
              <Fragment key={item.id}>
                {item.id === "usher" && (
                  <div className="undara-sidebar-group flex flex-col gap-3">
                    <Button
                      type="button"
                      aria-expanded={guestMenuOpen}
                      aria-controls="undara-dashboard-guest-nav"
                      onClick={onToggleGuestMenu}
                      className={`undara-sidebar-link undara-sidebar-group-trigger ${tab === "personalInvitation" || tab === "placement" ? "is-active" : ""}`}
                    >
                      <Users className="size-5 shrink-0" strokeWidth={1.9} />
                      <span className="min-w-0 flex-1 truncate">{d("Manajemen Tamu")}</span>
                      <ChevronDown className={`size-4 shrink-0 transition-transform ${guestMenuOpen ? "rotate-180" : ""}`} />
                    </Button>
                    {guestMenuOpen && (
                      <div id="undara-dashboard-guest-nav" className="undara-sidebar-subnav flex flex-col gap-3">
                        {guestManagementNav.map((guestItem) => {
                          const GuestIcon = guestItem.icon;
                          return (
                            <Button
                              key={guestItem.id}
                              type="button"
                              aria-current={tab === guestItem.id ? "page" : undefined}
                              onClick={() => onNavigate(guestItem.id)}
                              className={`undara-sidebar-link undara-sidebar-sublink ${tab === guestItem.id ? "is-active" : ""}`}
                            >
                              <GuestIcon className="size-[18px] shrink-0" strokeWidth={1.9} />
                              <span className="min-w-0 truncate">{d(guestItem.label)}</span>
                            </Button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
                <Button
                  type="button"
                  aria-current={tab === item.id ? "page" : undefined}
                  onClick={() => onNavigate(item.id)}
                  className={`undara-sidebar-link ${tab === item.id ? "is-active" : ""}`}
                >
                  <Icon className="size-5 shrink-0" strokeWidth={1.9} />
                  <span className="min-w-0 truncate">{d(item.label)}</span>
                </Button>
              </Fragment>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
