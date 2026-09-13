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
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
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

const menuItems = [
  { href: "/login", label: "Masuk ke workspace", icon: LogIn },
  { href: "/packages", label: "Paket & harga", icon: Package },
  { href: "/template-design", label: "Template", icon: LayoutTemplate },
  { href: "/help", label: "Bantuan", icon: CircleHelp },
] as const;

export default function BurgerMenuContent({ isDarkMode }: BurgerMenuContentProps) {
  const [isProductOpen, setIsProductOpen] = useState(true);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const itemClass =
    "group relative flex min-h-14 w-full items-center justify-between border-b border-[var(--border)] px-1 py-3 text-left text-[var(--foreground)] transition-colors duration-300 hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]";

  const listMotion = shouldReduceMotion
    ? undefined
    : { opacity: 1, y: 0 };

  return (
    <SheetContent
      side="right"
      className="flex w-[min(92vw,430px)] flex-col overflow-hidden border-l border-[var(--border)] bg-[var(--background)]/95 p-0 text-[var(--foreground)] shadow-2xl backdrop-blur-xl sm:max-w-none"
    >
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, x: 18 }}
        animate={listMotion}
        transition={shouldReduceMotion ? undefined : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pb-5 pt-7 sm:px-7"
      >
        <SheetHeader className="mb-7 shrink-0 p-0 pr-10 text-left">
          <span className="font-[family-name:var(--font-dc-mono)] text-[10px] uppercase tracking-[0.28em] text-[var(--primary)]">
            Navigation / 01
          </span>
          <SheetTitle className="mt-2 font-[family-name:var(--font-dc-heading)] text-3xl font-normal leading-tight text-[var(--foreground)]">
            Jelajahi DC Organizer
          </SheetTitle>
          <p className="mt-2 max-w-sm font-[family-name:var(--font-dc-body)] text-sm leading-6 text-[var(--muted-foreground)]">
            Pilih ruang kerja atau layanan yang ingin kamu buka.
          </p>
        </SheetHeader>

        <nav className="font-[family-name:var(--font-dc-body)] text-sm" aria-label="Navigasi utama">
          <div className="border-t border-[var(--border)]">
            {menuItems.slice(0, 1).map(({ href, label, icon: Icon }) => (
              <SheetClose
                key={href}
                nativeButton={false}
                render={<Link href={href} className={itemClass} />}
              >
                <span className="flex items-center gap-4">
                  <span className="font-[family-name:var(--font-dc-mono)] text-[10px] tracking-[0.16em] text-[var(--muted-foreground)]">01</span>
                  <Icon className="h-[18px] w-[18px] text-[var(--primary)] transition-transform duration-300 group-hover:scale-105" />
                  <span>Masuk ke workspace</span>
                </span>
                <ArrowUpRight className="h-4 w-4 opacity-40 transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" />
              </SheetClose>
            ))}

            <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
              <DialogTrigger className={itemClass}>
                <span className="flex items-center gap-4">
                  <span className="font-[family-name:var(--font-dc-mono)] text-[10px] tracking-[0.16em] text-[var(--muted-foreground)]">02</span>
                  <UserPlus className="h-[18px] w-[18px] text-[var(--primary)] transition-transform duration-300 group-hover:scale-105" />
                  <span>Buat akun baru</span>
                </span>
                <span className="font-[family-name:var(--font-dc-mono)] text-[10px] tracking-[0.16em] text-[var(--primary)] transition-colors group-hover:text-[var(--foreground)]">JOIN</span>
              </DialogTrigger>
              <RegisterDialog isDarkMode={isDarkMode} onSwitchToLogin={() => setIsRegisterOpen(false)} />
            </Dialog>

            <div className="border-b border-[var(--border)]">
              <button
                type="button"
                aria-expanded={isProductOpen}
                onClick={() => setIsProductOpen((open) => !open)}
                className="group flex min-h-14 w-full items-center justify-between border-b border-transparent px-1 py-3 text-left text-[var(--foreground)] transition-colors duration-300 hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--ring)]"
              >
                <span className="flex items-center gap-4">
                  <span className="font-[family-name:var(--font-dc-mono)] text-[10px] tracking-[0.16em] text-[var(--muted-foreground)]">03</span>
                  <Package className="h-[18px] w-[18px] text-[var(--primary)] transition-transform duration-300 group-hover:scale-105" />
                  <span>Layanan</span>
                </span>
                <ChevronDown className={`h-4 w-4 text-[var(--muted-foreground)] transition-transform duration-300 ${isProductOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence initial={false}>
                {isProductOpen && (
                  <motion.div
                    initial={shouldReduceMotion ? false : { opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                    transition={shouldReduceMotion ? { duration: 0.12 } : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    className="ml-10 border-l border-[var(--border)] py-1 pl-4"
                  >
                    {products.map(({ href, label, icon: Icon, description }, index) => (
                      <motion.div
                        key={href}
                        initial={shouldReduceMotion ? false : { opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={shouldReduceMotion ? undefined : { delay: index * 0.05, duration: 0.25 }}
                      >
                        <SheetClose
                          nativeButton={false}
                          render={
                            <Link
                              href={href}
                              className="group flex min-h-14 w-full items-center justify-between border-b border-[var(--border)] px-1 py-2.5 text-[var(--foreground)] transition-colors duration-300 last:border-b-0 hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                            />
                          }
                        >
                          <span className="flex min-w-0 items-center gap-3">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--secondary)] text-[var(--secondary-foreground)] transition-colors duration-300 group-hover:bg-[var(--primary)] group-hover:text-[var(--primary-foreground)]">
                              <Icon className="h-4 w-4" />
                            </span>
                            <span className="min-w-0">
                              <span className="block font-medium">{label}</span>
                              <span className="block truncate font-[family-name:var(--font-dc-body)] text-xs text-[var(--muted-foreground)]">{description}</span>
                            </span>
                          </span>
                          <ArrowUpRight className="h-4 w-4 shrink-0 opacity-30 transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" />
                        </SheetClose>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {menuItems.slice(1).map(({ href, label, icon: Icon }, index) => (
              <SheetClose key={href} nativeButton={false} render={<Link href={href} className={itemClass} />}>
                <span className="flex items-center gap-4">
                  <span className="font-[family-name:var(--font-dc-mono)] text-[10px] tracking-[0.16em] text-[var(--muted-foreground)]">{String(index + 4).padStart(2, "0")}</span>
                  <Icon className="h-[18px] w-[18px] text-[var(--primary)] transition-transform duration-300 group-hover:scale-105" />
                  <span>{label}</span>
                </span>
                <ArrowUpRight className="h-4 w-4 opacity-40 transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" />
              </SheetClose>
            ))}
          </div>
        </nav>
      </motion.div>

      <div className="flex shrink-0 items-center justify-between border-t border-[var(--border)] px-6 py-4 font-[family-name:var(--font-dc-mono)] text-[10px] uppercase tracking-[0.16em] text-[var(--muted-foreground)] sm:px-7">
        <span>DC Organizer</span>
        <span>Wedding & Event</span>
      </div>
    </SheetContent>
  );
}
