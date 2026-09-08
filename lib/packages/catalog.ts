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
    description: "Undangan online dengan template, galeri, musik, RSVP, dan link WhatsApp.",
    features: ["Pilih template", "Edit data pasangan", "RSVP dan table arrangement"],
  },
  {
    key: "GUESTBOOK_DIGITAL",
    name: "Guestbook Digital",
    price: 350000,
    description: "Paket undangan dengan check-in QR, e-gift, dan dashboard usher.",
    features: ["Semua fitur undangan", "QR check-in", "Akun usher hari-H"],
  },
  {
    key: "WO_DAY",
    name: "WO Hari-H",
    price: 2500000,
    description: "Workspace koordinasi vendor dan table arrangement untuk hari acara.",
    features: ["Timeline hari-H", "Vendor list", "Table arrangement"],
  },
  {
    key: "WO_FULL",
    name: "WO Full Service",
    price: 7500000,
    description: "Workspace lengkap untuk perencanaan acara dari awal sampai selesai.",
    features: ["Semua fitur WO", "Checklist persiapan", "Budget dan vendor management"],
  },
];

export function getServicePackage(key: string) {
  return servicePackages.find((item) => item.key === key);
}