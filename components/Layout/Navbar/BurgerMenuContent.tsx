"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  CalendarCheck,
  ChevronDown,
  CircleHelp,
  Home,
  LayoutTemplate,
  LogIn,
  Package,
  UserPlus,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import RegisterDialog from "./RegisterDialog";
import { useLanguage } from "@/components/I18n/LanguageProvider";

interface BurgerMenuContentProps {
  isDarkMode: boolean;
}

export default function BurgerMenuContent({ isDarkMode }: BurgerMenuContentProps) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();
  const [servicesOpen, setServicesOpen] = useState(true);
  const [registerOpen, setRegisterOpen] = useState(false);
  const { messages } = useLanguage();
  const { nav } = messages;

  const services = [
    { href: "/event-planner", label: nav.planner, icon: CalendarCheck },
    { href: "/d-invitation", label: nav.invitation, icon: LayoutTemplate },
    { href: "/guestbook", label: nav.guestbook, icon: BookOpen },
  ] as const;

  const secondary = [
    { href: "/packages", label: nav.packages, icon: Package },
    { href: "/template-design", label: nav.templates, icon: LayoutTemplate },
    { href: "/help", label: nav.help, icon: CircleHelp },
  ] as const;

  const serviceActive = services.some(({ href }) => pathname === href);
  const navButtonClass = (active = false) =>
    `group flex min-h-11 w-full items-center gap-3 rounded-[10px] border px-3 py-2.5 text-left font-[family-name:var(--font-dc-body)] text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] ${
      active
        ? "border-primary/15 bg-primary/10 text-primary"
        : "border-transparent bg-transparent text-foreground hover:border-primary/10 hover:bg-primary/[0.07] hover:text-primary"
    }`;

  const subButtonClass = (active = false) =>
    `group flex min-h-10 w-full items-center gap-2.5 rounded-[9px] border px-2.5 py-2 text-left font-[family-name:var(--font-dc-body)] text-[12px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] ${
      active
        ? "border-primary/15 bg-primary/[0.09] text-primary"
        : "border-transparent bg-transparent text-foreground/75 hover:bg-primary/[0.06] hover:text-primary"
    }`;

  return (
    <SheetContent
      side="right"
      className="flex w-[min(92vw,420px)] flex-col overflow-hidden border-l border-[var(--border)] bg-[var(--background)] p-0 text-[var(--foreground)] shadow-2xl"
    >
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, x: 18 }}
        animate={{ opacity: 1, x: 0 }}
        transition={
          shouldReduceMotion
            ? undefined
            : { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
        }
        className="flex min-h-0 flex-1 flex-col overflow-y-auto"
      >
        <SheetHeader className="shrink-0 border-b border-[var(--border)] px-6 pb-5 pt-7 pr-14 text-left sm:px-7">
          <SheetTitle className="font-[family-name:var(--font-dc-heading)] text-2xl font-normal leading-tight text-[var(--foreground)]">
            {nav.navigation}
          </SheetTitle>
        </SheetHeader>

        <nav className="flex-1 space-y-2 bg-primary/[0.035] p-3 dark:bg-primary/[0.055]">
          <SheetClose
            nativeButton={false}
            render={
              <Link
                href="/"
                className={navButtonClass(pathname === "/")}
                aria-current={pathname === "/" ? "page" : undefined}
              />
            }
          >
            <Home className="h-4 w-4 shrink-0" strokeWidth={1.8} />
            <span>{nav.home}</span>
          </SheetClose>

          <div className="rounded-xl border border-primary/10 bg-background/45 p-1.5">
            <Button
              type="button"
              aria-expanded={servicesOpen}
              onClick={() => setServicesOpen((open) => !open)}
              className={`h-auto w-full min-w-0 justify-start rounded-[9px] border border-transparent bg-transparent px-2.5 py-2.5 text-left text-[13px] font-medium shadow-none ${
                serviceActive
                  ? "bg-primary/10 text-primary"
                  : "text-foreground hover:bg-primary/[0.06] hover:text-primary"
              }`}
            >
              <Package className="h-4 w-4 shrink-0" strokeWidth={1.8} />
              <span>{nav.services}</span>
              <ChevronDown
                className={`ml-auto h-3.5 w-3.5 transition-transform ${servicesOpen ? "rotate-180" : ""}`}
              />
            </Button>

            <AnimatePresence initial={false}>
              {servicesOpen && (
                <motion.div
                  initial={shouldReduceMotion ? false : { opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
                  transition={{ duration: shouldReduceMotion ? 0.1 : 0.22 }}
                  className="mt-1 space-y-1 pl-3"
                >
                  {services.map(({ href, label, icon: Icon }) => {
                    const active = pathname === href;
                    return (
                      <SheetClose
                        key={href}
                        nativeButton={false}
                        render={
                          <Link
                            href={href}
                            className={subButtonClass(active)}
                            aria-current={active ? "page" : undefined}
                          />
                        }
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.8} />
                        <span>{label}</span>
                      </SheetClose>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {secondary.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <SheetClose
                key={href}
                nativeButton={false}
                render={
                  <Link
                    href={href}
                    className={navButtonClass(active)}
                    aria-current={active ? "page" : undefined}
                  />
                }
              >
                <Icon className="h-4 w-4 shrink-0" strokeWidth={1.8} />
                <span>{label}</span>
              </SheetClose>
            );
          })}

          <div className="my-3 border-t border-[var(--border)]" />

          <SheetClose
            nativeButton={false}
            render={<Link href="/login" className={navButtonClass(pathname === "/login")} />}
          >
            <LogIn className="h-4 w-4 shrink-0" strokeWidth={1.8} />
            <span>{nav.login}</span>
          </SheetClose>

          <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
            <DialogTrigger
              render={
                <Button className="h-auto min-h-11 w-full justify-start rounded-[10px] px-3 py-2.5 text-[13px] shadow-none" />
              }
            >
              <UserPlus className="h-4 w-4 shrink-0" strokeWidth={1.8} />
              <span>{nav.register}</span>
            </DialogTrigger>
            <RegisterDialog
              isDarkMode={isDarkMode}
              onSwitchToLogin={() => setRegisterOpen(false)}
            />
          </Dialog>
        </nav>
      </motion.div>
    </SheetContent>
  );
}
