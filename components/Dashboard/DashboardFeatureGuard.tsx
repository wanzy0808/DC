"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import DashboardAccessNotice from "@/components/Dashboard/DashboardAccessNotice";

type Access = { digitalInvitation: boolean; guestbook: boolean; bundle: boolean };

export default function DashboardFeatureGuard({ children }: { children: ReactNode }) {
  const [access, setAccess] = useState<Access>({ digitalInvitation: false, guestbook: false, bundle: false });
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeType, setUpgradeType] = useState<"guestbook" | "digital">("guestbook");

  useEffect(() => {
    fetch("/api/dashboard/access", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => data && setAccess(data))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      const button = target?.closest("button");
      if (!button) return;
      const text = button.textContent?.replace(/\s+/g, " ").trim().toLowerCase() ?? "";
      const needsGuestbook = text.includes("tamu undangan") || text.includes("manajemen tamu") || text.includes("kelola tamu") || text.includes("tambah tamu");
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
      <Dialog open={upgradeOpen} onOpenChange={setUpgradeOpen}>
        <DialogContent showCloseButton={false} className="max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-[10px] border border-border bg-background p-6 sm:p-8">
          <DialogTitle className="sr-only">Upgrade paket</DialogTitle>
          <DialogDescription className="sr-only">
            Pilih paket untuk membuka fitur yang diperlukan.
          </DialogDescription>
          <DialogClose render={<Button size="icon-lg" className="absolute right-4 top-4" aria-label="Tutup pemberitahuan upgrade" />}>
            <X className="size-4" aria-hidden="true" />
          </DialogClose>
          <DashboardAccessNotice
            label="Upgrade paket"
            title={upgradeType === "guestbook" ? "Kelola tamu dengan lebih lengkap" : "Publikasikan undanganmu"}
            description={upgradeType === "guestbook"
              ? "Daftar tamu, nomor meja, kursi, Usher App, QR check-in, dan realtime attendance termasuk dalam Guestbook Digital."
              : "Paket Undangan Digital diperlukan untuk membagikan undanganmu ke tamu dan mengaktifkan halaman publik."}
          >
            <Button asChild size="lg">
              <Link href="/packages" onClick={() => setUpgradeOpen(false)}>Lihat paket</Link>
            </Button>
          </DashboardAccessNotice>
        </DialogContent>
      </Dialog>
    </>
  );
}
