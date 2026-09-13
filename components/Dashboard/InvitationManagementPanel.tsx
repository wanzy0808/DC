"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check, Copy, Eye, KeyRound, LockKeyhole, PenLine, ShieldCheck, Sparkles } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { useLanguage } from "@/components/I18n/LanguageProvider";
import { slugifyEvent } from "@/lib/invitation-slug";
import { cn } from "@/lib/utils";

type Invitation = {
  id: string;
  slug: string;
  type: "WEDDING" | "ADAT_AKAD";
  title: string;
  isPublished: boolean;
  passwordProtected: boolean;
};

type Props = { paid: boolean };

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_INVITATION_ROOT_DOMAIN || "dcwedding.com";

const emptyInvitation = (type: Invitation["type"]): Invitation => ({
  id: "",
  slug: "",
  type,
  title: "",
  isPublished: false,
  passwordProtected: false,
});

function publicInvitationUrl(weddingSlug: string, specialInvitation?: Invitation) {
  if (!weddingSlug) return "";
  const origin = `https://${weddingSlug}.${ROOT_DOMAIN}`;
  if (!specialInvitation?.title.trim()) return specialInvitation ? "" : `${origin}/`;
  return `${origin}/${slugifyEvent(specialInvitation.title)}`;
}

export default function InvitationManagementPanel({ paid }: Props) {
  const { locale } = useLanguage();
  const copy = useMemo(
    () =>
      locale === "en"
        ? {
            eyebrow: "Digital invitation workspace",
            title: "Make every first impression unforgettable.",
            intro: "Shape the invitation, publish when it feels right, and keep every guest-facing detail under your control.",
            main: "Main wedding",
            special: "Special event",
            mainDesc: "Your primary invitation for the wedding celebration and reception.",
            specialDesc: "A dedicated experience for akad, sangjit, family gatherings, or private moments.",
            published: "Published",
            draft: "Draft",
            preview: "Preview",
            copyLink: "Copy link",
            copied: "Link copied.",
            edit: "Edit design",
            publish: "Publish",
            unpublish: "Unpublish",
            saving: "Saving...",
            noMain: "Your public link will appear here once the invitation is ready.",
            noSpecial: "Set an event name in the studio to create its public path.",
            accessEyebrow: "Privacy & access",
            accessTitle: "Decide who gets through the door.",
            accessDesc: "One password protects both the main invitation and every special-event page.",
            protected: "Protected",
            publicAccess: "Public access",
            passwordPlaceholder: "New password",
            enable: "Protect invitation",
            change: "Change password",
            disable: "Remove protection",
            studioEyebrow: "Design studio",
            studioTitle: "Turn your story into a beautiful experience.",
            studioDesc: "Choose a template, refine the palette, shape the typography, then preview the full invitation before publishing.",
            openStudio: "Open invitation studio",
            manageAssets: "Manage templates & assets",
            packageRequired: "Publishing requires a Digital Invitation package.",
            loading: "Loading invitation...",
            ready: "Ready to edit.",
            error: "Something went wrong.",
            passwordError: "Enter a new password or remove protection.",
            passwordSaved: "Password protection updated.",
            passwordMin: "Password must be at least 6 characters.",
          }
        : {
            eyebrow: "Ruang kerja undangan digital",
            title: "Buat kesan pertama yang tak terlupakan.",
            intro: "Rancang undangan, publikasikan saat sudah terasa tepat, dan kendalikan setiap detail yang dilihat tamu.",
            main: "Pernikahan utama",
            special: "Event khusus",
            mainDesc: "Undangan utama untuk perayaan pernikahan dan resepsi.",
            specialDesc: "Pengalaman khusus untuk akad, sangjit, kumpul keluarga, atau momen privat.",
            published: "Terbit",
            draft: "Draft",
            preview: "Preview",
            copyLink: "Salin link",
            copied: "Link berhasil disalin.",
            edit: "Edit desain",
            publish: "Publish",
            unpublish: "Unpublish",
            saving: "Menyimpan...",
            noMain: "Link publik akan muncul di sini setelah undangan siap.",
            noSpecial: "Atur nama event di studio untuk membuat alamat publiknya.",
            accessEyebrow: "Privasi & akses",
            accessTitle: "Tentukan siapa yang boleh masuk.",
            accessDesc: "Satu password melindungi undangan utama dan seluruh halaman event khusus.",
            protected: "Terlindungi",
            publicAccess: "Akses publik",
            passwordPlaceholder: "Password baru",
            enable: "Lindungi undangan",
            change: "Ganti password",
            disable: "Matikan proteksi",
            studioEyebrow: "Design studio",
            studioTitle: "Ubah cerita kalian menjadi pengalaman yang indah.",
            studioDesc: "Pilih template, rapikan warna, bentuk tipografi, lalu preview seluruh undangan sebelum dipublikasikan.",
            openStudio: "Buka invitation studio",
            manageAssets: "Kelola template & asset",
            packageRequired: "Publish membutuhkan paket Digital Invitation.",
            loading: "Memuat undangan...",
            ready: "Siap diedit.",
            error: "Terjadi kesalahan.",
            passwordError: "Masukkan password baru atau matikan proteksi.",
            passwordSaved: "Proteksi password berhasil diperbarui.",
            passwordMin: "Password minimal 6 karakter.",
          },
    [locale],
  );

  const [invitations, setInvitations] = useState<Record<Invitation["type"], Invitation>>({
    WEDDING: emptyInvitation("WEDDING"),
    ADAT_AKAD: emptyInvitation("ADAT_AKAD"),
  });
  const [passwordProtected, setPasswordProtected] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    try {
      const [weddingRes, specialRes, passwordRes] = await Promise.all([
        fetch("/api/invitations?type=WEDDING", { cache: "no-store" }),
        fetch("/api/invitations?type=ADAT_AKAD", { cache: "no-store" }),
        fetch("/api/invitations/password", { cache: "no-store" }),
      ]);
      const next = { ...invitations };
      if (weddingRes.ok) next.WEDDING = await weddingRes.json().then((x) => x.invitation);
      if (specialRes.ok) next.ADAT_AKAD = await specialRes.json().then((x) => x.invitation);
      setInvitations(next);
      if (passwordRes.ok) setPasswordProtected(Boolean((await passwordRes.json()).passwordProtected));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load().catch(() => setLoading(false));
  }, []);

  async function togglePublish(type: Invitation["type"]) {
    if (!paid) return;
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
  const specialUrl = publicInvitationUrl(invitations.WEDDING.slug, invitations.ADAT_AKAD);

  function copyLink(url: string) {
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => setMessage(copy.copied));
  }

  return (
    <div className="mx-auto max-w-7xl px-5 pb-16 pt-8 sm:px-8 sm:pt-12">
      <section className="relative overflow-hidden rounded-[2rem] border border-border bg-card px-6 py-9 shadow-sm sm:px-10 sm:py-12">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative max-w-3xl">
          <div className="flex items-center gap-2 font-[family-name:var(--font-dm-mono)] text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            {copy.eyebrow}
          </div>
          <h1 className="mt-4 max-w-2xl font-[family-name:var(--font-cinzel)] text-3xl font-semibold leading-[1.12] tracking-tight sm:text-5xl">
            {copy.title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">{copy.intro}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/dashboard/editor?type=WEDDING" className={cn(buttonVariants({ variant: "default" }), "rounded-full px-5")}> 
              <PenLine className="h-4 w-4" />
              {copy.openStudio}
            </Link>
            <Link href="/dashboard" className={cn(buttonVariants({ variant: "outline" }), "rounded-full px-5")}> 
              {locale === "en" ? "Back to dashboard" : "Kembali ke dashboard"}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {message && (
        <div className="mt-5 flex items-center gap-2 rounded-2xl border border-border bg-secondary/50 px-4 py-3 text-xs text-muted-foreground" role="status">
          <Check className="h-4 w-4 text-primary" />
          {message}
        </div>
      )}

      <section className="mt-8">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="font-[family-name:var(--font-dm-mono)] text-[10px] uppercase tracking-[0.18em] text-muted-foreground">01 / Invitation</p>
            <h2 className="mt-2 font-[family-name:var(--font-cinzel)] text-2xl font-semibold">{locale === "en" ? "Your invitations" : "Undangan kalian"}</h2>
          </div>
          <span className="hidden text-xs text-muted-foreground sm:block">{loading ? copy.loading : copy.ready}</span>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <InvitationCard invitation={invitations.WEDDING} publicUrl={weddingUrl} paid={paid} loading={loading} special={false} copy={copy} onCopy={() => copyLink(weddingUrl)} onPublish={() => togglePublish("WEDDING")} busy={busy === "publish-WEDDING"} />
          <InvitationCard invitation={invitations.ADAT_AKAD} publicUrl={specialUrl} paid={paid} loading={loading} special copy={copy} onCopy={() => copyLink(specialUrl)} onPublish={() => togglePublish("ADAT_AKAD")} busy={busy === "publish-ADAT_AKAD"} />
        </div>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
        <div className="rounded-[1.75rem] border border-border bg-card p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-secondary text-primary"><LockKeyhole className="h-5 w-5" /></div>
            <div>
              <p className="font-[family-name:var(--font-dm-mono)] text-[10px] uppercase tracking-[0.18em] text-muted-foreground">02 / {copy.accessEyebrow}</p>
              <h2 className="mt-2 font-[family-name:var(--font-cinzel)] text-xl font-semibold sm:text-2xl">{copy.accessTitle}</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{copy.accessDesc}</p>
            </div>
          </div>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder={copy.passwordPlaceholder}
              disabled={!paid || loading}
              className="min-h-11 min-w-0 flex-1 rounded-xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
            />
            <Button disabled={!paid || loading || busy === "password" || password.trim().length < 6} onClick={savePassword} className="rounded-xl">
              {passwordProtected ? copy.change : copy.enable}
            </Button>
            {passwordProtected && <Button disabled={busy === "password-off"} onClick={disablePassword} variant="outline" className="rounded-xl">{copy.disable}</Button>}
          </div>
          <div className="mt-4 flex items-center gap-2 font-[family-name:var(--font-dm-mono)] text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" />
            {passwordProtected ? copy.protected : copy.publicAccess}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-primary/20 bg-secondary/55 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-background text-primary"><KeyRound className="h-5 w-5" /></div>
            <div>
              <p className="font-[family-name:var(--font-dm-mono)] text-[10px] uppercase tracking-[0.18em] text-muted-foreground">03 / {copy.studioEyebrow}</p>
              <h2 className="mt-2 font-[family-name:var(--font-cinzel)] text-xl font-semibold sm:text-2xl">{copy.studioTitle}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy.studioDesc}</p>
            </div>
          </div>
          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            <Link href="/dashboard/editor" className={cn(buttonVariants({ variant: "default" }), "rounded-xl")}>{copy.openStudio}</Link>
            <Link href="/dashboard/editor" className={cn(buttonVariants({ variant: "outline" }), "rounded-xl")}>{copy.manageAssets}</Link>
          </div>
        </div>
      </section>
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
  const title = special ? copy.special : copy.main;
  const description = special ? copy.specialDesc : copy.mainDesc;
  const emptyText = special ? copy.noSpecial : copy.noMain;

  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-sm transition-transform duration-300 hover:-translate-y-1">
      <div className="border-b border-border bg-secondary/40 px-6 py-5 sm:px-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-[family-name:var(--font-dm-mono)] text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{special ? "EVENT / 02" : "WEDDING / 01"}</p>
            <h3 className="mt-2 font-[family-name:var(--font-cinzel)] text-xl font-semibold">{title}</h3>
          </div>
          <span className={cn("rounded-full border px-3 py-1 font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.12em]", invitation.isPublished ? "border-primary/30 bg-primary/10 text-primary" : "border-border text-muted-foreground")}>
            {loading ? "..." : invitation.isPublished ? copy.published : copy.draft}
          </span>
        </div>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      </div>

      <div className="p-6 sm:p-7">
        <div className="min-h-24 rounded-2xl border border-border bg-background p-4">
          <p className="font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.14em] text-muted-foreground">Public URL</p>
          <p className="mt-3 break-all text-xs leading-5 text-foreground/80">{publicUrl || emptyText}</p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Link href={publicUrl || "#"} target="_blank" aria-disabled={!publicUrl} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-xl", !publicUrl && "pointer-events-none opacity-40")}>
            <Eye className="h-3.5 w-3.5" />
            {copy.preview}
          </Link>
          <Button variant="outline" size="sm" disabled={!publicUrl} onClick={onCopy} className="rounded-xl">
            <Copy className="h-3.5 w-3.5" />
            {copy.copyLink}
          </Button>
          <Link href={`/dashboard/editor${special ? "?type=ADAT_AKAD" : "?type=WEDDING"}`} className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "rounded-xl")}>
            <PenLine className="h-3.5 w-3.5" />
            {copy.edit}
          </Link>
          <Button disabled={!paid || busy} onClick={onPublish} size="sm" className="rounded-xl">
            {busy ? copy.saving : invitation.isPublished ? copy.unpublish : copy.publish}
          </Button>
        </div>
        {!paid && <p className="mt-4 text-xs text-muted-foreground">{copy.packageRequired}</p>}
      </div>
    </article>
  );
}
