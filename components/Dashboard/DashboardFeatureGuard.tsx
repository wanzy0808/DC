"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { Eye, LockKeyhole, ScanLine, X } from "lucide-react";

type Access = { digitalInvitation: boolean; guestbook: boolean; bundle: boolean };

export default function DashboardFeatureGuard({ children }: { children: ReactNode }) {
  const [access, setAccess] = useState<Access>({ digitalInvitation: false, guestbook: false, bundle: false });
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeType, setUpgradeType] = useState<"guestbook" | "digital">("guestbook");

  useEffect(() => {
    fetch("/api/dashboard/access", { cache: "no-store" }).then(r => r.ok ? r.json() : null).then(data => data && setAccess(data)).catch(() => undefined);
    function onClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null; const button = target?.closest("button"); if (!button) return;
      const text = button.textContent?.replace(/\s+/g, " ").trim().toLowerCase() ?? "";
      const needsGuestbook = text.includes("tamu undangan") || text.includes("kelola tamu") || text.includes("tambah tamu");
      const needsDigital = text.includes("bagikan undangan") || text === "bagikan" || text.includes("publikasi");
      if ((!access.guestbook && needsGuestbook) || (!access.digitalInvitation && needsDigital)) { event.preventDefault(); event.stopPropagation(); setUpgradeType(!access.guestbook && needsGuestbook ? "guestbook" : "digital"); setUpgradeOpen(true); }
    }
    document.addEventListener("click", onClick, true); return () => document.removeEventListener("click", onClick, true);
  }, [access.digitalInvitation, access.guestbook]);

  return <>
    {children}
    <Link href="/dashboard/editor" className="fixed bottom-5 left-5 z-40 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-3 text-xs font-medium shadow-xl transition hover:-translate-y-0.5"><Eye className="h-4 w-4 text-primary"/>Pratinjau undangan</Link>
    <Link href="/dashboard/usher" className={`fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full px-4 py-3 text-xs font-medium text-white shadow-xl transition hover:-translate-y-0.5 ${access.guestbook ? "bg-primary" : "bg-dc-maroon"}`}>{access.guestbook ? <ScanLine className="h-4 w-4" /> : <LockKeyhole className="h-4 w-4" />}Usher App{!access.guestbook && " · Upgrade"}</Link>
    {!access.guestbook && <div className="fixed bottom-20 right-5 z-30 hidden rounded-xl border border-border bg-card px-3 py-2 text-[9px] opacity-60 shadow-lg sm:block">Tamu &amp; Usher App tersedia di Guestbook Digital</div>}
    {upgradeOpen && <div className="fixed inset-0 z-[110] grid place-items-center bg-black/40 p-4 backdrop-blur-sm" onMouseDown={() => setUpgradeOpen(false)}><div className="w-full max-w-md rounded-3xl border border-border bg-card p-7 shadow-2xl" onMouseDown={e => e.stopPropagation()}><div className="flex items-start justify-between"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary"><LockKeyhole className="h-5 w-5"/></div><button type="button" onClick={() => setUpgradeOpen(false)} className="rounded-full p-2 hover:bg-black/5 dark:hover:bg-white/10"><X className="h-4 w-4"/></button></div><p className="mt-5 text-[10px] font-semibold uppercase tracking-[.2em] text-primary">Upgrade paket</p><h2 className="mt-2 font-[var(--font-cinzel)] text-2xl">{upgradeType === "guestbook" ? "Kelola tamu dengan lebih lengkap" : "Publikasikan undanganmu"}</h2><p className="mt-2 text-sm leading-6 opacity-60">{upgradeType === "guestbook" ? "Daftar tamu, nomor meja, kursi, Usher App, QR check-in, dan realtime attendance termasuk dalam Guestbook Digital." : "Paket Undangan Digital diperlukan untuk membagikan undangan ke tamu dan mengaktifkan halaman publik."}</p><Link href="/packages" onClick={() => setUpgradeOpen(false)} className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-primary px-5 py-3 text-xs font-medium text-primary-foreground">Lihat paket</Link></div></div>}
  </>;
}
