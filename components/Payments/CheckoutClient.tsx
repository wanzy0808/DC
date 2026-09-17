"use client";

import Link from "next/link";
import { ChangeEvent, useState } from "react";
import { ArrowLeft, CheckCircle2, Copy, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = { order: { id: string; invoiceNumber: string; packageKey: string; packageName: string; amount: number; status: string; proofUrl: string | null; note: string | null; createdAt: string; invitation: { title: string; groomName: string; brideName: string } }; bank: { name: string; account: string; holder: string } };
function rupiah(value: number) { return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value); }

export default function CheckoutClient({ order, bank }: Props) {
  const [proofUrl, setProofUrl] = useState(order.proofUrl ?? "");
  const [note, setNote] = useState(order.note ?? "");
  const [fileName, setFileName] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp", "application/pdf"].includes(file.type)) { setMessage("Bukti harus JPG, PNG, WEBP, atau PDF."); return; }
    if (file.size > 3 * 1024 * 1024) { setMessage("Ukuran bukti maksimal 3 MB."); return; }
    const reader = new FileReader();
    reader.onload = () => { setProofUrl(String(reader.result)); setFileName(file.name); setMessage(""); };
    reader.onerror = () => setMessage("File belum dapat dibaca.");
    reader.readAsDataURL(file);
  }

  async function submitProof() {
    if (!/^https?:\/\//i.test(proofUrl.trim()) && !/^data:(image\/(png|jpeg|webp)|application\/pdf);base64,/i.test(proofUrl.trim())) { setMessage("Upload bukti transfer atau masukkan URL file."); return; }
    setSaving(true); setMessage("");
    try {
      const response = await fetch(`/api/orders/${order.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ proofUrl: proofUrl.trim(), note }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Bukti transfer belum dapat disimpan.");
      setMessage("Bukti transfer sudah dikirim. Tim kami akan melakukan verifikasi manual.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Bukti transfer belum dapat disimpan."); } finally { setSaving(false); }
  }

  async function copyAccount() { if (!bank.account) return; await navigator.clipboard.writeText(bank.account); setMessage("Nomor rekening berhasil disalin."); }
  const paid = order.status === "PAID";

  return <main className="min-h-screen bg-background px-5 py-10 text-foreground sm:px-8"><div className="mx-auto w-[80vw] max-w-full"><Link href="/transactions" className="inline-flex items-center gap-2 text-sm text-primary hover:underline"><ArrowLeft className="h-4 w-4" /> Kembali ke Transaksi</Link><div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]"><section className="rounded-3xl border border-border bg-card p-6 sm:p-8"><p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">Invoice</p><h1 className="mt-2 font-[family-name:var(--font-dc-heading)] text-3xl">{order.invoiceNumber}</h1><div className="mt-6 border-y border-border py-5"><p className="text-sm text-muted-foreground">Paket</p><p className="mt-1 text-lg font-semibold">{order.packageName}</p>{order.packageKey === "GUESTBOOK_DIGITAL" && <p className="mt-1 text-xs text-muted-foreground">Upgrade dari Digital Invitation dihitung hanya selisih paket.</p>}<p className="mt-4 text-sm text-muted-foreground">Total pembayaran</p><p className="mt-1 text-3xl font-semibold">{rupiah(order.amount)}</p></div><div className="mt-5 text-sm text-muted-foreground"><p>{order.invitation.groomName || "Pasangan"} {order.invitation.groomName || order.invitation.brideName ? "&" : ""} {order.invitation.brideName}</p><p className="mt-1">Paket baru aktif setelah admin memverifikasi pembayaran.</p></div></section><section className="space-y-5 rounded-3xl border border-border bg-card p-6 sm:p-8"><div><p className="text-sm font-semibold">Transfer manual</p><p className="mt-1 text-xs text-muted-foreground">Gunakan rekening berikut untuk pembayaran invoice.</p></div><div className="rounded-2xl border border-border p-4"><p className="text-xs text-muted-foreground">Bank</p><p className="mt-1 font-semibold">{bank.name || "Belum dikonfigurasi"}</p><p className="mt-3 text-xs text-muted-foreground">Nomor rekening</p><div className="mt-1 flex items-center justify-between gap-3"><p className="font-mono font-semibold">{bank.account || "—"}</p>{bank.account && <Button type="button" size="icon-sm" onClick={copyAccount} aria-label="Salin rekening"><Copy className="h-4 w-4" /></Button>}</div><p className="mt-3 text-xs text-muted-foreground">Atas nama</p><p className="mt-1 font-semibold">{bank.holder || "—"}</p></div>{paid ? <div className="rounded-2xl bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-300"><CheckCircle2 className="mb-2 h-5 w-5" />Pembayaran sudah diverifikasi dan paket sudah tercatat aktif.</div> : <div className="space-y-4"><label className="block text-sm">Upload bukti transfer<input type="file" accept="image/png,image/jpeg,image/webp,application/pdf" onChange={handleFile} className="mt-2 block w-full rounded-xl border border-border bg-background px-4 py-3 text-sm" />{fileName && <span className="mt-1 block text-xs text-muted-foreground">{fileName}</span>}</label><label className="block text-sm">Atau URL bukti transfer<input type="url" value={proofUrl.startsWith("data:") ? "" : proofUrl} onChange={(event) => { setProofUrl(event.target.value); setFileName(""); }} placeholder="https://..." className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary" /></label><label className="block text-sm">Catatan (opsional)<textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary" /></label><p className="flex items-center gap-2 text-xs text-muted-foreground"><Upload className="h-4 w-4" /> File disimpan sebagai bukti invoice untuk diverifikasi admin.</p><Button type="button" disabled={saving} onClick={submitProof} size="lg" className="w-full">{saving ? "Mengirim..." : "Kirim bukti transfer"}</Button>{message && <p className="text-xs text-muted-foreground">{message}</p>}</div>}</section></div></div></main>;
}
