"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { BookOpen, CalendarCheck, ChevronDown, CircleHelp, Layers, LayoutTemplate, LogIn, Package, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/I18n/LanguageProvider";

export default function BurgerMenuContent({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const [servicesOpen, setServicesOpen] = useState(true);
  const { messages } = useLanguage();
  const { nav } = messages;
  function openAuth(mode: "login" | "register") {
    const requestedNext = new URLSearchParams(window.location.search).get("next");
    const next = requestedNext?.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/dashboard";
    onClose();
    window.dispatchEvent(new CustomEvent("dc-auth-open", { detail: { mode, next } }));
  }
  const items = [
    { href: "/packages", label: nav.packages, icon: Package },
    { href: "/template-design", label: nav.templates, icon: LayoutTemplate },
    { href: "/help", label: nav.help, icon: CircleHelp },
  ];
  const services = [
    { href: "/event-planner", label: nav.planner, icon: CalendarCheck },
    { href: "/d-invitation", label: nav.invitation, icon: LayoutTemplate },
    { href: "/guestbook", label: nav.guestbook, icon: BookOpen },
  ];
  const itemClass = "flex min-h-11 w-full items-center justify-start gap-3 rounded-[var(--dc-control-radius)] border border-primary/35 bg-card/60 px-4 py-2.5 text-left font-[family-name:var(--font-dc-body)] text-sm text-foreground shadow-none transition-[background-color,border-color,transform] duration-200 hover:-translate-y-px hover:border-primary/70 hover:bg-primary/10 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary aria-[current=page]:border-primary aria-[current=page]:bg-primary/10 aria-[current=page]:text-primary dark:bg-card/60 dark:text-foreground dark:hover:bg-primary/15 dark:hover:text-primary";
  const reveal = (index: number) => reduced ? {} : {
    initial: { opacity: 0, x: 26 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.34, delay: 0.09 + index * 0.085, ease: [0.22, 1, 0.36, 1] as const },
  };
  return (
    <nav aria-label={nav.navigation} className="space-y-2">
      <motion.div {...reveal(0)}>
        <Link href="/login" onClick={(event) => { event.preventDefault(); openAuth("login"); }} aria-current={pathname === "/login" ? "page" : undefined} className={itemClass}><LogIn className="size-4 shrink-0" strokeWidth={1.8} /><span>{nav.login}</span></Link>
      </motion.div>
      <motion.div {...reveal(1)}>
        <Button className={itemClass} onClick={() => openAuth("register")}><UserPlus className="size-4 shrink-0" strokeWidth={1.8} /><span>{nav.register}</span></Button>
      </motion.div>
      {items.map(({ href, label, icon: Icon }, index) => (
        <motion.div key={href} {...reveal(index + 2)}>
          <Link href={href} onClick={onClose} aria-current={pathname === href ? "page" : undefined} className={itemClass}><Icon className="size-4 shrink-0" strokeWidth={1.8} /><span>{label}</span></Link>
        </motion.div>
      ))}
      <motion.div {...reveal(5)}>
        <button type="button" aria-expanded={servicesOpen} onClick={() => setServicesOpen((open) => !open)} className={itemClass}>
          <Layers className="size-4 shrink-0" strokeWidth={1.8} /><span>{nav.services}</span><ChevronDown className={`ml-auto size-4 transition-transform duration-200 ${servicesOpen ? "rotate-180" : ""}`} />
        </button>
      </motion.div>
      <AnimatePresence initial={false}>
        {servicesOpen && (
          <motion.div initial={reduced ? false : { opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: reduced ? 0.1 : 0.24 }} className="space-y-2 overflow-hidden pl-4">
            {services.map(({ href, label, icon: Icon }, index) => (
              <motion.div key={href} {...reveal(index + 6)}>
                <Link href={href} onClick={onClose} aria-current={pathname === href ? "page" : undefined} className={itemClass}><Icon className="size-4 shrink-0" strokeWidth={1.8} /><span>{label}</span></Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
