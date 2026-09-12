"use client";

import { FormEvent, useState } from "react";
import { LockKeyhole } from "lucide-react";

export default function InvitationPasswordGate({ slug }: { slug: string }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/invite/${encodeURIComponent(slug)}/password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Password salah.");
      window.location.reload();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Password belum dapat diverifikasi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f0e8] px-5 text-[#2f2525] dark:bg-[#090708] dark:text-white">
      <form onSubmit={handleSubmit} className="w-full max-w-md border border-[#7A1C25]/15 bg-[#fffaf5] p-8 text-center shadow-sm dark:border-[#e8a5ae]/15 dark:bg-[#120e10] md:p-10">
        <LockKeyhole className="mx-auto h-8 w-8 text-[#7A1C25] dark:text-[#e8a5ae]" />
        <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.24em] text-[#7A1C25] dark:text-[#e8a5ae]">Private Invitation</p>
        <h1 className="mt-3 font-[var(--font-cinzel)] text-3xl">Masukkan Password</h1>
        <p className="mt-3 font-[var(--font-fauna)] text-sm leading-6 opacity-70">Undangan ini menggunakan perlindungan password. Masukkan password untuk melanjutkan.</p>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          placeholder="Password undangan"
          className="mt-7 h-11 w-full border border-[#7A1C25]/20 bg-transparent px-4 font-[var(--font-fauna)] text-sm outline-none focus:border-[#7A1C25] dark:border-[#e8a5ae]/20 dark:focus:border-[#e8a5ae]"
        />
        {error && <p className="mt-3 font-[var(--font-fauna)] text-xs text-[#9b2935] dark:text-[#ffb4bf]">{error}</p>}
        <button
          type="submit"
          disabled={loading || !password}
          className="mt-5 h-11 w-full bg-[#7A1C25] px-5 font-[var(--font-fauna)] text-sm text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#e8a5ae] dark:text-[#1a1012]"
        >
          {loading ? "Memverifikasi..." : "Buka Undangan"}
        </button>
      </form>
    </main>
  );
}
