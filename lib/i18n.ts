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
      navigation: "Navigasi",
      explore: "Jelajahi DC Organizer",
      exploreDescription: "Pilih ruang kerja atau layanan yang ingin kamu buka.",
      login: "Masuk ke workspace",
      register: "Buat akun baru",
      services: "Layanan",
      planner: "Wedding Planner",
      plannerDescription: "Rencana & koordinasi acara",
      invitation: "Digital Invitation",
      invitationDescription: "Undangan, RSVP & publikasi",
      guestbook: "Guestbook Digital",
      guestbookDescription: "Tamu, QR & check-in",
      packages: "Paket & harga",
      templates: "Template",
      help: "Bantuan",
      join: "JOIN",
    },
    home: {
      doors: {
        planner: {
          eyebrow: "01 / Wedding Planner",
          title: "Rencanakan acara tanpa kehilangan kendali.",
          description: "Susun rundown, koordinasikan kebutuhan acara, dan kelola vendor dalam satu ruang kerja yang lebih terarah.",
          capabilities: ["Staff", "Event rundown", "Vendor"],
        },
        invitation: {
          eyebrow: "02 / Digital Invitation",
          title: "Undangan digital yang terasa seperti bagian dari acaranya.",
          description: "Bangun undangan, kelola RSVP, dan siapkan pengalaman tamu dengan data acara yang tetap terhubung.",
          capabilities: ["Undangan", "RSVP", "Guest management"],
        },
        guestbook: {
          eyebrow: "03 / Guestbook",
          title: "Tahu siapa yang datang, sejak tamu membuka pintu.",
          description: "Kelola kehadiran dengan QR check-in dan guestbook digital agar penerimaan tamu lebih cepat dan rapi.",
          capabilities: ["Buku tamu", "QR check-in", "Kehadiran"],
        },
      },
      openWorkspace: "Buka workspace",
    },
    footer: {
      description: "DC Organizer adalah platform digitalisasi pernikahan terpadu yang membuat persiapan acara lebih efisien, terarah, dan berkesan.",
      customerService: "Layanan Pelanggan",
      paymentMethods: "Metode Pembayaran",
      products: "Produk",
      digitalInvitation: "Undangan Digital",
      qrGuestbook: "Buku Tamu QR",
      weddingPlanner: "WO & Planning",
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
      navigation: "Navigation",
      explore: "Explore DC Organizer",
      exploreDescription: "Choose the workspace or service you want to open.",
      login: "Sign in to workspace",
      register: "Create an account",
      services: "Services",
      planner: "Wedding Planner",
      plannerDescription: "Plan & coordinate your event",
      invitation: "Digital Invitation",
      invitationDescription: "Invitation, RSVP & publishing",
      guestbook: "Digital Guestbook",
      guestbookDescription: "Guests, QR & check-in",
      packages: "Packages & pricing",
      templates: "Templates",
      help: "Help",
      join: "JOIN",
    },
    home: {
      doors: {
        planner: {
          eyebrow: "01 / Wedding Planner",
          title: "Plan your celebration without losing control.",
          description: "Build your rundown, coordinate event needs, and manage vendors from one focused workspace.",
          capabilities: ["Staff", "Event rundown", "Vendors"],
        },
        invitation: {
          eyebrow: "02 / Digital Invitation",
          title: "A digital invitation that feels like part of the celebration.",
          description: "Create your invitation, manage RSVPs, and prepare a connected guest experience from one place.",
          capabilities: ["Invitation", "RSVP", "Guest management"],
        },
        guestbook: {
          eyebrow: "03 / Guestbook",
          title: "Know who is arriving from the moment guests walk through the door.",
          description: "Streamline arrival with QR check-in and a digital guestbook for a faster, more organized reception.",
          capabilities: ["Guestbook", "QR check-in", "Attendance"],
        },
      },
      openWorkspace: "Open workspace",
    },
    footer: {
      description: "DC Organizer is an integrated wedding platform designed to make event preparation more efficient, organized, and memorable.",
      customerService: "Customer Service",
      paymentMethods: "Payment Methods",
      products: "Products",
      digitalInvitation: "Digital Invitation",
      qrGuestbook: "QR Guestbook",
      weddingPlanner: "Wedding Planning",
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
