export const plannerPackages = [
  {
    key: "wedding-organizer",
    name: "Wedding Organizer",
    description:
      "Untuk pasangan yang sudah menyiapkan sebagian besar kebutuhan dan membutuhkan tim yang menjaga koordinasi menjelang serta saat hari-H.",
    features: [
      "Finalisasi rundown & technical meeting",
      "Koordinasi vendor, venue, keluarga & PIC",
      "Tim operasional pada hari acara",
      "Guest flow, cue acara & contingency handling",
    ],
    waMessage: "Halo, aku ingin tanya2 mengenai paket Wedding Organizer.",
  },
  {
    key: "wedding-planner",
    name: "Wedding Planner",
    description:
      "Pendampingan menyeluruh sejak konsep awal sampai hari acara untuk pasangan yang ingin proses persiapan lebih terarah.",
    features: [
      "Konsep, prioritas budget & master timeline",
      "Shortlist dan koordinasi vendor",
      "Meeting berkala & progress tracking",
      "Eksekusi hari-H bersama tim organizer",
    ],
    waMessage: "Halo, aku ingin tanya2 mengenai paket Wedding Planner.",
  },
  {
    key: "silver-golden-wedding",
    name: "Silver / Golden Wedding",
    description:
      "Perayaan anniversary 25 atau 50 tahun yang hangat, personal, dan dirancang untuk mempertemukan kembali keluarga serta cerita perjalanan bersama.",
    features: [
      "Konsep anniversary & family storytelling",
      "Renewal moment / ceremony flow",
      "Dekorasi, entertainment & vendor coordination",
      "Guest experience untuk keluarga lintas generasi",
    ],
    waMessage: "Halo, aku ingin tanya2 mengenai paket Silver / Golden Wedding.",
  },
  {
    key: "baby-shower",
    name: "Baby Shower",
    description:
      "Perayaan menyambut anggota keluarga baru dengan konsep yang ringan, hangat, dan mudah dinikmati oleh keluarga maupun sahabat.",
    features: [
      "Konsep tema & styling acara",
      "Rundown, games & activity planning",
      "Vendor, dekorasi & konsumsi coordination",
      "Guest flow, dokumentasi & event-day support",
    ],
    waMessage: "Halo, aku ingin tanya2 mengenai paket Baby Shower.",
  },
] as const;

export const plannerReviews = [
  {
    name: "Riko & Sarah",
    review:
      "Rundown-nya rapi sekali. Kami dan orang tua benar-benar bisa menikmati acara tanpa sibuk mengurus vendor.",
    date: "Oktober 2025",
  },
  {
    name: "Keluarga Wijaya",
    review:
      "Anniversary orang tua terasa personal dan semua anggota keluarga punya ruang untuk ikut bercerita tanpa acara terasa kaku.",
    date: "Desember 2025",
  },
  {
    name: "Nadine",
    review:
      "Baby shower-nya ringan, hangat, dan semua aktivitas mengalir. Saya tinggal menikmati waktu bersama keluarga dan teman-teman.",
    date: "Januari 2026",
  },
];

export const plannerFaq = [
  {
    question: "Apa bedanya Wedding Organizer dan Wedding Planner?",
    answer:
      "Wedding Organizer berfokus pada finalisasi dan eksekusi acara, sedangkan Wedding Planner mendampingi lebih awal mulai dari konsep, budget, vendor, timeline, sampai hari-H.",
  },
  {
    question: "Apakah Event Planner DC hanya untuk pernikahan?",
    answer:
      "Tidak. Selain Wedding Organizer dan Wedding Planner, DC juga menangani Silver / Golden Wedding dan Baby Shower. Scope acara lain dapat dibicarakan terlebih dahulu melalui konsultasi.",
  },
  {
    question: "Apakah melayani acara di luar kota?",
    answer:
      "Ya. Kebutuhan luar kota dapat dibahas saat konsultasi dan akan disesuaikan dengan venue, logistik, jumlah tim, serta scope pekerjaan.",
  },
  {
    question: "Apakah paket Event Planner menampilkan harga tetap?",
    answer:
      "Tidak. Setiap acara memiliki kebutuhan, venue, jumlah tamu, dan scope yang berbeda. Tim akan menyusun penawaran setelah konsultasi awal.",
  },
  {
    question: "Apakah layanan Event Planner bisa terhubung dengan Undangan Digital DC?",
    answer:
      "Bisa. Undangan Digital DC dapat digunakan untuk RSVP dan manajemen tamu, sementara kebutuhan WA Blast tersedia sebagai add-on terpisah.",
  },
];

export const plannerPortfolio = [
  {
    name: "Aria & Vania",
    category: "Wedding",
    location: "The Glass House, Bandung",
    concept: "Intimate Botanical Elegance",
    date: "12 November 2025",
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1000&auto=format&fit=crop",
    video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    name: "25th Anniversary — Keluarga Wijaya",
    category: "Silver Wedding",
    location: "Jakarta",
    concept: "A Celebration of 25 Years",
    date: "20 Januari 2026",
    image:
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1000&auto=format&fit=crop",
    video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    name: "Baby Shower Nadine",
    category: "Baby Shower",
    location: "Bandung",
    concept: "Soft Garden Afternoon",
    date: "14 Februari 2026",
    image:
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1000&auto=format&fit=crop",
    video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
];

export const plannerServices = [
  {
    title: "Concept & Budget",
    text: "Menyusun konsep, prioritas pengeluaran, timeline, dan ruang gerak budget agar keputusan terasa lebih terarah.",
  },
  {
    title: "Vendor Management",
    text: "Membantu shortlist vendor, komunikasi kebutuhan, timeline pembayaran, dan sinkronisasi antar vendor.",
  },
  {
    title: "Event Day Execution",
    text: "Mengawal rundown, keluarga, vendor, venue, dan perubahan situasi agar host dapat fokus menikmati acara.",
  },
  {
    title: "Guest Experience",
    text: "Menghubungkan alur RSVP, seating, greeting, dan kebutuhan onsite dengan produk digital DC bila diperlukan.",
  },
];
