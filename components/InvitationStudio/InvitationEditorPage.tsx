"use client";

import Link from "next/link";
import { ArrowLeft, LayoutTemplate } from "lucide-react";
import InvitationDesigner from "@/components/InvitationStudio/InvitationDesigner";
import { useLanguage } from "@/components/I18n/LanguageProvider";
import { buttonVariants } from "@/components/ui/button";

export default function InvitationEditorPage() {
  const { locale } = useLanguage();
  const copy = locale === "en"
    ? { back: "Back to Digital Invitation", studio: "Digital Invitation", home: "Home" }
    : { back: "Kembali ke Undangan Digital", studio: "Undangan Digital", home: "Beranda" };

  return (
    <main className="dc-invitation-editor min-h-screen bg-background font-[family-name:var(--font-fauna)] text-foreground">
      <header className="border-b border-border/70 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 w-[min(92vw,1400px)] items-center gap-3">
          <Link href="/dashboard/undangan-digital" aria-label={copy.back} className={buttonVariants({ variant: "ghost", size: "icon" })}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <Link href="/" className="font-[family-name:var(--font-cinzel)] text-sm font-semibold tracking-[.16em] text-primary hover:text-primary/80">DC Organizer</Link>
          <span className="h-5 w-px bg-border" />
          <Link href="/dashboard/undangan-digital" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
            <LayoutTemplate className="h-4 w-4" />
            {copy.studio}
          </Link>
          <Link href="/dashboard" className="ml-auto text-xs text-muted-foreground hover:text-foreground">{copy.home}</Link>
        </div>
      </header>
      <InvitationDesigner />
      <style jsx global>{`
        .dc-invitation-editor .dc-invitation-studio-shell,
        .dc-invitation-editor section { border-color: var(--border); }
        .dc-invitation-editor section { background: var(--background) !important; color: var(--foreground) !important; }
        .dc-invitation-editor section > header,
        .dc-invitation-editor section > div.border-b,
        .dc-invitation-editor section > div > aside:first-child,
        .dc-invitation-editor section > div > aside:nth-child(2) { background: var(--background) !important; border-color: var(--border) !important; color: var(--foreground) !important; }
        .dc-invitation-editor section > div.border-b > div { width: fit-content; max-width: 100%; overflow-x: auto; }
        .dc-invitation-editor section > div.border-b > div > button { flex: 0 0 auto; }
        .dc-invitation-editor section > div > main { background: color-mix(in oklab, var(--background) 92%, var(--primary) 8%) !important; }
        .dc-invitation-editor section > div > main > div:first-child { width: 360px; max-width: 100%; border: 2px solid #111111; border-radius: 28px; padding: 0; background: #ffffff; box-shadow: 0 18px 50px rgb(0 0 0 / 18%); overflow: hidden; }
        .dark .dc-invitation-editor section > div > main > div:first-child { border-color: #ffffff; background: #111113; box-shadow: 0 18px 50px rgb(0 0 0 / 45%); }
        .dc-invitation-editor section > div > main > div:first-child > div { border-radius: 26px !important; box-shadow: none !important; }
        .dc-invitation-editor button { font-family: var(--font-fauna); }
        .dark .dc-invitation-editor section button:not([class*="bg-[#7A1C25"]),
        .dark .dc-invitation-editor section input,
        .dark .dc-invitation-editor section label { color: var(--foreground); }
        .dark .dc-invitation-editor section aside:nth-child(2) button { background-color: transparent; }
        .dark .dc-invitation-editor section aside:nth-child(2) button:hover { background-color: rgb(192 122 132 / 8%); }
        .dc-invitation-editor section aside:nth-child(2) img { border-color: var(--border); }
      `}</style>
    </main>
  );
}
