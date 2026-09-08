"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/components/Theme/ThemeContext";
import { Button } from "@/components/ui/button";
import { 
  Star, 
  ChevronDown, 
  Play, 
  User, 
  LogOut, 
  Sparkles 
} from "lucide-react";

// --- DATA KONTEN ---

// 1. Data Biography Owner (Christine)
const ownerBio = {
  name: "Christine",
  role: "Founder & Lead Wedding Planner",
  experience: "8+ Tahun Pengalaman",
  bio: "Memulai karir di industri *hospitality & luxury event execution*, Christine mendirikan DC Wedding dengan keyakinan bahwa setiap pasangan berhak menikmati hari bahagia mereka tanpa rasa cemas. Berbekal ketelitian pada detail dan pendekatan personal, Christine telah membantu lebih dari 150+ pasangan mewujudkan pernikahan impian mereka.",
  quote: "Bagi saya, pernikahan bukan sekadar acara satu hari, melainkan momen sakral di mana cerita dua keluarga menyatu dengan indah.",
  stats: [
    { value: "150+", label: "Pernikahan Dikelola" },
    { value: "99%", label: "Tingkat Kepuasan" },
    { value: "8+", label: "Tahun Pengalaman" }
  ]
};

// 2. Data Portfolio Video Wedding
const videoPortfolio = [
  {
    id: 1,
    couple: "Aria & Vania",
    location: "The Glass House, Bandung",
    concept: "Intimate Botanical Elegance",
    vimeoOrYoutubeId: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Gantilah dengan URL embed YouTube/Vimeo
    thumbnail: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop",
    date: "12 November 2025"
  },
  {
    id: 2,
    couple: "Kevin & Nathalia",
    location: "Plataran Hutan Kota, Jakarta",
    concept: "Modern Heritage Maroon & Gold",
    vimeoOrYoutubeId: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800&auto=format&fit=crop",
    date: "20 Januari 2026"
  },
  {
    id: 3,
    couple: "Dimas & Clarissa",
    location: "Mulila Resort, Bali",
    concept: "Sunset Oceanfront Luxury",
    vimeoOrYoutubeId: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=800&auto=format&fit=crop",
    date: "14 Februari 2026"
  }
];

// 3. Data Testimonial / Review
const clientReviews = [
  {
    id: 1,
    couple: "Riko & Sarah",
    weddingDate: "Oktober 2025",
    rating: 5,
    text: "Rundown-nya rapi sekali! Kami dan orang tua benar-benar tenang dari pagi sampai acara selesai. Tim Christine sangat gesit dan cekatan melayani kebutuhan katering hingga keluarga besar.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop"
  },
  {
    id: 2,
    couple: "Adit & Maya",
    weddingDate: "Desember 2025",
    rating: 5,
    text: "Mulai dari pencarian vendor yang sesuai budget sampai gladi bersih, Christine selalu memberikan saran objektif. Hari-H kami berjalan sempurna tanpa kendala sedikit pun!",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop"
  },
  {
    id: 3,
    couple: "Daniel & Jessica",
    weddingDate: "Januari 2026",
    rating: 5,
    text: "Awalnya panik karena konsep dekor sempat terhalang cuaca outdoor, tapi tim DC langsung eksekusi Plan B dengan cepat dan hasilnya malah lebih fantastis! Sangat direkomendasikan.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop"
  }
];

// 4. Data FAQ (Frequently Asked Questions)
const faqList = [
  {
    question: "Apa perbedaan layanan 'Full Planning' dan 'On the Day Coordinator'?",
    answer: "Full Planning mendampingi Anda dari nol (pencarian konsep, budgeting, negosiasi vendor, hingga hari-H). Sedangkan On the Day Coordinator fokus mematikan rundown, koordinasi vendor, dan mengawal jalannya acara mulai 1-2 bulan sebelum hari-H."
  },
  {
    question: "Kapan waktu ideal untuk mulai berkonsultasi dengan WO?",
    answer: "Idealnya adalah 6 hingga 12 bulan sebelum tanggal pernikahan untuk mengamankan lokasi (venue) dan vendor impian Anda. Namun kami juga siap menangani persiapan singkat (3-4 bulan)."
  },
  {
    question: "Apakah Christine dan tim menangani pernikahan di luar kota / luar pulau?",
    answer: "Ya, kami melayani pernikahan Destination Wedding di seluruh wilayah Indonesia (seperti Bali, Bandung, Surabaya, Yogyakarta) maupun luar negeri."
  },
  {
    question: "Bagaimana sistem pembayaran dan konsultasi awalnya?",
    answer: "Konsultasi awal bersifat gratis. Setelah sepakat pada skema kerja dan kesepakatan penawaran, pembayaran dapat dilakukan secara bertahap (DP dan cicilan hingga mendekati hari-H)."
  }
];

export default function WeddingOrganizerPage() {
  const { isDarkMode } = useTheme();
  
  // State Interaktif
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  
  // State Simulasi Login Standar
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      setIsLoggedIn(true);
      setShowLoginModal(false);
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="relative z-10 min-h-screen text-[var(--foreground)] transition-colors duration-500">

      {/* AMBIENT GLOW BACKGROUND */}
      <div className={`fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] rounded-full blur-[160px] pointer-events-none transition-all duration-700 ${
        isDarkMode 
          ? "bg-gradient-to-b from-[#C26B70]/15 via-[#C26B70]/05 to-transparent" 
          : "bg-gradient-to-b from-[#7A1C25]/10 via-[#C5A059]/15 to-transparent"
      }`} />

      <div className="relative z-10 w-full max-w-[75%] mx-auto px-6 pt-24 pb-16 space-y-24">

        {/* ------------------------------------
            SUB-HEADER / HEADER ACTION & LOGIN STATUS
           ------------------------------------ */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-[var(--border)]">
          <div>
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-[var(--primary)] font-semibold">
              [ DC WEDDING ]
            </span>
            <h1 className="text-3xl md:text-5xl font-[family-name:var(--font-dc-heading)] mt-1">
              Wedding Organizer & Planning
            </h1>
          </div>

          {/* Menubar Login Standar Layout */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <div className="flex items-center gap-3 bg-[var(--card)] px-4 py-2 rounded-full border border-[var(--border)] shadow-sm">
                <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-bold text-xs">
                  {username.charAt(0).toUpperCase()}
                </div>
                <div className="text-xs">
                  <p className="font-semibold">{username}</p>
                  <p className="text-[10px] text-[var(--muted-foreground)]">Client Portal Active</p>
                </div>
                <button 
                  onClick={() => setIsLoggedIn(false)}
                  className="ml-2 text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Button 
                onClick={() => setShowLoginModal(true)}
                variant="outline"
                className="rounded-full text-xs font-mono uppercase tracking-wider px-5 py-2 border-[var(--border)] hover:bg-[var(--primary)] hover:text-white transition-all"
              >
                <User className="w-3.5 h-3.5 mr-2" /> Client Login
              </Button>
            )}
          </div>
        </div>

        {/* ------------------------------------
            1. BIOGRAPHY OWNER (CHRISTINE)
           ------------------------------------ */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 relative">
            <div className={`relative rounded-3xl overflow-hidden border p-2 ${
              isDarkMode ? "bg-[var(--card)] border-[var(--border)]" : "bg-white border-[var(--border)]"
            }`}>
              <div className="relative h-[480px] w-full rounded-2xl overflow-hidden">
                <Image 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop" 
                  alt="Christine - Owner DC Wedding Organizer"
                  fill
                  className="object-cover object-center transition-transform duration-700 hover:scale-105"
                />
              </div>
            </div>
            
            {/* Floating Badge */}
            <div className={`absolute -bottom-6 -right-4 md:right-4 p-5 rounded-2xl border shadow-2xl max-w-xs ${
              isDarkMode ? "bg-[var(--card)] border-[var(--border)] text-[var(--foreground)]" : "bg-white border-[var(--border)] text-[var(--foreground)]"
            }`}>
              <div className="flex items-center gap-2 text-[var(--primary)] mb-1">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-semibold font-mono">{ownerBio.experience}</span>
              </div>
              <p className="text-xs italic text-[var(--muted-foreground)]">
                &quot;{ownerBio.quote}&quot;
              </p>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-[var(--primary)] font-semibold">
              [ MEET THE FOUNDER ]
            </span>
            <h2 className="text-3xl md:text-4xl font-[family-name:var(--font-dc-heading)] leading-tight">
              {ownerBio.name}
            </h2>
            <p className="text-sm font-mono text-[var(--primary)] uppercase tracking-wider">
              {ownerBio.role}
            </p>

            <p className="text-sm md:text-base leading-relaxed text-[var(--muted-foreground)] font-light">
              {ownerBio.bio}
            </p>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[var(--border)]">
              {ownerBio.stats.map((stat, idx) => (
                <div key={idx} className="space-y-1">
                  <h3 className="text-2xl md:text-3xl font-[family-name:var(--font-dc-heading)] text-[var(--primary)]">
                    {stat.value}
                  </h3>
                  <p className="text-xs text-[var(--muted-foreground)] font-mono">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <Link href="https://wa.me/" target="_blank">
                <Button className="rounded-full text-xs font-semibold tracking-widest uppercase px-8 py-6 bg-[var(--primary)] text-white hover:brightness-110 transition-all shadow-lg">
                  Konsultasi Langsung dengan Christine →
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ------------------------------------
            2. PORTFOLIO VIDEO WEDDING
           ------------------------------------ */}
        <section className="space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-[var(--primary)] font-semibold">
              [ OUR PORTFOLIO ]
            </span>
            <h2 className="text-3xl md:text-4xl font-[family-name:var(--font-dc-heading)]">
              Momen Abadi Pasangan Kami
            </h2>
            <p className="text-sm text-[var(--muted-foreground)]">
              Saksikan keindahan dan kehangatan eksekusi pesta pernikahan karya DC Wedding.
            </p>
          </div>

          {/* Grid Video Portfolio */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {videoPortfolio.map((item) => (
              <div 
                key={item.id} 
                className={`group rounded-2xl overflow-hidden border transition-all duration-300 hover:-translate-y-1 ${
                  isDarkMode ? "bg-[var(--card)] border-[var(--border)]" : "bg-white border-[var(--border)]"
                }`}
              >
                {/* Thumbnail dengan overlay Play Button */}
                <div className="relative h-56 w-full overflow-hidden cursor-pointer" onClick={() => setActiveVideo(item.vimeoOrYoutubeId)}>
                  <Image 
                    src={item.thumbnail} 
                    alt={item.couple}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-[var(--primary)] text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 ml-1 fill-current" />
                    </div>
                  </div>
                  <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-mono px-3 py-1 rounded-full">
                    {item.date}
                  </span>
                </div>

                {/* Deskripsi Momen */}
                <div className="p-5 space-y-2">
                  <h3 className="text-xl font-[family-name:var(--font-dc-heading)]">
                    {item.couple}
                  </h3>
                  <p className="text-xs text-[var(--primary)] font-mono font-medium">
                    {item.concept}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)] flex items-center gap-1">
                    📍 {item.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ------------------------------------
            3. REVIEWS & TESTIMONIALS
           ------------------------------------ */}
        <section className="space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-[var(--primary)] font-semibold">
              [ CLIENT TESTIMONIALS ]
            </span>
            <h2 className="text-3xl md:text-4xl font-[family-name:var(--font-dc-heading)]">
              Kisah Bahagia Mereka
            </h2>
            <p className="text-sm text-[var(--muted-foreground)]">
              Apresiasi tulus dari para pasangan pengantin yang telah mempercayakan hari besarnya bersama kami.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {clientReviews.map((rev) => (
              <div 
                key={rev.id}
                className={`p-6 rounded-2xl border flex flex-col justify-between space-y-6 ${
                  isDarkMode 
                    ? "bg-[var(--card)] border-[var(--border)] shadow-lg" 
                    : "bg-white border-[var(--border)] shadow-sm"
                }`}
              >
                <div className="space-y-4">
                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 text-[var(--secondary)]">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current text-[var(--color-dc-gold-bright)]" />
                    ))}
                  </div>

                  <p className="text-sm leading-relaxed italic text-[var(--foreground)] font-serif">
                    &quot;{rev.text}&quot;
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-[var(--border)]">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden">
                    <Image src={rev.image} alt={rev.couple} fill className="object-cover" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">{rev.couple}</h4>
                    <p className="text-[10px] text-[var(--muted-foreground)] font-mono">{rev.weddingDate}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ------------------------------------
            4. FREQUENTLY ASKED QUESTIONS (FAQ)
           ------------------------------------ */}
        <section className="space-y-10 max-w-4xl mx-auto">
          <div className="text-center space-y-3">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-[var(--primary)] font-semibold">
              [ FREQUENTLY ASKED QUESTIONS ]
            </span>
            <h2 className="text-3xl md:text-4xl font-[family-name:var(--font-dc-heading)]">
              Pertanyaan Umum
            </h2>
            <p className="text-sm text-[var(--muted-foreground)]">
              Segala hal yang perlu Anda ketahui tentang alur kerja dan layanan Wedding Organizer DC.
            </p>
          </div>

          <div className="space-y-4">
            {faqList.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx}
                  className={`rounded-2xl border transition-colors overflow-hidden ${
                    isDarkMode ? "bg-[var(--card)] border-[var(--border)]" : "bg-white border-[var(--border)]"
                  }`}
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-6 text-left flex justify-between items-center gap-4 focus:outline-none"
                  >
                    <span className="text-base font-semibold font-[family-name:var(--font-dc-heading)]">
                      {faq.question}
                    </span>
                    <ChevronDown className={`w-5 h-5 text-[var(--primary)] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 text-sm leading-relaxed text-[var(--muted-foreground)] font-light border-t border-[var(--border)]/50 pt-4 animate-in fade-in duration-300">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

      </div>

      {/* ------------------------------------
          MODAL VIDEO PLAYER (Pop-Up)
         ------------------------------------ */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/20">
            <button 
              onClick={() => setActiveVideo(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-white hover:text-black transition-colors"
            >
              ✕
            </button>
            <iframe 
              src={activeVideo} 
              className="w-full h-full" 
              allow="autoplay; encrypted-media" 
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* ------------------------------------
          MODAL LOGIN CLIENT (Standard Layout)
         ------------------------------------ */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-md p-8 rounded-3xl border shadow-2xl relative ${
            isDarkMode ? "bg-[var(--card)] border-[var(--border)]" : "bg-white border-[var(--border)]"
          }`}>
            <button 
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              ✕
            </button>

            <div className="space-y-6">
              <div className="text-center space-y-2">
                <span className="text-xs font-mono uppercase tracking-widest text-[var(--primary)]">Client Portal</span>
                <h3 className="text-2xl font-[family-name:var(--font-dc-heading)]">Masuk ke Dasbor Anda</h3>
                <p className="text-xs text-[var(--muted-foreground)]">Akses rundown, rincian anggaran, & progres persiapan wedding Anda.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono uppercase text-[var(--muted-foreground)]">Username / Email Klien</label>
                  <input 
                    type="text" 
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="nama.pasangan"
                    className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono uppercase text-[var(--muted-foreground)]">Kata Sandi</label>
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>

                <Button type="submit" className="w-full py-6 rounded-xl bg-[var(--primary)] text-white hover:brightness-110 font-semibold uppercase text-xs tracking-wider">
                  Masuk Portal
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}