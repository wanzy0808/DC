"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CalendarCheck,
  ChevronDown,
  CircleHelp,
  LayoutTemplate,
  LogIn,
  Package,
  UserPlus,
  BookOpen,
} from "lucide-react";
import { SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import RegisterDialog from "./RegisterDialog";

interface BurgerMenuContentProps {
  isDarkMode: boolean;
}

const products = [
  { href: "/wedding-planner", label: "Wedding Planner", icon: CalendarCheck },
  { href: "/d-invitation", label: "Digital Invitation", icon: LayoutTemplate },
  { href: "/guestbook", label: "Guestbook Digital", icon: BookOpen },
];

export default function BurgerMenuContent({ isDarkMode }: BurgerMenuContentProps) {
  const [isProductOpen, setIsProductOpen] = useState(true);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const accent = isDarkMode ? "text-dc-pink-light" : "text-dc-maroon";
  const border = "border-[var(--border)]";
  const hover = "hover:bg-[var(--muted)]";

  const itemClass = `flex w-full items-center justify-between rounded-xl border ${border} p-3.5 text-left ${hover} transition`;

  return (
    <SheetContent
      side="right"
      className="flex w-full flex-col justify-between border-l bg-[var(--background)] p-6 text-[var(--foreground)] sm:w-[400px]"
    >
      <div>
        <SheetHeader className="mb-8 text-left">
          <span className={`font-mono text-[10px] uppercase tracking-[0.3em] ${accent}`}>
            [ NAVIGATION MENU ]
          </span>
          <SheetTitle className="font-[family-name:var(--font-dc-heading)] text-2xl font-normal text-[var(--foreground)]">
            Pilihan Menu
          </SheetTitle>
        </SheetHeader>

        <nav className="space-y-3 font-[family-name:var(--font-dc-sans)] text-sm">
          {/* 1. Masuk */}
          <SheetClose
            render={
              <Link href="/login" className={itemClass} />
            }
          >
            <span className="flex items-center gap-3">
              <LogIn className={`h-5 w-5 ${accent}`} />
              Masuk
            </span>
            <span className="font-mono text-xs opacity-50">→</span>
          </SheetClose>

          {/* 2. Daftar */}
          <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
            <DialogTrigger className={itemClass}>
              <span className="flex items-center gap-3">
                <UserPlus className={`h-5 w-5 ${accent}`} />
                Daftar
              </span>
              <span className="font-mono text-xs opacity-50">+</span>
            </DialogTrigger>
            <RegisterDialog
              isDarkMode={isDarkMode}
              onSwitchToLogin={() => setIsRegisterOpen(false)}
            />
          </Dialog>

          {/* 3. Produk */}
          <div className={`overflow-hidden rounded-xl border ${border}`}>
            <button
              type="button"
              onClick={() => setIsProductOpen((open) => !open)}
              className={`flex w-full items-center justify-between p-3.5 text-left ${hover}`}
            >
              <span className="flex items-center gap-3">
                <Package className={`h-5 w-5 ${accent}`} />
                Produk
              </span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${isProductOpen ? "rotate-180" : ""}`}
              />
            </button>
            {isProductOpen && (
              <div className={`space-y-1 border-t ${border} p-2`}>
                {products.map(({ href, label, icon: Icon }) => (
                  <SheetClose
                    key={href}
                    render={
                      <Link
                        href={href}
                        className={`flex items-center justify-between rounded-lg px-4 py-2.5 text-sm ${hover} transition`}
                      />
                    }
                  >
                    <span className="flex items-center gap-3">
                      <Icon className={`h-4 w-4 ${accent}`} />
                      {label}
                    </span>
                    <span className="text-xs opacity-40">→</span>
                  </SheetClose>
                ))}
              </div>
            )}
          </div>

          {/* 4. Package — sengaja berdiri sendiri, bukan bagian Produk */}
          <SheetClose
            render={
              <Link href="/packages" className={itemClass} />
            }
          >
            <span className="flex items-center gap-3">
              <Package className={`h-5 w-5 ${accent}`} />
              Package
            </span>
            <span className="font-mono text-xs opacity-50">→</span>
          </SheetClose>

          {/* 5. Template */}
          <SheetClose
            render={
              <Link href="/template-design" className={itemClass} />
            }
          >
            <span className="flex items-center gap-3">
              <LayoutTemplate className={`h-5 w-5 ${accent}`} />
              Template
            </span>
            <span className="font-mono text-xs opacity-50">→</span>
          </SheetClose>

          {/* 6. Bantuan */}
          <SheetClose
            render={
              <Link href="/help" className={itemClass} />
            }
          >
            <span className="flex items-center gap-3">
              <CircleHelp className={`h-5 w-5 ${accent}`} />
              Bantuan
            </span>
            <span className="font-mono text-xs opacity-50">→</span>
          </SheetClose>
        </nav>
      </div>

      <div className={`flex items-center justify-between border-t ${border} pt-6 font-mono text-xs opacity-60`}>
        <span>DC Wedding</span>
        <span>v1.0</span>
      </div>
    </SheetContent>
  );
}
