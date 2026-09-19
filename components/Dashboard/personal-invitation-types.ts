import type { EventScopeOption } from "@/components/Dashboard/EventScopePicker";

export type PersonalInvitationGuest = {
  id: string;
  name: string;
  phone: string | null;
  personalToken?: string | null;
  weddingSessionAccess?: string | null;
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
  eventCategory: string;
  weddingCeremonyEnabled: boolean;
  weddingReceptionEnabled: boolean;
};
