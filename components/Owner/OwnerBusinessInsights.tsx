"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type Designer = {
  id: string;
  name: string;
  email: string;
  templateCount: number;
  salesCount: number;
  orderValue: number;
  templates: Array<{ templateNo: string; name: string; salesCount: number; orderValue: number }>;
};

type Partner = {
  id: string;
  name: string;
  email: string;
  vouchers: string[];
  attributedOrders: number;
  paidSales: number;
  revenue: number;
};

function rupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function OwnerBusinessInsights() {
  const [designers, setDesigners] = useState<Designer[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [message, setMessage] = useState("Memuat data bisnis...");
  const [busyPartner, setBusyPartner] = useState<string | null>(null);

  async function load() {
    const response = await fetch("/api/owner/analytics", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error ?? "Data bisnis belum dapat dimuat.");
      return;
    }
    setDesigners(data.designers ?? []);
    setPartners(data.partners ?? []);
    setMessage("");
  }

  useEffect(() => { void load(); }, []);

  async function generateVoucher(partnerId: string) {
    setBusyPartner(partnerId);
    setMessage("");
    const response = await fetch("/api/owner/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "GENERATE_VOUCHER", partnerId }),
    });
    const data = await response.json();
    if (!response.ok) setMessage(data.error ?? "Kode voucher belum dapat dibuat.");
    else {
      setMessage(`Kode ${data.code} berhasil dibuat.`);
      await load();
    }
    setBusyPartner(null);
  }

  const totals = useMemo(() => ({
    designerSales: designers.reduce((sum, item) => sum + item.salesCount, 0),
    partnerSales: partners.reduce((sum, item) => sum + item.paidSales, 0),
    partnerRevenue: partners.reduce((sum, item) => sum + item.revenue, 0),
  }), [designers, partners]);

  return (
    <section className="space-y-6 rounded-2xl border border-border bg-background p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-[family-name:var(--font-dm-mono)] text-xs uppercase tracking-[.18em] text-primary">Performa bisnis</p>
          <h2 className="mt-2 font-[family-name:var(--font-cinzel)] text-2xl">Designer & Mitra</h2>
          <p className="mt-2 text-sm text-muted-foreground">Penjualan hanya menghitung order yang sudah terverifikasi PAID. Grant Owner tidak dihitung sebagai penjualan.</p>
        </div>
        <Button type="button" size="sm" onClick={() => void load()}>Muat ulang</Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Template terjual</p>
          <p className="mt-2 text-2xl font-semibold">{totals.designerSales}</p>
        </div>
        <div className="rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Penjualan dari mitra</p>
          <p className="mt-2 text-2xl font-semibold">{totals.partnerSales}</p>
        </div>
        <div className="rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Nilai order via mitra</p>
          <p className="mt-2 text-xl font-semibold">{rupiah(totals.partnerRevenue)}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="overflow-hidden rounded-xl border border-border">
          <div className="border-b border-border p-4">
            <h3 className="font-[family-name:var(--font-cinzel)] text-lg">Performa designer</h3>
          </div>
          {!designers.length ? (
            <p className="p-4 text-sm text-muted-foreground">Belum ada data penjualan designer.</p>
          ) : (
            <div className="divide-y divide-border">
              {designers.map((designer) => (
                <article key={designer.id} className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{designer.name}</p>
                      <p className="text-xs text-muted-foreground">{designer.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">{designer.salesCount} terjual</p>
                      <p className="text-xs text-muted-foreground">{designer.templateCount} template</p>
                    </div>
                  </div>
                  {!!designer.templates.length && (
                    <div className="mt-3 space-y-1">
                      {designer.templates.slice(0, 5).map((template) => (
                        <div key={template.templateNo} className="flex items-center justify-between gap-3 text-xs">
                          <span className="min-w-0 truncate">#{template.templateNo} · {template.name}</span>
                          <span className="shrink-0 text-muted-foreground">{template.salesCount} terjual</span>
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-xl border border-border">
          <div className="border-b border-border p-4">
            <h3 className="font-[family-name:var(--font-cinzel)] text-lg">Mitra & kode voucher</h3>
          </div>
          {!partners.length ? (
            <p className="p-4 text-sm text-muted-foreground">Buat ID dengan role Mitra untuk mulai membuat kode voucher.</p>
          ) : (
            <div className="divide-y divide-border">
              {partners.map((partner) => (
                <article key={partner.id} className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{partner.name}</p>
                      <p className="text-xs text-muted-foreground">{partner.email}</p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      disabled={busyPartner === partner.id}
                      onClick={() => generateVoucher(partner.id)}
                    >
                      {busyPartner === partner.id ? "Membuat..." : "Generate kode"}
                    </Button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {partner.vouchers.length ? partner.vouchers.map((code) => (
                      <span key={code} className="rounded-md border border-primary/30 bg-primary/5 px-2 py-1 font-mono text-[10px] text-primary">{code}</span>
                    )) : <span className="text-xs text-muted-foreground">Belum punya kode</span>}
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {partner.paidSales} penjualan terverifikasi · {partner.attributedOrders} order memakai kode · {rupiah(partner.revenue)}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      {message && <p className="rounded-xl bg-primary/10 p-3 text-xs">{message}</p>}
    </section>
  );
}
