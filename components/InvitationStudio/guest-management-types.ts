export type GuestManagementTable = {
  id: string;
  name: string;
  shape: string;
  capacity: number;
  _count?: { guests: number };
};

export type GuestManagementGuest = {
  id: string;
  name: string;
  phone: string | null;
  rsvpStatus: string;
  plusOnes: number;
  table: { name: string } | null;
};

export type GuestManagementResponse = {
  error?: string;
  tables?: GuestManagementTable[];
  guests?: GuestManagementGuest[];
  canManageGuests?: boolean;
};

export type GuestTableForm = {
  name: string;
  shape: string;
  capacity: string;
};

export type GuestForm = {
  name: string;
  phone: string;
  tableId: string;
  plusOnes: string;
};
