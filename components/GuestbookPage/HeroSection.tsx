import Link from "next/link";
import { ArrowRight, QrCode, Users, Radio } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="grid gap-10 lg:grid-cols-12 lg:items-end">
      <div className="lg:col-span-8">
        <p className="text-xs font-mono font-semibold uppercase tracking-[0.24em] text-[var(--primary)]">[ DIGITAL GUESTBOOK SYSTEM ]</p>
        <h1 className="mt-4 max-w-5xl font-[family-name:var(--font-dc-heading)] text-4xl leading-[1.05] md:text-6xl lg:text-7xl">Tamu datang dengan tenang. <span className="font-serif italic opacity-80">Tim Anda tetap terkendali.</span></h1>
        <p className="mt-6 max-w-2xl text-sm leading-7 text-[var(--muted-foreground)] md:text-base">Kelola undangan, verifikasi tamu, QR check-in, seating, greeting, dan attendance dari satu sistem Guestbook Digital DC Wedding.</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/packages" className="inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-white hover:brightness-110">Lihat paket <ArrowRight className="h-4 w-4" /></Link>
          <Link href="/d-invitation" className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.15em]">Lihat Undangan Digital</Link>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 lg:col-span-4">
        {[{ icon: QrCode, label: "QR Entry" }, { icon: Users, label: "Guest Data" }, { icon: Radio, label: "Realtime" }].map(({ icon: Icon, label }) => <div key={label} className="rounded-2xl border border-[var(--border)] bg-[var(--card)]/70 p-4 text-center"><Icon className="mx-auto h-5 w-5 text-[var(--primary)]" /><p className="mt-3 text-[10px] font-mono uppercase tracking-wider text-[var(--muted-foreground)]">{label}</p></div>)}
      </div>
    </section>
  );
}
