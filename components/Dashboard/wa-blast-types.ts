export type WaBlastEvent = {
  id: string;
  title: string;
  eventConfigured: boolean;
  accessPaid: boolean;
  slug?: string;
  venue?: string;
  eventDate?: string;
  isPublished?: boolean;
};

export type WaBlastGuest = {
  id: string;
  name: string;
  phone: string | null;
  category?: string | null;
  tags?: string[];
  invitedPax?: number;
};

export type WaBlastRecipient = WaBlastGuest & {
  waBlastSelected: boolean;
  waBlastSentAt: string | null;
};
