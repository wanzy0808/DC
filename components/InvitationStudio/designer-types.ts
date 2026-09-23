import type { EventCategory } from "@/lib/events/catalog";
import type { FontKey, PaletteKey } from "@/lib/templates/design";
import type { InvitationSections } from "@/lib/templates/sections";
import type { PhotoAssignments } from "@/lib/templates/photo-slots";

export type InvitationDesignerInvitation = {
  id: string;
  slug: string;
  type: "WEDDING" | "ADAT_AKAD";
  title: string;
  eventCategory: EventCategory | string;
  groomName: string;
  brideName: string;
  groomFatherName?: string | null;
  groomMotherName?: string | null;
  groomChildOrder?: number | null;
  groomChildPosition?: "ELDEST" | "YOUNGEST" | "NUMBER" | null;
  brideFatherName?: string | null;
  brideMotherName?: string | null;
  brideChildOrder?: number | null;
  brideChildPosition?: "ELDEST" | "YOUNGEST" | "NUMBER" | null;
  venue: string;
  address?: string | null;
  mapUrl?: string | null;
  timezone: string;
  eventDate: string;
  ceremonyTime: string | null;
  receptionTime: string | null;
  description: string | null;
  weddingHashtag: string | null;
  dressCode: string | null;
  eventNotes: string | null;
  musicUrl: string | null;
  templateKey: string;
  isPublished: boolean;
  accessPaid?: boolean;
  giftBankName?: string | null;
  giftAccountName?: string | null;
  giftAccountNumber?: string | null;
  assets: {
    id: string;
    type: "IMAGE" | "AUDIO";
    url: string;
    title: string | null;
  }[];
};

export type InvitationDesignerPanel =
  | "template"
  | "sections"
  | "color"
  | "font"
  | "content"
  | "decor"
  | "music";

export type InvitationDesignState = {
  template: string;
  palette: PaletteKey;
  font: FontKey;
  decor: string;
  sections: InvitationSections;
  photos: PhotoAssignments;
};

export type InvitationTemplateLayout =
  | "botanical"
  | "editorial"
  | "maroon"
  | "garden"
  | "midnight"
  | "classic";

export type InvitationTemplatePreset = {
  layout: InvitationTemplateLayout;
  palette: PaletteKey;
  font: FontKey;
};
