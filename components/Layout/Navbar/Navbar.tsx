"use client";

import React from "react";
import Link from "next/link";
import { useTheme } from "@/components/Theme/ThemeContext";
import ThemeToggle from "@/components/Theme/ThemeToggle";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import BurgerMenuContent from "@/components/Layout/Navbar/BurgerMenuContent";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { isDarkMode } = useTheme();

  const accentColor = isDarkMode ? "text-[#C26B70]" : "text-[#7A1C25]";

  return (
    <header
      className={`w-full transition-colors duration-500 sticky top-0 z-50 bg-[var(--background)]/75 border-none backdrop-blur-md ${
        isDarkMode
          ? "text-white"
          : "text-[#1A1A1A]"
      }`}
    >
      <div className="w-full max-w-[70%] mx-auto px-6 md:px-8 py-5 flex justify-between items-center relative">
        
        {/* LOGO */}
        <div>
          <Link href="/" className="block">
            <div
              className={`font-serif text-2xl md:text-3xl font-bold tracking-[0.2em] transition-colors duration-500 ${accentColor}`}
            >
              D C
            </div>
            <span
              className={`text-[8px] md:text-[9px] font-sans tracking-[0.35em] uppercase block mt-0.5 ${
                isDarkMode ? "text-white/50" : "text-[#1A1A1A]/50"
              }`}
            >
              WEDDING
            </span>
          </Link>
        </div>

        {/* KANAN: Theme Toggle & Burger Menu */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          <Sheet>
            <SheetTrigger
              render={
                <Button
                variant="outline"
                size="icon"
                aria-label="Toggle Menu"
                className="rounded-full w-11 h-11 border border-primary bg-primary text-white transition-all duration-300 cursor-pointer hover:brightness-110"
                >
                  <Menu className="w-5 h-5 text-white" />
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