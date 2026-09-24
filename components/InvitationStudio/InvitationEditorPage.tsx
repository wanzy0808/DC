"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import BrandWordmark from "@/components/Brand/BrandWordmark";
import ThemeToggle from "@/components/Theme/ThemeToggle";
import LanguageToggle from "@/components/I18n/LanguageToggle";
import "./studio.css";
import InvitationDesigner from "@/components/InvitationStudio/InvitationDesigner";
import { useLanguage } from "@/components/I18n/LanguageProvider";
import { Button } from "@/components/ui/button";

/** Publishing and package checkout live in Dashboard > Undangan Digital. */
export default function InvitationEditorPage() {
  const { locale } = useLanguage();
  const [accessPaid, setAccessPaid] = useState<boolean | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const invitationId = params.get("invitationId")?.trim();
    if (!invitationId) {
      setError("Pilih acara dari Dashboard untuk membuka Studio.");
      return;
    }
    const type = params.get("type") === "ADAT_AKAD" ? "ADAT_AKAD" : "WEDDING";
    const controller = new AbortController();
    fetch(`/api/invitations?id=${encodeURIComponent(invitationId)}&type=${type}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = await response.json().catch(() => null);
        if (!response.ok || !data?.invitation) {
          throw new Error(data?.error || "Undangan belum dapat dimuat.");
        }
        setAccessPaid(Boolean(data.invitation.accessPaid));
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setError(reason instanceof Error ? reason.message : "Undangan belum dapat dimuat.");
        }
      });
    return () => controller.abort();
  }, []);

  const previewOnly = accessPaid === false;
  const backLabel = locale === "en" ? "Back to dashboard" : "Kembali ke dashboard";

  return (
    <main
      className={`dc-invitation-editor font-[family-name:var(--font-dc-sans)] text-foreground ${previewOnly ? "dc-unlicensed-studio" : ""}`}
      onContextMenu={previewOnly ? (event) => event.preventDefault() : undefined}
    >
      <div className="dc-studio-frame">
        <header className="dc-studio-page-header">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Button asChild size="icon" variant="outline" className="dc-studio-back shrink-0">
              <Link href="/dashboard" aria-label={backLabel} title={backLabel}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <Link href="/" className="min-w-0"><BrandWordmark size="mobile" /></Link>
            <span className="hidden border-l border-primary/25 pl-3 text-sm text-primary sm:block">Studio</span>
          </div>
          <div className="dc-studio-header-actions flex shrink-0 items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <LanguageToggle />
          </div>
          {error && <span className="w-full text-sm text-destructive" role="alert">{error}</span>}
        </header>
        <InvitationDesigner />
      </div>
    </main>
  );
}
