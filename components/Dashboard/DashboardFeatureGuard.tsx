"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { LockKeyhole, ScanLine, X } from "lucide-react";

type Access = { digitalInvitation: boolean; guestbook: boolean; bundle: boolean };

export default function DashboardFeatureGuard({ children }: { children: ReactNode }) {
  const [access, setAccess] = useState<Access>({ digitalInvitation: false, guestbook: false, bundle: false });
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeType, setUpgradeType] = useState<"guestbook" | "digital">("guestbook");

  useEffect(() => {
    fetch("/api/dashboard/access", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => data && setAccess(data))
      .catch(() => undefined);

    function onClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      const button = target?.closest("button");
      if (!button) return;
      const text = button.textContent?.replace(/\s+/g, " ").trim().toLowerCase() ?? "";
      const needsGuestbook = text.includes("tamu undangan") || text.includes("kelola tamu") || text.includes("tambah tamu");
      const needsDigital = text.includes("bagikan undangan") || text === "bagikan" || text.includes("publikasi");
      if ((!access.guestbook && needsGuestbook) || (!access.digitalInvitation && needsDigital)) {
        event.preventDefault();
        event.stopPropagation();
        setUpgradeType(!access.guestbook && needsGuestbook ? "guestbook" : "digital");
        setUpgradeOpen(true);
      }
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [access.digitalInvitation, access.guestbook]);

  return (
    <>
      {children}
      <Link
        href="/dashboard/usher"
        className={`fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full px-4 py-3 text-xs font-medium text-white shadow-xl transition hover:-translate-y-0.5 ${access.guestbook ? "bg-[#E60087]" : "bg-[#7A1C25]"}`}
      >
        {access.guestbook ? <ScanLine className="h-4 w-4" /> : <LockKeyhole className="h-4 w-4" />}
        Usher App{!access.guestbook && " · Upgrade"}
      </Link>

      {!access.guestbook && (
        <div className="fixed bottom-20 right-5 z-30 hidden rounded-xl border border-black/10 bg-white px-3 py-2 text-[9px] text-black/50 shadow-lg sm:block">
          Tamu &amp; Usher App tersedia di Guestbook Digital
        </div>
      )}

      {upgradeOpen && (
        <div className="fixed inset-0 z-[110] grid place-items-center bg-black/40 p-4 backdrop-blur-sm" onMouseDown={() => setUpgradeOpen(false)}>
          <div className="w-full max-w-md rounded-3xl border border-black/10 bg-[#fffdfa] p-7 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#E60087]/10 text-[#E60087]"><LockKeyhole className="h-5 w-5" /></div>
              <button type="button" onClick={() => setUpgradeOpen(false)} className="rounded-full p-2 hover:bg-black/5"><X className="h-4 w-4" /></button>
            </div>
            <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#E60087]">Upgrade paket</p>
            <h2 className="mt-2 font-serif text-2xl">{upgradeType === "guestbook" ? "Kelola tamu dengan lebih lengkap" : "Publikasikan undanganmu"}</h2>
            <p className="mt-2 text-sm leading-6 text-black/50">
              {upgradeType === "guestbook"
                ? "Daftar tamu, nomor meja, kursi, Usher App, QR check-in, dan realtime attendance termasuk dalam Guestbook Digital."
                : "Paket Undangan Digital diperlukan untuk membagikan undangan ke tamu dan mengaktifkan halaman publik."}
            </p>
            <Link href="/packages" onClick={() => setUpgradeOpen(false)} className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-[#E60087] px-5 py-3 text-xs font-medium text-white">Lihat paket</Link>
          </div>
        </div>
      )}
    </>
  );
}
