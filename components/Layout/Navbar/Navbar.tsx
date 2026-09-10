"use client";

import Link from "next/link";
import { useTheme } from "@/components/Theme/ThemeContext";
import ThemeToggle from "@/components/Theme/ThemeToggle";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import BurgerMenuContent from "@/components/Layout/Navbar/BurgerMenuContent";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { isDarkMode } = useTheme();
  const accentColor = isDarkMode ? "text-dc-pink-light" : "text-dc-maroon";

  return (
    <header className="dc-navbar sticky top-0 z-50 w-full text-[var(--foreground)] transition-colors duration-500">
      <div className="mx-auto flex w-[75vw] items-center justify-between px-0 py-5 relative">
        <Link href="/" className="block">
          <div className={`font-[family-name:var(--font-dc-heading)] text-2xl font-bold tracking-[0.2em] ${accentColor}`}>
            D C
          </div>
          <span className="mt-0.5 block font-[family-name:var(--font-dc-sans)] text-[8px] uppercase tracking-[0.35em] opacity-50 md:text-[9px]">
            WEDDING
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="default"
                  size="icon"
                  aria-label="Buka menu navigasi"
                  className="h-11 w-11 rounded-full bg-primary text-primary-foreground hover:bg-primary/85"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              }
            />
            <BurgerMenuContent isDarkMode={isDarkMode} />
          </Sheet>
        </div>
      </div>
    </header>
  );
}
