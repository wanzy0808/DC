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
      exploreDescription: "Pilih layanan untuk merancang, mengundang, dan mengelola tamu di acara yang penting bagimu.",
      login: "Masuk ke workspace",
      register: "Mulai perjalananmu",
      services: "Layanan",
      planner: "Event Planner",
      plannerDescription: "Rencanakan dan koordinasikan acara dengan tenang",
      invitation: "Digital Invitation",
      invitationDescription: "Undangan per acara dengan RSVP & guest management",
      guestbook: "Guestbook Digital",
      guestbookDescription: "Sambut dan check-in tamu dengan rapi",
      packages: "Paket & harga",
      templates: "Template",
      help: "Bantuan",
      join: "MULAI",
    },
    home: {
      doors: {
        planner: {
          eyebrow: "Event Planner",
          title: "Rangkai acara pentingmu dengan tenang dan alur yang jelas.",
          description: "Dari konsep dan rundown hingga vendor dan tim, satukan detail acara agar kamu bisa lebih banyak menikmati momennya.",
          capabilities: ["Tim terkoordinasi", "Rundown acara", "Vendor"],
        },
        invitation: {
          eyebrow: "Undangan Digital",
          title: "Biarkan undangan menjadi awal dari pengalaman acara yang rapi.",
          description: "Buat undangan digital yang terasa personal, bagikan detail acara, terima RSVP, dan kelola tamu dalam satu alur.",
          capabilities: ["Undangan personal", "RSVP", "Guest management"],
        },
        guestbook: {
          eyebrow: "Buku Tamu Digital",
          title: "Karena setiap nama yang hadir adalah bagian dari acara.",
          description: "Sambut tamu melalui QR check-in dan guestbook digital yang membuat setiap kehadiran tercatat dengan rapi.",
          capabilities: ["Buku tamu", "QR check-in", "Kehadiran"],
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
      navigation: "Navigation",
      explore: "Explore DC Organizer",
      exploreDescription: "Choose a service to plan, invite, and manage guests for the events that matter to you.",
      login: "Sign in to workspace",
      register: "Begin your journey",
      services: "Services",
      planner: "Event Planner",
      plannerDescription: "Plan and coordinate your event with ease",
      invitation: "Digital Invitation",
      invitationDescription: "Per-event invitation with RSVP & guest management",
      guestbook: "Digital Guestbook",
      guestbookDescription: "Welcome and check in guests smoothly",
      packages: "Packages & pricing",
      templates: "Templates",
      help: "Help",
      join: "BEGIN",
    },
    home: {
      doors: {
        planner: {
          eyebrow: "Event Planner",
          title: "Shape the events that matter with clarity and ease.",
          description: "From concept and rundown to vendors and crew, keep event details coordinated so you can spend more time in the moment.",
          capabilities: ["Coordinated team", "Event rundown", "Vendors"],
        },
        invitation: {
          eyebrow: "Digital Invitation",
          title: "Let your invitation be the first step toward an organized event experience.",
          description: "Create a personal digital invitation, share event details, receive RSVPs, and manage guests in one flow.",
          capabilities: ["Personal invitation", "RSVP", "Guest management"],
        },
        guestbook: {
          eyebrow: "Digital Guestbook",
          title: "Because every guest who arrives becomes part of the event.",
          description: "Welcome guests through QR check-in and a digital guestbook that keeps attendance organized.",
          capabilities: ["Guestbook", "QR check-in", "Attendance"],
        },
      },
      openWorkspace: "View details",
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
