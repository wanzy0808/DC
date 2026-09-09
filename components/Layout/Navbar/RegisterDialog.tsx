"use client";

import React, { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface RegisterDialogProps {
  isDarkMode: boolean;
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

export default function RegisterDialog({ isDarkMode, onSwitchToLogin }: RegisterDialogProps) {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedPromo, setAgreedPromo] = useState(false);

  const accentColor = isDarkMode ? "text-[#C26B70]" : "text-[#7A1C25]";
  const borderColor = isDarkMode ? "border-white/10" : "border-black/10";
  const inputBg = isDarkMode ? "bg-black/40 text-white" : "bg-transparent text-[#1A1A1A]";

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
        body: JSON.stringify({ firstName, lastName, email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Pendaftaran gagal.");
      } else {
        router.push("/login");
      }
    } catch {
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DialogContent className={`max-h-[90vh] overflow-y-auto sm:max-w-md ${
      isDarkMode ? "border-white/10 bg-[#121116] text-white" : "bg-white text-[#1A1A1A]"
    }`}>
      <DialogHeader className="flex flex-row items-center justify-between border-b border-neutral-200 pb-4 dark:border-neutral-800">
        <DialogTitle className="font-serif text-2xl font-normal">Daftar</DialogTitle>
        <button type="button" onClick={onSwitchToLogin} className={`text-sm font-medium ${accentColor} hover:underline`}>
          Masuk
        </button>
      </DialogHeader>

      <form onSubmit={submit} className="space-y-5 py-4">
        <a
          href="/api/auth/google"
          className={`flex w-full items-center justify-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-sm transition ${borderColor} ${
            isDarkMode ? "bg-neutral-900 hover:bg-neutral-800" : "bg-white hover:bg-neutral-50"
          }`}
        >
          <GoogleIcon />
          <span>Daftar dengan Google</span>
        </a>

        <div className="flex items-center gap-3">
          <div className={`h-px flex-1 border-t ${borderColor}`} />
          <span className="text-xs opacity-50">atau lanjutkan dengan</span>
          <div className={`h-px flex-1 border-t ${borderColor}`} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <input
            required
            type="text"
            placeholder="Nama Depan"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            className={`w-full rounded-lg border px-3 py-2.5 text-sm ${borderColor} ${inputBg} focus:outline-none focus:ring-1 focus:ring-[#7A1C25]`}
          />
          <input
            type="text"
            placeholder="Nama Belakang"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            className={`w-full rounded-lg border px-3 py-2.5 text-sm ${borderColor} ${inputBg} focus:outline-none focus:ring-1 focus:ring-[#7A1C25]`}
          />
        </div>

        <input
          required
          type="email"
          autoComplete="email"
          placeholder="Alamat Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={`w-full rounded-lg border px-3 py-2.5 text-sm ${borderColor} ${inputBg} focus:outline-none focus:ring-1 focus:ring-[#7A1C25]`}
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
            className={`w-full rounded-lg border px-3 py-2.5 pr-10 text-sm ${borderColor} ${inputBg} focus:outline-none focus:ring-1 focus:ring-[#7A1C25]`}
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 opacity-50 hover:opacity-100" aria-label="Tampilkan password">
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
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
            className={`w-full rounded-lg border px-3 py-2.5 pr-10 text-sm ${borderColor} ${inputBg} focus:outline-none focus:ring-1 focus:ring-[#7A1C25]`}
          />
          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3 opacity-50 hover:opacity-100" aria-label="Tampilkan konfirmasi password">
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <div className="space-y-3 pt-1 text-xs">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              required
              type="checkbox"
              checked={agreedTerms}
              onChange={(event) => setAgreedTerms(event.target.checked)}
              className="mt-0.5 rounded accent-[#7A1C25]"
            />
            <span className="leading-relaxed opacity-80">
              Saya menyetujui <span className={`${accentColor} underline`}>Syarat & Ketentuan</span> beserta <span className={`${accentColor} underline`}>Kebijakan Privasi</span>.
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={agreedPromo}
              onChange={(event) => setAgreedPromo(event.target.checked)}
              className="mt-0.5 rounded accent-[#7A1C25]"
            />
            <span className="leading-relaxed opacity-80">Saya ingin menerima email promo dan newsletter dari rekanannya.</span>
          </label>
        </div>

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <Button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-neutral-300 py-6 font-medium tracking-wide text-neutral-700 transition-all hover:bg-neutral-400 disabled:opacity-60 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
        >
          {loading ? "Memproses..." : "Lanjutkan"}
        </Button>

        <div className="space-y-3 pt-1 text-center text-xs">
          <p className="opacity-70">
            Sudah punya akun?{" "}
            <button type="button" onClick={onSwitchToLogin} className={`${accentColor} font-medium hover:underline`}>
              Masuk
            </button>
          </p>
          <div className={`-mx-6 -mb-4 mt-6 rounded-b-lg border-t p-3 ${borderColor} ${isDarkMode ? "bg-black/30" : "bg-neutral-50"}`}>
            <span className="opacity-70">Punya bisnis terkait pernikahan? </span>
            <Link href="/vendor-register" className={`${accentColor} font-medium hover:underline`}>Bergabung sebagai vendor</Link>
          </div>
        </div>
      </form>
    </DialogContent>
  );
}
