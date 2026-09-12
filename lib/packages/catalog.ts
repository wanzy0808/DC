export type ServicePackage = {
  key: string;
  name: string;
  price: number;
  description: string;
  features: string[];
};

export const servicePackages: ServicePackage[] = [
  {
    key: "INVITATION_BASIC",
    name: "Undangan Digital",
    price: 300000,
    description: "Undangan digital lengkap untuk membuat, mempublikasikan, dan menyebarkan undangan pernikahan.",
    features: [
      "Pilih & edit seluruh template",
      "Publikasi undangan digital",
      "RSVP & wishes",
      "Galeri foto hingga 30 foto",
      "Custom music, maps, countdown & Google Calendar",
      "Manajemen tamu, meja & tempat duduk",
    ],
  },
  {
    key: "GUESTBOOK_DIGITAL",
    name: "Guest Book Digital",
    price: 2000000,
    description: "Layanan operasional buku tamu hari-H yang otomatis mencakup seluruh fitur Undangan Digital.",
    features: [
      "Semua fitur Undangan Digital",
      "2 unit perangkat tablet",
      "Internet modem di venue",
      "Technical support crew 4 jam",
      "Usher App & QR check-in",
      "Printable QR ticket & e-angpao QR",
    ],
  },
  {
    key: "WO_DAY",
    name: "WO Hari-H",
    price: 2500000,
    description: "Koordinasi vendor, rundown, keluarga, dan eksekusi acara agar pasangan dapat fokus menikmati hari-H.",
    features: ["Timeline & rundown hari-H", "Vendor coordination", "Koordinasi keluarga & venue", "Table arrangement support"],
  },
  {
    key: "WO_FULL",
    name: "WO Full Service",
    price: 7500000,
    description: "Pendampingan perencanaan dari konsep, budget, vendor, timeline persiapan, hingga eksekusi hari-H.",
    features: ["Semua fitur WO Hari-H", "Concept & budget planning", "Vendor selection & management", "Checklist & timeline persiapan"],
  },
];

export function getServicePackage(key: string) {
  return servicePackages.find((item) => item.key === key);
}
