"use client";

import React, { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface RegisterDialogProps {
  onSwitchToLogin?: () => void;
}

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

const neutralButton =
  "border border-black/10 bg-white text-black shadow-sm hover:bg-neutral-100 hover:text-black dark:border-black/10 dark:bg-white dark:text-black dark:hover:bg-neutral-100";

export default function RegisterDialog({ onSwitchToLogin }: RegisterDialogProps) {
  const router = useRouter();
  const [next, setNext] = useState("/dashboard");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedPromo, setAgreedPromo] = useState(false);

  useEffect(() => {
    const requestedNext = new URLSearchParams(window.location.search).get("next");
    if (requestedNext?.startsWith("/") && !requestedNext.startsWith("//")) {
      setNext(requestedNext);
    }
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!agreedTerms) {
      setError("Kamu perlu menyetujui Syarat & Ketentuan dan Kebijakan Privasi.");
      return;
    }
    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Pendaftaran gagal.");
      } else {
        router.push(`/login?next=${encodeURIComponent(next)}`);
      }
    } catch {
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto border-black/10 bg-white text-black sm:max-w-md">
      <DialogHeader className="border-b border-black/10 pb-4 pr-10 text-left">
        <DialogTitle className="font-[family-name:var(--font-dc-heading)] text-2xl font-normal text-black">
          Daftar
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={submit} className="space-y-5 py-4">
        <Button asChild size="lg" className={`w-full gap-3 rounded-xl ${neutralButton}`}>
          <a href={`/api/auth/google?next=${encodeURIComponent(next)}`}>
            <GoogleIcon />
            <span>Daftar dengan Google</span>
          </a>
        </Button>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-black/10" />
          <span className="text-xs text-black/45">atau lanjutkan dengan</span>
          <div className="h-px flex-1 bg-black/10" />
        </div>

        <input
          required
          type="email"
          autoComplete="email"
          placeholder="Alamat Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-black outline-none transition placeholder:text-black/35 focus:border-primary focus:ring-1 focus:ring-primary"
        />

        <div className="relative">
          <input
            required
            minLength={8}
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Kata Sandi"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 pr-12 text-sm text-black outline-none transition placeholder:text-black/35 focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <Button
            type="button"
            size="icon-xs"
            onClick={() => setShowPassword((value) => !value)}
            className={`absolute right-2 top-2.5 ${neutralButton}`}
            aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </Button>
        </div>

        <div className="relative">
          <input
            required
            minLength={8}
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Konfirmasi Kata Sandi"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 pr-12 text-sm text-black outline-none transition placeholder:text-black/35 focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <Button
            type="button"
            size="icon-xs"
            onClick={() => setShowConfirmPassword((value) => !value)}
            className={`absolute right-2 top-2.5 ${neutralButton}`}
            aria-label={showConfirmPassword ? "Sembunyikan konfirmasi password" : "Tampilkan konfirmasi password"}
          >
            {showConfirmPassword ? <EyeOff /> : <Eye />}
          </Button>
        </div>

        <div className="space-y-3 pt-1 text-xs text-black/70">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              required
              type="checkbox"
              checked={agreedTerms}
              onChange={(event) => setAgreedTerms(event.target.checked)}
              className="mt-0.5 rounded accent-[var(--primary)]"
            />
            <span className="leading-relaxed">
              Saya menyetujui <span className="text-primary underline">Syarat & Ketentuan</span> beserta <span className="text-primary underline">Kebijakan Privasi</span>.
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={agreedPromo}
              onChange={(event) => setAgreedPromo(event.target.checked)}
              className="mt-0.5 rounded accent-[var(--primary)]"
            />
            <span className="leading-relaxed">
              Saya ingin menerima email promo dan newsletter DC Organizer.
            </span>
          </label>
        </div>

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={loading}
          size="lg"
          className={`w-full rounded-xl font-medium ${neutralButton}`}
        >
          {loading ? "Memproses..." : "Daftar"}
        </Button>

        <div className="space-y-3 pt-1 text-center text-xs text-black/65">
          <p>
            Sudah punya akun?{" "}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="font-medium text-primary underline underline-offset-2"
            >
              Masuk
            </button>
          </p>
          <div className="-mx-6 -mb-4 mt-6 rounded-b-lg border-t border-black/10 bg-neutral-50 p-3">
            <span>Punya bisnis terkait acara? </span>
            <Link href="/vendor-register" className="font-medium text-primary hover:underline">
              Bergabung sebagai vendor
            </Link>
          </div>
        </div>
      </form>
    </DialogContent>
  );
}
