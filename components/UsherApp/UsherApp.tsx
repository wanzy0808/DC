"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Camera,
  CheckCircle2,
  Gift,
  HeartHandshake,
  LogOut,
  QrCode,
  Search,
  ScanLine,
  Sparkles,
  UserPlus,
  Users,
  UsersRound,
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

type Tab = "checkin" | "guests" | "attendance" | "rsvp" | "greeting" | "gift" | "giving";

type IssuedQr = { guest: Guest; token: string } | null;

const tabs: { id: Tab; label: string; icon: typeof ScanLine }[] = [
  { id: "checkin", label: "Check-in", icon: ScanLine },
  { id: "guests", label: "Daftar Tamu Diundang", icon: UsersRound },
  { id: "attendance", label: "Realtime Attendance", icon: Users },
  { id: "rsvp", label: "Smart RSVP", icon: HeartHandshake },
  { id: "greeting", label: "Guest Greeting", icon: Sparkles },
  { id: "gift", label: "Gift Corner", icon: Gift },
  { id: "giving", label: "Giving Management", icon: QrCode },
];

function parseQrToken(value: string) {
  const raw = value.trim();
  try {
    const url = new URL(raw);
    return url.searchParams.get("token") ?? url.searchParams.get("qr") ?? raw;
  } catch {
    return raw;
  }
}

function qrImageUrl(token: string) {
  return `https://quickchart.io/qr?text=${encodeURIComponent(token)}&size=320&margin=2`;
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
  const [issuingQr, setIssuingQr] = useState(false);
  const [issuedQr, setIssuedQr] = useState<IssuedQr>(null);
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

  const checkInWithQr = useCallback(async (rawValue: string) => {
    const token = parseQrToken(rawValue);
    if (!token || checkingIn) return;
    setCheckingIn(true);
    setMessage("Memverifikasi QR tamu...");
    try {
      const response = await fetch("/api/usher/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error ?? "Check-in gagal.");
        return;
      }
      setGuests((current) => current.map((guest) => guest.id === data.guest.id ? { ...guest, ...data.guest, checkedIn: true } : guest));
      setSelectedGuest(data.guest);
      setMessage(`Selamat datang, ${data.guest.name}. QR valid dan check-in berhasil.`);
      setScanInput("");
      stopScanner();
    } catch {
      setMessage("Check-in gagal diproses.");
    } finally {
      setCheckingIn(false);
    }
  }, [checkingIn, stopScanner]);

  const startScanner = useCallback(async () => {
    setScannerError("");
    if (!("BarcodeDetector" in window)) {
      setScannerError("Browser ini belum mendukung scanner otomatis. Gunakan input kode QR di bawah.");
      setScannerOpen(true);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
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
          if (value) await checkInWithQr(value);
        } catch {
          // Keep scanning when a frame cannot be decoded.
        }
      }, 450);
    } catch {
      setScannerError("Kamera tidak dapat dibuka. Pastikan izin kamera diberikan dan gunakan HTTPS saat online.");
      setScannerOpen(true);
    }
  }, [checkInWithQr]);

  useEffect(() => () => stopScanner(), [stopScanner]);

  const issueGuestQr = async (guest: Guest) => {
    setIssuingQr(true);
    setMessage("");
    try {
      const response = await fetch("/api/usher/qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestId: guest.id }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error ?? "QR tamu gagal dibuat.");
        return;
      }
      setIssuedQr(data);
    } catch {
      setMessage("QR tamu gagal dibuat.");
    } finally {
      setIssuingQr(false);
    }
  };

  const filteredGuests = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return guests;
    return guests.filter((guest) => guest.name.toLowerCase().includes(query) || guest.phone?.toLowerCase().includes(query));
  }, [guests, search]);

  const checkedIn = guests.filter((guest) => guest.checkedIn);
  const attending = guests.filter((guest) => guest.rsvpStatus === "ATTENDING");
  const notAttending = guests.filter((guest) => guest.rsvpStatus === "NOT_ATTENDING");
  const pending = guests.filter((guest) => guest.rsvpStatus === "PENDING" || guest.rsvpStatus === "TENTATIVE");
  const attendancePercent = guests.length ? Math.round((checkedIn.length / guests.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#f8f8f7] text-[#242124]">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-black/10 bg-white/95 px-4 backdrop-blur sm:px-7">
        <div className="flex items-center gap-4">
          <div className="font-serif text-2xl font-semibold tracking-[0.08em] text-[#E60087]">D C</div>
          <div className="h-5 w-px bg-black/10" />
          <div><p className="text-xs font-semibold">Usher App</p><p className="text-[9px] uppercase tracking-[0.18em] text-black/40">Hari-H Check-in</p></div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="hidden rounded-full bg-emerald-500/10 px-3 py-1.5 text-emerald-600 sm:inline-flex">● Sistem aktif</span>
          <button onClick={() => (window.location.href = "/dashboard")} className="rounded-lg border border-black/10 px-3 py-2 hover:bg-black/5"><LogOut className="mr-1 inline h-3.5 w-3.5" /> Dashboard</button>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-64px)]">
        <aside className="hidden w-72 shrink-0 border-r border-black/10 bg-white p-4 md:block">
          <p className="px-3 pb-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-black/35">Usher Workspace</p>
          <nav className="space-y-1">
            {tabs.map((item) => {
              const Icon = item.icon;
              return <button key={item.id} onClick={() => setTab(item.id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-xs transition ${tab === item.id ? "bg-[#E60087]/10 font-medium text-[#E60087]" : "text-black/60 hover:bg-black/5"}`}><Icon className="h-4 w-4" /><span>{item.label}</span>{item.id === "attendance" && <span className="ml-auto rounded-full bg-[#E60087] px-1.5 py-0.5 text-[8px] text-white">LIVE</span>}</button>;
            })}
          </nav>
          <div className="mt-8 rounded-2xl bg-[#fff1fa] p-4">
            <p className="text-xs font-semibold text-[#E60087]">Aturan pintu masuk</p>
            <p className="mt-2 text-[10px] leading-5 text-black/55">QR resmi adalah satu-satunya validasi untuk masuk venue. Cari nama hanya untuk memeriksa status undangan dan menerbitkan QR.</p>
          </div>
        </aside>

        <main className="min-w-0 flex-1 p-4 sm:p-7">
          <div className="mx-auto max-w-6xl">
            <div className="mb-6 flex gap-2 overflow-x-auto md:hidden">
              {tabs.map((item) => <button key={item.id} onClick={() => setTab(item.id)} className={`whitespace-nowrap rounded-full px-3 py-2 text-[10px] ${tab === item.id ? "bg-[#E60087] text-white" : "bg-white text-black/55"}`}>{item.label}</button>)}
            </div>

            {tab === "checkin" && <CheckinPanel scannerOpen={scannerOpen} scannerError={scannerError} videoRef={videoRef} scanInput={scanInput} setScanInput={setScanInput} startScanner={startScanner} stopScanner={stopScanner} checkInWithQr={checkInWithQr} checkingIn={checkingIn} checkedIn={checkedIn} guests={guests} attendancePercent={attendancePercent} selectedGuest={selectedGuest} message={message} />}

            {tab === "guests" && <section className="space-y-6">
              <div><p className="text-[10px] uppercase tracking-[0.22em] text-[#E60087]">Guest directory</p><h1 className="mt-2 font-serif text-3xl sm:text-4xl">Daftar Tamu Diundang</h1><p className="mt-2 max-w-2xl text-sm text-black/50">Semua nama di sini berasal dari daftar tamu undangan pasangan. Status RSVP tidak menentukan boleh tidaknya masuk; tamu tetap harus memiliki QR resmi.</p></div>
              <div className="grid gap-4 sm:grid-cols-4"><Stat label="Total diundang" value={guests.length} /><Stat label="Sudah RSVP hadir" value={attending.length} /><Stat label="Belum konfirmasi" value={pending.length} /><Stat label="Tidak hadir" value={notAttending.length} /></div>
              <div className="rounded-3xl border border-black/10 bg-white p-5">
                <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-black/25" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama atau nomor WhatsApp..." className="w-full rounded-xl border border-black/10 bg-[#fafafa] py-3 pl-10 pr-3 text-xs outline-none focus:border-[#E60087]" /></div>
                <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[720px] text-left text-xs"><thead><tr className="border-b border-black/10 text-[9px] uppercase tracking-[0.14em] text-black/35"><th className="px-3 py-3">Nama tamu</th><th className="px-3 py-3">WhatsApp</th><th className="px-3 py-3">RSVP</th><th className="px-3 py-3">Plus one</th><th className="px-3 py-3">Check-in</th><th className="px-3 py-3 text-right">Aksi</th></tr></thead><tbody>{filteredGuests.map((guest) => <tr key={guest.id} className="border-b border-black/5 last:border-0"><td className="px-3 py-4 font-medium">{guest.name}</td><td className="px-3 py-4 text-black/50">{guest.phone || "—"}</td><td className="px-3 py-4"><RsvpBadge status={guest.rsvpStatus} /></td><td className="px-3 py-4">{guest.plusOnes}</td><td className="px-3 py-4">{guest.checkedIn ? <span className="text-emerald-600">Sudah masuk</span> : <span className="text-black/35">Belum masuk</span>}</td><td className="px-3 py-4 text-right"><button onClick={() => issueGuestQr(guest)} disabled={issuingQr} className="rounded-lg bg-[#E60087] px-3 py-2 text-[10px] font-medium text-white disabled:opacity-50">Buat QR</button></td></tr>)}</tbody></table></div>
              </div>
            </section>}

            {tab === "attendance" && <section className="space-y-6"><div><p className="text-[10px] uppercase tracking-[0.22em] text-[#E60087]">Live monitor</p><h1 className="mt-2 font-serif text-3xl sm:text-4xl">Realtime Attendance</h1><p className="mt-2 text-sm text-black/50">Data diperbarui otomatis setiap 5 detik.</p></div><div className="grid gap-4 sm:grid-cols-3"><Stat label="Sudah masuk" value={checkedIn.length} /><Stat label="Menunggu" value={guests.length - checkedIn.length} /><Stat label="Total RSVP hadir" value={attending.length} /></div><GuestTable guests={checkedIn} empty="Belum ada tamu yang check-in." /></section>}

            {tab === "rsvp" && <section className="space-y-6"><div><p className="text-[10px] uppercase tracking-[0.22em] text-[#E60087]">Smart RSVP</p><h1 className="mt-2 font-serif text-3xl sm:text-4xl">Daftar RSVP</h1><p className="mt-2 text-sm text-black/50">Pantau siapa yang hadir, belum menjawab, dan tidak hadir. Untuk masuk venue tetap diperlukan QR.</p></div><div className="grid gap-4 sm:grid-cols-3"><Stat label="Total diundang" value={guests.length} /><Stat label="Konfirmasi hadir" value={attending.length} /><Stat label="Belum konfirmasi" value={pending.length} /></div><GuestTable guests={attending} empty="Belum ada RSVP hadir." /></section>}

            {tab === "greeting" && <FeaturePanel icon={Sparkles} title="Guest Greeting" description={selectedGuest ? `Tamu terakhir: ${selectedGuest.name}.` : "Tampilkan nama tamu setelah QR berhasil diverifikasi untuk sambutan personal."} />}
            {tab === "gift" && <FeaturePanel icon={Gift} title="Gift Corner" description="Catat pengambilan souvenir per tamu, jumlah yang diambil, dan sisa stok secara realtime." />}
            {tab === "giving" && <FeaturePanel icon={QrCode} title="Giving Management" description="Kelola hadiah dan transaksi tamu dari workspace Guestbook Digital." />}

            {message && <div className="mt-5 rounded-2xl border border-[#E60087]/20 bg-[#fff1fa] px-4 py-3 text-xs text-[#9a0060]">{message}</div>}
            {loading && <p className="fixed bottom-5 right-5 rounded-full bg-black px-4 py-2 text-[10px] text-white">Memuat data tamu...</p>}
          </div>
        </main>
      </div>

      {issuedQr && <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={() => setIssuedQr(null)}><div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl" onClick={(e) => e.stopPropagation()}><button onClick={() => setIssuedQr(null)} className="float-right rounded-full p-2 hover:bg-black/5"><X className="h-4 w-4" /></button><p className="text-[10px] uppercase tracking-[0.2em] text-[#E60087]">QR tamu diterbitkan</p><h2 className="mt-2 font-serif text-3xl">{issuedQr.guest.name}</h2><p className="mt-2 text-xs text-black/45">Tamu ini ditemukan di daftar undangan. QR ini dapat dipakai sebagai tiket masuk.</p><div className="mx-auto mt-5 w-fit rounded-2xl border border-black/10 bg-white p-3"><img src={qrImageUrl(issuedQr.token)} alt={`QR ${issuedQr.guest.name}`} width={280} height={280} /></div><button onClick={() => window.open(qrImageUrl(issuedQr.token), "_blank", "noopener,noreferrer")} className="mt-5 rounded-xl bg-black px-5 py-3 text-xs font-medium text-white">Buka QR ukuran besar</button></div></div>}
    </div>
  );
}

function CheckinPanel({ scannerOpen, scannerError, videoRef, scanInput, setScanInput, startScanner, stopScanner, checkInWithQr, checkingIn, checkedIn, guests, attendancePercent, selectedGuest, message }: { scannerOpen: boolean; scannerError: string; videoRef: React.RefObject<HTMLVideoElement | null>; scanInput: string; setScanInput: (value: string) => void; startScanner: () => void; stopScanner: () => void; checkInWithQr: (value: string) => void; checkingIn: boolean; checkedIn: Guest[]; guests: Guest[]; attendancePercent: number; selectedGuest: Guest | null; message: string }) {
  return <section className="space-y-6"><div><p className="text-[10px] uppercase tracking-[0.22em] text-[#E60087]">Hari-H Guest Check-in</p><h1 className="mt-2 font-serif text-3xl sm:text-4xl">QR adalah tiket masuk</h1><p className="mt-2 max-w-2xl text-sm text-black/50">Scan QR resmi tamu. Pencarian nama tidak bisa melakukan check-in; pencarian hanya tersedia di Daftar Tamu Diundang untuk verifikasi dan penerbitan QR.</p></div><div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]"><section className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm sm:p-7"><div className="relative overflow-hidden rounded-2xl bg-[#151315]">{scannerOpen && !scannerError ? <div className="relative aspect-[4/3]"><video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" /><div className="pointer-events-none absolute inset-0 grid place-items-center"><div className="h-52 w-52 rounded-3xl border-2 border-[#E60087] shadow-[0_0_0_999px_rgba(0,0,0,.25)]" /></div><button onClick={stopScanner} className="absolute right-3 top-3 rounded-full bg-black/60 p-2 text-white"><X className="h-4 w-4" /></button></div> : <div className="flex aspect-[4/3] flex-col items-center justify-center px-8 text-center text-white"><div className="mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-[#E60087]/15 text-[#ff57b7]"><Camera className="h-8 w-8" /></div><h2 className="font-serif text-2xl">Siap menerima tamu?</h2><p className="mt-2 max-w-sm text-xs leading-5 text-white/50">Gunakan kamera belakang perangkat untuk memindai QR.</p>{scannerError && <p className="mt-4 max-w-sm text-xs text-pink-300">{scannerError}</p>}<button onClick={startScanner} className="mt-5 rounded-xl bg-[#E60087] px-5 py-3 text-xs font-medium text-white">Buka kamera scanner</button></div>}</div><div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]"><input value={scanInput} onChange={(e) => setScanInput(e.target.value)} placeholder="Tempel token / link QR resmi" className="w-full rounded-xl border border-black/10 bg-[#fafafa] py-3 px-4 text-xs outline-none focus:border-[#E60087]" /><button onClick={() => checkInWithQr(scanInput)} disabled={!scanInput.trim() || checkingIn} className="rounded-xl bg-[#E60087] px-5 py-3 text-xs font-medium text-white disabled:opacity-40">Verifikasi QR</button></div></section><section className="space-y-5"><div className="rounded-3xl border border-black/10 bg-white p-6"><div className="flex items-center justify-between"><div><p className="text-[10px] uppercase tracking-[0.18em] text-black/40">Status hari-H</p><p className="mt-1 font-serif text-2xl">{checkedIn.length} / {guests.length} tamu</p></div><CheckCircle2 className="h-7 w-7 text-[#E60087]" /></div><div className="mt-5 h-2 overflow-hidden rounded-full bg-black/5"><div className="h-full rounded-full bg-[#E60087]" style={{ width: `${attendancePercent}%` }} /></div><p className="mt-2 text-[10px] text-black/40">{attendancePercent}% sudah check-in</p></div><div className="rounded-3xl border border-amber-200 bg-amber-50 p-6"><p className="text-xs font-semibold text-amber-900">Tamu datang tanpa RSVP?</p><p className="mt-2 text-[10px] leading-5 text-amber-800/70">Jangan check-in langsung. Buka <b>Daftar Tamu Diundang</b>, cari namanya, pastikan memang diundang, lalu klik <b>Buat QR</b>. Setelah QR muncul, scan QR tersebut di sini.</p></div>{selectedGuest && <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6"><p className="text-[10px] uppercase tracking-[0.2em] text-emerald-600">Check-in berhasil</p><h2 className="mt-2 font-serif text-3xl text-emerald-900">Selamat datang, {selectedGuest.name}</h2><p className="mt-2 text-xs text-emerald-700">QR valid dan kehadiran sudah tercatat.</p></div>}</section></div></section>;
}

function Stat({ label, value }: { label: string; value: number }) { return <div className="rounded-2xl border border-black/10 bg-white p-5"><p className="text-[10px] text-black/45">{label}</p><p className="mt-2 font-serif text-3xl">{value}</p></div>; }
function RsvpBadge({ status }: { status: string }) { const label = status === "ATTENDING" ? "Hadir" : status === "NOT_ATTENDING" ? "Tidak hadir" : "Belum konfirmasi"; return <span className="rounded-full bg-black/5 px-2.5 py-1 text-[9px]">{label}</span>; }
function GuestTable({ guests, empty }: { guests: Guest[]; empty: string }) { return <section className="overflow-hidden rounded-2xl border border-black/10 bg-white"><div className="border-b border-black/10 px-5 py-4 text-xs font-semibold">Tamu ({guests.length})</div>{guests.length === 0 ? <div className="p-10 text-center text-xs text-black/40">{empty}</div> : <div className="divide-y divide-black/5">{guests.map((guest) => <div key={guest.id} className="flex items-center justify-between gap-4 px-5 py-4"><div><p className="text-sm font-medium">{guest.name}</p><p className="mt-1 text-[10px] text-black/40">{guest.phone || "Nomor tidak tersedia"} · +{guest.plusOnes} pendamping</p></div><span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[9px] text-emerald-600">CHECKED IN</span></div>)}</div>}</section>; }
function FeaturePanel({ icon: Icon, title, description }: { icon: typeof Gift; title: string; description: string }) { return <section className="grid min-h-[520px] place-items-center rounded-3xl border border-black/10 bg-white p-8 text-center"><div className="max-w-lg"><div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#fff1fa] text-[#E60087]"><Icon className="h-8 w-8" /></div><p className="mt-6 text-[10px] uppercase tracking-[0.22em] text-[#E60087]">Usher feature</p><h1 className="mt-2 font-serif text-4xl">{title}</h1><p className="mt-4 text-sm leading-6 text-black/50">{description}</p></div></section>; }
