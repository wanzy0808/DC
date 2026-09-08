"use client";

import { useEffect, useState } from "react";

type Payment = {
  id: string;
  status: "PENDING" | "PAID" | "FAILED";
  proofUrl: string | null;
  user: { email: string; firstName: string };
  invitation: { slug: string; templateKey: string };
};

export default function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [message, setMessage] = useState("Memuat pembayaran...");

  async function load() {
    const response = await fetch("/api/admin/payments");
    const data = await response.json();
    if (response.ok) {
      setPayments(data.payments);
      setMessage("");
    } else setMessage(data.error ?? "Pembayaran belum dapat dimuat.");
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function updateStatus(paymentId: string, status: "PAID" | "FAILED") {
    const response = await fetch("/api/admin/payments", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ paymentId, status }) });
    if (response.ok) await load();
    else setMessage("Status pembayaran belum dapat diubah.");
  }

  return (
    <section className="space-y-4 rounded-2xl border border-black/10 bg-white p-6">
      <div><h2 className="font-serif text-2xl">Konfirmasi pembayaran</h2><p className="mt-1 text-sm opacity-60">Setujui transfer agar user bisa memilih template dan mulai mengedit.</p></div>
      {message && <p className="text-sm opacity-60">{message}</p>}
      {!payments.length && !message && <p className="text-sm opacity-60">Belum ada pembayaran.</p>}
      <div className="space-y-3">{payments.map((payment) => <div key={payment.id} className="flex flex-col gap-3 rounded-xl border border-black/10 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium">{payment.user.firstName} · {payment.user.email}</p><p className="text-xs opacity-60">Status {payment.status} · template {payment.invitation.templateKey}</p>{payment.proofUrl && <a href={payment.proofUrl} target="_blank" rel="noreferrer" className="text-xs text-[#7A1C25] underline">Buka bukti transfer</a>}</div>{payment.status === "PENDING" && <div className="flex gap-2"><button type="button" onClick={() => updateStatus(payment.id, "PAID")} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white">Konfirmasi</button><button type="button" onClick={() => updateStatus(payment.id, "FAILED")} className="rounded-lg border border-red-300 px-3 py-2 text-xs text-red-700">Tolak</button></div>}</div>)}</div>
    </section>
  );
}