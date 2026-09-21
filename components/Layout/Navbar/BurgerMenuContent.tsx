"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { BookOpen, CalendarCheck, ChevronDown, CircleHelp, Layers, LayoutTemplate, LogIn, Package, UserPlus } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import RegisterDialog from "./RegisterDialog";
import { useLanguage } from "@/components/I18n/LanguageProvider";

export default function BurgerMenuContent({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const [servicesOpen, setServicesOpen] = useState(true);
  const [registerOpen, setRegisterOpen] = useState(false);
  const { messages } = useLanguage();
  const { nav } = messages;
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
  const itemClass = "flex min-h-10 w-full !justify-start !gap-3 items-center !rounded-[18px] border border-primary/30 bg-background/35 px-4 py-2.5 text-left font-[family-name:var(--font-dc-heading)] text-sm text-primary shadow-none transition-[background-color,border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-primary/65 hover:bg-primary/10 hover:text-primary dark:text-primary dark:hover:text-primary";
  const reveal = (index: number) => reduced ? {} : {
    initial: { opacity: 0, x: 26 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.34, delay: 0.09 + index * 0.085, ease: [0.22, 1, 0.36, 1] as const },
  };
  return (
    <nav aria-label={nav.navigation} className="space-y-2">
      <motion.div {...reveal(0)}>
        <Link href="/login" onClick={onClose} aria-current={pathname === "/login" ? "page" : undefined} className={itemClass}><LogIn className="size-4 shrink-0" strokeWidth={1.8} /><span>{nav.login}</span></Link>
      </motion.div>
      <motion.div {...reveal(1)}>
        <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
          <DialogTrigger render={<Button className={itemClass} />}><UserPlus className="size-4 shrink-0" strokeWidth={1.8} /><span>{nav.register}</span></DialogTrigger>
          <RegisterDialog onSwitchToLogin={() => setRegisterOpen(false)} />
        </Dialog>
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
                <Link href={href} onClick={onClose} aria-current={pathname === href ? "page" : undefined} className={itemClass}>{label}</Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
