"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { authCardClass, authDescriptionClass, authFieldClass, authLabelClass, authSubmitButtonClass, authTitleClass } from "@/components/Auth/auth-styles";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    const token = new URLSearchParams(window.location.search).get("token") ?? "";
    setLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json() as { error?: string; message?: string };
      if (!response.ok) setError(data.error ?? "Kata sandi belum dapat diubah.");
      else setMessage(data.message ?? "Kata sandi berhasil diubah.");
    } catch {
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  return <main className="grid min-h-dvh place-items-center bg-background px-4 py-10">
    <section className={`${authCardClass} max-w-[480px] p-7 sm:p-9`}>
      <h1 className={authTitleClass}>Buat kata sandi baru</h1>
      <p className={`${authDescriptionClass} mt-3`}>Gunakan minimal 8 karakter. Setelah berhasil, semua sesi lama akan keluar otomatis.</p>
      <form onSubmit={submit} className="mt-7 space-y-5">
        <label className={authLabelClass}>Kata sandi baru
          <input className={authFieldClass} type="password" minLength={8} required autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        {message && <p role="status" className="text-sm">{message}</p>}
        <Button className={authSubmitButtonClass} disabled={loading}>{loading ? "Memproses..." : "Simpan kata sandi"}</Button>
      </form>
      <Link className="mt-5 inline-block text-sm font-semibold text-primary underline underline-offset-4" href="/?auth=login">Kembali ke masuk</Link>
    </section>
  </main>;
}
