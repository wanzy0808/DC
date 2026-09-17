"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  CalendarCheck,
  CircleHelp,
  Home,
  LayoutTemplate,
  LogIn,
  Package,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import {
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useLanguage } from "@/components/I18n/LanguageProvider";

export default function BurgerMenuContent() {
  const shouldReduceMotion = useReducedMotion();
  const { messages } = useLanguage();
  const { nav } = messages;

  const menuItems = [
    { href: "/", label: nav.home, icon: Home },
    { href: "/event-planner", label: nav.planner, icon: CalendarCheck },
    { href: "/d-invitation", label: nav.invitation, icon: LayoutTemplate },
    { href: "/guestbook", label: nav.guestbook, icon: BookOpen },
    { href: "/packages", label: nav.packages, icon: Package },
    { href: "/template-design", label: nav.templates, icon: LayoutTemplate },
    { href: "/help", label: nav.help, icon: CircleHelp },
    { href: "/login", label: nav.login, icon: LogIn },
  ] as const;

  const itemClass =
    "group flex min-h-14 w-full items-center justify-between border-b border-[var(--border)] px-1 py-3 text-left text-[var(--foreground)] transition-colors duration-300 hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]";

  return (
    <SheetContent
      side="right"
      className="flex w-[min(90vw,390px)] flex-col overflow-hidden border-l border-[var(--border)] bg-[var(--background)]/95 p-0 text-[var(--foreground)] shadow-2xl backdrop-blur-xl"
    >
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, x: 18 }}
        animate={{ opacity: 1, x: 0 }}
        transition={
          shouldReduceMotion
            ? undefined
            : { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
        }
        className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pb-6 pt-7 sm:px-7"
      >
        <SheetHeader className="mb-5 shrink-0 p-0 pr-10 text-left">
          <SheetTitle className="font-[family-name:var(--font-dc-heading)] text-3xl font-normal leading-tight text-[var(--foreground)]">
            {nav.navigation}
          </SheetTitle>
        </SheetHeader>

        <nav className="border-t border-[var(--border)] font-[family-name:var(--font-dc-body)] text-sm">
          {menuItems.map(({ href, label, icon: Icon }) => (
            <SheetClose
              key={href}
              nativeButton={false}
              render={<Link href={href} className={itemClass} />}
            >
              <span className="flex items-center gap-3.5">
                <Icon className="h-[18px] w-[18px] text-[var(--primary)]" />
                <span>{label}</span>
              </span>
              <ArrowUpRight className="h-4 w-4 opacity-35 transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" />
            </SheetClose>
          ))}
        </nav>
      </motion.div>
    </SheetContent>
  );
}
