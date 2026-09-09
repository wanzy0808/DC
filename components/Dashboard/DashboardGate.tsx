"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Heart, LockKeyhole, Sparkles } from "lucide-react";

const setupKey = "dc-dashboard-setup-v2";

type Invitation = {
  groomName: string;
  brideName: string;
  venue: string;
  eventDate: string;
  templateKey: string;
  ceremonyTime?: string | null;
  receptionTime?: string | null;
  description?: string | null;
  weddingHashtag?: string | null;
  dressCode?: string | null;
  liveStreamUrl?: string | null;
  eventNotes?: string | null;
  giftBankName?: string | null;
  giftAccountName?: string | null;
  giftAccountNumber?: string | null;
  musicUrl?: string | null;
};

type Access = { digitalInvitation: boolean; guestbook: boolean; bundle: boolean };

export default function DashboardGate({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [showSetup, setShowSetup] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [nickname, setNickname] = useState("");
  const [access, setAccess] = useState<Access>({ digitalInvitation: false, guestbook: false, bundle: false });

  useEffect(() => {
    Promise.all([
      fetch("/api/invitations", { cache: "no-store" }),
      fetch("/api/dashboard/access", { cache: "no-store" }),
      fetch("/api/dashboard/preferences", { cache: "no-store" }),
    ])
      .then(async ([invitationResponse, accessResponse, preferenceResponse]) => {
        if (invitationResponse.ok) setInvitation((await invitationResponse.json()).invitation);
        if (accessResponse.ok) setAccess(await accessResponse.json());
        let savedNickname = "";
        if (preferenceResponse.ok) savedNickname = (await preferenceResponse.json()).nickname ?? "";
        setNickname(savedNickname);
        setShowSetup(window.localStorage.getItem(setupKey) !== "1" || !savedNickname);
      })
      .catch(() => setError("Data dashboard belum dapat dimuat."))
      .finally(() => setLoading(false));
  }, []);

  async function saveSetup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!invitation) return;
    const form = new FormData(event.currentTarget);
    const groomName = String(form.get("groomName") ?? "").trim();
    const brideName = String(form.get("brideName") ?? "").trim();
    const nextNickname = String(form.get("nickname") ?? "").trim();
    if (!groomName || !brideName || !nextNickname) {
      setError("Nama pasangan dan nama panggilan wajib diisi.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const invitationResponse = await fetch("/api/invitations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...invitation, groomName, brideName, eventDate: invitation.eventDate, venue: invitation.venue, templateKey: invitation.templateKey, isPublished: false }),
      });
      const invitationData = await invitationResponse.json();
      if (!invitationResponse.ok) throw new Error(invitationData.error ?? "Data pasangan belum dapat disimpan.");
      const preferenceResponse = await fetch("/api/dashboard/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: nextNickname }),
      });
      const preferenceData = await preferenceResponse.json();
      if (!preferenceResponse.ok) throw new Error(preferenceData.error ?? "Nama panggilan belum dapat disimpan.");
      setInvitation(invitationData.invitation);
      setNickname(preferenceData.nickname);
      window.localStorage.setItem(setupKey, "1");
      setShowSetup(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Setup dashboard gagal disimpan.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="grid min-h-screen place-items-center bg-[#FAF7F2] text-sm text-black/50">Menyiapkan workspace...</div>;

  return (
    <>
      {children}
      {showSetup && invitation && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-[#171217]/55 p-4 backdrop-blur-sm">
          <form onSubmit={saveSetup} className="w-full max-w-xl rounded-[28px] border border-black/10 bg-[#fffdfa] p-7 shadow-2xl sm:p-9">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#7A1C25]/10 text-[#7A1C25]"><Heart className="h-5 w-5" /></div>
            <p className="mt-5 text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7A1C25]">Sebelum masuk workspace</p>
            <h1 className="mt-2 text-center font-serif text-3xl">Kenalan dulu dengan pasanganmu</h1>
            <p className="mx-auto mt-2 max-w-md text-center text-xs leading-5 text-black/50">Data ini dipakai untuk judul undangan dan sapaan di dashboard. Kamu bisa mengubahnya lagi nanti dari pengaturan undangan.</p>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-semibold">Nama pasangan pria<input name="groomName" defaultValue={invitation.groomName} className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-normal outline-none focus:border-[#7A1C25]" placeholder="Contoh: Andi" /></label>
              <label className="text-xs font-semibold">Nama pasangan wanita<input name="brideName" defaultValue={invitation.brideName} className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-normal outline-none focus:border-[#7A1C25]" placeholder="Contoh: Sinta" /></label>
            </div>
            <label className="mt-4 block text-xs font-semibold">Nama panggilan kamu di dashboard<input name="nickname" defaultValue={nickname} className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-normal outline-none focus:border-[#7A1C25]" placeholder="Contoh: Hendro" /></label>
            {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-xs text-red-700">{error}</p>}
            <button disabled={saving} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#7A1C25] px-5 py-3.5 text-xs font-medium text-white disabled:opacity-50"><Sparkles className="h-4 w-4" />{saving ? "Menyimpan..." : "Masuk ke Dashboard"}</button>
          </form>
        </div>
      )}
      {!showSetup && !access.digitalInvitation && (
        <div className="pointer-events-none fixed bottom-5 right-5 z-40 hidden rounded-2xl border border-black/10 bg-white/95 px-4 py-3 shadow-lg sm:block"><div className="flex items-center gap-2"><LockKeyhole className="h-4 w-4 text-[#7A1C25]" /><span className="text-[10px] font-semibold">Mode template</span></div><p className="mt-1 text-[9px] text-black/45">Publikasi &amp; upload asset terbuka setelah paket aktif.</p></div>
      )}
    </>
  );
}
