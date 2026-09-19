import type { EventCategory } from "@/lib/events/catalog";

export type EventPanelInvitation = {
  id: string;
  type: "WEDDING" | "ADAT_AKAD";
  title: string;
  eventCategory: EventCategory;
  groomName: string;
  brideName: string;
  groomFatherName: string | null;
  groomMotherName: string | null;
  groomChildOrder: number | null;
  brideFatherName: string | null;
  brideMotherName: string | null;
  brideChildOrder: number | null;
  venue: string;
  address: string | null;
  mapUrl: string | null;
  timezone: string;
  eventDate: string;
  eventConfigured: boolean;
  ceremonyTime: string | null;
  receptionTime: string | null;
  weddingCeremonyEnabled: boolean;
  weddingReceptionEnabled: boolean;
  weddingCeremonyStart: string | null;
  weddingCeremonyEnd: string | null;
  weddingCeremonyVenue: string | null;
  weddingCeremonyAddress: string | null;
  weddingCeremonyMapUrl: string | null;
  weddingReceptionStart: string | null;
  weddingReceptionEnd: string | null;
  weddingReceptionVenue: string | null;
  weddingReceptionAddress: string | null;
  weddingReceptionMapUrl: string | null;

  description: string | null;
  eventNotes: string | null;
  templateKey: string;
  isPublished: boolean;
  accessPaid: boolean;
  createdAt: string;
};

export type EventPanelProps = {
  accent: string;
  onSaved: () => void;
};

export type EventEditorMode = "closed" | "new" | "edit";

export type EventForm = {
  eventCategory: EventCategory | "";
  customTitle: string;
  groomName: string;
  brideName: string;
  groomFatherName: string;
  groomMotherName: string;
  groomChildOrder: string;
  brideFatherName: string;
  brideMotherName: string;
  brideChildOrder: string;
  venue: string;
  address: string;
  mapUrl: string;
  timezone: string;
  eventDate: string;
  ceremonyTime: string;
  receptionTime: string;
  weddingCeremonyEnabled: boolean;
  weddingReceptionEnabled: boolean;
  weddingCeremonyStart: string;
  weddingCeremonyEnd: string;
  weddingCeremonyVenue: string;
  weddingCeremonyAddress: string;
  weddingCeremonyMapUrl: string;
  weddingReceptionStart: string;
  weddingReceptionEnd: string;
  weddingReceptionVenue: string;
  weddingReceptionAddress: string;
  weddingReceptionMapUrl: string;

  description: string;
  eventNotes: string;
};
