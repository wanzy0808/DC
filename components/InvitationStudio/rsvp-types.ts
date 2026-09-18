export type RsvpFormProps = {
  slug: string;
  guestId?: string;
  guestName?: string;
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
  id: string;
  name: string;
  phone?: string | null;
  plusOnes: number;
};
