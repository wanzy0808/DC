export type WaBlastEvent = {
  id: string;
  title: string;
  eventConfigured: boolean;
  accessPaid: boolean;
};

export type WaBlastGuest = {
  id: string;
  name: string;
  phone: string | null;
};

export type WaBlastRecipient = WaBlastGuest & {
  waBlastSelected: boolean;
  waBlastSentAt: string | null;
};
