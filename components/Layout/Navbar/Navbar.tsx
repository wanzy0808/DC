"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/Theme/ThemeContext";
import ThemeToggle from "@/components/Theme/ThemeToggle";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import BurgerMenuContent from "@/components/Layout/Navbar/BurgerMenuContent";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const pathname = usePathname();
  const { isDarkMode } = useTheme();
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) return null;

  return (
    <header className="dc-navbar sticky top-0 z-50 w-full border-b border-[color-mix(in_srgb,var(--primary)_8%,transparent)] text-[var(--foreground)] transition-colors duration-500">
      <div className="mx-auto flex w-[90vw] max-w-[1320px] items-center justify-between px-0 py-4">
        <Link href="/" className="group block">
          <div className="font-[family-name:var(--font-dc-heading)] text-2xl font-bold tracking-[0.13em] leading-none text-[var(--primary)] transition-transform group-hover:scale-[1.01] sm:text-3xl">
            DC Organizer
          </div>
          <div className="mt-1 font-[family-name:var(--font-dc-mono)] text-[8px] uppercase tracking-[0.22em] text-[var(--muted-foreground)]">Wedding operating system</div>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <Sheet>
            <SheetTrigger render={<Button variant="default" size="icon" aria-label="Buka menu navigasi" className="h-11 w-11 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm transition hover:-translate-y-0.5 hover:bg-[var(--dc-rose-wood-dark)]"><Menu className="h-5 w-5" /></Button>} />
            <BurgerMenuContent isDarkMode={isDarkMode} />
          </Sheet>
        </div>
      </div>
    </header>
  );
}
