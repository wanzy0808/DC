export type PersonalRsvpGuest = {
  id: string;
  name: string;
  token: string;
  invitedPax: number;
};

export type RsvpFormProps = {
  slug: string;
  guestId?: string;
  guestName?: string;
  guestToken?: string;
  invitedPax?: number;
  eventDate?: string | Date;
  venue?: string | null;
  title?: string | null;
  start?: string | null;
  end?: string | null;
  description?: string | null;
};

export type RsvpFormState = {
  name: string;
  phone: string;
  status: string;
  plusOnes: string;
};

export type RsvpTicketGuest = {
  rsvpStatus: "ATTENDING" | "NOT_ATTENDING" | "TENTATIVE";
  id: string;
  name: string;
  phone?: string | null;
  plusOnes: number;
};
