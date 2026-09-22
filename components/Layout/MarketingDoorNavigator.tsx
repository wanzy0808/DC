"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, X } from "lucide-react";
import { useLanguage } from "@/components/I18n/LanguageProvider";

/** Small, shared wayfinding doors for the public marketing pages. */
const destinations = [
  {
    href: "/",
    id: { title: "Beranda", description: "Kembali ke dunia tiga pintu." },
    en: { title: "Home", description: "Return to the world of three doors." },
  },
  {
    href: "/event-planner",
    id: { title: "Event Planner", description: "Perencanaan dan koordinasi acara." },
    en: { title: "Event Planner", description: "Planning and coordination for your event." },
  },
  {
    href: "/d-invitation",
    id: { title: "Digital Invitation", description: "Undangan, RSVP, dan manajemen tamu." },
    en: { title: "Digital Invitation", description: "Invitations, RSVPs, and guest management." },
  },
  {
    href: "/guestbook",
    id: { title: "Guestbook", description: "Check-in QR dan pencatatan tamu di lokasi." },
    en: { title: "Guestbook", description: "QR check-in and guest tracking on site." },
  },
  {
    href: "/template-design",
    id: { title: "Koleksi Desain", description: "Jelajahi tema dan pratinjau undangan." },
    en: { title: "Design Collection", description: "Explore themes and invitation previews." },
  },
] as const;

function MiniDoor({ active = false }: { active?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className="relative inline-block h-[51px] w-[34px] shrink-0 overflow-hidden rounded-t-[17px] rounded-b-[4px] border-[2px] border-[#e8bec6] bg-[#472630] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.35),0_5px_12px_rgba(64,25,36,0.22)]"
    >
      <span className="absolute inset-[3px] rounded-t-[13px] bg-[radial-gradient(ellipse_at_50%_45%,#ffe1e8_0%,#d78c9d_55%,#8f4e5d_100%)]" />
      <span
        className={
          "absolute bottom-[3px] left-[3px] top-[3px] w-[calc(50%_-_3px)] origin-left rounded-tl-[13px] border border-white/35 bg-[linear-gradient(125deg,#e9b6c0_0%,#b66f80_80%)] shadow-[2px_0_4px_rgba(51,20,31,0.3)] transition-transform duration-500 ease-out " +
          (active ? "-translate-x-[4px]" : "group-hover:-translate-x-[4px] group-focus-visible:-translate-x-[4px]")
        }
      >
        <span className="absolute inset-[3px] rounded-tl-[10px] border border-white/30" />
        <span className="absolute right-[1px] top-[56%] size-[2px] rounded-full bg-[#fff3dc]" />
      </span>
      <span
        className={
          "absolute bottom-[3px] right-[3px] top-[3px] w-[calc(50%_-_3px)] origin-right rounded-tr-[13px] border border-white/35 bg-[linear-gradient(235deg,#d99eac_0%,#a96173_85%)] shadow-[-2px_0_4px_rgba(51,20,31,0.3)] transition-transform duration-500 ease-out " +
          (active ? "translate-x-[4px]" : "group-hover:translate-x-[4px] group-focus-visible:translate-x-[4px]")
        }
      >
        <span className="absolute inset-[3px] rounded-tr-[10px] border border-white/30" />
        <span className="absolute left-[1px] top-[56%] size-[2px] rounded-full bg-[#fff3dc]" />
      </span>
    </span>
  );
}

export default function MarketingDoorNavigator() {
  const pathname = usePathname();
  const { locale } = useLanguage();
  const reducedMotion = Boolean(useReducedMotion());
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const activePath = pathname === "/pagecontoh" ? "/" : pathname;
  const visible = destinations.some((item) => item.href === activePath);
  const isEnglish = locale === "en";

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("pointerdown", onOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  if (!visible) return null;

  const label = isEnglish ? "Explore pages" : "Jelajahi halaman";
  const pageLabel = isEnglish ? "Where would you like to go?" : "Mau ke halaman mana?";
  const currentLabel = isEnglish ? "You are here" : "Kamu di sini";

  return (
    <nav
      ref={rootRef}
      aria-label={isEnglish ? "Explore DC Organizer pages" : "Jelajahi halaman DC Organizer"}
      className="fixed bottom-[74px] left-2 z-[80] font-[family-name:var(--font-dc-body)] sm:bottom-auto sm:left-2 sm:top-1/2 sm:-translate-y-1/2 lg:left-3"
    >
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls="dc-marketing-door-navigation"
        aria-label={open ? (isEnglish ? "Close page navigation" : "Tutup navigasi halaman") : label}
        onClick={() => setOpen((previous) => !previous)}
        className="group flex w-[53px] flex-col items-center gap-1 rounded-[24px] border border-primary/40 bg-background/90 px-1.5 py-2 text-primary shadow-[0_8px_25px_rgba(75,35,47,0.18)] backdrop-blur-xl transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-primary hover:shadow-[0_10px_30px_rgba(75,35,47,0.25)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <MiniDoor active={open} />
        <span className="font-[family-name:var(--font-dc-mono)] text-[8px] uppercase leading-tight tracking-[0.05em]">
          {isEnglish ? "Explore" : "Jelajah"}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id="dc-marketing-door-navigation"
            initial={reducedMotion ? false : { opacity: 0, x: -9, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -8, scale: 0.98 }}
            transition={{ duration: reducedMotion ? 0.08 : 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-[calc(100%+10px)] left-0 w-[min(340px,calc(100vw-72px))] max-h-[min(70dvh,550px)] overflow-y-auto rounded-[24px] border border-primary/35 bg-background/95 p-3 text-foreground shadow-[0_20px_65px_rgba(57,23,35,0.25)] backdrop-blur-xl sm:bottom-auto sm:left-[calc(100%+12px)] sm:top-1/2 sm:max-h-[min(82dvh,580px)] sm:-translate-y-1/2 sm:p-4"
          >
            <div className="mb-3 flex items-start justify-between gap-3 border-b border-primary/20 px-1 pb-3">
              <div>
                <p className="font-[family-name:var(--font-dc-mono)] text-[10px] uppercase tracking-[0.16em] text-primary">
                  DC Organizer
                </p>
                <p className="mt-1 font-[family-name:var(--font-dc-heading)] text-base text-foreground">
                  {pageLabel}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  triggerRef.current?.focus();
                }}
                aria-label={isEnglish ? "Close" : "Tutup"}
                className="flex size-8 shrink-0 items-center justify-center rounded-full text-foreground/70 transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </div>
            <div className="space-y-1.5">
              {destinations.map((item) => {
                const current = item.href === activePath;
                const copy = isEnglish ? item.en : item.id;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={current ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={
                      "group flex min-h-[76px] items-center gap-3 rounded-[17px] border px-3 py-2 text-left transition-[background-color,border-color,transform] duration-200 focus-visible:outline-2 focus-visible:outline-primary " +
                      (current
                        ? "border-primary/45 bg-primary/10"
                        : "border-transparent hover:translate-x-0.5 hover:border-primary/30 hover:bg-primary/10")
                    }
                  >
                    <MiniDoor active={current} />
                    <span className="min-w-0 flex-1">
                      <span className="block font-[family-name:var(--font-dc-heading)] text-sm font-medium text-primary">
                        {copy.title}
                      </span>
                      <span className="mt-1 block text-[11px] leading-[1.5] text-foreground/70">
                        {copy.description}
                      </span>
                      {current && (
                        <span className="mt-1 block font-[family-name:var(--font-dc-mono)] text-[9px] uppercase tracking-[0.1em] text-primary/80">
                          {currentLabel}
                        </span>
                      )}
                    </span>
                    {!current && <ArrowUpRight aria-hidden="true" className="size-4 shrink-0 text-primary/65 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
