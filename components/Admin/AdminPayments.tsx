"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type OrderStatus = "PENDING" | "PAID" | "FAILED" | "CANCELLED";

type Order = {
  id: string;
  invoiceNumber: string;
  packageKey: string;
  status: OrderStatus;
  amount: number;
  proofUrl: string | null;
  note: string | null;
  createdAt: string;
  paidAt: string | null;
  confirmedAt: string | null;
  user: { email: string; firstName: string };
  invitation: { title: string; groomName: string; brideName: string };
};

const packageNames: Record<string, string> = {
  INVITATION_BASIC: "Digital Invitation",
  GUESTBOOK_DIGITAL: "Guestbook Digital",
};

const statusLabels: Record<OrderStatus, string> = {
  PENDING: "Pending",
  PAID: "Paid",
  FAILED: "Rejected",
  CANCELLED: "Cancelled",
};

function rupiah(value: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function isImageProof(value: string | null) {
  return Boolean(value?.startsWith("data:image/") || /\.(png|jpe?g|webp)(?:[?#].*)?$/i.test(value ?? ""));
}

export default function AdminPayments() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<"ALL" | OrderStatus>("PENDING");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
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
    if (response.ok) {
      await load();
      setSelectedOrderId(null);
    } else {
      const data = await response.json().catch(() => null);
      setMessage(data?.error ?? "Status pembayaran belum dapat diubah.");
    }
    setBusy(null);
  }

  const counts = useMemo(() => ({
    ALL: orders.length,
    PENDING: orders.filter((order) => order.status === "PENDING").length,
    PAID: orders.filter((order) => order.status === "PAID").length,
    FAILED: orders.filter((order) => order.status === "FAILED").length,
    CANCELLED: orders.filter((order) => order.status === "CANCELLED").length,
  }), [orders]);

  const filteredOrders = useMemo(
    () => filter === "ALL" ? orders : orders.filter((order) => order.status === filter),
    [filter, orders],
  );
  const selectedOrder = orders.find((order) => order.id === selectedOrderId) ?? null;

  return (
    <section className="space-y-6 rounded-2xl border border-border bg-card p-6">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">Finance</p>
          <h2 className="mt-1 font-[family-name:var(--font-dc-heading)] text-2xl">Pembayaran & aktivasi paket</h2>
          <p className="mt-1 text-sm text-muted-foreground">Verifikasi bukti transfer sebelum entitlement paket diaktifkan.</p>
        </div>
        <Button type="button" size="sm" onClick={() => void load()}>Muat ulang</Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(["PENDING", "PAID", "FAILED", "ALL"] as const).map((status) => (
          <button key={status} type="button" onClick={() => setFilter(status)} className={`rounded-xl border p-4 text-left transition-transform hover:-translate-y-0.5 ${filter === status ? "border-primary bg-primary/5" : "border-border"}`}>
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{status === "ALL" ? "Semua order" : statusLabels[status]}</p>
            <p className="mt-2 font-[family-name:var(--font-dc-heading)] text-2xl">{counts[status]}</p>
          </button>
        ))}
      </div>

      {message && <p className="text-sm text-muted-foreground">{message}</p>}
      {!filteredOrders.length && !message && <p className="text-sm text-muted-foreground">Tidak ada order pada filter ini.</p>}

      <div className="space-y-3">
        {filteredOrders.map((order) => (
          <article key={order.id} className="rounded-2xl border border-border p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-mono text-sm font-semibold">{order.invoiceNumber}</p>
                  <span className="rounded-full bg-primary/10 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-primary">{statusLabels[order.status]}</span>
                </div>
                <p className="text-sm">{packageNames[order.packageKey] ?? order.packageKey} · {rupiah(order.amount)}</p>
                <p className="text-xs text-muted-foreground">{order.user.firstName} · {order.user.email}</p>
                <p className="text-xs text-muted-foreground">{order.invitation.groomName} & {order.invitation.brideName}</p>
                <p className="font-mono text-[10px] text-muted-foreground">Dibuat {formatDate(order.createdAt)}</p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <Button type="button" size="sm" onClick={() => setSelectedOrderId(order.id)}>Detail</Button>
                {order.status === "PENDING" && (
                  <>
                    <Button type="button" size="sm" disabled={busy === order.id} onClick={() => updateOrder(order.id, "REJECT")}>Tolak</Button>
                    <Button type="button" size="sm" disabled={busy === order.id || !order.proofUrl} onClick={() => updateOrder(order.id, "ACTIVATE")}>
                      {busy === order.id ? "Memproses..." : "Aktifkan paket"}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-label={`Detail ${selectedOrder.invoiceNumber}`}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-background p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-primary">Invoice</p>
                <h3 className="mt-1 font-[family-name:var(--font-dc-heading)] text-xl">{selectedOrder.invoiceNumber}</h3>
              </div>
              <Button type="button" size="sm" onClick={() => setSelectedOrderId(null)}>Tutup</Button>
            </div>

            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <div><dt className="text-xs text-muted-foreground">Paket</dt><dd className="mt-1 text-sm">{packageNames[selectedOrder.packageKey] ?? selectedOrder.packageKey}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Nominal</dt><dd className="mt-1 text-sm">{rupiah(selectedOrder.amount)}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Pemesan</dt><dd className="mt-1 text-sm">{selectedOrder.user.firstName} · {selectedOrder.user.email}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Status</dt><dd className="mt-1 text-sm">{statusLabels[selectedOrder.status]}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Dibuat</dt><dd className="mt-1 text-sm">{formatDate(selectedOrder.createdAt)}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Diverifikasi</dt><dd className="mt-1 text-sm">{formatDate(selectedOrder.confirmedAt)}</dd></div>
            </dl>

            {selectedOrder.note && (
              <div className="mt-5 rounded-xl border border-border p-4">
                <p className="text-xs text-muted-foreground">Catatan user</p>
                <p className="mt-1 whitespace-pre-wrap text-sm">{selectedOrder.note}</p>
              </div>
            )}

            <div className="mt-5">
              <p className="text-xs text-muted-foreground">Bukti transfer</p>
              {selectedOrder.proofUrl ? (
                <div className="mt-2 space-y-3">
                  {isImageProof(selectedOrder.proofUrl) && <img src={selectedOrder.proofUrl} alt={`Bukti transfer ${selectedOrder.invoiceNumber}`} className="max-h-[420px] w-full rounded-xl border border-border object-contain" />}
                  <a href={selectedOrder.proofUrl} target="_blank" rel="noreferrer" className="text-sm text-primary underline">Buka bukti transfer di tab baru</a>
                </div>
              ) : <p className="mt-1 text-sm text-muted-foreground">Bukti transfer belum dikirim.</p>}
            </div>

            {selectedOrder.status === "PENDING" && (
              <div className="mt-6 flex flex-wrap gap-2">
                <Button type="button" disabled={busy === selectedOrder.id} onClick={() => updateOrder(selectedOrder.id, "REJECT")}>Tolak pembayaran</Button>
                <Button type="button" disabled={busy === selectedOrder.id || !selectedOrder.proofUrl} onClick={() => updateOrder(selectedOrder.id, "ACTIVATE")}>
                  {busy === selectedOrder.id ? "Memproses..." : "Aktifkan paket"}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
