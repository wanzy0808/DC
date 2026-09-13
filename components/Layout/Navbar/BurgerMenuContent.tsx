"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarCheck, ChevronDown, CircleHelp, LayoutTemplate, LogIn, Package, UserPlus, BookOpen, ArrowUpRight } from "lucide-react";
import { SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import RegisterDialog from "./RegisterDialog";

interface BurgerMenuContentProps { isDarkMode: boolean; }

const products = [
  { href: "/wedding-planner", label: "Wedding Planner", icon: CalendarCheck, description: "Rencana & koordinasi acara" },
  { href: "/d-invitation", label: "Digital Invitation", icon: LayoutTemplate, description: "Undangan, RSVP & publikasi" },
  { href: "/guestbook", label: "Guestbook Digital", icon: BookOpen, description: "Tamu, QR & check-in" },
];

export default function BurgerMenuContent({ isDarkMode }: BurgerMenuContentProps) {
  const [isProductOpen, setIsProductOpen] = useState(true);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const itemClass = "flex w-full items-center justify-between rounded-2xl bg-[var(--card)]/60 p-4 text-left transition duration-300 hover:-translate-y-0.5 hover:bg-[var(--secondary)]";
  void isDarkMode;

  return (
    <SheetContent side="right" className="flex w-full flex-col justify-between bg-[var(--background)] p-6 text-[var(--foreground)] sm:w-[430px]">
      <div>
        <SheetHeader className="mb-8 text-left">
          <span className="font-[family-name:var(--font-dc-mono)] text-[10px] uppercase tracking-[0.28em] text-[var(--primary)]">Navigation / 01</span>
          <SheetTitle className="mt-2 font-[family-name:var(--font-dc-heading)] text-3xl font-normal text-[var(--foreground)]">Jelajahi DC Organizer</SheetTitle>
          <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">Pindah halaman dan pilih layanan tanpa kehilangan konteks perjalanan acaramu.</p>
        </SheetHeader>
        <nav className="space-y-3 font-[family-name:var(--font-dc-sans)] text-sm">
          <SheetClose nativeButton={false} render={<Link href="/login" className={itemClass} />}><span className="flex items-center gap-3"><LogIn className="h-5 w-5 text-[var(--primary)]" />Masuk ke workspace</span><ArrowUpRight className="h-4 w-4 opacity-50" /></SheetClose>
          <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}><DialogTrigger className={itemClass}><span className="flex items-center gap-3"><UserPlus className="h-5 w-5 text-[var(--primary)]" />Buat akun baru</span><span className="font-[family-name:var(--font-dc-mono)] text-xs text-[var(--primary)]">JOIN</span></DialogTrigger><RegisterDialog isDarkMode={isDarkMode} onSwitchToLogin={() => setIsRegisterOpen(false)} /></Dialog>
          <div className="overflow-hidden rounded-2xl bg-[var(--card)]/45">
            <button type="button" onClick={() => setIsProductOpen((open) => !open)} className="flex w-full items-center justify-between p-4 text-left transition hover:bg-[var(--secondary)]"><span className="flex items-center gap-3"><Package className="h-5 w-5 text-[var(--primary)]" />Layanan</span><ChevronDown className={`h-4 w-4 transition-transform ${isProductOpen ? "rotate-180" : ""}`} /></button>
            {isProductOpen && <div className="space-y-1 p-2">{products.map(({ href, label, icon: Icon, description }) => <SheetClose key={href} nativeButton={false} render={<Link href={href} className="group flex items-center justify-between rounded-xl p-3 transition hover:bg-[var(--secondary)]" />}><span className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--secondary)] text-[var(--primary)]"><Icon className="h-4 w-4" /></span><span><span className="block font-semibold">{label}</span><span className="block text-xs text-[var(--muted-foreground)]">{description}</span></span></span><ArrowUpRight className="h-4 w-4 opacity-30 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" /></SheetClose>)}</div>}
          </div>
          <SheetClose nativeButton={false} render={<Link href="/packages" className={itemClass} />}><span className="flex items-center gap-3"><Package className="h-5 w-5 text-[var(--primary)]" />Paket & harga</span><ArrowUpRight className="h-4 w-4 opacity-50" /></SheetClose>
          <SheetClose nativeButton={false} render={<Link href="/template-design" className={itemClass} />}><span className="flex items-center gap-3"><LayoutTemplate className="h-5 w-5 text-[var(--primary)]" />Template</span><ArrowUpRight className="h-4 w-4 opacity-50" /></SheetClose>
          <SheetClose nativeButton={false} render={<Link href="/help" className={itemClass} />}><span className="flex items-center gap-3"><CircleHelp className="h-5 w-5 text-[var(--primary)]" />Bantuan</span><ArrowUpRight className="h-4 w-4 opacity-50" /></SheetClose>
        </nav>
      </div>
      <div className="flex items-center justify-between pt-6 font-[family-name:var(--font-dc-mono)] text-[10px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]"><span>DC Organizer</span><span>Wedding & Event</span></div>
    </SheetContent>
  );
}
