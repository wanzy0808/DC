"use client";

import Link from "next/link";
import { ArrowLeft, LayoutTemplate } from "lucide-react";
import InvitationDesigner from "@/components/InvitationStudio/InvitationDesigner";
import { useLanguage } from "@/components/I18n/LanguageProvider";
import { buttonVariants } from "@/components/ui/button";

export default function InvitationEditorPage() {
  const { locale } = useLanguage();
  const copy =
    locale === "en"
      ? { back: "Back to dashboard", studio: "Invitation Studio", home: "Dashboard" }
      : { back: "Kembali ke dashboard", studio: "Invitation Studio", home: "Dashboard" };

  return (
    <main className="dc-invitation-editor min-h-screen bg-background font-[family-name:var(--font-fauna)] text-foreground">
      <header className="border-b border-border/70 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 w-[min(92vw,1400px)] items-center gap-3">
          <Link
            href="/dashboard"
            aria-label={copy.back}
            title={copy.back}
            className={buttonVariants({ size: "icon" })}
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <Link
            href="/"
            className="font-[family-name:var(--font-cinzel)] text-sm font-semibold tracking-[0.16em] text-primary hover:text-primary/80"
          >
            DC Organizer
          </Link>
          <span className="h-5 w-px bg-border" />
          <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <LayoutTemplate className="h-4 w-4 text-primary" />
            {copy.studio}
          </span>
          <Link href="/dashboard" className="ml-auto text-xs text-muted-foreground hover:text-foreground">
            {copy.home}
          </Link>
        </div>
      </header>
      <InvitationDesigner />
      <style jsx global>{`
        .dc-invitation-editor .dc-invitation-studio-shell {
          background: var(--background);
          color: var(--foreground);
        }
        .dc-invitation-editor .dc-invitation-studio-shell > div > main > div:first-child {
          width: 360px;
          max-width: 100%;
          border: 2px solid var(--foreground);
          border-radius: 28px;
          padding: 0;
          background: var(--background);
          box-shadow: 0 18px 50px rgb(0 0 0 / 18%);
          overflow: hidden;
        }
        .dark .dc-invitation-editor .dc-invitation-studio-shell > div > main > div:first-child {
          box-shadow: 0 18px 50px rgb(0 0 0 / 45%);
        }
        .dc-invitation-editor .dc-invitation-studio-shell > div > main > div:first-child > div {
          border-radius: 26px !important;
          box-shadow: none !important;
        }
        .dc-invitation-editor button,
        .dc-invitation-editor input,
        .dc-invitation-editor label {
          font-family: var(--font-fauna);
        }
      `}</style>
    </main>
  );
}
