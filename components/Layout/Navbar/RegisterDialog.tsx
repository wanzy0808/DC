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

export default function RegisterDialog({ isDarkMode, onSwitchToLogin }: RegisterDialogProps) {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [agreedPromo, setAgreedPromo] = useState(false);

  const accentColor = isDarkMode ? "text-[#C26B70]" : "text-[#7A1C25]";
  const borderColor = isDarkMode ? "border-white/10" : "border-black/10";
  const inputBg = isDarkMode ? "bg-black/40 text-white" : "bg-transparent text-[#1A1A1A]";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const response = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ firstName, lastName, email, password }) });
    const data = await response.json();
    if (!response.ok) setError(data.error ?? "Pendaftaran gagal.");
    else router.push("/login");
    setLoading(false);
  }

  return (
    <DialogContent className={`sm:max-w-md max-h-[90vh] overflow-y-auto ${
      isDarkMode ? "bg-[#121116] text-white border-white/10" : "bg-white text-[#1A1A1A]"
    }`}>
      <DialogHeader className="flex flex-row items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <DialogTitle className="font-serif text-2xl font-normal">Daftar</DialogTitle>
        <button 
          onClick={onSwitchToLogin}
          className={`text-sm font-medium ${accentColor} hover:underline`}
        >
          Masuk
        </button>
      </DialogHeader>

      <form onSubmit={submit} className="space-y-5 py-4">
        {/* Google Sign In Button */}
        <Button 
          variant="outline" 
          className={`w-full py-6 flex items-center justify-center gap-3 rounded-xl border ${borderColor} ${
            isDarkMode ? "hover:bg-neutral-800 bg-neutral-900" : "hover:bg-neutral-50 bg-white"
          } transition-all shadow-sm`}
          onClick={() => alert("Menghubungkan ke Google Sign-Up...")}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.13 0-5.78-2.11-6.73-4.96H1.18v3.15C3.15 21.32 7.22 24 12 24z"/>
            <path fill="#FBBC05" d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.6H1.18C.43 8.13 0 9.87 0 11.7c0 1.83.43 3.57 1.18 5.1l4.09-2.56z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.22 0 3.15 2.68 1.18 6.6l4.09 3.15c.95-2.85 3.6-4.96 6.73-4.96z"/>
          </svg>
          <span className="font-medium text-sm">Sign in with Google</span>
        </Button>

        <div className="flex items-center my-4">
          <div className={`flex-grow border-t ${borderColor}`} />
          <span className="flex-shrink mx-4 text-xs opacity-50">atau lanjutkan dengan</span>
          <div className={`flex-grow border-t ${borderColor}`} />
        </div>

        {/* Input Nama Depan & Belakang */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <input
              type="text"
              placeholder="Nama Depan"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              className={`w-full px-3 py-2.5 text-sm rounded-lg border ${borderColor} ${inputBg} focus:outline-none focus:ring-1 focus:ring-[#7A1C25]`}
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Nama Belakang"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              className={`w-full px-3 py-2.5 text-sm rounded-lg border ${borderColor} ${inputBg} focus:outline-none focus:ring-1 focus:ring-[#7A1C25]`}
            />
          </div>
        </div>

        {/* Input Email */}
        <div>
          <input
            type="email"
            placeholder="Alamat Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={`w-full px-3 py-2.5 text-sm rounded-lg border ${borderColor} ${inputBg} focus:outline-none focus:ring-1 focus:ring-[#7A1C25]`}
          />
        </div>

        {/* Input Kata Sandi */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Kata Sandi"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={`w-full px-3 py-2.5 text-sm rounded-lg border ${borderColor} ${inputBg} focus:outline-none focus:ring-1 focus:ring-[#7A1C25]`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 opacity-50 hover:opacity-100"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Input Konfirmasi Kata Sandi */}
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Konfirmasi Kata Sandi"
            className={`w-full px-3 py-2.5 text-sm rounded-lg border ${borderColor} ${inputBg} focus:outline-none focus:ring-1 focus:ring-[#7A1C25]`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-3 opacity-50 hover:opacity-100"
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Checkbox Persetujuan */}
        <div className="space-y-3 pt-2 text-xs">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreedTerms}
              onChange={() => setAgreedTerms(!agreedTerms)}
              className="mt-0.5 rounded accent-[#7A1C25]"
            />
            <span className="opacity-80 leading-relaxed">
              Saya menyetujui <span className={`${accentColor} underline`}>Syarat & Ketentuan</span> beserta <span className={`${accentColor} underline`}>Kebijakan Privasi</span>.
            </span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreedPromo}
              onChange={() => setAgreedPromo(!agreedPromo)}
              className="mt-0.5 rounded accent-[#7A1C25]"
            />
            <span className="opacity-80 leading-relaxed">
              Saya ingin menerima email promo dan newsletter dari rekanannya.
            </span>
          </label>
        </div>

        {/* Tombol Lanjutkan */}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={loading}
          className="w-full py-6 rounded-xl font-medium tracking-wide bg-neutral-300 hover:bg-neutral-400 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 transition-all"
        >
          {loading ? "Memproses..." : "Lanjutkan"}
        </Button>

        {/* Footer Link Masuk & Vendor */}
        <div className="text-center pt-2 text-xs space-y-3">
          <p className="opacity-70">
            Sudah punya akun?{" "}
            <button type="button" onClick={onSwitchToLogin} className={`${accentColor} font-medium hover:underline`}>
              <Link href="/login">Masuk</Link>
            </button>
          </p>
          
          <div className={`p-3 -mx-6 -mb-4 mt-6 rounded-b-lg border-t ${borderColor} ${isDarkMode ? "bg-black/30" : "bg-neutral-50"}`}>
            <span className="opacity-70">Punya bisnis terkait pernikahan? </span>
            <Link href="/vendor-register" className={`${accentColor} font-medium hover:underline`}>
              Bergabung sebagai vendor
            </Link>
          </div>
        </div>
      </form>
    </DialogContent>
  );
}