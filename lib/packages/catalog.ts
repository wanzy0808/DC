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
    price: 150000,
    description: "Buat dan personalisasi undangan online dengan template DC, RSVP, galeri, musik bawaan, dan link undangan.",
    features: ["Pilih & edit template", "Data pasangan & acara", "RSVP & plus one", "Publikasi & custom asset setelah paket aktif"],
  },
  {
    key: "GUESTBOOK_DIGITAL",
    name: "Guestbook Digital",
    price: 350000,
    description: "Sistem penerimaan tamu hari-H dengan daftar tamu, QR check-in, seating, realtime attendance, dan Usher App.",
    features: ["Daftar tamu & meja", "QR sebagai validasi masuk", "Usher App", "Realtime attendance & greeting"],
  },
  {
    key: "INVITATION_GUESTBOOK",
    name: "Undangan Digital + Guestbook",
    price: 500000,
    description: "Paket lengkap dari publikasi undangan sampai pengelolaan tamu dan check-in hari-H.",
    features: ["Semua fitur Undangan Digital", "Semua fitur Guestbook Digital", "Usher App + realtime attendance", "Workflow RSVP → seating → check-in"],
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
