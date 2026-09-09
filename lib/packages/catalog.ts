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
    features: ["Pilih template", "Edit data pasangan", "RSVP dan QR tamu"],
  },
  {
    key: "GUESTBOOK_DIGITAL",
    name: "Guestbook Digital",
    price: 350000,
    description: "Paket buku tamu digital dengan check-in QR, e-gift, dan dashboard usher.",
    features: ["Daftar tamu & meja", "QR check-in", "Usher App hari-H"],
  },
  {
    key: "INVITATION_GUESTBOOK",
    name: "Undangan Digital + Guestbook",
    price: 500000,
    description: "Paket lengkap untuk publikasi undangan digital sekaligus pengelolaan buku tamu hari-H.",
    features: ["Semua fitur Undangan Digital", "Semua fitur Guestbook", "Usher App + realtime attendance"],
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
