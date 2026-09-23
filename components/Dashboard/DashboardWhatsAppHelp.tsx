"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarHeart, ChevronRight, MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDashboardI18n } from "@/components/Dashboard/useDashboardI18n";

const helpOptions = [
  {
    id: "planner",
    label: "Wedding Planner",
    labelEn: "Wedding Planner",
    contact: "Christine",
    number: "6282124786516",
    message: "Halo Christine, saya ingin konsultasi mengenai layanan Wedding Planner DC Organizer.",
    messageEn: "Hello Christine, I would like to ask about DC Organizer Wedding Planner services.",
    icon: CalendarHeart,
  },
  {
    id: "admin",
    label: "Undangan & Guestbook",
    labelEn: "Invitations & Guestbook",
    contact: "Admin",
    number: "6281285009609",
    message: "Halo Admin DC Organizer, saya ingin bertanya mengenai undangan fisik, undangan digital, atau Guestbook.",
    messageEn: "Hello DC Organizer Admin, I have a question about printed invitations, digital invitations, or Guestbook.",
    icon: MessageCircle,
  },
] as const;

export default function DashboardWhatsAppHelp() {
  const { d, locale } = useDashboardI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const dismissOnPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const dismissOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", dismissOnPointer);
    document.addEventListener("keydown", dismissOnEscape);
    return () => {
      document.removeEventListener("pointerdown", dismissOnPointer);
      document.removeEventListener("keydown", dismissOnEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="absolute bottom-5 right-5 z-[70] flex max-w-[calc(100%-2.5rem)] flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open && (
        <div id="dc-dashboard-whatsapp-options" className="max-h-[calc(90dvh-6rem)] w-[min(330px,calc(90vw-3rem))] max-w-full overflow-x-hidden overflow-y-auto overscroll-contain rounded-[24px] border border-primary/25 bg-background p-2 text-foreground shadow-[0_16px_45px_rgba(0,0,0,0.16)]">
          <div className="flex items-center justify-between gap-2 px-3 py-2">
            <p className="text-sm font-semibold">{d("Hubungi kami")}</p>
            <button type="button" aria-label={d("Tutup")} onClick={() => setOpen(false)} className="grid size-8 place-items-center rounded-full text-muted-foreground transition hover:bg-primary/10 hover:text-primary focus-visible:outline-2 focus-visible:outline-primary">
              <X className="size-4" />
            </button>
          </div>
          <div className="space-y-1">
            {helpOptions.map((option) => {
              const Icon = option.icon;
              const href = `https://wa.me/${option.number}?text=${encodeURIComponent(locale === "en" ? option.messageEn : option.message)}`;
              return (
                <a
                  key={option.id}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="group flex min-h-16 items-center gap-3 rounded-2xl px-3 py-2.5 transition hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-primary"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                    <Icon className="size-5" strokeWidth={1.8} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{locale === "en" ? option.labelEn : option.label}</span>
                    <span className="block text-xs text-muted-foreground">{option.contact}</span>
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-primary transition group-hover:translate-x-0.5" />
                </a>
              );
            })}
          </div>
        </div>
      )}
      <Button
        type="button"
        size="icon-lg"
        aria-label={d("Buka bantuan WhatsApp")}
        aria-expanded={open}
        aria-controls="dc-dashboard-whatsapp-options"
        onClick={() => setOpen((current) => !current)}
        className="rounded-full"
      >
        {open ? <X className="size-6" strokeWidth={2} /> : <MessageCircle className="size-6" strokeWidth={2} />}
      </Button>
    </div>
  );
}
