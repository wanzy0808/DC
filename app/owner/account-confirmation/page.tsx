"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AccountConfirmationPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [message, setMessage] = useState(
    token ? "Perubahan belum diterapkan. Konfirmasi untuk melanjutkan." : "Token konfirmasi tidak ditemukan.",
  );
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function confirmChange() {
    if (!token || loading || done) return;
    setLoading(true);
    try {
      const response = await fetch("/api/owner/account-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await response.json().catch(() => null) as { message?: string; error?: string } | null;
      setMessage(data?.message ?? data?.error ?? "Konfirmasi belum dapat diproses.");
      setDone(response.ok);
    } catch {
      setMessage("Konfirmasi belum dapat diproses.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-white px-6 dark:bg-[#0B0B0C]">
      <section className="w-full max-w-md rounded-3xl border border-black/10 bg-white p-8 text-center shadow-xl dark:border-white/10 dark:bg-[#121116]">
        <p className="font-[family-name:var(--font-dm-mono)] text-xs uppercase tracking-[.2em] text-[#C07A84]">DC Organizer</p>
        <h1 className="mt-3 font-[family-name:var(--font-cinzel)] text-2xl">Konfirmasi akun</h1>
        <p className="mt-3 text-sm opacity-70">{message}</p>
        {!done && token ? (
          <Button className="mt-6 w-full" onClick={confirmChange} disabled={loading}>
            {loading ? "Memproses..." : "Konfirmasi perubahan password"}
          </Button>
        ) : null}
        <Button asChild variant="outline" className="mt-3 w-full">
          <Link href="/owner">Kembali ke Owner Dashboard</Link>
        </Button>
      </section>
    </main>
  );
}
