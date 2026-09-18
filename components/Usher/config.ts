import {
  Gift,
  HeartHandshake,
  QrCode,
  ScanLine,
  Sparkles,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import type { UsherTab } from "@/components/Usher/types";

export type UsherTabItem = {
  id: UsherTab;
  label: string;
  icon: LucideIcon;
};

export const usherTabs: UsherTabItem[] = [
  { id: "checkin", label: "Check-in", icon: ScanLine },
  { id: "guests", label: "Daftar Tamu Diundang", icon: UsersRound },
  { id: "attendance", label: "Realtime Attendance", icon: Users },
  { id: "rsvp", label: "Smart RSVP", icon: HeartHandshake },
  { id: "greeting", label: "Guest Greeting", icon: Sparkles },
  { id: "gift", label: "Gift Corner", icon: Gift },
  { id: "giving", label: "Giving Management", icon: QrCode },
];
