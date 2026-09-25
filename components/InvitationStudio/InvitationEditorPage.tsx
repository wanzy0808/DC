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
import { invitationTitleCase } from "@/lib/events/parents";

/** Publishing and package checkout live in Dashboard > Undangan Digital. */
export default function InvitationEditorPage({ mode = "invitation", backHref = "/dashboard" }: { mode?: "invitation" | "template"; backHref?: string }) {
  const { locale } = useLanguage();
  const [accessPaid, setAccessPaid] = useState<boolean | null>(null);
  const [documentTitle, setDocumentTitle] = useState("Studio");
  const [error, setError] = useState("");

  useEffect(() => {
    if (mode === "template") {
      setAccessPaid(true);
      setDocumentTitle("Template Studio");
      setError("");
      return;
    }
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
        setDocumentTitle(invitationTitleCase(data.invitation.title || "Studio"));
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setError(reason instanceof Error ? reason.message : "Undangan belum dapat dimuat.");
        }
      });
    return () => controller.abort();
  }, [mode]);

  const previewOnly = accessPaid === false;
  const backLabel = locale === "en" ? "Back" : "Kembali";

  return (
    <main
      className={`dc-invitation-editor font-[family-name:var(--font-dc-sans)] text-foreground ${previewOnly ? "dc-unlicensed-studio" : ""}`}
      onContextMenu={previewOnly ? (event) => event.preventDefault() : undefined}
    >
      <div className="dc-studio-frame">
        <header className="dc-studio-page-header">
          <div className="dc-studio-header-brand flex min-w-0 items-center gap-3">
            <Button asChild size="icon" variant="outline" className="dc-studio-back shrink-0">
              <Link href={backHref} aria-label={backLabel} title={backLabel}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <Link href="/" className="min-w-0"><BrandWordmark size="mobile" /></Link>
          </div>
          <h1 className="dc-studio-document-title truncate font-[family-name:var(--font-dc-heading)] text-base text-primary sm:text-lg" title={documentTitle}>{documentTitle}</h1>
          <div className="dc-studio-header-actions flex shrink-0 items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <LanguageToggle />
          </div>
          {error && <span className="w-full text-sm text-destructive" role="alert">{error}</span>}
        </header>
        <InvitationDesigner mode={mode} />
      </div>
    </main>
  );
}
