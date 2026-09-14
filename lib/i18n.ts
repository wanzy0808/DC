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
      exploreDescription: "Pilih ruang untuk merangkai hari yang ingin selalu dikenang.",
      login: "Masuk ke workspace",
      register: "Mulai perjalananmu",
      services: "Layanan",
      planner: "Wedding Planner",
      plannerDescription: "Rencanakan setiap detail dengan tenang",
      invitation: "Digital Invitation",
      invitationDescription: "Undangan yang membuka cerita",
      guestbook: "Guestbook Digital",
      guestbookDescription: "Sambut setiap tamu dengan hangat",
      packages: "Paket & harga",
      templates: "Template",
      help: "Bantuan",
      join: "MULAI",
    },
    home: {
      doors: {
        planner: {
          eyebrow: "01 / Wedding Planner",
          title: "Rangkai hari istimewamu, dengan tenang dan penuh cerita.",
          description: "Dari rundown pertama hingga detail terakhir, satukan rencana, vendor, dan tim agar kamu bisa lebih banyak menikmati perjalanan menuju hari besar.",
          capabilities: ["Tim terkoordinasi", "Rundown acara", "Vendor"],
        },
        invitation: {
          eyebrow: "02 / Digital Invitation",
          title: "Biarkan undangan menjadi awal dari kisah yang ingin dikenang.",
          description: "Ciptakan undangan digital yang terasa personal, bagikan kabar bahagia, dan sambut RSVP dari orang-orang yang ingin hadir di momen terpentingmu.",
          capabilities: ["Undangan personal", "RSVP", "Guest management"],
        },
        guestbook: {
          eyebrow: "03 / Guestbook",
          title: "Karena setiap nama yang hadir adalah bagian dari cerita.",
          description: "Sambut tamu dengan lebih hangat melalui QR check-in dan guestbook digital yang membuat setiap kehadiran tercatat dengan rapi.",
          capabilities: ["Buku tamu", "QR check-in", "Kehadiran"],
        },
      },
      openWorkspace: "Lihat Detail",
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
      exploreDescription: "Choose the space where your celebration begins to take shape.",
      login: "Sign in to workspace",
      register: "Begin your journey",
      services: "Services",
      planner: "Wedding Planner",
      plannerDescription: "Plan every detail with ease",
      invitation: "Digital Invitation",
      invitationDescription: "An invitation that opens the story",
      guestbook: "Digital Guestbook",
      guestbookDescription: "Welcome every guest warmly",
      packages: "Packages & pricing",
      templates: "Templates",
      help: "Help",
      join: "BEGIN",
    },
    home: {
      doors: {
        planner: {
          eyebrow: "01 / Wedding Planner",
          title: "Shape your special day with intention, ease, and heart.",
          description: "From the first rundown to the final detail, bring your plans, vendors, and team into one calm workspace—so you can spend more time enjoying the journey.",
          capabilities: ["Coordinated team", "Event rundown", "Vendors"],
        },
        invitation: {
          eyebrow: "02 / Digital Invitation",
          title: "Let your invitation be the first chapter of a story worth remembering.",
          description: "Create a digital invitation that feels personal, share the joy, and welcome RSVPs from the people who matter most on your special day.",
          capabilities: ["Personal invitation", "RSVP", "Guest management"],
        },
        guestbook: {
          eyebrow: "03 / Guestbook",
          title: "Because every name who arrives becomes part of the story.",
          description: "Welcome your guests with ease through QR check-in and a digital guestbook that keeps every meaningful arrival beautifully organized.",
          capabilities: ["Guestbook", "QR check-in", "Attendance"],
        },
      },
      openWorkspace: "Begin your story",
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
