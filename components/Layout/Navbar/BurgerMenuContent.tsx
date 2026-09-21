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
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import RegisterDialog from "./RegisterDialog";
import BrandWordmark from "@/components/Brand/BrandWordmark";
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
  const itemMotion = (index: number) => shouldReduceMotion ? {} : {
    initial: { opacity: 0, x: 32 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.38, delay: 0.16 + index * 0.085, ease: [0.22, 1, 0.36, 1] as const },
  };
  const neutralButton =
    "border border-primary/25 !rounded-[20px] bg-background/45 text-foreground shadow-none backdrop-blur-sm transition-[background-color,border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-primary/60 hover:bg-primary/10 hover:text-foreground dark:border-primary/30 dark:bg-background/45 dark:text-foreground dark:hover:border-primary/60 dark:hover:bg-primary/15 dark:hover:text-foreground";
  const topButtonClass = `${neutralButton} h-auto min-h-11 w-full justify-start !rounded-2xl px-4 py-3 text-left text-sm`;
  const subButtonClass = `${neutralButton} h-auto min-h-10 w-full justify-start !rounded-2xl px-4 py-2.5 text-left text-[13px]`;

  return (
    <DialogContent
      className="flex max-h-[min(85dvh,720px)] w-[min(92vw,440px)] max-w-none flex-col gap-0 overflow-hidden !rounded-[32px] border border-primary/35 bg-background/90 p-0 text-foreground shadow-[0_18px_75px_rgba(75,35,47,0.14)] backdrop-blur-xl sm:max-w-[440px]"
    >
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.82 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={
          shouldReduceMotion
            ? undefined
            : { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
        }
        className="flex min-h-0 flex-1 flex-col overflow-y-auto"
      >
        <DialogHeader className="shrink-0 border-b border-primary/15 bg-background/35 px-6 pb-5 pt-7 pr-14 text-left sm:px-7">
          <DialogTitle className="w-fit rounded-2xl border border-primary/25 bg-background/45 px-4 py-3 backdrop-blur-sm">
            <BrandWordmark size="mobile" />
          </DialogTitle>
        </DialogHeader>

        <nav className="flex-1 space-y-2 bg-transparent p-4 sm:p-5">
          <motion.div {...itemMotion(0)} className="space-y-1.5 rounded-[24px] border border-primary/20 bg-background/30 p-2">
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
                      <motion.div key={href} {...itemMotion(1 + services.findIndex((item) => item.href === href))}>
                      <DialogClose
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
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {secondary.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <motion.div key={href} {...itemMotion(4 + secondary.findIndex((item) => item.href === href))}>
              <DialogClose
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
              </motion.div>
            );
          })}

          <div className="my-4 border-t border-primary/15" />

          <motion.div {...itemMotion(7)}>
          <DialogClose
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

          </motion.div>
          <motion.div {...itemMotion(8)}>
          <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
            <DialogTrigger
              render={<Button size="lg" className={topButtonClass} />}
            >
              <UserPlus className="h-4 w-4 shrink-0" strokeWidth={1.8} />
              <span>{nav.register}</span>
            </DialogTrigger>
            <RegisterDialog onSwitchToLogin={() => setRegisterOpen(false)} />
          </Dialog>
          </motion.div>
        </nav>
      </motion.div>
    </DialogContent>
  );
}
