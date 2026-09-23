"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/Theme/ThemeToggle";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import BurgerMenuContent from "@/components/Layout/Navbar/BurgerMenuContent";
import LanguageToggle from "@/components/I18n/LanguageToggle";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import BrandWordmark from "@/components/Brand/BrandWordmark";

export default function Navbar({ embedded = false }: { embedded?: boolean }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const reducedMotion = useReducedMotion();
  const isJiplak = pathname === "/jiplak";
  const isLanding = pathname === "/" || isJiplak || (embedded && (pathname === "/d-invitation" || pathname === "/template-design" || pathname === "/event-planner" || pathname === "/guestbook" || pathname === "/undangan-fisik"));
  if ((!embedded && (pathname === "/" || pathname === "/pagecontoh" || pathname === "/d-invitation" || pathname === "/template-design" || pathname === "/event-planner" || pathname === "/guestbook" || pathname === "/undangan-fisik")) || pathname === "/dashboard" || pathname.startsWith("/dashboard/")) return null;

  return (
    <header className={`dc-navbar relative z-50 w-full text-foreground transition-colors duration-500 ${
      isLanding
        ? `dc-navbar--landing ${isJiplak ? "dc-navbar--jiplak bg-transparent" : "bg-background"}`
        : "bg-transparent"
    }`}>
      <div className="mx-auto flex w-[80vw] max-w-full items-center justify-between py-5 sm:py-4">
        <Link href="/" className="group block min-w-0">
          <BrandWordmark
            showTagline
            className="transition-transform group-hover:scale-[1.01]"
          />
        </Link>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <LanguageToggle />
          <div className="relative">
                <Button
                  variant="outline"
                  size="icon"
                  aria-label={menuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
                  aria-expanded={menuOpen}
                  aria-controls="dc-burger-dropdown"
                  onClick={() => setMenuOpen((open) => !open)}
                  className="dc-burger-toggle h-11 w-11"
                >
                  <Menu className="h-5 w-5" />
                </Button>
            <AnimatePresence>
              {menuOpen && (
                <>
                  <button type="button" aria-label="Tutup menu" className="fixed inset-0 z-40 cursor-default bg-transparent" onClick={() => setMenuOpen(false)} />
                  <motion.div id="dc-burger-dropdown" initial={reducedMotion ? false : { opacity: 0, scale: 0.88, y: -12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: -10 }} transition={{ duration: reducedMotion ? 0.1 : 0.32, ease: [0.22, 1, 0.36, 1] }} style={{ transformOrigin: "top right" }} className="absolute right-0 top-[calc(100%+32px)] z-50 w-[min(88vw,370px)] max-h-[min(75dvh,650px)] overflow-y-auto !rounded-[28px] border border-primary/35 bg-background/95 p-3 shadow-[0_18px_65px_rgba(75,35,47,0.16)] backdrop-blur-xl">
                    <BurgerMenuContent onClose={() => setMenuOpen(false)} />
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
