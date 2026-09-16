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
    price: 150000,
    description: {
      id: "Satu undangan digital untuk satu acara, lengkap dengan satu template, RSVP, dan manajemen tamu.",
      en: "One digital invitation for one event, including one template, RSVP, and guest management.",
    },
    features: {
      id: [
        "1 acara + 1 undangan digital",
        "1 template undangan per acara",
        "Publikasi undangan digital",
        "RSVP & daftar kehadiran",
        "Manajemen tamu, meja & tempat duduk",
        "Galeri, musik, maps & detail acara",
      ],
      en: [
        "1 event + 1 digital invitation",
        "1 invitation template per event",
        "Digital invitation publishing",
        "RSVP & attendance list",
        "Guest, table & seating management",
        "Gallery, music, maps & event details",
      ],
    },
  },
  {
    key: "WA_BLAST_50",
    name: { id: "Add-on WA Blast 50", en: "WA Blast 50 Add-on" },
    price: 75000,
    description: {
      id: "Tambahan 50 kuota WA Blast untuk satu acara yang sudah memiliki Undangan Digital aktif.",
      en: "Adds 50 WA Blast credits to one event with an active Digital Invitation.",
    },
    features: {
      id: [
        "50 kuota WA Blast",
        "Terikat ke satu acara",
        "Dapat dibeli berulang sesuai kebutuhan",
        "Daftar penerima menggunakan database tamu acara",
      ],
      en: [
        "50 WA Blast credits",
        "Attached to one event",
        "Can be purchased repeatedly as needed",
        "Recipients use the event guest database",
      ],
    },
  },
  {
    key: "GUESTBOOK_DIGITAL",
    name: { id: "Guest Book Digital", en: "Digital Guest Book" },
    price: 2000000,
    description: {
      id: "Layanan operasional buku tamu dan check-in untuk kebutuhan hari acara.",
      en: "Guestbook and onsite check-in operations for your event day.",
    },
    features: {
      id: [
        "2 unit perangkat tablet",
        "Internet modem di venue",
        "Technical support crew 4 jam",
        "Usher App & QR check-in",
        "Printable QR ticket",
      ],
      en: [
        "2 tablet devices",
        "Internet modem at the venue",
        "4-hour technical support crew",
        "Usher App & QR check-in",
        "Printable QR ticket",
      ],
    },
  },
];

export function getServicePackage(key: string) {
  return servicePackages.find((item) => item.key === key);
}
