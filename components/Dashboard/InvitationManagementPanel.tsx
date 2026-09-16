"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, Copy, ExternalLink, LockKeyhole, PenLine, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/components/I18n/LanguageProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { slugifyEvent } from "@/lib/invitation-slug";

type Invitation = {
  id: string;
  slug: string;
  type: "WEDDING" | "ADAT_AKAD";
  title: string;
  isPublished: boolean;
  passwordProtected: boolean;
};

type Props = {
  paid: boolean;
  accent?: string;
  button?: string;
};

const ROOT_DOMAIN =
  process.env.NEXT_PUBLIC_INVITATION_ROOT_DOMAIN || "dcwedding.com";

const emptyInvitation = (type: Invitation["type"]): Invitation => ({
  id: "",
  slug: "",
  type,
  title: "",
  isPublished: false,
  passwordProtected: false,
});

function publicInvitationUrl(
  weddingSlug: string,
  specialInvitation?: Invitation,
) {
  if (!weddingSlug) return "";
  const origin = `https://${weddingSlug}.${ROOT_DOMAIN}`;
  if (!specialInvitation?.title.trim()) {
    return specialInvitation ? "" : `${origin}/`;
  }
  return `${origin}/${slugifyEvent(specialInvitation.title)}`;
}

export default function InvitationManagementPanel({ paid }: Props) {
  const { locale } = useLanguage();
  const copy = useMemo(
    () =>
      locale === "en"
        ? {
            main: "Main wedding",
            special: "Special event",
            published: "Published",
            draft: "Draft",
            open: "Open",
            copyLink: "Copy link",
            copied: "Link copied.",
            edit: "Edit design",
            publish: "Publish",
            unpublish: "Unpublish",
            saving: "Saving...",
            noMain: "Public URL is not ready.",
            noSpecial: "Set the event name in Studio first.",
            publicUrl: "Public URL",
            pagesPublished: "Published",
            access: "Access",
            package: "Package",
            activePackage: "Active",
            packageRequired: "Package required",
            protected: "Protected",
            publicAccess: "Public",
            password: "Password",
            passwordPlaceholder: "New password",
            enable: "Enable",
            change: "Change",
            disable: "Disable",
            studio: "Studio",
            loading: "Loading...",
            ready: "Ready",
            error: "Something went wrong.",
            passwordSaved: "Password updated.",
            passwordMin: "Password must be at least 6 characters.",
          }
        : {
            main: "Pernikahan utama",
            special: "Event khusus",
            published: "Terbit",
            draft: "Draft",
            open: "Buka",
            copyLink: "Salin link",
            copied: "Link disalin.",
            edit: "Edit desain",
            publish: "Publish",
            unpublish: "Unpublish",
            saving: "Menyimpan...",
            noMain: "URL publik belum tersedia.",
            noSpecial: "Atur nama event di Studio terlebih dahulu.",
            publicUrl: "URL publik",
            pagesPublished: "Terbit",
            access: "Akses",
            package: "Paket",
            activePackage: "Aktif",
            packageRequired: "Belum aktif",
            protected: "Terlindungi",
            publicAccess: "Publik",
            password: "Password",
            passwordPlaceholder: "Password baru",
            enable: "Aktifkan",
            change: "Ganti",
            disable: "Matikan",
            studio: "Studio",
            loading: "Memuat...",
            ready: "Siap",
            error: "Terjadi kesalahan.",
            passwordSaved: "Password diperbarui.",
            passwordMin: "Password minimal 6 karakter.",
          },
    [locale],
  );

  const [invitations, setInvitations] = useState<
    Record<Invitation["type"], Invitation>
  >({
    WEDDING: emptyInvitation("WEDDING"),
    ADAT_AKAD: emptyInvitation("ADAT_AKAD"),
  });
  const [passwordProtected, setPasswordProtected] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [weddingRes, specialRes, passwordRes] = await Promise.all([
        fetch("/api/invitations?type=WEDDING", { cache: "no-store" }),
        fetch("/api/invitations?type=ADAT_AKAD", { cache: "no-store" }),
        fetch("/api/invitations/password", { cache: "no-store" }),
      ]);

      const weddingData = weddingRes.ok ? await weddingRes.json() : null;
      const specialData = specialRes.ok ? await specialRes.json() : null;
      const passwordData = passwordRes.ok ? await passwordRes.json() : null;

      setInvitations((current) => ({
        WEDDING: weddingData?.invitation ?? current.WEDDING,
        ADAT_AKAD: specialData?.invitation ?? current.ADAT_AKAD,
      }));

      if (passwordData) {
        setPasswordProtected(Boolean(passwordData.passwordProtected));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load().catch(() => setLoading(false));
  }, [load]);

  async function togglePublish(type: Invitation["type"]) {
    if (!paid) {
      setMessage(copy.packageRequired);
      return;
    }

    const invitation = invitations[type];
    setBusy(`publish-${type}`);
    setMessage("");
    try {
      const response = await fetch("/api/invitations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, isPublished: !invitation.isPublished }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || copy.error);
      setInvitations((current) => ({ ...current, [type]: data.invitation }));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : copy.error);
    } finally {
      setBusy(null);
    }
  }

  async function savePassword() {
    const trimmed = password.trim();
    if (trimmed.length < 6) {
      setMessage(copy.passwordMin);
      return;
    }

    setBusy("password");
    setMessage("");
    try {
      const response = await fetch("/api/invitations/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: true, password: trimmed }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || copy.error);
      setPasswordProtected(Boolean(data.passwordProtected));
      setPassword("");
      setMessage(copy.passwordSaved);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : copy.error);
    } finally {
      setBusy(null);
    }
  }

  async function disablePassword() {
    setBusy("password-off");
    setMessage("");
    try {
      const response = await fetch("/api/invitations/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: false }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || copy.error);
      setPasswordProtected(false);
      setPassword("");
      setMessage(copy.passwordSaved);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : copy.error);
    } finally {
      setBusy(null);
    }
  }

  const weddingUrl = publicInvitationUrl(invitations.WEDDING.slug);
  const specialUrl = publicInvitationUrl(
    invitations.WEDDING.slug,
    invitations.ADAT_AKAD,
  );
  const publishedCount = Object.values(invitations).filter(
    (invitation) => invitation.isPublished,
  ).length;

  function copyLink(url: string) {
    if (!url) return;
    navigator.clipboard
      .writeText(url)
      .then(() => setMessage(copy.copied))
      .catch(() => setMessage(copy.error));
  }

  return (
    <div className="mx-auto min-w-0 overflow-x-clip pb-16 pt-7 text-foreground sm:pt-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <h2 className="font-[family-name:var(--font-cinzel)] text-lg font-semibold">
            {locale === "en" ? "Invitation pages" : "Halaman undangan"}
          </h2>
          <span className="font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
            {loading ? copy.loading : copy.ready}
          </span>
        </div>
        <Button asChild size="sm">
          <Link href="/dashboard/editor?type=WEDDING">
            <PenLine className="h-4 w-4" />
            {copy.studio}
          </Link>
        </Button>
      </div>

      {message && (
        <div
          className="flex min-w-0 items-center gap-2 border-b border-border px-1 py-3 text-xs text-muted-foreground"
          role="status"
        >
          <Check className="h-4 w-4 shrink-0 text-primary" />
          <span>{message}</span>
        </div>
      )}

      <section className="grid border-b border-border sm:grid-cols-3">
        <SummaryItem
          label={copy.pagesPublished}
          value={loading ? "—" : `${publishedCount} / 2`}
        />
        <SummaryItem
          label={copy.access}
          value={passwordProtected ? copy.protected : copy.publicAccess}
        />
        <SummaryItem
          label={copy.package}
          value={paid ? copy.activePackage : copy.packageRequired}
        />
      </section>

      <section className="mt-6 grid min-w-0 border-y border-border lg:grid-cols-2">
        <InvitationCard
          invitation={invitations.WEDDING}
          publicUrl={weddingUrl}
          paid={paid}
          loading={loading}
          special={false}
          copy={copy}
          onCopy={() => copyLink(weddingUrl)}
          onPublish={() => togglePublish("WEDDING")}
          busy={busy === "publish-WEDDING"}
        />
        <InvitationCard
          invitation={invitations.ADAT_AKAD}
          publicUrl={specialUrl}
          paid={paid}
          loading={loading}
          special
          copy={copy}
          onCopy={() => copyLink(specialUrl)}
          onPublish={() => togglePublish("ADAT_AKAD")}
          busy={busy === "publish-ADAT_AKAD"}
        />
      </section>

      <section className="mt-8 border-t border-border pt-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] border border-border text-primary">
              <LockKeyhole className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-[family-name:var(--font-cinzel)] text-base font-semibold">
                {copy.password}
              </h3>
              <div className="mt-0.5 flex items-center gap-1.5 font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                {passwordProtected ? copy.protected : copy.publicAccess}
              </div>
            </div>
          </div>

          <div className="grid min-w-0 gap-2 sm:grid-cols-[minmax(13rem,1fr)_auto_auto] sm:items-center">
            <Input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              placeholder={copy.passwordPlaceholder}
              disabled={!paid || loading}
              className="min-w-0"
            />
            <Button
              size="sm"
              disabled={
                !paid ||
                loading ||
                busy === "password" ||
                password.trim().length < 6
              }
              onClick={savePassword}
            >
              {passwordProtected ? copy.change : copy.enable}
            </Button>
            {passwordProtected && (
              <Button
                size="sm"
                disabled={busy === "password-off"}
                onClick={disablePassword}
              >
                {copy.disable}
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 border-b border-border px-0 py-4 last:border-b-0 sm:border-b-0 sm:border-r sm:px-5 sm:last:border-r-0 sm:first:pl-0">
      <p className="font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function InvitationCard({
  invitation,
  publicUrl,
  paid,
  loading,
  special,
  copy,
  onCopy,
  onPublish,
  busy,
}: {
  invitation: Invitation;
  publicUrl: string;
  paid: boolean;
  loading: boolean;
  special: boolean;
  copy: Record<string, string>;
  onCopy: () => void;
  onPublish: () => void;
  busy: boolean;
}) {
  const title =
    special && invitation.title.trim()
      ? invitation.title
      : special
        ? copy.special
        : copy.main;
  const emptyText = special ? copy.noSpecial : copy.noMain;
  const editHref = `/dashboard/editor?type=${special ? "ADAT_AKAD" : "WEDDING"}`;

  return (
    <article className="min-w-0 py-5 lg:px-6 lg:first:border-r lg:first:border-border lg:first:pl-0 lg:last:pr-0">
      <div className="flex min-w-0 items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
            {special ? "EVENT / 02" : "WEDDING / 01"}
          </p>
          <h3 className="mt-1.5 truncate font-[family-name:var(--font-cinzel)] text-base font-semibold text-foreground">
            {title}
          </h3>
        </div>
        <span className="shrink-0 font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.12em] text-primary">
          {invitation.isPublished ? copy.published : copy.draft}
        </span>
      </div>

      <div className="mt-4 border-y border-border py-3">
        <p className="font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
          {copy.publicUrl}
        </p>
        {publicUrl ? (
          <div className="mt-1.5 flex min-w-0 items-center gap-2">
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className="min-w-0 flex-1 break-all text-xs leading-5 text-foreground underline decoration-border underline-offset-4 transition hover:text-primary"
              title={copy.open}
            >
              {publicUrl}
              <ExternalLink className="ml-1 inline h-3 w-3" />
            </a>
            <Button
              size="icon-sm"
              onClick={onCopy}
              disabled={loading}
              title={copy.copyLink}
              aria-label={copy.copyLink}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <p className="mt-1.5 text-xs text-muted-foreground">{emptyText}</p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button asChild size="sm">
          <Link href={editHref}>
            <PenLine className="h-4 w-4" />
            {copy.edit}
          </Link>
        </Button>
        <Button
          size="sm"
          disabled={!paid || loading || busy}
          onClick={onPublish}
        >
          {busy
            ? copy.saving
            : invitation.isPublished
              ? copy.unpublish
              : copy.publish}
        </Button>
      </div>
    </article>
  );
}
