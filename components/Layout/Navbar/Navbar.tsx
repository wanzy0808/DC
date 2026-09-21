"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/Theme/ThemeToggle";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import BurgerMenuContent from "@/components/Layout/Navbar/BurgerMenuContent";
import LanguageToggle from "@/components/I18n/LanguageToggle";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import BrandWordmark from "@/components/Brand/BrandWordmark";

export default function Navbar({ embedded = false }: { embedded?: boolean }) {
  const pathname = usePathname();
  const isJiplak = pathname === "/jiplak";
  const isLanding = pathname === "/" || isJiplak;
  if ((!embedded && (pathname === "/" || pathname === "/pagecontoh")) || pathname === "/dashboard" || pathname.startsWith("/dashboard/")) return null;

  return (
    <header className={`dc-navbar relative z-50 w-full text-foreground transition-colors duration-500 ${
      isLanding
        ? `dc-navbar--landing ${isJiplak ? "dc-navbar--jiplak bg-transparent" : "bg-background"}`
        : "bg-transparent"
    }`}>
      <div className="mx-auto flex w-[80vw] max-w-full items-center justify-between py-5">
        <Link href="/" className="group block min-w-0">
          <BrandWordmark
            showTagline
            className="transition-transform group-hover:scale-[1.01]"
          />
        </Link>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <LanguageToggle />
          <Dialog>
            <DialogTrigger
              render={
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Buka menu navigasi"
                  className="h-11 w-11 border-primary/35 bg-transparent text-primary shadow-none hover:border-primary hover:bg-primary/5 hover:text-primary dark:border-primary/35 dark:bg-transparent dark:text-primary dark:hover:border-primary dark:hover:bg-primary/5 dark:hover:text-primary"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              }
            />
            <BurgerMenuContent />
          </Dialog>
        </div>
      </div>
    </header>
  );
}
