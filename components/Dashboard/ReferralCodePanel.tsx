"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { ArrowUpRight, TicketPercent } from "lucide-react";
import { useLanguage } from "@/components/I18n/LanguageProvider";
import { Button } from "@/components/ui/button";
import { DashboardSurface } from "@/components/Dashboard/DashboardPrimitives";
import { getServicePackage } from "@/lib/packages/catalog";
import { referralPrice } from "@/lib/partners/referral-pricing";

const referralOffers = ["INVITATION_BASIC", "GUESTBOOK_DIGITAL"].map((key) => {
  const item = getServicePackage(key)!;
  return { name: item.name, ...referralPrice(key, item.price) };
});

export default function ReferralCodePanel() {
  const { locale } = useLanguage();
  const en = locale === "en";
  const [input, setInput] = useState("");
  const [applied, setApplied] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/dashboard/referral", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error();
        const data = await response.json();
        if (!active) return;
        setInput(data.code ?? "");
        setApplied(data.active ? data.code : "");
        if (data.code && !data.active) setMessage(en ? "This code is no longer active. Enter another code." : "Kode ini sudah tidak aktif. Masukkan kode lain.");
      })
      .catch(() => { if (active) setMessage(en ? "The referral code could not be loaded." : "Kode referral belum dapat dimuat."); });
    return () => { active = false; };
  }, [en]);

  async function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/dashboard/referral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: input }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Kode belum dapat dipakai.");
      setInput(data.code);
      setApplied(data.code);
      setMessage(en ? "Code saved. Your discount will appear on a new eligible invoice." : "Kode tersimpan. Diskon akan masuk pada invoice baru yang memenuhi syarat.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Kode belum dapat dipakai.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/dashboard/referral", { method: "DELETE" });
      if (!response.ok) throw new Error();
      setInput("");
      setApplied("");
      setMessage(en ? "Referral code removed." : "Kode referral dihapus.");
    } catch {
      setMessage(en ? "The code could not be removed." : "Kode belum dapat dihapus.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <DashboardSurface className="mt-5 min-w-0 px-5 py-6 sm:px-7">
      <div className="flex flex-wrap items-start gap-4 sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><TicketPercent className="size-5" aria-hidden="true" /></span>
          <div>
            <h2 className="font-[family-name:var(--font-undara-heading)] text-xl font-semibold text-primary sm:text-2xl">{en ? "Have a partner referral code?" : "Punya kode referral Mitra?"}</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">{en ? "Save it here before choosing a package. The discount is calculated when a new invoice is created." : "Simpan di sini sebelum memilih paket. Diskon dihitung saat invoice baru dibuat."}</p>
          </div>
        </div>
        <Link href="/packages" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">{en ? "Choose a package" : "Lihat paket"}<ArrowUpRight className="size-4" aria-hidden="true" /></Link>
      </div>
      <form onSubmit={apply} className="mt-5 flex flex-wrap items-end gap-3">
        <label className="min-w-[190px] flex-1 text-sm font-medium" htmlFor="dashboard-referral-code">
          {en ? "Referral code" : "Kode referral"}
          <input id="dashboard-referral-code" name="referralCode" autoComplete="off" maxLength={32} value={input} onChange={(event) => setInput(event.target.value.toUpperCase())} placeholder="MITRA-XXXXXXXX" className="mt-2 h-11 w-full rounded-lg border border-primary/30 bg-background px-4 font-mono text-sm uppercase outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20" />
        </label>
        <Button type="submit" disabled={busy || !input.trim()} className="h-11">{busy ? (en ? "Saving..." : "Menyimpan...") : (en ? "Apply code" : "Pakai kode")}</Button>
        {applied && <Button type="button" variant="outline" disabled={busy} onClick={remove} className="h-11">{en ? "Remove" : "Hapus"}</Button>}
      </form>
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
        {referralOffers.map((offer) => <p key={offer.name.id}>{offer.name[locale]} <strong className="text-primary">−{offer.percent}%</strong> · Rp{offer.amount.toLocaleString("id-ID")}</p>)}
      </div>
      <p aria-live="polite" className="mt-3 text-sm text-primary">{message || (applied ? (en ? `Active code: ${applied}` : `Kode aktif: ${applied}`) : "")}</p>
    </DashboardSurface>
  );
}
