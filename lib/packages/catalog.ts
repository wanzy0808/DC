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
        "Galeri, musik, peta & detail acara",
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
    name: { id: "Tambahan 50 Kuota WA Blast", en: "WA Blast 50 Add-on" },
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
        "Daftar penerima memakai data tamu acara",
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
    name: { id: "Buku Tamu Digital", en: "Digital Guestbook" },
    price: 2000000,
    description: {
      id: "Penerimaan tamu di hari acara, termasuk Undangan Digital untuk acara yang sama tanpa biaya tambahan.",
      en: "Event-day guest reception, including a Digital Invitation for the same event at no extra charge.",
    },
    features: {
      id: [
        "Undangan Digital termasuk tanpa biaya tambahan",
        "Undangan personal tanpa batas, dikirim manual",
        "Revisi desain tanpa batas sebelum publikasi",
        "Pembagian undangan untuk kelompok tamu melalui konsultasi",
        "RSVP dan kode QR tamu",
        "Sapaan undangan sesuai nama tamu",
        "Musik latar undangan",
        "Dasbor pengelolaan acara dan tamu",
        "Dukungan pelanggan 24 jam setiap hari",
        "Angpao digital dan daftar hadiah melalui konsultasi",
        "Berkas kode QR undangan untuk dicetak",
        "Cetak kode QR angpao sesuai kebutuhan acara",
        "2 unit tablet dan modem internet",
        "Kru dukungan teknis selama 4 jam",
        "Pemindaian QR melalui aplikasi penerima tamu",
        "Pengaturan meja dan tempat duduk",
      ],
      en: [
        "Digital Invitation included at no extra charge",
        "Unlimited personal invitations, sent manually",
        "Unlimited design revisions before publishing",
        "Split guest-group invitations arranged through consultation",
        "Guest RSVP and QR codes",
        "Guest-name personalization",
        "Invitation background music",
        "Event and guest management dashboard",
        "24/7 customer support",
        "E-gift and gift registry arranged through consultation",
        "Printable invitation QR code file",
        "Printed E-Angpao QR code for your event",
        "2 tablet devices and internet modem",
        "4 hours of technical crew support",
        "QR scanning through the Usher App",
        "Table and seat management",
      ],
    },
  },
];

export function getServicePackage(key: string) {
  return servicePackages.find((item) => item.key === key);
}
