"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Clock3, ExternalLink, Receipt, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const packageNames: Record<string, string> = {
  INVITATION_BASIC: "Digital Invitation",
  GUESTBOOK_DIGITAL: "Guestbook Digital",
};

const statusLabel: Record<string, string> = {
  PAID: "Berhasil",
  PENDING: "Menunggu pembayaran",
  FAILED: "Ditolak",
  CANCELLED: "Dibatalkan",
};

type Transaction = {
  id: string;
  invoiceNumber: string;
  packageKey: string;
  status: string;
  amount: number;
  provider: string;
  proofUrl: string | null;
  paidAt: string | null;
  createdAt: string;
  invitation: { title: string; groomName: string; brideName: string };
};

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function StatusIcon({ status }: { status: string }) {
  if (status === "PAID") return <CheckCircle2 className="h-4 w-4" />;
  if (status === "FAILED" || status === "CANCELLED") return <XCircle className="h-4 w-4" />;
  return <Clock3 className="h-4 w-4" />;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/transactions", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Gagal mengambil transaksi");
        const data = await response.json();
        setTransactions(data.transactions ?? []);
      })
      .catch(() => setTransactions([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-background px-5 py-8 text-foreground sm:px-8">
      <div className="mx-auto max-w-4xl">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-primary hover:underline"><ArrowLeft className="h-4 w-4" /> Kembali ke Beranda</Link>
        <div className="mt-8">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">DC Organizer</p>
          <h1 className="mt-2 font-[family-name:var(--font-dc-heading)] text-3xl font-medium">Transaksi & Paket</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Lihat invoice, nominal, status verifikasi, dan bukti pembayaran akun ini.</p>
        </div>

        <section className="mt-8 overflow-hidden rounded-3xl border border-border bg-card">
          <div className="flex items-center gap-3 border-b border-border px-5 py-4 sm:px-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Receipt className="h-5 w-5" /></div>
            <div><h2 className="font-[family-name:var(--font-dc-heading)] text-sm font-semibold">Riwayat pembelian</h2><p className="mt-0.5 text-xs text-muted-foreground">Semua invoice dan order akun ini</p></div>
          </div>

          {loading ? <div className="px-6 py-12 text-center text-sm text-muted-foreground">Memuat transaksi...</div> : transactions.length === 0 ? (
            <div className="px-6 py-14 text-center"><Receipt className="mx-auto h-9 w-9 text-primary/40" /><h3 className="mt-4 font-[family-name:var(--font-dc-heading)] text-sm font-semibold">Belum ada transaksi</h3><p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">Pilih paket untuk membuat invoice dan memulai proses pembayaran.</p><Button asChild className="mt-5"><Link href="/packages">Lihat Paket</Link></Button></div>
          ) : (
            <div className="divide-y divide-border">
              {transactions.map((transaction) => {
                const packageName = packageNames[transaction.packageKey] ?? transaction.packageKey.replaceAll("_", " ");
                return <article key={transaction.id} className="px-5 py-5 sm:px-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-[family-name:var(--font-dc-heading)] text-sm font-semibold">{packageName}</h3><span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary"><StatusIcon status={transaction.status} />{statusLabel[transaction.status] ?? transaction.status}</span></div><p className="mt-2 font-mono text-[10px] text-muted-foreground">{transaction.invoiceNumber}</p><p className="mt-2 text-sm text-muted-foreground">{transaction.invitation.groomName} & {transaction.invitation.brideName}</p><p className="mt-1 text-xs text-muted-foreground">Dibuat {formatDate(transaction.createdAt)}</p>{transaction.paidAt && <p className="mt-1 text-xs text-muted-foreground">Diverifikasi {formatDate(transaction.paidAt)}</p>}</div><div className="shrink-0 sm:text-right"><p className="text-lg font-medium">{formatRupiah(transaction.amount)}</p><div className="mt-3 flex flex-wrap gap-2 sm:justify-end"><Button asChild size="sm"><Link href={`/checkout/${transaction.id}`}>Buka invoice</Link></Button>{transaction.proofUrl && <Button asChild size="sm"><a href={transaction.proofUrl} target="_blank" rel="noreferrer">Bukti <ExternalLink className="h-3.5 w-3.5" /></a></Button>}</div></div></div></article>;
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
