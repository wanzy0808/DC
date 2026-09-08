"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Mail,
  Users,
  MessageSquareHeart,
  LogOut,
  Edit3,
  ChevronDown,
  Plus,
  Search,
  Eye,
  Share2,
  CalendarDays,
  Image as ImageIcon,
  Music2,
  Gift,
  Send,
  Settings,
  ExternalLink,
  Bell,
  CheckCircle2,
  QrCode,
} from "lucide-react";
import { useTheme } from "@/components/Theme/ThemeContext";
import { Button } from "@/components/ui/button";
import GuestManagement from "@/components/InvitationStudio/GuestManagement";

type DashboardGuest = {
  id: string;
  name: string;
  phone: string | null;
  rsvpStatus: string;
  plusOnes: number;
};
type Profile = {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
};

function whatsappNumber(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("0") ? `62${digits.slice(1)}` : digits;
}

function ThankYouAndQr({
  guests,
  invitationSlug,
}: {
  guests: DashboardGuest[];
  invitationSlug: string;
}) {
  const confirmed = guests.filter((guest) => guest.rsvpStatus === "ATTENDING");
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-5 sm:p-8">
      <section className="rounded-2xl border border-dc-maroon/20 bg-white p-6 dark:bg-[#121116]">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-dc-maroon dark:text-dc-pink-light">
          Ucapan &amp; QR
        </p>
        <h1 className="mt-2 font-serif text-3xl">Terima kasih untuk tamu</h1>
        <p className="mt-2 max-w-2xl text-sm opacity-60">
          Setiap tamu yang mengonfirmasi hadir mendapatkan ucapan terima kasih
          dan QR check-in personal.
        </p>
      </section>
      {confirmed.length === 0 ? (
        <section className="rounded-2xl border border-dc-maroon/20 bg-white p-8 text-center dark:bg-[#121116]">
          <CheckCircle2 className="mx-auto h-8 w-8 text-dc-maroon dark:text-dc-pink-light" />
          <p className="mt-3 text-sm">
            Belum ada tamu yang mengonfirmasi hadir.
          </p>
          <p className="mt-1 text-xs opacity-60">
            QR akan muncul otomatis setelah RSVP diterima.
          </p>
        </section>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {confirmed.map((guest) => {
            const inviteUrl = `${typeof window === "undefined" ? "" : window.location.origin}/invite/${invitationSlug}?guestId=${guest.id}`;
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(inviteUrl)}`;
            const whatsappText = `Terima kasih, ${guest.name}. RSVP kamu sudah kami terima. Tunjukkan QR ini saat check-in: ${inviteUrl}`;
            return (
              <article
                key={guest.id}
                className="rounded-2xl border border-dc-maroon/20 bg-white p-5 dark:bg-[#121116]"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-serif text-xl">
                      Terima kasih, {guest.name}
                    </p>
                    <p className="mt-1 text-xs text-dc-maroon dark:text-dc-pink-light">
                      Konfirmasi hadir diterima
                    </p>
                  </div>
                  <QrCode className="h-5 w-5 text-dc-maroon dark:text-dc-pink-light" />
                </div>
                <img
                  src={qrUrl}
                  alt={`QR check-in ${guest.name}`}
                  className="mx-auto mt-5 h-44 w-44"
                />
                <a
                  href={
                    guest.phone
                      ? `https://wa.me/${whatsappNumber(guest.phone)}?text=${encodeURIComponent(whatsappText)}`
                      : undefined
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 flex items-center justify-center rounded-xl bg-dc-maroon px-4 py-2.5 text-xs text-white aria-disabled:pointer-events-none aria-disabled:opacity-50"
                  aria-disabled={!guest.phone}
                >
                  Kirim ucapan via WhatsApp
                </a>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [dashboardGuests, setDashboardGuests] = useState<DashboardGuest[]>([]);
  const [invitationSlug, setInvitationSlug] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/guests", { cache: "no-store" }),
      fetch("/api/invitations", { cache: "no-store" }),
      fetch("/api/profile", { cache: "no-store" }),
    ])
      .then(async ([guestsResponse, invitationResponse, profileResponse]) => {
        if (guestsResponse.ok)
          setDashboardGuests((await guestsResponse.json()).guests ?? []);
        if (invitationResponse.ok)
          setInvitationSlug(
            (await invitationResponse.json()).invitation?.slug ?? "",
          );
        if (profileResponse.ok) {
          const nextProfile = (await profileResponse.json()).user as Profile;
          setProfile(nextProfile);
          setShowWelcome(
            window.localStorage.getItem(`dc-welcome-seen:${nextProfile.id}`) !==
              "1",
          );
        }
      })
      .catch(() => undefined);
  }, []);

  const confirmedGuests = dashboardGuests.filter(
    (guest) => guest.rsvpStatus === "ATTENDING",
  );
  const displayName = profile?.firstName || "kamu";

  const accentColor = isDarkMode ? "text-[#C26B70]" : "text-[#7A1C25]";
  const bgAccent = isDarkMode
    ? "bg-[#C26B70] hover:bg-[#A9565C]"
    : "bg-[#7A1C25] hover:bg-[#5E141C]";
  const borderColor = isDarkMode ? "border-white/10" : "border-black/10";
  const cardBg = isDarkMode ? "bg-[#121116]" : "bg-white";
  const hoverBg = isDarkMode ? "hover:bg-white/5" : "hover:bg-black/5";

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div
      className={`min-h-screen w-full flex font-sans [font-family:var(--font-dc-sans)] transition-colors duration-500 ${isDarkMode ? "bg-[#060508] text-white" : "bg-[#FAF7F2] text-[#1A1A1A]"}`}
    >
      <aside
        className={`w-60 shrink-0 border-r ${borderColor} ${isDarkMode ? "bg-[#0B0A0E]" : "bg-white"}`}
      >
        <div className="sticky top-0 flex min-h-screen flex-col">
          <Link href="/" className={`border-b px-5 py-5 ${borderColor}`}>
            <div
              className={`font-serif text-2xl font-bold tracking-[0.18em] ${accentColor}`}
            >
              D C
            </div>
            <span className="mt-1 block text-[9px] uppercase tracking-[0.3em] opacity-50">
              Wedding
            </span>
          </Link>
          <nav className="space-y-1 p-3 text-xs">
            <p className="px-3 pb-2 pt-3 text-[10px] font-semibold uppercase tracking-[0.2em] opacity-40">
              Workspace
            </p>
            {[
              { id: "dashboard", label: "Beranda", icon: LayoutDashboard },
              { id: "undangan", label: "Undangan Digital", icon: Mail },
              { id: "tamu", label: "Tamu Undangan", icon: Users },
              { id: "rsvp", label: "Ucapan & QR", icon: MessageSquareHeart },
            ].map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition ${active ? (isDarkMode ? "bg-[#C26B70]/15 text-[#E8A5AE]" : "bg-[#FCE8EF] text-[#7A1C25]") : `opacity-70 hover:opacity-100 ${hoverBg}`}`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  {item.id === "rsvp" && confirmedGuests.length > 0 && (
                    <span className="ml-auto rounded-full bg-dc-maroon px-1.5 py-0.5 text-[9px] text-white">
                      {confirmedGuests.length}
                    </span>
                  )}
                </button>
              );
            })}
            <p className="px-3 pb-2 pt-5 text-[10px] font-semibold uppercase tracking-[0.2em] opacity-40">
              Kelola Undangan
            </p>
            <button
              onClick={() => setActiveTab("undangan")}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left opacity-70 hover:opacity-100 ${hoverBg}`}
            >
              <ImageIcon className="h-4 w-4" />
              <span>Galeri & Foto</span>
            </button>
            <button
              onClick={() => setActiveTab("undangan")}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left opacity-70 hover:opacity-100 ${hoverBg}`}
            >
              <Music2 className="h-4 w-4" />
              <span>Musik Undangan</span>
            </button>
            <Link
              href="/packages"
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 opacity-70 hover:opacity-100 ${hoverBg}`}
            >
              <Plus className="h-4 w-4" />
              <span>Tambah layanan</span>
            </Link>
          </nav>
          <div className="mt-auto space-y-2 border-t p-3">
            <Link
              href="/"
              className={`flex items-center gap-3 rounded-lg px-3 py-3 text-xs opacity-70 hover:opacity-100 ${hoverBg}`}
            >
              <ExternalLink className="h-4 w-4" />
              Lihat website DC
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-xs ${isDarkMode ? "text-red-300" : "text-red-700"}`}
            >
              <LogOut className="h-4 w-4" />
              Keluar
            </button>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <header
          className={`flex h-[72px] items-center justify-between border-b px-5 sm:px-8 ${borderColor}`}
        >
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] opacity-50">
              DC Workspace
            </p>
            <p className="mt-1 text-sm font-medium">
              {activeTab === "dashboard"
                ? "Beranda"
                : activeTab === "undangan"
                  ? "Undangan Digital"
                  : activeTab === "tamu"
                    ? "Tamu Undangan"
                    : "RSVP & Ucapan"}
            </p>
          </div>
          <div className="relative flex items-center gap-3">
            <button
              onClick={() => setNotificationsOpen((open) => !open)}
              className={`relative rounded-full p-2 ${confirmedGuests.length > 0 ? "text-dc-maroon dark:text-dc-pink-light" : "opacity-40"}`}
              aria-label="Notifikasi RSVP"
            >
              <Bell className="h-4 w-4" />
              {confirmedGuests.length > 0 && (
                <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-dc-maroon dark:bg-dc-pink-light" />
              )}
            </button>
            {notificationsOpen && (
              <div
                className={`absolute right-20 top-12 z-20 w-72 rounded-xl border p-4 text-xs shadow-xl ${cardBg} ${borderColor}`}
              >
                <p className="font-medium text-dc-maroon dark:text-dc-pink-light">
                  Notifikasi RSVP
                </p>
                <p className="mt-2 opacity-60">
                  {confirmedGuests.length
                    ? `${confirmedGuests.length} tamu baru mengonfirmasi hadir.`
                    : "Belum ada RSVP baru."}
                </p>
                {confirmedGuests.length > 0 && (
                  <button
                    onClick={() => {
                      setActiveTab("rsvp");
                      setNotificationsOpen(false);
                    }}
                    className="mt-3 text-dc-maroon underline dark:text-dc-pink-light"
                  >
                    Lihat ucapan &amp; QR
                  </button>
                )}
              </div>
            )}
            <div
              className={`flex items-center gap-2 rounded-full border px-2 py-1.5 text-xs ${borderColor}`}
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-dc-maroon text-white">
                {displayName.slice(0, 1).toUpperCase()}
              </span>
              <span className="hidden sm:block">{displayName}</span>
              <ChevronDown className="h-3 w-3 opacity-50" />
            </div>
          </div>
        </header>

        {activeTab === "dashboard" && profile && showWelcome && (
          <WelcomeProfile
            profile={profile}
            onSaved={(nextProfile) => {
              setProfile(nextProfile);
              setShowWelcome(false);
              window.localStorage.setItem(
                `dc-welcome-seen:${nextProfile.id}`,
                "1",
              );
            }}
          />
        )}
        {activeTab === "dashboard" && (
          <div className="mx-auto max-w-7xl space-y-6 p-5 sm:p-8">
            <section
              className={`flex flex-col justify-between gap-5 rounded-2xl border p-6 sm:flex-row sm:items-center ${cardBg} ${borderColor}`}
            >
              <div>
                <p
                  className={`text-xs font-semibold uppercase tracking-[0.22em] ${accentColor}`}
                >
                  Selamat datang kembali
                </p>
                <h1 className="mt-2 font-serif text-3xl">
                  Halo, {displayName}
                </h1>
                <p className="mt-2 text-sm opacity-60">
                  Atur semua kebutuhan pernikahanmu dari satu tempat.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("undangan")}
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-medium text-white ${bgAccent}`}
              >
                <Edit3 className="h-4 w-4" />
                Buka undangan
              </button>
            </section>
            <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                { label: "Undangan dilihat", value: "376", icon: Eye },
                { label: "Total RSVP", value: "41", icon: MessageSquareHeart },
                { label: "Tamu terdaftar", value: "98", icon: Users },
                {
                  label: "Hari menuju acara",
                  value: "142",
                  icon: CalendarDays,
                },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className={`rounded-2xl border p-5 ${cardBg} ${borderColor}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs opacity-60">{stat.label}</span>
                      <Icon className={`h-4 w-4 ${accentColor}`} />
                    </div>
                    <p className="mt-3 font-serif text-3xl">{stat.value}</p>
                  </div>
                );
              })}
            </section>
            <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <div className={`rounded-2xl border ${cardBg} ${borderColor}`}>
                <div
                  className={`flex items-center justify-between border-b p-5 ${borderColor}`}
                >
                  <div>
                    <h2 className="font-serif text-xl">Undangan Saya</h2>
                    <p className="mt-1 text-xs opacity-60">
                      Kelola dan pantau undanganmu.
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-medium text-emerald-600">
                    LUNAS
                  </span>
                </div>
                <div className="p-5">
                  <div
                    className={`flex flex-col justify-between gap-5 rounded-xl border p-4 sm:flex-row sm:items-center ${borderColor}`}
                  >
                    <div>
                      <p className="font-serif text-lg">riolyvi.momentus.id</p>
                      <p className="mt-1 text-xs opacity-60">
                        Nisha &middot; Holy Matrimony &middot; 26 September 2026
                      </p>
                      <div className="mt-3 flex items-center gap-2 text-[10px] opacity-60">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        Publik dan siap dibagikan
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab("undangan")}
                        className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${borderColor} ${hoverBg}`}
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        Buka
                      </button>
                      <button
                        className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-white ${bgAccent}`}
                      >
                        <Share2 className="h-3.5 w-3.5" />
                        Bagikan
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`rounded-2xl border ${cardBg} ${borderColor}`}>
                <div
                  className={`flex items-center justify-between border-b p-5 ${borderColor}`}
                >
                  <div>
                    <h2 className="font-serif text-xl">Rangkaian Acara</h2>
                    <p className="mt-1 text-xs opacity-60">
                      Agenda utama pernikahan.
                    </p>
                  </div>
                  <button
                    className={`rounded-lg border p-2 ${borderColor}`}
                    aria-label="Tambah acara"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-4 p-5">
                  <div className="flex gap-3">
                    <span
                      className={`mt-1 h-2.5 w-2.5 rounded-full ${isDarkMode ? "bg-[#C26B70]" : "bg-[#7A1C25]"}`}
                    />
                    <div>
                      <p className="text-sm font-medium">Holy Matrimony</p>
                      <p className="mt-1 text-xs opacity-60">
                        26 September 2026 &middot; 16:00
                      </p>
                      <p className="mt-1 text-xs opacity-60">
                        Saint Christopher Cathedral Church
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#E60087]" />
                    <div>
                      <p className="text-sm font-medium">Resepsi Pernikahan</p>
                      <p className="mt-1 text-xs opacity-60">
                        26 September 2026 &middot; 19:00
                      </p>
                      <p className="mt-1 text-xs opacity-60">
                        The Glass House, Bandung
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            <section
              className={`rounded-2xl border p-5 ${cardBg} ${borderColor}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-xl">Aksi Cepat</h2>
                  <p className="mt-1 text-xs opacity-60">
                    Lanjutkan persiapanmu.
                  </p>
                </div>
                <Settings className="h-4 w-4 opacity-40" />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <button
                  onClick={() => setActiveTab("tamu")}
                  className={`flex items-center gap-2 rounded-xl border p-3 text-left text-xs ${borderColor} ${hoverBg}`}
                >
                  <Users className={accentColor + " h-4 w-4"} />
                  Kelola tamu
                </button>
                <button
                  onClick={() => setActiveTab("rsvp")}
                  className={`flex items-center gap-2 rounded-xl border p-3 text-left text-xs ${borderColor} ${hoverBg}`}
                >
                  <MessageSquareHeart className={accentColor + " h-4 w-4"} />
                  Cek RSVP
                </button>
                <Link
                  href="/packages"
                  className={`flex items-center gap-2 rounded-xl border p-3 text-xs ${borderColor} ${hoverBg}`}
                >
                  <Gift className={accentColor + " h-4 w-4"} />
                  Lihat add-on
                </Link>
                <button
                  onClick={() => setActiveTab("undangan")}
                  className={`flex items-center gap-2 rounded-xl border p-3 text-left text-xs ${borderColor} ${hoverBg}`}
                >
                  <Send className={accentColor + " h-4 w-4"} />
                  Bagikan undangan
                </button>
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: RINGKASAN UNDANGAN */}
        {activeTab === "undangan" && (
          <div className="mx-auto max-w-7xl space-y-6 p-5 sm:p-8">
            <section
              className={`flex flex-col justify-between gap-5 rounded-2xl border p-6 sm:flex-row sm:items-center ${cardBg} ${borderColor}`}
            >
              <div>
                <p
                  className={`text-xs font-semibold uppercase tracking-[0.22em] ${accentColor}`}
                >
                  Undangan Digital
                </p>
                <h1 className="mt-2 font-serif text-3xl">Undangan Saya</h1>
                <p className="mt-2 text-sm opacity-60">
                  Kelola tampilan, konten, dan publikasi undangan pernikahanmu.
                </p>
              </div>
              <Link
                href="/dashboard/editor"
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-medium text-white ${bgAccent}`}
              >
                <Edit3 className="h-4 w-4" />
                Buka Invitation Studio
              </Link>
            </section>
            <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
              <div
                className={`overflow-hidden rounded-2xl border ${cardBg} ${borderColor}`}
              >
                <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-gradient-to-br from-[#f5d7dc] via-[#fff7f1] to-[#e8d8c6]">
                  <div className="absolute left-6 top-6 h-24 w-24 rounded-full bg-[#C26B70]/20 blur-2xl" />
                  <div className="absolute bottom-6 right-6 h-32 w-32 rounded-full bg-[#C5A059]/25 blur-2xl" />
                  <div className="relative w-2/3 rounded-xl border border-white/70 bg-white/55 p-6 text-center shadow-xl backdrop-blur-sm">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-[#7A1C25]">
                      The Wedding Of
                    </p>
                    <h2 className="mt-3 font-serif text-3xl text-[#251b1e]">
                      Rio &amp; Lyvia
                    </h2>
                    <p className="mt-3 text-xs text-[#7A1C25]">
                      26 September 2026
                    </p>
                    <p className="mt-1 text-[10px] text-[#251b1e]/60">
                      Eternal Blossom
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-5">
                  <div>
                    <h2 className="font-serif text-xl">Eternal Blossom</h2>
                    <p className="mt-1 text-xs opacity-60">
                      Diperbarui beberapa saat lalu
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-medium text-emerald-600">
                    AKTIF
                  </span>
                </div>
              </div>
              <div
                className={`rounded-2xl border p-6 ${cardBg} ${borderColor}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-serif text-xl">Kelola Undangan</h2>
                    <p className="mt-1 text-xs opacity-60">
                      Pilih tindakan yang ingin kamu lakukan.
                    </p>
                  </div>
                  <Mail className={`h-5 w-5 ${accentColor}`} />
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <Link
                    href="/dashboard/editor"
                    className={`group rounded-xl border p-4 transition hover:-translate-y-0.5 ${borderColor} ${hoverBg}`}
                  >
                    <Edit3 className={`h-5 w-5 ${accentColor}`} />
                    <p className="mt-3 text-sm font-medium">Edit desain</p>
                    <p className="mt-1 text-xs opacity-60">
                      Buka studio visual dan atur layout undangan.
                    </p>
                    <span
                      className={`mt-4 block text-xs font-medium ${accentColor}`}
                    >
                      Buka editor →
                    </span>
                  </Link>
                  <Link
                    href="/dashboard/editor"
                    className={`group rounded-xl border p-4 transition hover:-translate-y-0.5 ${borderColor} ${hoverBg}`}
                  >
                    <ImageIcon className={`h-5 w-5 ${accentColor}`} />
                    <p className="mt-3 text-sm font-medium">
                      Galeri &amp; foto
                    </p>
                    <p className="mt-1 text-xs opacity-60">
                      Atur foto pasangan dan asset undangan.
                    </p>
                    <span
                      className={`mt-4 block text-xs font-medium ${accentColor}`}
                    >
                      Kelola asset →
                    </span>
                  </Link>
                  <Link
                    href="/dashboard/editor"
                    className={`group rounded-xl border p-4 transition hover:-translate-y-0.5 ${borderColor} ${hoverBg}`}
                  >
                    <Music2 className={`h-5 w-5 ${accentColor}`} />
                    <p className="mt-3 text-sm font-medium">Musik undangan</p>
                    <p className="mt-1 text-xs opacity-60">
                      Tambahkan musik untuk halaman undangan.
                    </p>
                    <span
                      className={`mt-4 block text-xs font-medium ${accentColor}`}
                    >
                      Atur musik →
                    </span>
                  </Link>
                  <button
                    type="button"
                    className={`group rounded-xl border p-4 text-left transition hover:-translate-y-0.5 ${borderColor} ${hoverBg}`}
                  >
                    <Share2 className={`h-5 w-5 ${accentColor}`} />
                    <p className="mt-3 text-sm font-medium">Bagikan undangan</p>
                    <p className="mt-1 text-xs opacity-60">
                      Salin link atau kirim ke tamu undangan.
                    </p>
                    <span
                      className={`mt-4 block text-xs font-medium ${accentColor}`}
                    >
                      Bagikan →
                    </span>
                  </button>
                </div>
              </div>
            </section>
            <section
              className={`rounded-2xl border p-6 ${cardBg} ${borderColor}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-xl">Status Undangan</h2>
                  <p className="mt-1 text-xs opacity-60">
                    Pastikan semua bagian sudah siap sebelum dibagikan.
                  </p>
                </div>
                <span className="text-xs font-medium text-emerald-600">
                  80% selesai
                </span>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                <div className="h-full w-4/5 rounded-full bg-[#E60087]" />
              </div>
              <div className="mt-5 grid gap-3 text-xs sm:grid-cols-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Data pasangan lengkap
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Rangkaian acara siap
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  Tambahkan galeri foto
                </div>
              </div>
            </section>
            <section
              className={`grid gap-6 rounded-2xl border p-6 lg:grid-cols-[1fr_auto] lg:items-center ${cardBg} ${borderColor}`}
            >
              <div>
                <p
                  className={`text-xs font-semibold uppercase tracking-[0.22em] ${accentColor}`}
                >
                  DC Design Studio
                </p>
                <h2 className="mt-2 font-serif text-2xl">
                  Bangun undanganmu dengan lebih leluasa.
                </h2>
                <p className="mt-2 max-w-2xl text-sm opacity-60">
                  Pilih template, atur tipografi, tambahkan foto dan musik, lalu
                  lihat perubahanmu dalam preview yang langsung hidup.
                </p>
                <div className="mt-5 flex flex-wrap gap-2 text-[10px] opacity-70">
                  <span className="rounded-full border border-current px-3 py-1">
                    Template editorial
                  </span>
                  <span className="rounded-full border border-current px-3 py-1">
                    Musik &amp; galeri
                  </span>
                  <span className="rounded-full border border-current px-3 py-1">
                    RSVP &amp; QR
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/template-design"
                  className={`inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-xs ${borderColor} ${hoverBg}`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Lihat template
                </Link>
                <Link
                  href="/dashboard/editor"
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-xs text-white ${bgAccent}`}
                >
                  <Edit3 className="h-4 w-4" />
                  Buka Studio
                </Link>
              </div>
            </section>
          </div>
        )}

        {/* TAB 3: MANAJEMEN TAMU */}
        {activeTab === "tamu" && <GuestManagement />}

        {activeTab === "rsvp" && (
          <ThankYouAndQr
            guests={dashboardGuests}
            invitationSlug={invitationSlug}
          />
        )}

        {activeTab === "tamu-old" && (
          <div className="p-8 space-y-6 max-w-6xl w-full mx-auto">
            <div>
              <h1 className="text-2xl font-serif font-normal">
                Manajemen Tamu
              </h1>
              <p className="text-xs opacity-60 mt-1">
                Kelola 98 tamu, kirim undangan, dan pantau kehadiran
              </p>
            </div>

            {/* Statistik Tamu */}
            <div
              className={`grid grid-cols-1 sm:grid-cols-4 rounded-2xl border overflow-hidden ${cardBg} ${borderColor}`}
            >
              <div className="p-5 border-r border-inherit">
                <span className="text-xs opacity-60">Total Tamu</span>
                <h3 className="text-2xl font-serif font-normal mt-1">98</h3>
                <span className="text-[10px] opacity-40">206 total orang</span>
              </div>
              <div className="p-5 border-r border-inherit">
                <span className="text-xs opacity-60">Terkirim</span>
                <h3 className="text-2xl font-serif font-normal mt-1">72</h3>
                <span className="text-[10px] opacity-40">26 belum dikirim</span>
              </div>
              <div className="p-5 border-r border-inherit">
                <span className="text-xs opacity-60">Dilihat</span>
                <h3 className="text-2xl font-serif font-normal mt-1">83</h3>
                <span className="text-[10px] opacity-40">15 belum dibuka</span>
              </div>
              <div className="p-5">
                <span className="text-xs opacity-60">Hadir</span>
                <h3 className="text-2xl font-serif font-normal mt-1">37</h3>
                <span className="text-[10px] opacity-40">1 tidak • 3 ragu</span>
              </div>
            </div>

            <div className="flex justify-between items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 w-4 h-4 opacity-40" />
                <input
                  type="text"
                  placeholder="Cari nama tamu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none ${cardBg} ${borderColor}`}
                />
              </div>
              <Button
                className={`gap-2 rounded-xl text-xs text-white ${bgAccent}`}
              >
                <Plus className="w-4 h-4" /> Tambah Tamu
              </Button>
            </div>

            {/* List Tamu Sample */}
            <div
              className={`p-4 rounded-xl border flex justify-between items-center ${cardBg} ${borderColor}`}
            >
              <div className="flex items-center gap-3">
                <input type="checkbox" className="rounded" />
                <div>
                  <h4 className="font-medium text-sm">Alicia & Partner</h4>
                  <p className="text-xs opacity-60">
                    📅 Holy Matrimony, Reception
                  </p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-medium">
                      Teman
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-medium">
                      ✓ Dilihat
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 font-medium">
                      ● Hadir
                    </span>
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className={`text-xs gap-1 border ${borderColor} text-emerald-500 ${hoverBg}`}
              >
                <Share2 className="w-3.5 h-3.5" /> Kirim
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function WelcomeProfile({
  profile,
  onSaved,
}: {
  profile: Profile;
  onSaved: (profile: Profile) => void;
}) {
  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, lastName }),
    });
    const data = await response.json();
    if (response.ok) onSaved(data.user);
    else setError(data.error ?? "Profil belum dapat disimpan.");
    setSaving(false);
  }

  return (
    <section className="border-b border-dc-maroon/20 bg-[#fff8f5] px-5 py-8 dark:bg-[#1b1518] sm:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_360px] lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-dc-maroon dark:text-dc-pink-light">
            Selamat datang di DC Workspace
          </p>
          <h1 className="mt-2 font-serif text-3xl">
            Halo, {profile.firstName}.
          </h1>
          <p className="mt-2 max-w-xl text-sm opacity-65">
            Lengkapi nama kamu dulu supaya sapaan, undangan, dan komunikasi dari
            kami terasa lebih personal.
          </p>
        </div>
        <form
          onSubmit={save}
          className="space-y-3 rounded-2xl border border-dc-maroon/20 bg-white p-4 dark:bg-[#121116]"
        >
          <p className="font-serif text-lg">Data diri singkat</p>
          <input
            required
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            placeholder="Nama depan"
            className="w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm dark:border-white/10 dark:bg-white/5"
          />
          <input
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            placeholder="Nama belakang (opsional)"
            className="w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm dark:border-white/10 dark:bg-white/5"
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button
            disabled={saving}
            className="w-full rounded-xl bg-dc-maroon px-4 py-2.5 text-sm text-white disabled:opacity-60"
          >
            {saving ? "Menyimpan..." : "Simpan dan mulai"}
          </button>
        </form>
      </div>
    </section>
  );
}
