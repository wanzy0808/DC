"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const responseText = await response.text();
      let data: { error?: string; user?: { role: string } } = {};

      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch {
          data = { error: "Response server tidak valid." };
        }
      }

      if (!response.ok || !data.user) {
        setError(data.error ?? "Login gagal.");
      } else {
        router.push(
          data.user.role === "ADMIN" || data.user.role === "OWNER"
            ? "/admin"
            : "/dashboard",
        );
      }
    } catch {
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative z-10 min-h-screen grid place-items-center px-6 text-[var(--foreground)]">
      <form
        onSubmit={submit}
        className="w-full max-w-md space-y-5 rounded-3xl border border-black/10 bg-white p-8 shadow-xl"
      >
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[#7A1C25]">
            DC Workspace
          </p>
          <h1 className="mt-2 font-serif text-3xl">Masuk ke dashboard</h1>
        </div>
        <label className="block text-sm">
          Email
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3"
          />
        </label>
        <label className="block text-sm">
          Password
          <input
            required
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3"
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          disabled={loading}
          className="w-full rounded-xl bg-[#7A1C25] px-4 py-3 font-medium text-white disabled:opacity-60"
        >
          {loading ? "Memproses..." : "Masuk"}
        </button>
        <p className="text-center text-sm opacity-70">
          Belum punya akun?{" "}
          <Link href="/?register=1" className="text-[#7A1C25] underline">
            Daftar
          </Link>
        </p>
      </form>
    </main>
  );
}
