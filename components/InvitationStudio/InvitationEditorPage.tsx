"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import BrandWordmark from "@/components/Brand/BrandWordmark";
import ThemeToggle from "@/components/Theme/ThemeToggle";
import "./studio.css";
import InvitationDesigner from "@/components/InvitationStudio/InvitationDesigner";
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
  const [dirty, setDirty] = useState(false);
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
    if (publishing || dirty) return;
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
      className={`dc-invitation-editor font-[family-name:var(--font-dc-sans)] text-foreground ${previewOnly ? "dc-unlicensed-studio" : ""}`}
      onContextMenu={previewOnly ? (event) => event.preventDefault() : undefined}
    >
      <div className="dc-studio-frame">
      <header className="dc-studio-page-header">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Button asChild size="icon">
            <Link href="/dashboard" aria-label={copy.back} title={copy.back}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <Link href="/" className="min-w-0"><BrandWordmark size="mobile" /></Link>
          <span className="hidden border-l border-primary/25 pl-3 text-sm text-muted-foreground sm:block">Studio</span>
        </div>
        <ThemeToggle />
          {notice && (
            <span className="ml-auto max-w-80 text-[11px] text-muted-foreground lg:block" role="status">
              {notice}
            </span>
          )}
          <Button
            type="button"
            size="sm"
            onClick={publish}
            disabled={!studio.invitationId || publishing || studio.isPublished || dirty}
            title={dirty ? "Simpan perubahan sebelum menerbitkan" : undefined}
            className={notice ? "" : "ml-auto"}
          >
            <Send className="h-4 w-4" />
            {publishing ? "Memeriksa..." : studio.isPublished ? "Sudah terbit" : "Terbitkan"}
          </Button>

      </header>

      {previewOnly && (
        <div className="border-b border-primary/15 bg-primary/[0.035] px-4 py-2 text-center text-xs text-muted-foreground" role="status">
          Desain bisa disimpan sekarang. Paket diperlukan saat terbitkan.
        </div>
      )}

      <InvitationDesigner onDirtyChange={setDirty} />
      </div>
    </main>
  );
}
