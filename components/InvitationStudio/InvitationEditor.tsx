"use client";

import { FormEvent, useEffect, useState } from "react";
import { Check, Copy, ExternalLink, ImagePlus, Music2, Save, Share2, Trash2 } from "lucide-react";
import { invitationTemplates } from "@/lib/templates/catalog";

type Asset = { id: string; type: "IMAGE" | "AUDIO"; url: string; title: string | null };
type Invitation = {
  id: string;
  slug: string;
  groomName: string;
  brideName: string;
  venue: string;
  eventDate: string;
  ceremonyTime: string | null;
  receptionTime: string | null;
  description: string | null;
  weddingHashtag: string | null;
  dressCode: string | null;
  liveStreamUrl: string | null;
  eventNotes: string | null;
  giftBankName: string | null;
  giftAccountName: string | null;
  giftAccountNumber: string | null;
  musicUrl: string | null;
  isPublished: boolean;
  templateKey: string;
  payment: { status: "PENDING" | "PAID" | "FAILED"; packageKey: string; proofUrl: string | null } | null;
  assets: Asset[];
};

const fallbackImage = "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=900";

export default function InvitationEditor() {
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [form, setForm] = useState({ groomName: "", brideName: "", venue: "", eventDate: "", ceremonyTime: "", receptionTime: "", description: "", weddingHashtag: "", dressCode: "", liveStreamUrl: "", eventNotes: "", giftBankName: "", giftAccountName: "", giftAccountNumber: "", musicUrl: "", templateKey: "eternal-blossom", isPublished: false });
  const [assetUrl, setAssetUrl] = useState("");
  const [assetType, setAssetType] = useState<"IMAGE" | "AUDIO">("IMAGE");
  const [message, setMessage] = useState("Memuat template...");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [proofUrl, setProofUrl] = useState("");

  useEffect(() => {
    fetch("/api/invitations")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Template belum dapat dimuat.");
        return data.invitation as Invitation;
      })
      .then((data) => {
        setInvitation(data);
        setForm({
          groomName: data.groomName,
          brideName: data.brideName,
          venue: data.venue,
          eventDate: data.eventDate.slice(0, 10),
          ceremonyTime: data.ceremonyTime ?? "",
          receptionTime: data.receptionTime ?? "",
          description: data.description ?? "",
          weddingHashtag: data.weddingHashtag ?? "",
          dressCode: data.dressCode ?? "",
          liveStreamUrl: data.liveStreamUrl ?? "",
          eventNotes: data.eventNotes ?? "",
          giftBankName: data.giftBankName ?? "",
          giftAccountName: data.giftAccountName ?? "",
          giftAccountNumber: data.giftAccountNumber ?? "",
          musicUrl: data.musicUrl ?? "",
          templateKey: data.templateKey,
          isPublished: data.isPublished,
        });
        setProofUrl(data.payment?.proofUrl ?? "");
        setMessage("Template siap diedit.");
      })
      .catch((error: Error) => setMessage(error.message));
  }, []);

  async function save() {
    setSaving(true);
    setMessage("Menyimpan...");
    const response = await fetch("/api/invitations", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await response.json();
    if (response.ok) {
      setInvitation(data.invitation);
      setMessage("Tersimpan.");
    } else setMessage(data.error ?? "Gagal menyimpan.");
    setSaving(false);
  }

  async function addAsset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!invitation || !assetUrl.trim()) return;
    const response = await fetch("/api/invitations/assets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ invitationId: invitation.id, type: assetType, url: assetUrl }) });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error ?? "Asset gagal ditambahkan.");
      return;
    }
    setInvitation({ ...invitation, assets: [...invitation.assets, data.asset] });
    setAssetUrl("");
    setMessage("Asset ditambahkan.");
  }

  async function removeAsset(assetId: string) {
    const response = await fetch(`/api/invitations/assets/${assetId}`, { method: "DELETE" });
    if (response.ok && invitation) setInvitation({ ...invitation, assets: invitation.assets.filter((asset) => asset.id !== assetId) });
  }

  async function submitPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!invitation) return;
    const response = await fetch("/api/payments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ invitationId: invitation.id, proofUrl }) });
    const data = await response.json();
    if (response.ok) {
      setInvitation({ ...invitation, payment: data.payment });
      setMessage("Bukti transfer terkirim. Menunggu konfirmasi admin.");
    } else setMessage(data.error ?? "Bukti transfer gagal dikirim.");
  }

  const publicUrl = invitation
    ? (() => {
        if (typeof window === "undefined") return "";
        const hostname = window.location.hostname;
        const port = window.location.port ? `:${window.location.port}` : "";
        const rootDomain = process.env.NEXT_PUBLIC_INVITATION_ROOT_DOMAIN ?? "dcwedding.com";
        const host = hostname === "localhost" || hostname.endsWith(".localhost")
          ? `${invitation.slug}.localhost${port}`
          : `${invitation.slug}.${rootDomain}`;
        return `${window.location.protocol}//${host}`;
      })()
    : "";

  async function copyLink() {
    if (!publicUrl) return;
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function shareToWhatsApp() {
    if (!publicUrl) return;
    window.open(`https://wa.me/?text=${encodeURIComponent(`Undangan pernikahan kami: ${publicUrl}`)}`, "_blank", "noopener,noreferrer");
  }

  const image = invitation?.assets.find((asset) => asset.type === "IMAGE")?.url ?? fallbackImage;
  const isPaid = invitation?.payment?.status === "PAID" && ["INVITATION_BASIC", "GUESTBOOK_DIGITAL"].includes(invitation.payment.packageKey);

  return (
    <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 p-5 sm:p-8 lg:grid-cols-12">
      <div className="space-y-5 lg:col-span-7">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[#7A1C25]">Template Eternal Blossom</p>
          <h1 className="mt-2 font-serif text-3xl">Edit Undangan</h1>
          <p className="mt-1 text-xs opacity-60">Satu template contoh yang bisa dikembangkan menjadi katalog template.</p>
        </div>

        <fieldset className="grid gap-4 rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#121116] sm:grid-cols-2">
          <label className="text-sm sm:col-span-2">Template<select value={form.templateKey} onChange={(event) => setForm({ ...form, templateKey: event.target.value })} className="mt-2 w-full rounded-xl border border-black/10 px-3 py-2.5">{invitationTemplates.map((template) => <option key={template.key} value={template.key}>{template.name}</option>)}</select><span className="mt-1 block text-xs opacity-60">Draft bisa disiapkan sebelum pembayaran.</span></label>
          <label className="text-sm">Nama mempelai pria<input required value={form.groomName} onChange={(event) => setForm({ ...form, groomName: event.target.value })} className="mt-2 w-full rounded-xl border border-black/10 px-3 py-2.5" /></label>
          <label className="text-sm">Nama mempelai wanita<input required value={form.brideName} onChange={(event) => setForm({ ...form, brideName: event.target.value })} className="mt-2 w-full rounded-xl border border-black/10 px-3 py-2.5" /></label>
          <label className="text-sm sm:col-span-2">Tempat wedding<input required value={form.venue} onChange={(event) => setForm({ ...form, venue: event.target.value })} className="mt-2 w-full rounded-xl border border-black/10 px-3 py-2.5" /></label>
          <label className="text-sm">Tanggal acara<input required type="date" value={form.eventDate} onChange={(event) => setForm({ ...form, eventDate: event.target.value })} className="mt-2 w-full rounded-xl border border-black/10 px-3 py-2.5" /></label>
          <label className="text-sm">Jam akad / pemberkatan<input type="text" value={form.ceremonyTime} onChange={(event) => setForm({ ...form, ceremonyTime: event.target.value })} placeholder="08.00 WIB" className="mt-2 w-full rounded-xl border border-black/10 px-3 py-2.5" /></label>
          <label className="text-sm">Jam resepsi<input type="text" value={form.receptionTime} onChange={(event) => setForm({ ...form, receptionTime: event.target.value })} placeholder="11.00 WIB" className="mt-2 w-full rounded-xl border border-black/10 px-3 py-2.5" /></label>
          <label className="text-sm">URL musik<input type="url" value={form.musicUrl} onChange={(event) => setForm({ ...form, musicUrl: event.target.value })} placeholder="https://.../music.mp3" className="mt-2 w-full rounded-xl border border-black/10 px-3 py-2.5" /></label>
          <label className="text-sm sm:col-span-2">Kisah singkat<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={3} className="mt-2 w-full resize-none rounded-xl border border-black/10 px-3 py-2.5" /></label>
          <label className="text-sm">Wedding hashtag<input value={form.weddingHashtag} onChange={(event) => setForm({ ...form, weddingHashtag: event.target.value })} placeholder="#RioLyviaForever" className="mt-2 w-full rounded-xl border border-black/10 px-3 py-2.5" /></label>
          <label className="text-sm">Dress code / tema warna<input value={form.dressCode} onChange={(event) => setForm({ ...form, dressCode: event.target.value })} placeholder="Earth tone" className="mt-2 w-full rounded-xl border border-black/10 px-3 py-2.5" /></label>
          <label className="text-sm sm:col-span-2">Link live streaming (opsional)<input type="url" value={form.liveStreamUrl} onChange={(event) => setForm({ ...form, liveStreamUrl: event.target.value })} placeholder="https://youtube.com/..." className="mt-2 w-full rounded-xl border border-black/10 px-3 py-2.5" /></label>
          <label className="text-sm sm:col-span-2">Protokol / ketentuan acara<textarea value={form.eventNotes} onChange={(event) => setForm({ ...form, eventNotes: event.target.value })} rows={3} placeholder="Contoh: mohon datang 30 menit lebih awal." className="mt-2 w-full resize-none rounded-xl border border-black/10 px-3 py-2.5" /></label>
          <div className="grid gap-4 sm:col-span-2 sm:grid-cols-3"><label className="text-sm">Bank / e-wallet<input value={form.giftBankName} onChange={(event) => setForm({ ...form, giftBankName: event.target.value })} placeholder="BCA / GoPay" className="mt-2 w-full rounded-xl border border-black/10 px-3 py-2.5" /></label><label className="text-sm">Nama penerima<input value={form.giftAccountName} onChange={(event) => setForm({ ...form, giftAccountName: event.target.value })} placeholder="Nama pemilik rekening" className="mt-2 w-full rounded-xl border border-black/10 px-3 py-2.5" /></label><label className="text-sm">Nomor rekening<input value={form.giftAccountNumber} onChange={(event) => setForm({ ...form, giftAccountNumber: event.target.value })} placeholder="1234567890" className="mt-2 w-full rounded-xl border border-black/10 px-3 py-2.5" /></label></div>
          <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" checked={form.isPublished} disabled={!isPaid} onChange={(event) => setForm({ ...form, isPublished: event.target.checked })} /> Publikasikan undangan {!isPaid && <span className="text-xs opacity-60">(aktif setelah paket lunas)</span>}</label>
        </fieldset>

        <button type="button" onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-[#7A1C25] px-4 py-3 text-sm font-medium text-white disabled:opacity-50"><Save className="h-4 w-4" />{saving ? "Menyimpan..." : "Simpan draft"}</button>
        <span className="ml-3 text-xs opacity-60">{message}</span>

        {invitation && <div className="space-y-3 rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#121116]"><div><p className="text-xs uppercase tracking-widest text-[#7A1C25]">Link undangan</p><p className="mt-1 break-all text-sm font-medium">{publicUrl}</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={copyLink} disabled={!isPaid || !invitation.isPublished} className="inline-flex items-center gap-2 rounded-xl border border-black/10 px-3 py-2 text-xs dark:border-white/10 disabled:cursor-not-allowed disabled:opacity-50">{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{copied ? "Tersalin" : "Salin link"}</button><button type="button" onClick={shareToWhatsApp} disabled={!isPaid || !invitation.isPublished} className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-3 py-2 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"><Share2 className="h-4 w-4" />Share WhatsApp</button><a href={isPaid && invitation.isPublished ? publicUrl : undefined} target="_blank" rel="noreferrer" aria-disabled={!isPaid || !invitation.isPublished} className="inline-flex items-center gap-2 rounded-xl border border-black/10 px-3 py-2 text-xs dark:border-white/10 aria-disabled:pointer-events-none aria-disabled:opacity-50"><ExternalLink className="h-4 w-4" />Preview</a></div><p className="text-xs opacity-60">{!isPaid ? "Link dan share aktif setelah paket Undangan Digital lunas." : invitation.isPublished ? "Link aktif dan bisa dibagikan." : "Centang Publikasikan lalu simpan agar link bisa dibuka publik."}</p></div>}

        {invitation && <form onSubmit={submitPayment} className="space-y-3 rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#121116]"><div><p className="text-xs uppercase tracking-widest text-[#7A1C25]">Pembayaran</p><p className="mt-1 text-sm">Status: <strong>{invitation.payment?.status ?? "PENDING"}</strong></p></div><input required type="url" value={proofUrl} onChange={(event) => setProofUrl(event.target.value)} placeholder="URL bukti transfer" className="w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm" /><button disabled={invitation.payment?.status === "PAID"} className="rounded-xl border border-[#7A1C25] px-4 py-2 text-sm text-[#7A1C25] disabled:opacity-50">{invitation.payment?.status === "PAID" ? "Pembayaran dikonfirmasi" : "Kirim bukti transfer"}</button></form>}

        <div className="space-y-4 rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#121116]">
          <div className="flex items-center justify-between"><div><h2 className="font-serif text-xl">Asset undangan</h2><p className="text-xs opacity-60">Gunakan URL foto atau audio. Maksimal 30 asset.</p></div><span className="rounded-full bg-[#7A1C25]/10 px-3 py-1 text-xs text-[#7A1C25]">{invitation?.assets.length ?? 0}/30</span></div>
          <form onSubmit={addAsset} className="flex flex-col gap-2 sm:flex-row"><select value={assetType} onChange={(event) => setAssetType(event.target.value as "IMAGE" | "AUDIO")} className="rounded-xl border border-black/10 px-3 py-2 text-sm"><option value="IMAGE">Foto</option><option value="AUDIO">Musik</option></select><input required type="url" value={assetUrl} onChange={(event) => setAssetUrl(event.target.value)} placeholder="https://..." className="min-w-0 flex-1 rounded-xl border border-black/10 px-3 py-2 text-sm" /><button className="rounded-xl border border-[#7A1C25] px-4 py-2 text-sm text-[#7A1C25]">Tambah</button></form>
          <div className="space-y-2">{invitation?.assets.map((asset) => <div key={asset.id} className="flex items-center gap-3 rounded-xl border border-black/10 p-2 text-xs"><span className="rounded-lg bg-black/5 p-2">{asset.type === "IMAGE" ? <ImagePlus className="h-4 w-4" /> : <Music2 className="h-4 w-4" />}</span><span className="min-w-0 flex-1 truncate">{asset.url}</span><button type="button" onClick={() => removeAsset(asset.id)} aria-label="Hapus asset" className="p-2 text-red-600"><Trash2 className="h-4 w-4" /></button></div>)}</div>
        </div>
      </div>

      <div className="flex items-start justify-center lg:col-span-5">
        <div className="sticky top-8 w-[280px] overflow-hidden rounded-[38px] border-8 border-neutral-300 bg-black p-2 shadow-2xl">
          <div className="relative aspect-[9/16] overflow-hidden rounded-[28px] bg-[#251b1e] text-white"><img src={image} alt="Preview undangan" className="absolute inset-0 h-full w-full object-cover opacity-60" /><div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/10 to-black/80" /><div className="relative flex h-full flex-col items-center justify-end p-6 pb-12 text-center"><p className="text-[9px] uppercase tracking-[0.3em]">The Wedding Of</p><h2 className="mt-3 font-serif text-3xl">{form.groomName || "Rio"} &amp; {form.brideName || "Lyvia"}</h2><p className="mt-3 text-[10px] opacity-80">{form.eventDate || "2026-09-26"}</p><p className="mt-1 text-[10px] opacity-80">{form.venue || "Gedung Pernikahan"}</p><a href={publicUrl || "#"} target="_blank" className="mt-6 inline-flex items-center gap-1 text-[9px] uppercase tracking-widest underline"><ExternalLink className="h-3 w-3" /> Buka undangan</a></div></div>
        </div>
      </div>
    </div>
  );
}