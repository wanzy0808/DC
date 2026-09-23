import type { EventScopeOption } from "@/components/Dashboard/EventScopePicker";

export type PersonalInvitationGuest = {
  id: string;
  name: string;
  phone: string | null;
  category?: string | null;
  tags?: string[];
  recipientType?: "INDIVIDUAL" | "COUPLE" | "FAMILY" | "GROUP";
  invitedPax?: number;
  personalAddressee?: string | null;
  personalGreeting?: string | null;
  personalSharedAt?: string | null;
  rsvpStatus?: "PENDING" | "ATTENDING" | "DECLINED";
  plusOnes?: number;
  checkedIn?: boolean;
  table?: { id: string; name: string } | null;
  personalToken?: string | null;
  personalPublished?: boolean;
  personalPasswordProtected?: boolean;
  personalViewCount?: number;
};

export type PersonalInvitationItem = PersonalInvitationGuest & {
  personalToken: string;
  personalPublished: boolean;
  personalPasswordProtected: boolean;
  personalViewCount: number;
};

export type PersonalInvitationEvent = EventScopeOption & {
  slug: string;
  eventConfigured: boolean;
  accessPaid: boolean;
  createdAt: string;
};
