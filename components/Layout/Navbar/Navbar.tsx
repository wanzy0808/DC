"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme, ThemeToggle } from "@/components/Theme/ThemeContext";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import BurgerMenuContent from "@/components/Layout/Navbar/BurgerMenuContent";
import LanguageToggle from "@/components/I18n/LanguageToggle";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const pathname = usePathname();
  const { isDarkMode } = useTheme();
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) return null;

  return (
    <header className="dc-navbar relative z-50 w-full bg-background text-foreground transition-colors duration-500">
      <div className="mx-auto flex w-[92vw] max-w-[1400px] items-center justify-between py-5">
        <Link href="/" className="group block min-w-0">
          <div className="font-[family-name:var(--font-dc-heading)] text-2xl font-bold leading-none tracking-[0.12em] text-primary transition-transform group-hover:scale-[1.01] sm:text-3xl">DC Organizer</div>
          <div className="mt-1 font-[family-name:var(--font-dc-mono)] text-[8px] uppercase tracking-[0.22em] text-foreground/60">Your best consultant for wedding & event</div>
        </Link>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <LanguageToggle />
          <Sheet>
            <SheetTrigger render={<Button variant="default" size="icon" aria-label="Buka menu navigasi" className="h-11 w-11 rounded-none shadow-none"><Menu className="h-5 w-5" /></Button>} />
            <BurgerMenuContent isDarkMode={isDarkMode} />
          </Sheet>
        </div>
      </div>
    </header>
  );
}
