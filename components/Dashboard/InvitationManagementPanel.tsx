"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Copy, Eye, LockKeyhole, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { slugifyEvent } from "@/lib/invitation-slug";

type Invitation = {
  id: string;
  slug: string;
  type: "WEDDING" | "ADAT_AKAD";
  title: string;
  isPublished: boolean;
  passwordProtected: boolean;
};

type Props = { accent: string; button: string; paid: boolean };

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_INVITATION_ROOT_DOMAIN || "dcwedding.com";
const invitationOrigin = `https://${ROOT_DOMAIN}`;

const emptyInvitation = (type: Invitation["type"]): Invitation => ({
  id: "",
  slug: "",
  type,
  title: type === "WEDDING" ? "Undangan Pernikahan" : "Undangan Event Khusus",
  isPublished: false,
  passwordProtected: false,
});

function publicInvitationUrl(weddingSlug: string, specialInvitation?: Invitation) {
  if (!weddingSlug) return "";
  if (!specialInvitation) return `${invitationOrigin}/`;
  return `${invitationOrigin}/${slugifyEvent(specialInvitation.title || "event")}`;
}

export default function InvitationManagementPanel({ accent, button, paid }: Props) {
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

  useEffect(() => { load().catch(() => setLoading(false)); }, []);

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
      if (!response.ok) throw new Error(data.error || "Gagal mengubah status publikasi.");
      setInvitations((current) => ({ ...current, [type]: data.invitation }));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal mengubah status publikasi.");
    } finally {
      setBusy(null);
    }
  }

  async function savePassword() {
    if (!paid) return;
    const trimmed = password.trim();
    if (passwordProtected && !trimmed) {
      setMessage("Masukkan password baru untuk mengganti password, atau gunakan tombol Matikan.");
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
      if (!response.ok) throw new Error(data.error || "Gagal menyimpan password.");
      setPasswordProtected(Boolean(data.passwordProtected));
      setPassword("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal menyimpan password.");
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
      if (!response.ok) throw new Error(data.error || "Gagal mematikan password.");
      setPasswordProtected(false);
      setPassword("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal mematikan password.");
    } finally {
      setBusy(null);
    }
  }

  const weddingUrl = publicInvitationUrl(invitations.WEDDING.slug);
  const specialUrl = publicInvitationUrl(invitations.WEDDING.slug, invitations.ADAT_AKAD);

  function copyLink(url: string) {
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => setMessage("Link berhasil disalin."));
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5 p-5 sm:p-8">
      <section className="rounded-2xl border border-[#d9cbc2] bg-[#f3ede6] p-6 dark:border-white/10 dark:bg-[#121116]">
        <p className={`font-[family-name:var(--font-cinzel)] text-xs font-semibold uppercase tracking-[.16em] ${accent}`}>Undangan Digital</p>
        <h1 className="mt-2 font-[family-name:var(--font-cinzel)] text-2xl font-semibold">Kelola dua jenis undangan</h1>
        <p className="mt-2 max-w-3xl text-sm text-[#5A4545] dark:text-white/75">Link publik menggunakan subdomain pasangan. Undangan utama berada di root subdomain, sedangkan setiap Event Khusus memakai nama event sebagai path.</p>
        {message && <p className="mt-4 rounded-xl border border-[#d8cbc2] bg-[#fffaf6] px-3 py-2 text-xs dark:border-white/10 dark:bg-black/20">{message}</p>}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <InvitationCard invitation={invitations.WEDDING} publicUrl={weddingUrl} paid={paid} loading={loading} button={button} onCopy={() => copyLink(weddingUrl)} onPublish={() => togglePublish("WEDDING")} busy={busy === "publish-WEDDING"} />
        <InvitationCard invitation={invitations.ADAT_AKAD} publicUrl={specialUrl} paid={paid} loading={loading} button={button} special onCopy={() => copyLink(specialUrl)} onPublish={() => togglePublish("ADAT_AKAD")} busy={busy === "publish-ADAT_AKAD"} />
      </div>

      <section className="rounded-2xl border border-[#d9cbc2] bg-[#f3ede6] p-6 dark:border-white/10 dark:bg-[#121116]">
        <div className="flex items-start gap-3">
          <LockKeyhole className="mt-0.5 h-5 w-5 text-[#7A1C25] dark:text-[#E8A5AE]" />
          <div className="min-w-0 flex-1">
            <p className="font-[family-name:var(--font-cinzel)] text-sm font-semibold">Password Protection</p>
            <p className="mt-1 text-xs text-[#5A4545] dark:text-white/75">Satu pengaturan password melindungi subdomain undangan dan event khusus.</p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder={passwordProtected ? "Password baru (wajib diisi)" : "Password minimal 6 karakter"} disabled={!paid || loading} className="min-w-0 flex-1 rounded-xl border border-[#d8cbc2] bg-[#fffaf6] px-3 py-2 text-sm outline-none focus:border-[#7A1C25] dark:border-white/10 dark:bg-black/20" />
              <Button disabled={!paid || loading || busy === "password" || !password.trim()} onClick={savePassword} className={`rounded-xl ${button} text-white`}>{passwordProtected ? "Ganti Password" : "Aktifkan"}</Button>
              {passwordProtected && <Button disabled={busy === "password-off"} onClick={disablePassword} variant="outline" className="rounded-xl">Matikan</Button>}
            </div>
            <p className="mt-3 font-[family-name:var(--font-dm-mono)] text-[10px] uppercase tracking-[.12em] opacity-60">Status: {passwordProtected ? "Protected" : "Public access"}</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[#d9cbc2] bg-[#f3ede6] p-6 dark:border-white/10 dark:bg-[#121116]">
        <div className="flex items-center gap-3"><Settings2 className="h-5 w-5 text-[#7A1C25] dark:text-[#E8A5AE]"/><p className="font-[family-name:var(--font-cinzel)] text-sm font-semibold">Studio & Asset</p></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Link href="/dashboard/editor" className={`rounded-xl px-4 py-3 text-center text-xs font-semibold text-white ${button}`}>Buka Studio Editor</Link>
          <Link href="/dashboard/editor" className="rounded-xl border border-[#d8cbc2] bg-[#fffaf6] px-4 py-3 text-center text-xs dark:border-white/10 dark:bg-black/20">Kelola Template & Asset</Link>
        </div>
      </section>
    </div>
  );
}

function InvitationCard({ invitation, publicUrl, paid, loading, button, special, onCopy, onPublish, busy }: { invitation: Invitation; publicUrl: string; paid: boolean; loading: boolean; button: string; special?: boolean; onCopy: () => void; onPublish: () => void; busy: boolean }) {
  return <section className="rounded-2xl border border-[#d8cbc2] bg-[#fffaf6] p-5 dark:border-white/10 dark:bg-black/20">
    <div className="flex items-start justify-between gap-3"><div><p className="font-[family-name:var(--font-cinzel)] text-base font-semibold">{special ? "Undangan Event Khusus" : "Undangan Pernikahan"}</p><p className="mt-1 text-xs text-[#5A4545] dark:text-white/75">{special ? "Akad, seserahan, sangjit, atau event privat." : "Undangan utama untuk acara pernikahan dan resepsi."}</p></div><span className="rounded-full border border-[#d8cbc2] px-2.5 py-1 font-[family-name:var(--font-dm-mono)] text-[9px] uppercase dark:border-white/10">{loading ? "Loading" : invitation.isPublished ? "Published" : "Draft"}</span></div>
    <div className="mt-5 rounded-xl border border-[#d8cbc2] bg-[#f3ede6] p-3 dark:border-white/10 dark:bg-black/20"><p className="break-all font-[family-name:var(--font-dm-mono)] text-[10px] opacity-70">{publicUrl || "Link belum tersedia"}</p></div>
    <div className="mt-4 grid grid-cols-2 gap-2">
      <Link href={publicUrl || "#"} target="_blank" aria-disabled={!publicUrl} className={`inline-flex items-center justify-center gap-2 rounded-xl border border-[#d8cbc2] px-3 py-2 text-xs dark:border-white/10 ${!publicUrl ? "pointer-events-none opacity-40" : ""}`}><Eye className="h-3.5 w-3.5"/>Preview</Link>
      <button disabled={!publicUrl} onClick={onCopy} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#d8cbc2] px-3 py-2 text-xs disabled:opacity-40 dark:border-white/10"><Copy className="h-3.5 w-3.5"/>Salin Link</button>
      <Link href={`/dashboard/editor${special ? "?type=ADAT_AKAD" : "?type=WEDDING"}`} className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-white ${button}`}><Settings2 className="h-3.5 w-3.5"/>Edit Desain</Link>
      <button disabled={!paid || busy} onClick={onPublish} className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-white ${paid ? button : "bg-black/20 dark:bg-white/10"}`}>{busy ? "Menyimpan..." : invitation.isPublished ? "Unpublish" : "Publish"}</button>
    </div>
    {!paid && <p className="mt-3 text-[11px] text-[#7A1C25] dark:text-[#E8A5AE]">Publish membutuhkan paket Digital Invitation.</p>}
  </section>;
}
