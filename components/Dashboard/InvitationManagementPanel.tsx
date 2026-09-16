"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Check,
  Copy,
  ExternalLink,
  KeyRound,
  LockKeyhole,
  PenLine,
  ShieldCheck,
} from "lucide-react";
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
            sectionEyebrow: "Invitation control",
            sectionTitle: "Manage what guests will see.",
            sectionDesc:
              "Edit the design, review the public address, and control publishing from one compact workspace.",
            main: "Main wedding",
            special: "Special event",
            mainDesc:
              "The primary invitation for your ceremony, reception, and celebration.",
            specialDesc:
              "A focused invitation for akad, sangjit, family gatherings, or private moments.",
            published: "Published",
            draft: "Draft",
            preview: "Open public page",
            copyLink: "Copy public link",
            copied: "Link copied.",
            edit: "Edit design",
            publish: "Publish",
            unpublish: "Unpublish",
            saving: "Saving...",
            noMain: "The public address will appear once the invitation is ready.",
            noSpecial: "Add an event name in the studio to create its public address.",
            publicUrl: "Public URL",
            overview: "Overview",
            pagesPublished: "Pages published",
            access: "Guest access",
            package: "Package",
            activePackage: "Digital Invitation active",
            packageRequired: "Digital Invitation package required",
            privacyEyebrow: "Privacy & access",
            privacyTitle: "One password for every invitation page.",
            privacyDesc:
              "Enable shared password protection for the main invitation and special-event page.",
            protected: "Protected",
            publicAccess: "Public access",
            passwordPlaceholder: "New password",
            enable: "Protect invitation",
            change: "Change password",
            disable: "Remove protection",
            studioEyebrow: "Design studio",
            studioTitle: "Continue refining the invitation.",
            studioDesc:
              "Template, content, photos, music, and visual settings stay inside the invitation studio.",
            openStudio: "Open invitation studio",
            loading: "Loading invitation...",
            ready: "Invitation data is ready.",
            error: "Something went wrong.",
            passwordSaved: "Password protection updated.",
            passwordMin: "Password must be at least 6 characters.",
          }
        : {
            sectionEyebrow: "Kontrol undangan",
            sectionTitle: "Kelola yang akan dilihat tamu.",
            sectionDesc:
              "Edit desain, periksa alamat publik, dan atur status publish dari satu workspace yang ringkas.",
            main: "Pernikahan utama",
            special: "Event khusus",
            mainDesc:
              "Undangan utama untuk prosesi, resepsi, dan seluruh perayaan kalian.",
            specialDesc:
              "Undangan khusus untuk akad, sangjit, kumpul keluarga, atau momen yang lebih intim.",
            published: "Terbit",
            draft: "Draft",
            preview: "Buka halaman publik",
            copyLink: "Salin link publik",
            copied: "Link berhasil disalin.",
            edit: "Edit desain",
            publish: "Publish",
            unpublish: "Unpublish",
            saving: "Menyimpan...",
            noMain: "Alamat publik akan muncul setelah undangan siap.",
            noSpecial:
              "Tambahkan nama event di studio untuk membuat alamat publiknya.",
            publicUrl: "URL publik",
            overview: "Ringkasan",
            pagesPublished: "Halaman terbit",
            access: "Akses tamu",
            package: "Paket",
            activePackage: "Digital Invitation aktif",
            packageRequired: "Paket Digital Invitation diperlukan",
            privacyEyebrow: "Privasi & akses",
            privacyTitle: "Satu password untuk seluruh halaman undangan.",
            privacyDesc:
              "Aktifkan proteksi password bersama untuk undangan utama dan halaman event khusus.",
            protected: "Terlindungi",
            publicAccess: "Akses publik",
            passwordPlaceholder: "Password baru",
            enable: "Lindungi undangan",
            change: "Ganti password",
            disable: "Matikan proteksi",
            studioEyebrow: "Design studio",
            studioTitle: "Lanjutkan penyempurnaan undangan.",
            studioDesc:
              "Template, konten, foto, musik, dan pengaturan visual tetap dikelola di invitation studio.",
            openStudio: "Buka invitation studio",
            loading: "Memuat undangan...",
            ready: "Data undangan siap dikelola.",
            error: "Terjadi kesalahan.",
            passwordSaved: "Proteksi password berhasil diperbarui.",
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

  const load = useCallback(() => {
      return Promise.all([
        fetch("/api/invitations?type=WEDDING", { cache: "no-store" }),
        fetch("/api/invitations?type=ADAT_AKAD", { cache: "no-store" }),
        fetch("/api/invitations/password", { cache: "no-store" }),
      ]).then(async ([weddingRes, specialRes, passwordRes]) => {
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
    }).finally(() => {
      setLoading(false);
    });
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
        body: JSON.stringify({
          type,
          isPublished: !invitation.isPublished,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || copy.error);
      setInvitations((current) => ({
        ...current,
        [type]: data.invitation,
      }));
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
    <div className="mx-auto min-w-0 overflow-x-clip pb-16 pt-8 text-foreground sm:pt-10">
      <section className="grid gap-6 border-b border-border pb-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="min-w-0">
          <p className="font-[family-name:var(--font-dm-mono)] text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            {copy.sectionEyebrow}
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-cinzel)] text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
            {copy.sectionTitle}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {copy.sectionDesc}
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/dashboard/editor?type=WEDDING">
            <PenLine className="h-4 w-4" />
            {copy.openStudio}
          </Link>
        </Button>
      </section>

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

      <section className="mt-9 min-w-0">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="font-[family-name:var(--font-dm-mono)] text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              01 / {copy.overview}
            </p>
            <h3 className="mt-2 font-[family-name:var(--font-cinzel)] text-xl font-semibold text-foreground sm:text-2xl">
              {locale === "en" ? "Invitation pages" : "Halaman undangan"}
            </h3>
          </div>
          <span className="hidden font-[family-name:var(--font-dm-mono)] text-[10px] uppercase tracking-[0.12em] text-muted-foreground sm:block">
            {loading ? copy.loading : copy.ready}
          </span>
        </div>

        <div className="grid min-w-0 border-y border-border lg:grid-cols-2">
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
        </div>
      </section>

      <section className="mt-10 grid min-w-0 gap-8 border-t border-border pt-8 lg:grid-cols-2">
        <div className="min-w-0 lg:border-r lg:border-border lg:pr-8">
          <div className="flex items-start gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] border border-border text-primary">
              <LockKeyhole className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="font-[family-name:var(--font-dm-mono)] text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                02 / {copy.privacyEyebrow}
              </p>
              <h3 className="mt-2 font-[family-name:var(--font-cinzel)] text-xl font-semibold text-foreground">
                {copy.privacyTitle}
              </h3>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                {copy.privacyDesc}
              </p>
            </div>
          </div>

          <div className="mt-6 grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center">
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

          <div className="mt-3 flex items-center gap-2 font-[family-name:var(--font-dm-mono)] text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            {passwordProtected ? copy.protected : copy.publicAccess}
          </div>
        </div>

        <div className="min-w-0 lg:pl-1">
          <div className="flex items-start gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] border border-border text-primary">
              <KeyRound className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="font-[family-name:var(--font-dm-mono)] text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                03 / {copy.studioEyebrow}
              </p>
              <h3 className="mt-2 font-[family-name:var(--font-cinzel)] text-xl font-semibold text-foreground">
                {copy.studioTitle}
              </h3>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                {copy.studioDesc}
              </p>
              <Button asChild size="sm" className="mt-5">
                <Link href="/dashboard/editor">
                  <PenLine className="h-4 w-4" />
                  {copy.openStudio}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 border-b border-border px-0 py-4 last:border-b-0 sm:border-b-0 sm:border-r sm:px-5 sm:last:border-r-0 sm:first:pl-0">
      <p className="font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 truncate text-sm text-foreground">{value}</p>
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
    special && invitation.title.trim() ? invitation.title : special ? copy.special : copy.main;
  const description = special ? copy.specialDesc : copy.mainDesc;
  const emptyText = special ? copy.noSpecial : copy.noMain;
  const editHref = `/dashboard/editor?type=${special ? "ADAT_AKAD" : "WEDDING"}`;

  return (
    <article className="min-w-0 py-6 lg:min-h-[18rem] lg:px-7 lg:first:border-r lg:first:border-border lg:first:pl-0 lg:last:pr-0">
      <div className="flex min-w-0 items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
            {special ? "EVENT / 02" : "WEDDING / 01"}
          </p>
          <h4 className="mt-2 font-[family-name:var(--font-cinzel)] text-lg font-semibold text-foreground">
            {title}
          </h4>
        </div>
        <span className="shrink-0 font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.14em] text-primary">
          {invitation.isPublished ? copy.published : copy.draft}
        </span>
      </div>

      <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
        {description}
      </p>

      <div className="mt-6 border-y border-border py-4">
        <p className="font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
          {copy.publicUrl}
        </p>
        {publicUrl ? (
          <div className="mt-2 flex min-w-0 items-center gap-2">
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className="min-w-0 flex-1 break-all text-xs leading-5 text-foreground underline decoration-border underline-offset-4 transition hover:text-primary"
              title={copy.preview}
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
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            {emptyText}
          </p>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
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

      {!paid && (
        <p className="mt-3 text-[11px] leading-5 text-muted-foreground">
          {copy.packageRequired}
        </p>
      )}
    </article>
  );
}
