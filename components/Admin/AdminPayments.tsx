"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type Order = {
  id: string;
  invoiceNumber: string;
  packageKey: string;
  status: "PENDING" | "PAID" | "FAILED" | "CANCELLED";
  amount: number;
  proofUrl: string | null;
  note: string | null;
  createdAt: string;
  user: { email: string; firstName: string };
  invitation: { title: string; groomName: string; brideName: string };
};

const packageNames: Record<string, string> = {
  INVITATION_BASIC: "Digital Invitation",
  GUESTBOOK_DIGITAL: "Guestbook Digital",
};

function rupiah(value: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
}

export default function AdminPayments() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [message, setMessage] = useState("Memuat pembayaran...");
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    const response = await fetch("/api/admin/payments", { cache: "no-store" });
    const data = await response.json();
    if (response.ok) {
      setOrders(data.orders ?? []);
      setMessage("");
    } else setMessage(data.error ?? "Pembayaran belum dapat dimuat.");
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function updateOrder(orderId: string, action: "ACTIVATE" | "REJECT") {
    setBusy(orderId);
    const response = await fetch("/api/admin/payments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, action }),
    });
    if (response.ok) await load();
    else {
      const data = await response.json().catch(() => null);
      setMessage(data?.error ?? "Status pembayaran belum dapat diubah.");
    }
    setBusy(null);
  }

  return (
    <section className="space-y-5 rounded-2xl border border-border bg-card p-6">
      <div>
        <h2 className="font-[family-name:var(--font-dc-heading)] text-2xl">Pembayaran & aktivasi paket</h2>
        <p className="mt-1 text-sm text-muted-foreground">Verifikasi bukti transfer lalu aktifkan paket. Paket tidak aktif hanya karena user membuat order.</p>
      </div>
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
      {!orders.length && !message && <p className="text-sm text-muted-foreground">Belum ada order pembayaran.</p>}
      <div className="space-y-3">
        {orders.map((order) => (
          <article key={order.id} className="rounded-2xl border border-border p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{order.invoiceNumber}</p>
                  <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] uppercase tracking-wider text-primary">{order.status}</span>
                </div>
                <p className="text-sm">{packageNames[order.packageKey] ?? order.packageKey} · {rupiah(order.amount)}</p>
                <p className="text-xs text-muted-foreground">{order.user.firstName} · {order.user.email}</p>
                <p className="text-xs text-muted-foreground">{order.invitation.groomName} & {order.invitation.brideName}</p>
                {order.note && <p className="text-xs text-muted-foreground">Catatan: {order.note}</p>}
                {order.proofUrl ? <a href={order.proofUrl} target="_blank" rel="noreferrer" className="inline-block text-xs text-primary underline">Buka bukti transfer</a> : <p className="text-xs text-amber-700 dark:text-amber-300">Bukti transfer belum dikirim.</p>}
              </div>
              {order.status === "PENDING" && (
                <div className="flex shrink-0 gap-2">
                  <Button type="button" disabled={busy === order.id} onClick={() => updateOrder(order.id, "REJECT")} className="bg-transparent text-red-700 shadow-none hover:bg-red-500/10 dark:bg-transparent dark:text-red-300">Tolak</Button>
                  <Button type="button" disabled={busy === order.id || !order.proofUrl} onClick={() => updateOrder(order.id, "ACTIVATE")}>{busy === order.id ? "Memproses..." : "Aktifkan paket"}</Button>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
