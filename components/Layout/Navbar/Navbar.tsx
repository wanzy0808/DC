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

  const accentColor = isDarkMode ? "text-dc-pink-light" : "text-dc-maroon";

  return (
    <header className="dc-navbar sticky top-0 z-50 w-full text-[var(--foreground)] transition-colors duration-500">
      <div className="mx-auto flex w-[75vw] items-center justify-between px-0 py-5 relative">
        <Link href="/" className="block">
          <div className={`font-[family-name:var(--font-dc-heading)] text-3xl font-bold tracking-[0.18em] leading-none ${accentColor} sm:text-4xl`}>
            DC Wedding
          </div>
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
