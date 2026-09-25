"use client";

import { useEffect, useState } from "react";
import SessionLogoutButton from "@/components/Auth/SessionLogoutButton";

type Sale = {
  id: string;
  invoiceNumber: string;
  packageKey: string;
  status: string;
  amount: number;
  createdAt: string;
  paidAt: string | null;
  voucherCode: string;
};

type Data = {
  partner: { email: string; name: string };
  vouchers: string[];
  summary: { attributedOrders: number; paidSales: number; pendingSales: number; revenue: number };
  sales: Sale[];
};

const packageNames: Record<string, string> = {
  INVITATION_BASIC: "Undangan Digital",
  GUESTBOOK_DIGITAL: "Guest Book Digital",
  WA_BLAST_50: "WA Blast 50",
};

function rupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function date(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function PartnerDashboard() {
  const [data, setData] = useState<Data | null>(null);
  const [message, setMessage] = useState("Memuat data penjualan...");

  useEffect(() => {
    fetch("/api/partner/sales", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? "Data belum dapat dimuat.");
        setData(payload);
        setMessage("");
      })
      .catch((error) => setMessage(error instanceof Error ? error.message : "Data belum dapat dimuat."));
  }, []);

  return (
    <main className="mx-auto w-[80vw] max-w-full space-y-8 px-5 py-8 font-[family-name:var(--font-fauna)]">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-[family-name:var(--font-dm-mono)] text-xs uppercase tracking-[.2em] text-primary">Mitra DC Organizer</p>
          <h1 className="mt-2 font-[family-name:var(--font-cinzel)] text-3xl font-semibold">Dashboard Mitra</h1>
          <p className="mt-2 text-sm text-muted-foreground">{data?.partner.email ?? "Pantau penjualan dari kode voucher kamu."}</p>
        </div>
        <SessionLogoutButton />
      </header>

      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-4">
            {[
              ["Order pakai kode", data.summary.attributedOrders],
              ["Sudah PAID", data.summary.paidSales],
              ["Menunggu", data.summary.pendingSales],
              ["Nilai penjualan", rupiah(data.summary.revenue)],
            ].map(([label, value]) => (
              <section key={String(label)} className="rounded-2xl border border-border bg-background p-5">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-2 text-2xl font-semibold">{value}</p>
              </section>
            ))}
          </div>

          <section className="rounded-2xl border border-border bg-background p-5">
            <h2 className="font-[family-name:var(--font-cinzel)] text-xl">Kode voucher saya</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {data.vouchers.length ? data.vouchers.map((code) => (
                <span key={code} className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 font-mono text-sm text-primary">{code}</span>
              )) : <p className="text-sm text-muted-foreground">Belum ada kode voucher. Hubungi Owner untuk membuat kode.</p>}
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-border bg-background">
            <div className="border-b border-border p-5">
              <h2 className="font-[family-name:var(--font-cinzel)] text-xl">Penjualan dari kode voucher</h2>
              <p className="mt-1 text-xs text-muted-foreground">Hanya transaksi dengan kode voucher milik akun ini yang ditampilkan.</p>
            </div>
            {!data.sales.length ? (
              <p className="p-5 text-sm text-muted-foreground">Belum ada order yang memakai kode voucher kamu.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3">Invoice</th>
                      <th className="px-5 py-3">Kode</th>
                      <th className="px-5 py-3">Paket</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Nominal</th>
                      <th className="px-5 py-3">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.sales.map((sale) => (
                      <tr key={sale.id} className="border-b border-border last:border-0">
                        <td className="px-5 py-3 font-mono text-xs">{sale.invoiceNumber}</td>
                        <td className="px-5 py-3 font-mono text-xs text-primary">{sale.voucherCode}</td>
                        <td className="px-5 py-3">{packageNames[sale.packageKey] ?? sale.packageKey}</td>
                        <td className="px-5 py-3">{sale.status === "PAID" ? "Terverifikasi" : sale.status === "PENDING" ? "Menunggu" : sale.status}</td>
                        <td className="px-5 py-3">{rupiah(sale.amount)}</td>
                        <td className="px-5 py-3 text-xs text-muted-foreground">{date(sale.paidAt ?? sale.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      {message && <p className="rounded-xl bg-primary/10 p-4 text-sm">{message}</p>}
    </main>
  );
}
