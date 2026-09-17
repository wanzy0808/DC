export const LOCALES = ["id", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_COOKIE = "dc_locale";

export function isLocale(value: string | undefined): value is Locale {
  return value === "id" || value === "en";
}

export const messages = {
  id: {
    common: {
      language: "Bahasa",
      indonesian: "Indonesia",
      english: "English",
    },
    nav: {
      menuLabel: "Buka menu navigasi",
      navigation: "Menu",
      explore: "Navigasi",
      exploreDescription: "Pilih halaman yang ingin dibuka.",
      home: "Beranda",
      login: "Masuk",
      register: "Daftar",
      services: "Layanan",
      planner: "Event Planner",
      plannerDescription: "Perencanaan dan koordinasi acara",
      invitation: "Digital Invitation",
      invitationDescription: "Undangan, RSVP, dan manajemen tamu",
      guestbook: "Guestbook Digital",
      guestbookDescription: "QR check-in dan kehadiran tamu",
      packages: "Paket",
      templates: "Template",
      help: "Bantuan",
      join: "Mulai",
    },
    home: {
      doors: {
        planner: {
          eyebrow: "Event Planner",
          title: "Rangkai acara pentingmu dengan lebih tenang.",
          description: "Satukan konsep, rundown, vendor, dan tim dalam alur acara yang lebih rapi.",
          capabilities: ["Tim", "Rundown", "Vendor"],
        },
        invitation: {
          eyebrow: "Undangan Digital",
          title: "Undangan personal, alur acara lebih rapi.",
          description: "Bagikan detail acara, terima RSVP, dan kelola tamu dalam satu alur.",
          capabilities: ["Undangan", "RSVP", "Tamu"],
        },
        guestbook: {
          eyebrow: "Buku Tamu Digital",
          title: "Sambut setiap tamu dengan lebih rapi.",
          description: "Gunakan QR check-in dan guestbook digital agar kehadiran tercatat dengan mudah.",
          capabilities: ["Guestbook", "QR check-in", "Kehadiran"],
        },
      },
      openWorkspace: "Lihat Detail",
    },
    footer: {
      description: "DC Organizer adalah platform event dan undangan digital untuk membuat publikasi, RSVP, manajemen tamu, serta operasional acara lebih terarah.",
      customerService: "Layanan Pelanggan",
      paymentMethods: "Metode Pembayaran",
      products: "Produk",
      digitalInvitation: "Undangan Digital",
      qrGuestbook: "Buku Tamu QR",
      weddingPlanner: "Event Planner",
      help: "Bantuan",
      faq: "FAQ",
      terms: "Syarat & Ketentuan",
      privacy: "Kebijakan Privasi",
      resources: "Resources",
      templates: "Katalog Template",
      articles: "Blog & Artikel",
      followUs: "Ikuti Kami",
      legal: "Pernyataan Hukum",
      rights: "All Rights Reserved.",
    },
  },
  en: {
    common: {
      language: "Language",
      indonesian: "Indonesia",
      english: "English",
    },
    nav: {
      menuLabel: "Open navigation menu",
      navigation: "Menu",
      explore: "Navigation",
      exploreDescription: "Choose a page to open.",
      home: "Home",
      login: "Sign in",
      register: "Register",
      services: "Services",
      planner: "Event Planner",
      plannerDescription: "Event planning and coordination",
      invitation: "Digital Invitation",
      invitationDescription: "Invitation, RSVP, and guest management",
      guestbook: "Digital Guestbook",
      guestbookDescription: "QR check-in and attendance",
      packages: "Packages",
      templates: "Templates",
      help: "Help",
      join: "Start",
    },
    home: {
      doors: {
        planner: {
          eyebrow: "Event Planner",
          title: "Plan the moments that matter with more ease.",
          description: "Keep concepts, rundowns, vendors, and crew in one clear event flow.",
          capabilities: ["Crew", "Rundown", "Vendors"],
        },
        invitation: {
          eyebrow: "Digital Invitation",
          title: "A personal invitation, with a cleaner event flow.",
          description: "Share event details, collect RSVPs, and manage guests in one place.",
          capabilities: ["Invitation", "RSVP", "Guests"],
        },
        guestbook: {
          eyebrow: "Digital Guestbook",
          title: "Welcome every guest with a smoother flow.",
          description: "Use QR check-in and a digital guestbook to keep attendance organized.",
          capabilities: ["Guestbook", "QR check-in", "Attendance"],
        },
      },
      openWorkspace: "View Details",
    },
    footer: {
      description: "DC Organizer is an event and digital-invitation platform for publishing invitations, collecting RSVPs, managing guests, and supporting event operations.",
      customerService: "Customer Service",
      paymentMethods: "Payment Methods",
      products: "Products",
      digitalInvitation: "Digital Invitation",
      qrGuestbook: "QR Guestbook",
      weddingPlanner: "Event Planner",
      help: "Help",
      faq: "FAQ",
      terms: "Terms & Conditions",
      privacy: "Privacy Policy",
      resources: "Resources",
      templates: "Template Catalog",
      articles: "Blog & Articles",
      followUs: "Follow Us",
      legal: "Legal Statement",
      rights: "All Rights Reserved.",
    },
  },
} as const;

export function getMessages(locale: Locale) {
  return messages[locale];
}
