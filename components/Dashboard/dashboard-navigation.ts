import {
  CalendarDays,
  ContactRound,
  Mail,
  MessageSquareHeart,
  QrCode,
  Send,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { DashboardTab } from "@/components/Dashboard/dashboard-types";

export type DashboardNavItem = {
  id: DashboardTab;
  label: string;
  icon: LucideIcon;
};

export const invitationTabs = new Set<DashboardTab>([
  "events",
  "invitation",
  "personalInvitation",
  "waBlast",
]);

export const invitationNav: DashboardNavItem[] = [
  { id: "events", label: "Rangkaian Acara", icon: CalendarDays },
  { id: "invitation", label: "Undangan", icon: Mail },
  { id: "personalInvitation", label: "Personal Invitation", icon: ContactRound },
  { id: "waBlast", label: "WA Blast", icon: Send },
];

export const secondaryNav: DashboardNavItem[] = [
  { id: "rsvp", label: "RSVP", icon: MessageSquareHeart },
  { id: "placement", label: "Manajemen Tamu", icon: Users },
  { id: "usher", label: "Usher App", icon: QrCode },
];

export const dashboardTabMeta: Record<
  DashboardTab,
  { eyebrow: string; title: string }
> = {
  overview: { eyebrow: "Dashboard", title: "Beranda" },
  profile: { eyebrow: "Akun", title: "Profil Saya" },
  events: { eyebrow: "Persiapan", title: "Rangkaian Acara" },
  invitation: { eyebrow: "Publikasi", title: "Undangan" },
  personalInvitation: { eyebrow: "Distribusi", title: "Personal Invitation" },
  waBlast: { eyebrow: "Distribusi", title: "WA Blast" },
  rsvp: { eyebrow: "Kehadiran", title: "RSVP" },
  placement: { eyebrow: "Tamu", title: "Manajemen Tamu" },
  usher: { eyebrow: "Hari-H", title: "Usher App" },
};
