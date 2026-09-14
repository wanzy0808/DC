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
    </main>
  );
}
