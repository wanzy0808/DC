"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  CalendarCheck,
  ChevronDown,
  CircleHelp,
  LayoutTemplate,
  LogIn,
  Package,
  UserPlus,
} from "lucide-react";
import { SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import RegisterDialog from "./RegisterDialog";

interface BurgerMenuContentProps {
  isDarkMode: boolean;
}

const products = [
  { href: "/wedding-planner", label: "Wedding Planner", icon: CalendarCheck, description: "Rencana & koordinasi acara" },
  { href: "/d-invitation", label: "Digital Invitation", icon: LayoutTemplate, description: "Undangan, RSVP & publikasi" },
  { href: "/guestbook", label: "Guestbook Digital", icon: BookOpen, description: "Tamu, QR & check-in" },
];

export default function BurgerMenuContent({ isDarkMode }: BurgerMenuContentProps) {
  const [isProductOpen, setIsProductOpen] = useState(true);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const itemClass =
    "flex min-h-14 w-full items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--card)]/55 px-4 py-3 text-left transition duration-300 hover:-translate-y-0.5 hover:border-[var(--primary)]/25 hover:bg-[var(--secondary)]";
  void isDarkMode;

  return (
    <SheetContent
      side="right"
      className="flex w-[min(92vw,430px)] flex-col overflow-hidden border-l border-[var(--border)] bg-[var(--background)]/95 p-0 text-[var(--foreground)] shadow-2xl backdrop-blur-xl sm:max-w-none"
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pb-5 pt-7 sm:px-6">
        <SheetHeader className="mb-6 shrink-0 p-0 pr-10 text-left">
          <span className="font-[family-name:var(--font-dc-mono)] text-[10px] uppercase tracking-[0.28em] text-[var(--primary)]">
            Navigation / 01
          </span>
          <SheetTitle className="mt-2 font-[family-name:var(--font-dc-heading)] text-3xl font-normal leading-tight text-[var(--foreground)]">
            Jelajahi DC Organizer
          </SheetTitle>
          <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--muted-foreground)]">
            Pindah halaman dan pilih layanan tanpa kehilangan konteks perjalanan acaramu.
          </p>
        </SheetHeader>

        <nav className="space-y-3 font-[family-name:var(--font-dc-body)] text-sm" aria-label="Navigasi utama">
          <SheetClose
            nativeButton={false}
            render={
              <Link href="/login" className={itemClass} />
            }
          >
            <span className="flex items-center gap-3">
              <LogIn className="h-5 w-5 text-[var(--primary)]" />
              Masuk ke workspace
            </span>
            <ArrowUpRight className="h-4 w-4 opacity-50" />
          </SheetClose>

          <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
            <DialogTrigger className={itemClass}>
              <span className="flex items-center gap-3">
                <UserPlus className="h-5 w-5 text-[var(--primary)]" />
                Buat akun baru
              </span>
              <span className="font-[family-name:var(--font-dc-mono)] text-xs text-[var(--primary)]">JOIN</span>
            </DialogTrigger>
            <RegisterDialog isDarkMode={isDarkMode} onSwitchToLogin={() => setIsRegisterOpen(false)} />
          </Dialog>

          <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]/40">
            <button
              type="button"
              aria-expanded={isProductOpen}
              onClick={() => setIsProductOpen((open) => !open)}
              className="flex min-h-14 w-full items-center justify-between px-4 py-3 text-left transition hover:bg-[var(--secondary)]"
            >
              <span className="flex items-center gap-3">
                <Package className="h-5 w-5 text-[var(--primary)]" />
                Layanan
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform ${isProductOpen ? "rotate-180" : ""}`} />
            </button>

            {isProductOpen && (
              <div className="space-y-1 border-t border-[var(--border)] p-2">
                {products.map(({ href, label, icon: Icon, description }) => (
                  <SheetClose
                    key={href}
                    nativeButton={false}
                    render={
                      <Link
                        href={href}
                        className="group flex min-h-14 items-center justify-between rounded-xl px-3 py-2.5 transition hover:bg-[var(--secondary)]"
                      />
                    }
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--secondary)] text-[var(--primary)]">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-semibold">{label}</span>
                        <span className="block truncate text-xs text-[var(--muted-foreground)]">{description}</span>
                      </span>
                    </span>
                    <ArrowUpRight className="h-4 w-4 shrink-0 opacity-30 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" />
                  </SheetClose>
                ))}
              </div>
            )}
          </div>

          <SheetClose nativeButton={false} render={<Link href="/packages" className={itemClass} />}>
            <span className="flex items-center gap-3"><Package className="h-5 w-5 text-[var(--primary)]" />Paket & harga</span>
            <ArrowUpRight className="h-4 w-4 opacity-50" />
          </SheetClose>
          <SheetClose nativeButton={false} render={<Link href="/template-design" className={itemClass} />}>
            <span className="flex items-center gap-3"><LayoutTemplate className="h-5 w-5 text-[var(--primary)]" />Template</span>
            <ArrowUpRight className="h-4 w-4 opacity-50" />
          </SheetClose>
          <SheetClose nativeButton={false} render={<Link href="/help" className={itemClass} />}>
            <span className="flex items-center gap-3"><CircleHelp className="h-5 w-5 text-[var(--primary)]" />Bantuan</span>
            <ArrowUpRight className="h-4 w-4 opacity-50" />
          </SheetClose>
        </nav>
      </div>

      <div className="flex shrink-0 items-center justify-between border-t border-[var(--border)] px-5 py-4 font-[family-name:var(--font-dc-mono)] text-[10px] uppercase tracking-[0.16em] text-[var(--muted-foreground)] sm:px-6">
        <span>DC Organizer</span>
        <span>Wedding & Event</span>
      </div>
    </SheetContent>
  );
}
