"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  CalendarCheck,
  ChevronDown,
  CircleHelp,
  Layers,
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

export default function BurgerMenuContent() {
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
  const neutralButton =
    "border border-black/10 bg-white text-black shadow-sm hover:bg-neutral-100 hover:text-black dark:border-white/15 dark:bg-white dark:text-black dark:hover:bg-neutral-100";
  const topButtonClass = `${neutralButton} h-auto min-h-11 w-full justify-start rounded-[10px] px-3 py-2.5 text-left text-[13px]`;
  const subButtonClass = `${neutralButton} h-auto min-h-10 w-full justify-start rounded-[9px] px-3 py-2 text-left text-[12px]`;

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
          <div className="space-y-1.5 rounded-xl border border-primary/10 bg-background/45 p-1.5">
            <Button
              type="button"
              aria-expanded={servicesOpen}
              onClick={() => setServicesOpen((open) => !open)}
              className={`${topButtonClass} ${serviceActive ? "ring-2 ring-primary/25" : ""}`}
            >
              <Layers className="h-4 w-4 shrink-0" strokeWidth={1.8} />
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
                  className="space-y-1.5 pl-3"
                >
                  {services.map(({ href, label, icon: Icon }) => {
                    const active = pathname === href;
                    return (
                      <SheetClose
                        key={href}
                        nativeButton={false}
                        render={
                          <Button
                            asChild
                            size="sm"
                            className={`${subButtonClass} ${active ? "ring-2 ring-primary/25" : ""}`}
                          >
                            <Link href={href} aria-current={active ? "page" : undefined}>
                              <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.8} />
                              <span>{label}</span>
                            </Link>
                          </Button>
                        }
                      />
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
                  <Button
                    asChild
                    size="lg"
                    className={`${topButtonClass} ${active ? "ring-2 ring-primary/25" : ""}`}
                  >
                    <Link href={href} aria-current={active ? "page" : undefined}>
                      <Icon className="h-4 w-4 shrink-0" strokeWidth={1.8} />
                      <span>{label}</span>
                    </Link>
                  </Button>
                }
              />
            );
          })}

          <div className="my-3 border-t border-[var(--border)]" />

          <SheetClose
            nativeButton={false}
            render={
              <Button
                asChild
                size="lg"
                className={`${topButtonClass} ${pathname === "/login" ? "ring-2 ring-primary/25" : ""}`}
              >
                <Link href="/login" aria-current={pathname === "/login" ? "page" : undefined}>
                  <LogIn className="h-4 w-4 shrink-0" strokeWidth={1.8} />
                  <span>{nav.login}</span>
                </Link>
              </Button>
            }
          />

          <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
            <DialogTrigger
              render={<Button size="lg" className={topButtonClass} />}
            >
              <UserPlus className="h-4 w-4 shrink-0" strokeWidth={1.8} />
              <span>{nav.register}</span>
            </DialogTrigger>
            <RegisterDialog onSwitchToLogin={() => setRegisterOpen(false)} />
          </Dialog>
        </nav>
      </motion.div>
    </SheetContent>
  );
}
