export type Locale = "id" | "en";
export type LocalizedText = Record<Locale, string>;

export type ServicePackage = {
  key: string;
  name: LocalizedText;
  price: number;
  description: LocalizedText;
  features: Record<Locale, string[]>;
};

export const servicePackages: ServicePackage[] = [
  {
    key: "INVITATION_BASIC",
    name: { id: "Undangan Digital", en: "Digital Invitation" },
    price: 300000,
    description: {
      id: "Undangan digital lengkap untuk membuat, mempublikasikan, dan menyebarkan undangan pernikahan.",
      en: "A complete digital invitation service to create, publish, and share your wedding invitation.",
    },
    features: {
      id: ["Pilih & edit seluruh template", "Publikasi undangan digital", "RSVP & wishes", "Galeri foto hingga 30 foto", "Custom music, maps, countdown & Google Calendar", "Manajemen tamu, meja & tempat duduk"],
      en: ["Choose & edit any template", "Publish your digital invitation", "RSVP & wishes", "Photo gallery up to 30 photos", "Custom music, maps, countdown & Google Calendar", "Guest, table & seating management"],
    },
  },
  {
    key: "GUESTBOOK_DIGITAL",
    name: { id: "Guest Book Digital", en: "Digital Guest Book" },
    price: 2000000,
    description: {
      id: "Layanan operasional buku tamu hari-H yang otomatis mencakup seluruh fitur Undangan Digital.",
      en: "A wedding-day guest book service that includes everything in the Digital Invitation package.",
    },
    features: {
      id: ["Semua fitur Undangan Digital", "2 unit perangkat tablet", "Internet modem di venue", "Technical support crew 4 jam", "Usher App & QR check-in", "Printable QR ticket & e-angpao QR"],
      en: ["Everything in Digital Invitation", "2 tablet devices", "Internet modem at the venue", "4-hour technical support crew", "Usher App & QR check-in", "Printable QR ticket & e-angpao QR"],
    },
  },
  {
    key: "WO_DAY",
    name: { id: "WO Hari-H", en: "Wedding-Day Coordination" },
    price: 2500000,
    description: {
      id: "Koordinasi vendor, rundown, keluarga, dan eksekusi acara agar pasangan dapat fokus menikmati hari-H.",
      en: "Coordinate vendors, the rundown, family, and event execution so you can stay present and enjoy your wedding day.",
    },
    features: {
      id: ["Timeline & rundown hari-H", "Vendor coordination", "Koordinasi keluarga & venue", "Table arrangement support"],
      en: ["Wedding-day timeline & rundown", "Vendor coordination", "Family & venue coordination", "Table arrangement support"],
    },
  },
  {
    key: "WO_FULL",
    name: { id: "WO Full Service", en: "Full-Service Wedding Planning" },
    price: 7500000,
    description: {
      id: "Pendampingan perencanaan dari konsep, budget, vendor, timeline persiapan, hingga eksekusi hari-H.",
      en: "End-to-end support from concept and budget planning to vendor management, preparation, and wedding-day execution.",
    },
    features: {
      id: ["Semua fitur WO Hari-H", "Concept & budget planning", "Vendor selection & management", "Checklist & timeline persiapan"],
      en: ["Everything in Wedding-Day Coordination", "Concept & budget planning", "Vendor selection & management", "Preparation checklist & timeline"],
    },
  },
];

export function getServicePackage(key: string) {
  return servicePackages.find((item) => item.key === key);
}
