"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.13 0-5.78-2.11-6.73-4.96H1.18v3.15C3.15 21.32 7.22 24 12 24z" />
      <path fill="#FBBC05" d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.6H1.18C.43 8.13 0 9.87 0 11.7c0 1.83.43 3.57 1.18 5.1l4.09 2.56 1.18-4.09z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.22 0 3.15 2.68 1.18 6.6l4.09 3.15c.95-2.85 3.6-4.96 6.73-4.96z" />
    </svg>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const googleError = params.get("error");
    if (googleError?.startsWith("google_")) {
      setError(
        googleError === "google_config"
          ? "Google Sign-In belum dikonfigurasi di server."
          : "Google Sign-In gagal. Silakan coba lagi.",
      );
      window.history.replaceState({}, "", "/login");
      return;
    }

    fetch("/api/auth/session", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) return null;
        return response.json() as Promise<{ authenticated?: boolean }>;
      })
      .then((data) => {
        if (data?.authenticated) window.location.replace("/dashboard");
      })
      .catch(() => undefined);
  }, []);

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
        window.location.replace(
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
          <p className="text-xs uppercase tracking-[0.25em] text-[#7A1C25]">DC Workspace</p>
          <h1 className="mt-2 font-serif text-3xl">Masuk ke dashboard</h1>
          <p className="mt-2 text-sm opacity-60">Kelola undangan dan wedding workspace kamu.</p>
        </div>

        <a
          href="/api/auth/google"
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-black/10 bg-white px-4 py-3 font-medium text-sm shadow-sm transition hover:bg-neutral-50"
        >
          <GoogleIcon />
          <span>Masuk dengan Google</span>
        </a>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-black/10" />
          <span className="text-xs opacity-40">atau</span>
          <div className="h-px flex-1 bg-black/10" />
        </div>

        <label className="block text-sm">
          Email
          <input
            required
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 outline-none transition focus:border-[#7A1C25] focus:ring-1 focus:ring-[#7A1C25]"
          />
        </label>
        <label className="block text-sm">
          Password
          <input
            required
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 outline-none transition focus:border-[#7A1C25] focus:ring-1 focus:ring-[#7A1C25]"
          />
        </label>

        {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[#7A1C25] px-4 py-3 font-medium text-white transition hover:bg-[#64161e] disabled:opacity-60"
        >
          {loading ? "Memproses..." : "Masuk"}
        </button>

        <p className="text-center text-sm opacity-70">
          Belum punya akun?{" "}
          <Link href="/?register=1" className="font-medium text-[#7A1C25] underline">
            Daftar
          </Link>
        </p>
      </form>
    </main>
  );
}
