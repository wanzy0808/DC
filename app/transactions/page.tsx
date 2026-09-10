"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Clock3, Receipt, XCircle } from "lucide-react";

const packageNames: Record<string, string> = {
  INVITATION_BASIC: "Digital Invitation",
  GUESTBOOK_DIGITAL: "Guestbook Digital",
  INVITATION_GUESTBOOK: "Digital Invitation + Guestbook",
};

const statusLabel: Record<string, string> = {
  PAID: "Berhasil",
  PENDING: "Menunggu pembayaran",
  FAILED: "Gagal",
  REFUNDED: "Dikembalikan",
};

type Transaction = {
  id: string;
  packageKey: string;
  status: string;
  amount: number;
  provider: string;
  externalRef: string | null;
  paidAt: string | null;
  createdAt: string;
  invitation: { title: string; groomName: string; brideName: string };
};

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function StatusIcon({ status }: { status: string }) {
  if (status === "PAID") return <CheckCircle2 className="h-4 w-4" />;
  if (status === "FAILED" || status === "REFUNDED") return <XCircle className="h-4 w-4" />;
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
    <main className="min-h-screen bg-[#FAF7F2] px-5 py-8 text-[#2D2222] dark:bg-[#0B0A0E] dark:text-[#F8F1EB] sm:px-8">
      <div className="mx-auto max-w-4xl">
        <Link href="/dashboard" className="inline-flex items-center gap-2 font-[family-name:var(--font-cinzel)] text-xs font-semibold text-[#7A1C25] dark:text-[#E8A5AE]">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Beranda
        </Link>

        <div className="mt-8">
          <p className="font-[family-name:var(--font-cinzel)] text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7A1C25] dark:text-[#E8A5AE]">
            DC Wedding
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-fauna)] text-3xl font-medium">Transaksi & Paket</h1>
          <p className="mt-2 max-w-2xl font-[family-name:var(--font-fauna)] text-sm text-[#6B5A55] dark:text-white/65">
            Di sini kamu bisa melihat paket yang sudah dibeli, status pembayaran, nominal, dan detail transaksinya.
          </p>
        </div>

        <section className="mt-8 overflow-hidden rounded-3xl border border-[#ddd0c8] bg-[#f3ede6] dark:border-white/10 dark:bg-[#121116]">
          <div className="flex items-center gap-3 border-b border-[#ddd0c8] px-5 py-4 dark:border-white/10 sm:px-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7A1C25]/10 text-[#7A1C25] dark:bg-[#E8A5AE]/10 dark:text-[#E8A5AE]">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-[family-name:var(--font-cinzel)] text-sm font-semibold">Riwayat pembelian</h2>
              <p className="mt-0.5 text-xs text-[#6B5A55] dark:text-white/60">Semua pembayaran akun ini</p>
            </div>
          </div>

          {loading ? (
            <div className="px-6 py-12 text-center text-sm text-[#6B5A55] dark:text-white/60">Memuat transaksi...</div>
          ) : transactions.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <Receipt className="mx-auto h-9 w-9 text-[#7A1C25]/40 dark:text-[#E8A5AE]/40" />
              <h3 className="mt-4 font-[family-name:var(--font-cinzel)] text-sm font-semibold">Belum ada transaksi</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-[#6B5A55] dark:text-white/60">Kamu belum memiliki pembelian paket. Pilih paket untuk mulai mengaktifkan fitur DC Wedding.</p>
              <Link href="/packages" className="mt-5 inline-flex rounded-xl bg-[#7A1C25] px-5 py-3 font-[family-name:var(--font-cinzel)] text-xs font-semibold text-white hover:bg-[#5E141C]">Lihat Paket</Link>
            </div>
          ) : (
            <div className="divide-y divide-[#ddd0c8] dark:divide-white/10">
              {transactions.map((transaction) => {
                const packageName = packageNames[transaction.packageKey] ?? transaction.packageKey.replaceAll("_", " ");
                return (
                  <article key={transaction.id} className="px-5 py-5 sm:px-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-[family-name:var(--font-cinzel)] text-sm font-semibold">{packageName}</h3>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${transaction.status === "PAID" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : transaction.status === "PENDING" ? "bg-amber-500/10 text-amber-700 dark:text-amber-300" : "bg-red-500/10 text-red-700 dark:text-red-300"}`}>
                            <StatusIcon status={transaction.status} />
                            {statusLabel[transaction.status] ?? transaction.status}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-[#5A4545] dark:text-white/70">{transaction.invitation.groomName} & {transaction.invitation.brideName}</p>
                        <p className="mt-1 text-xs text-[#766761] dark:text-white/50">Dibuat {formatDate(transaction.createdAt)}</p>
                        {transaction.paidAt && <p className="mt-1 text-xs text-[#766761] dark:text-white/50">Dibayar {formatDate(transaction.paidAt)}</p>}
                        {transaction.externalRef && <p className="mt-2 text-[10px] text-[#766761] dark:text-white/45">Ref: {transaction.externalRef}</p>}
                      </div>
                      <div className="shrink-0 sm:text-right">
                        <p className="font-[family-name:var(--font-fauna)] text-lg font-medium">{formatRupiah(transaction.amount)}</p>
                        <p className="mt-1 text-[10px] uppercase tracking-wider text-[#766761] dark:text-white/45">{transaction.provider}</p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
