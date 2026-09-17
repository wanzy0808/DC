"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, LayoutTemplate, Send } from "lucide-react";
import InvitationDesignerV2 from "@/components/InvitationStudio/InvitationDesignerV2";
import { useLanguage } from "@/components/I18n/LanguageProvider";
import { Button } from "@/components/ui/button";

type StudioState = {
  invitationId: string;
  accessPaid: boolean | null;
  isPublished: boolean;
};

function studioParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    invitationId: params.get("invitationId")?.trim() || "",
    type: params.get("type") === "ADAT_AKAD" ? "ADAT_AKAD" : "WEDDING",
  };
}

export default function InvitationEditorPage() {
  const { locale } = useLanguage();
  const [studio, setStudio] = useState<StudioState>({
    invitationId: "",
    accessPaid: null,
    isPublished: false,
  });
  const [notice, setNotice] = useState("");
  const [publishing, setPublishing] = useState(false);
  const copy =
    locale === "en"
      ? { back: "Back to dashboard", studio: "Invitation Studio", home: "Dashboard" }
      : { back: "Kembali ke dashboard", studio: "Invitation Studio", home: "Dashboard" };

  async function readLatestInvitation() {
    const { invitationId, type } = studioParams();
    if (!invitationId) throw new Error("Acara belum dipilih.");

    const response = await fetch(
      `/api/invitations?id=${encodeURIComponent(invitationId)}&type=${type}`,
      { cache: "no-store" },
    );
    const data = await response.json().catch(() => null);
    if (!response.ok || !data?.invitation) {
      throw new Error(data?.error || "Undangan belum dapat dimuat.");
    }

    setStudio({
      invitationId,
      accessPaid: Boolean(data.invitation.accessPaid),
      isPublished: Boolean(data.invitation.isPublished),
    });
    return data.invitation as {
      id: string;
      templateKey: string;
      accessPaid: boolean;
      isPublished: boolean;
    };
  }

  useEffect(() => {
    readLatestInvitation().catch((error) => {
      setNotice(error instanceof Error ? error.message : "Undangan belum dapat dimuat.");
    });
  }, []);

  async function publish() {
    if (publishing) return;
    setPublishing(true);
    setNotice("Memeriksa undangan...");
    try {
      const latest = await readLatestInvitation();
      if (!latest.templateKey?.trim()) {
        setNotice("Simpan template terlebih dahulu sebelum publish.");
        return;
      }
      if (!latest.accessPaid) {
        window.location.assign(
          `/packages?package=INVITATION_BASIC&invitationId=${encodeURIComponent(latest.id)}`,
        );
        return;
      }
      if (latest.isPublished) {
        setNotice("Undangan sudah dipublish.");
        return;
      }

      const response = await fetch("/api/invitations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: latest.id, isPublished: true }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || "Undangan belum dapat dipublish.");

      setStudio((current) => ({
        ...current,
        accessPaid: Boolean(data.invitation?.accessPaid),
        isPublished: Boolean(data.invitation?.isPublished),
      }));
      setNotice("Undangan berhasil dipublish.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Undangan belum dapat dipublish.");
    } finally {
      setPublishing(false);
    }
  }

  const previewOnly = studio.accessPaid === false;

  return (
    <main
      className={`dc-invitation-editor min-h-screen bg-background font-[family-name:var(--font-fauna)] text-foreground ${previewOnly ? "dc-unlicensed-studio" : ""}`}
      onContextMenu={previewOnly ? (event) => event.preventDefault() : undefined}
    >
      <header className="border-b border-border/70 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 w-[80vw] max-w-full items-center gap-3">
          <Button asChild size="icon">
            <Link href="/dashboard" aria-label={copy.back} title={copy.back}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
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
          {notice && (
            <span className="ml-auto hidden max-w-80 truncate text-[11px] text-muted-foreground lg:block" role="status">
              {notice}
            </span>
          )}
          <Button
            type="button"
            size="sm"
            onClick={publish}
            disabled={!studio.invitationId || publishing || studio.isPublished}
            className={notice ? "" : "ml-auto"}
          >
            <Send className="h-4 w-4" />
            {publishing ? "Memeriksa..." : studio.isPublished ? "Sudah terbit" : "Publish"}
          </Button>
          <Link href="/dashboard" className="text-xs text-muted-foreground hover:text-foreground">
            {copy.home}
          </Link>
        </div>
      </header>

      {previewOnly && (
        <div className="border-b border-primary/15 bg-primary/[0.035] px-4 py-2 text-center text-xs text-muted-foreground" role="status">
          Mode preview ber-watermark. Desain boleh disiapkan dan disimpan sekarang; paket hanya diperlukan saat Publish.
        </div>
      )}

      <InvitationDesignerV2 />
      <style jsx global>{`
        .dc-invitation-editor .dc-invitation-studio-shell {
          background: var(--background);
          color: var(--foreground);
        }
        .dc-invitation-editor .dc-invitation-studio-shell > div > main > div:first-child {
          width: 390px;
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
        .dc-unlicensed-studio .dc-invitation-studio-shell img {
          -webkit-user-drag: none;
          user-select: none;
        }
        .dc-unlicensed-studio .dc-invitation-studio-shell > div > main > div:first-child,
        .dc-unlicensed-studio .dc-invitation-studio-shell > div.fixed > div.relative {
          position: relative;
          isolation: isolate;
        }
        .dc-unlicensed-studio .dc-invitation-studio-shell > div > main > div:first-child::after,
        .dc-unlicensed-studio .dc-invitation-studio-shell > div.fixed > div.relative::after {
          content: "PREVIEW • DC ORGANIZER";
          position: absolute;
          left: -18%;
          right: -18%;
          top: 46%;
          z-index: 40;
          transform: rotate(-24deg);
          border-block: 1px solid currentColor;
          padding: 14px 0;
          color: var(--primary);
          background: color-mix(in srgb, var(--background) 78%, transparent);
          font-family: var(--font-dm-mono);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.28em;
          text-align: center;
          opacity: 0.72;
          pointer-events: none;
          user-select: none;
        }
      `}</style>
    </main>
  );
}
