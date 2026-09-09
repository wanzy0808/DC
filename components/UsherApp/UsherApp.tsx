"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Camera,
  CheckCircle2,
  ChevronRight,
  Gift,
  HeartHandshake,
  LogOut,
  QrCode,
  Search,
  ScanLine,
  Sparkles,
  Users,
  UserPlus,
  X,
} from "lucide-react";

type Guest = {
  id: string;
  name: string;
  phone: string | null;
  rsvpStatus: string;
  plusOnes: number;
  checkedIn: boolean;
  updatedAt?: string;
};

type Tab = "checkin" | "attendance" | "rsvp" | "greeting" | "gift" | "giving";

const tabs: { id: Tab; label: string; icon: typeof ScanLine }[] = [
  { id: "checkin", label: "Check-in", icon: ScanLine },
  { id: "attendance", label: "Realtime Attendance", icon: Users },
  { id: "rsvp", label: "Smart RSVP", icon: HeartHandshake },
  { id: "greeting", label: "Guest Greeting", icon: Sparkles },
  { id: "gift", label: "Gift Corner", icon: Gift },
  { id: "giving", label: "Giving Management", icon: QrCode },
];

function parseGuestId(value: string) {
  try {
    const url = new URL(value);
    return url.searchParams.get("guestId") ?? value.trim();
  } catch {
    return value.trim();
  }
}

export default function UsherApp() {
  const [tab, setTab] = useState<Tab>("checkin");
  const [guests, setGuests] = useState<Guest[]>([]);
  const [search, setSearch] = useState("");
  const [scanInput, setScanInput] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerError, setScannerError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [manualName, setManualName] = useState("");
  const [giftSearch, setGiftSearch] = useState("");
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanTimerRef = useRef<number | null>(null);

  const loadGuests = useCallback(async () => {
    try {
      const response = await fetch("/api/usher/guests", { cache: "no-store" });
      const data = await response.json();
      if (response.ok) {
        setGuests(data.guests ?? []);
        setMessage("");
      } else {
        setMessage(data.error ?? "Data tamu belum dapat dimuat.");
      }
    } catch {
      setMessage("Koneksi ke data tamu gagal.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGuests();
    const timer = window.setInterval(loadGuests, 5000);
    return () => window.clearInterval(timer);
  }, [loadGuests]);

  const stopScanner = useCallback(() => {
    if (scanTimerRef.current) window.clearInterval(scanTimerRef.current);
    scanTimerRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setScannerOpen(false);
  }, []);

  const checkInGuest = useCallback(async (guestId: string, name?: string) => {
    if (!guestId || checkingIn) return;
    setCheckingIn(true);
    setMessage("Memverifikasi QR tamu...");
    try {
      const response = await fetch("/api/usher/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestId }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error ?? "Check-in gagal.");
        return;
      }
      setGuests((current) =>
        current.map((guest) =>
          guest.id === data.guest.id ? { ...guest, ...data.guest, checkedIn: true } : guest,
        ),
      );
      setSelectedGuest(data.guest);
      setMessage(`Selamat datang, ${data.guest.name}. Check-in berhasil.`);
      setScanInput("");
      setManualName("");
      stopScanner();
    } catch {
      setMessage(`Check-in ${name ? `untuk ${name} ` : ""}gagal diproses.`);
    } finally {
      setCheckingIn(false);
    }
  }, [checkingIn, stopScanner]);

  const startScanner = useCallback(async () => {
    setScannerError("");
    if (!("BarcodeDetector" in window)) {
      setScannerError("Browser ini belum mendukung QR scanner otomatis. Gunakan kolom kode QR atau cari nama tamu.");
      setScannerOpen(true);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      setScannerOpen(true);
      if (videoRef.current) videoRef.current.srcObject = stream;

      const Detector = (window as unknown as { BarcodeDetector: new (options?: { formats?: string[] }) => { detect: (source: CanvasImageSource) => Promise<Array<{ rawValue?: string }>> } }).BarcodeDetector;
      const detector = new Detector({ formats: ["qr_code"] });
      scanTimerRef.current = window.setInterval(async () => {
        const video = videoRef.current;
        if (!video || video.readyState < 2 || video.videoWidth === 0) return;
        try {
          const codes = await detector.detect(video);
          const value = codes[0]?.rawValue;
          if (value) await checkInGuest(parseGuestId(value));
        } catch {
          // Keep the camera running while a frame cannot be decoded.
        }
      }, 450);
    } catch {
      setScannerError("Kamera tidak dapat dibuka. Pastikan izin kamera diberikan dan gunakan HTTPS saat online.");
      setScannerOpen(true);
    }
  }, [checkInGuest]);

  useEffect(() => () => stopScanner(), [stopScanner]);

  const filteredGuests = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return guests;
    return guests.filter((guest) => guest.name.toLowerCase().includes(query) || guest.phone?.includes(query));
  }, [guests, search]);

  const checkedIn = guests.filter((guest) => guest.checkedIn);
  const attending = guests.filter((guest) => guest.rsvpStatus === "ATTENDING");
  const pending = guests.filter((guest) => !guest.checkedIn && guest.rsvpStatus === "ATTENDING");
  const attendancePercent = guests.length ? Math.round((checkedIn.length / guests.length) * 100) : 0;

  const handleManualGuest = async () => {
    const name = manualName.trim();
    if (!name) return;
    const found = guests.find((guest) => guest.name.toLowerCase() === name.toLowerCase());
    if (found) return checkInGuest(found.id, found.name);
    setMessage("Nama belum terdaftar. Tambahkan tamu melalui menu Tamu di dashboard terlebih dahulu.");
  };

  return (
    <div className="min-h-screen bg-[#f8f8f7] text-[#242124]">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-black/10 bg-white/95 px-4 backdrop-blur sm:px-7">
        <div className="flex items-center gap-4">
          <div className="font-serif text-2xl font-semibold tracking-[0.08em] text-[#E60087]">D C</div>
          <div className="h-5 w-px bg-black/10" />
          <div>
            <p className="text-xs font-semibold">Usher App</p>
            <p className="text-[9px] uppercase tracking-[0.18em] text-black/40">Hari-H Check-in</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="hidden rounded-full bg-emerald-500/10 px-3 py-1.5 text-emerald-600 sm:inline-flex">● Sistem aktif</span>
          <button onClick={() => (window.location.href = "/dashboard")} className="rounded-lg border border-black/10 px-3 py-2 hover:bg-black/5">
            <LogOut className="mr-1 inline h-3.5 w-3.5" /> Dashboard
          </button>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-64px)]">
        <aside className="hidden w-64 shrink-0 border-r border-black/10 bg-white p-4 md:block">
          <p className="px-3 pb-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-black/35">Usher Workspace</p>
          <nav className="space-y-1">
            {tabs.map((item) => {
              const Icon = item.icon;
              const active = tab === item.id;
              return (
                <button key={item.id} onClick={() => setTab(item.id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-xs transition ${active ? "bg-[#E60087]/10 font-medium text-[#E60087]" : "text-black/60 hover:bg-black/5"}`}>
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  {item.id === "attendance" && <span className="ml-auto rounded-full bg-[#E60087] px-1.5 py-0.5 text-[8px] text-white">LIVE</span>}
                </button>
              );
            })}
          </nav>
          <div className="mt-8 rounded-2xl bg-[#fff1fa] p-4">
            <p className="text-xs font-semibold text-[#E60087]">Pintu masuk venue</p>
            <p className="mt-2 text-[10px] leading-5 text-black/55">Tamu yang sudah RSVP wajib menunjukkan QR check-in sebelum masuk.</p>
          </div>
        </aside>

        <main className="min-w-0 flex-1 p-4 sm:p-7">
          <div className="mx-auto max-w-6xl">
            <div className="mb-6 flex gap-2 overflow-x-auto md:hidden">
              {tabs.map((item) => (
                <button key={item.id} onClick={() => setTab(item.id)} className={`whitespace-nowrap rounded-full px-3 py-2 text-[10px] ${tab === item.id ? "bg-[#E60087] text-white" : "bg-white text-black/55"}`}>{item.label}</button>
              ))}
            </div>

            {tab === "checkin" && (
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-[#E60087]">Hari-H Guest Check-in</p>
                  <h1 className="mt-2 font-serif text-3xl sm:text-4xl">Scan QR untuk masuk venue</h1>
                  <p className="mt-2 max-w-2xl text-sm text-black/50">QR adalah tiket masuk digital tamu. Scan QR yang dikirim bersama undangan, lalu sistem akan mencatat waktu kedatangan secara realtime.</p>
                </div>

                <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
                  <section className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm sm:p-7">
                    <div className="relative overflow-hidden rounded-2xl bg-[#151315]">
                      {scannerOpen && !scannerError ? (
                        <div className="relative aspect-[4/3]">
                          <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
                          <div className="pointer-events-none absolute inset-0 grid place-items-center">
                            <div className="h-52 w-52 rounded-3xl border-2 border-[#E60087] shadow-[0_0_0_999px_rgba(0,0,0,.25)]" />
                          </div>
                          <button onClick={stopScanner} className="absolute right-3 top-3 rounded-full bg-black/60 p-2 text-white"><X className="h-4 w-4" /></button>
                        </div>
                      ) : (
                        <div className="flex aspect-[4/3] flex-col items-center justify-center px-8 text-center text-white">
                          <div className="mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-[#E60087]/15 text-[#ff57b7]"><Camera className="h-8 w-8" /></div>
                          <h2 className="font-serif text-2xl">Siap menerima tamu?</h2>
                          <p className="mt-2 max-w-sm text-xs leading-5 text-white/50">Gunakan kamera belakang perangkat untuk memindai QR check-in tamu.</p>
                          {scannerError && <p className="mt-4 max-w-sm text-xs text-pink-300">{scannerError}</p>}
                          <button onClick={startScanner} className="mt-5 rounded-xl bg-[#E60087] px-5 py-3 text-xs font-medium text-white hover:bg-[#c90077]">Buka kamera scanner</button>
                        </div>
                      )}
                    </div>
                    <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
                      <div className="relative">
                        <QrCode className="absolute left-3 top-3 h-4 w-4 text-black/30" />
                        <input value={scanInput} onChange={(e) => setScanInput(e.target.value)} placeholder="Tempel kode / link QR tamu" className="w-full rounded-xl border border-black/10 bg-[#fafafa] py-3 pl-10 pr-3 text-xs outline-none focus:border-[#E60087]" />
                      </div>
                      <button onClick={() => checkInGuest(parseGuestId(scanInput))} disabled={!scanInput.trim() || checkingIn} className="rounded-xl bg-[#E60087] px-5 py-3 text-xs font-medium text-white disabled:opacity-40">Verifikasi QR</button>
                    </div>
                  </section>

                  <section className="space-y-5">
                    <div className="rounded-3xl border border-black/10 bg-white p-6">
                      <div className="flex items-center justify-between"><div><p className="text-[10px] uppercase tracking-[0.18em] text-black/40">Status hari-H</p><p className="mt-1 font-serif text-2xl">{checkedIn.length} / {guests.length} tamu</p></div><CheckCircle2 className="h-7 w-7 text-[#E60087]" /></div>
                      <div className="mt-5 h-2 overflow-hidden rounded-full bg-black/5"><div className="h-full rounded-full bg-[#E60087] transition-all" style={{ width: `${attendancePercent}%` }} /></div>
                      <p className="mt-2 text-[10px] text-black/40">{attendancePercent}% sudah check-in</p>
                    </div>
                    <div className="rounded-3xl border border-black/10 bg-white p-6">
                      <p className="text-xs font-semibold">Cari tanpa QR</p>
                      <p className="mt-1 text-[10px] text-black/45">Jika QR tidak terbaca, cari nama tamu yang sudah terdaftar.</p>
                      <div className="relative mt-4"><Search className="absolute left-3 top-3 h-4 w-4 text-black/25" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nama tamu..." className="w-full rounded-xl border border-black/10 py-3 pl-10 pr-3 text-xs" /></div>
                      <div className="mt-3 max-h-48 space-y-2 overflow-y-auto">
                        {filteredGuests.slice(0, 8).map((guest) => (
                          <button key={guest.id} onClick={() => checkInGuest(guest.id, guest.name)} disabled={guest.checkedIn} className="flex w-full items-center justify-between rounded-xl bg-[#fafafa] px-3 py-3 text-left disabled:opacity-50">
                            <span><span className="block text-xs font-medium">{guest.name}</span><span className="text-[9px] text-black/40">{guest.rsvpStatus === "ATTENDING" ? "Hadir" : "Belum konfirmasi"}</span></span>
                            {guest.checkedIn ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <ChevronRight className="h-4 w-4 text-black/25" />}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-3xl border border-black/10 bg-white p-6">
                      <p className="text-xs font-semibold">Tambah nama baru</p>
                      <div className="mt-3 flex gap-2"><input value={manualName} onChange={(e) => setManualName(e.target.value)} placeholder="Nama tamu" className="min-w-0 flex-1 rounded-xl border border-black/10 px-3 py-2.5 text-xs" /><button onClick={handleManualGuest} className="rounded-xl bg-black px-3 py-2.5 text-white"><UserPlus className="h-4 w-4" /></button></div>
                    </div>
                  </section>
                </div>
                {message && <div className="rounded-2xl border border-[#E60087]/20 bg-[#fff1fa] px-4 py-3 text-xs text-[#9a0060]">{message}</div>}
                {selectedGuest && <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6"><p className="text-[10px] uppercase tracking-[0.2em] text-emerald-600">Check-in berhasil</p><h2 className="mt-2 font-serif text-3xl text-emerald-900">Selamat datang, {selectedGuest.name}</h2><p className="mt-2 text-xs text-emerald-700">Silakan arahkan tamu menuju area acara. Data kehadiran sudah tercatat.</p></div>}
              </div>
            )}

            {tab === "attendance" && (
              <div className="space-y-6">
                <div><p className="text-[10px] uppercase tracking-[0.22em] text-[#E60087]">Live monitor</p><h1 className="mt-2 font-serif text-3xl sm:text-4xl">Realtime Attendance</h1><p className="mt-2 text-sm text-black/50">Data diperbarui otomatis setiap 5 detik selama usher app terbuka.</p></div>
                <div className="grid gap-4 sm:grid-cols-3"><Stat label="Sudah masuk" value={checkedIn.length} /><Stat label="Menunggu" value={pending.length} /><Stat label="Total RSVP hadir" value={attending.length} /></div>
                <GuestTable guests={checkedIn} empty="Belum ada tamu yang check-in." />
              </div>
            )}

            {tab === "rsvp" && (
              <div className="space-y-6"><div><p className="text-[10px] uppercase tracking-[0.22em] text-[#E60087]">Smart RSVP</p><h1 className="mt-2 font-serif text-3xl sm:text-4xl">Daftar reservasi tamu</h1><p className="mt-2 text-sm text-black/50">Pilihan acara dan jumlah tamu dari undangan digital menjadi daftar kerja usher.</p></div><div className="grid gap-4 sm:grid-cols-3"><Stat label="Total tamu" value={guests.length} /><Stat label="Konfirmasi hadir" value={attending.length} /><Stat label="Belum check-in" value={pending.length} /></div><GuestTable guests={attending} empty="Belum ada RSVP hadir." /></div>
            )}

            {tab === "greeting" && <FeaturePanel icon={Sparkles} title="Guest Greeting" description="Tampilkan nama tamu setelah check-in untuk memberi sambutan personal. Versi berikutnya dapat dihubungkan ke layar TV/LED venue." actionLabel={selectedGuest ? `Selamat datang, ${selectedGuest.name}` : "Belum ada tamu baru"} />}
            {tab === "gift" && <FeaturePanel icon={Gift} title="Gift Corner" description="Catat pengambilan souvenir per tamu, jumlah yang diambil, dan sisa stok secara realtime." actionLabel="Buka pencatatan souvenir" />}
            {tab === "giving" && <FeaturePanel icon={QrCode} title="Giving Management" description="Catat hadiah dari tamu melalui scan dan input sederhana. Data dapat dikembangkan menjadi laporan export setelah modul hadiah diaktifkan." actionLabel="Buka pencatatan hadiah" />}

            {loading && <p className="fixed bottom-5 right-5 rounded-full bg-black px-4 py-2 text-[10px] text-white">Memuat data tamu...</p>}
          </div>
        </main>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return <div className="rounded-2xl border border-black/10 bg-white p-5"><p className="text-[10px] text-black/45">{label}</p><p className="mt-2 font-serif text-3xl">{value}</p></div>;
}

function GuestTable({ guests, empty }: { guests: Guest[]; empty: string }) {
  return <section className="overflow-hidden rounded-2xl border border-black/10 bg-white"><div className="border-b border-black/10 px-5 py-4 text-xs font-semibold">Tamu ({guests.length})</div>{guests.length === 0 ? <div className="p-10 text-center text-xs text-black/40">{empty}</div> : <div className="divide-y divide-black/5">{guests.map((guest) => <div key={guest.id} className="flex items-center justify-between gap-4 px-5 py-4"><div><p className="text-sm font-medium">{guest.name}</p><p className="mt-1 text-[10px] text-black/40">{guest.phone || "Nomor tidak tersedia"} · +{guest.plusOnes} pendamping</p></div><span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[9px] text-emerald-600">CHECKED IN</span></div>)}</div>}</section>;
}

function FeaturePanel({ icon: Icon, title, description, actionLabel }: { icon: typeof Gift; title: string; description: string; actionLabel: string }) {
  return <section className="grid min-h-[520px] place-items-center rounded-3xl border border-black/10 bg-white p-8 text-center"><div className="max-w-lg"><div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#fff1fa] text-[#E60087]"><Icon className="h-8 w-8" /></div><p className="mt-6 text-[10px] uppercase tracking-[0.22em] text-[#E60087]">Usher feature</p><h1 className="mt-2 font-serif text-4xl">{title}</h1><p className="mt-4 text-sm leading-6 text-black/50">{description}</p><div className="mt-7 inline-flex rounded-xl bg-black px-5 py-3 text-xs text-white">{actionLabel}</div></div></section>;
}
