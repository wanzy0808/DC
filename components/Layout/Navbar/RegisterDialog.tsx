"use client";

import React, { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import GoogleIcon from "@/components/Auth/GoogleIcon";
import { authCardClass, authChoiceBoxClass, authDescriptionClass, authErrorClass, authEyebrowClass, authFieldClass, authGoogleButtonClass, authHeaderClass, authLabelClass, authPasswordToggleClass, authSecondaryLinkClass, authSeparatorClass, authSubmitButtonClass, authTitleClass } from "@/components/Auth/auth-styles";
import { useLanguage } from "@/components/I18n/LanguageProvider";
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface RegisterDialogProps {
  next?: string;
  onSwitchToLogin?: () => void;
  onRegistered?: () => void;
}

const copy = {
  id: {
    title: "Daftar",
    description: "Buat akun untuk mulai menyiapkan acaramu.",
    google: "Daftar dengan Google",
    separator: "atau dengan email",
    email: "Email",
    password: "Kata sandi",
    confirm: "Konfirmasi kata sandi",
    minimum: "Minimal 8 karakter",
    showPassword: "Tampilkan kata sandi",
    hidePassword: "Sembunyikan kata sandi",
    showConfirm: "Tampilkan konfirmasi kata sandi",
    hideConfirm: "Sembunyikan konfirmasi kata sandi",
    terms: "Saya menyetujui",
    termsName: "Syarat & Ketentuan",
    privacy: "Kebijakan Privasi",
    and: "dan",
    promo: "Saya ingin menerima email promo dan newsletter DC Organizer.",
    submit: "Daftar",
    loading: "Memproses...",
    haveAccount: "Sudah punya akun?",
    login: "Masuk",
    vendorText: "Punya bisnis terkait acara?",
    vendorLink: "Bergabung sebagai vendor",
    requiredTerms: "Kamu perlu menyetujui Syarat & Ketentuan dan Kebijakan Privasi.",
    minimumError: "Kata sandi minimal 8 karakter.",
    mismatchError: "Konfirmasi kata sandi tidak cocok.",
    registerError: "Pendaftaran gagal.",
    connectionError: "Tidak dapat terhubung ke server.",
  },
  en: {
    title: "Create account",
    description: "Create an account to start planning your event.",
    google: "Continue with Google",
    separator: "or with email",
    email: "Email",
    password: "Password",
    confirm: "Confirm password",
    minimum: "At least 8 characters",
    showPassword: "Show password",
    hidePassword: "Hide password",
    showConfirm: "Show confirmation password",
    hideConfirm: "Hide confirmation password",
    terms: "I agree to the",
    termsName: "Terms & Conditions",
    privacy: "Privacy Policy",
    and: "and",
    promo: "I want to receive promotional emails and DC Organizer newsletters.",
    submit: "Create account",
    loading: "Creating account...",
    haveAccount: "Already have an account?",
    login: "Sign in",
    vendorText: "Work in the events industry?",
    vendorLink: "Join as a vendor",
    requiredTerms: "Please agree to the Terms & Conditions and Privacy Policy.",
    minimumError: "Password must have at least 8 characters.",
    mismatchError: "Passwords do not match.",
    registerError: "Registration failed.",
    connectionError: "Unable to connect to the server.",
  },
} as const;

export default function RegisterDialog({ next: providedNext, onSwitchToLogin, onRegistered }: RegisterDialogProps) {
  const { locale } = useLanguage();
  const t = copy[locale];
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
    const requestedNext = providedNext ?? new URLSearchParams(window.location.search).get("next");
    if (requestedNext?.startsWith("/") && !requestedNext.startsWith("//")) {
      setNext(requestedNext);
    }
  }, [providedNext]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!agreedTerms) {
      setError(t.requiredTerms);
      return;
    }
    if (password.length < 8) {
      setError(t.minimumError);
      return;
    }
    if (password !== confirmPassword) {
      setError(t.mismatchError);
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
        setError(data.error ?? t.registerError);
      } else {
        if (onRegistered) onRegistered();
        else router.push(`/login?next=${encodeURIComponent(next)}`);
      }
    } catch {
      setError(t.connectionError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <DialogContent className={`${authCardClass} max-h-[calc(100dvh-32px)] w-[min(94vw,490px)] gap-0 overflow-y-auto overscroll-contain p-6 sm:max-h-[min(88dvh,800px)] sm:max-w-[490px] sm:p-8`}>
      <DialogHeader className={authHeaderClass}>
        <span aria-hidden="true" className={authEyebrowClass} />
        <DialogTitle className={authTitleClass}>
          {t.title}
        </DialogTitle>
        <DialogDescription className={authDescriptionClass}>
          {t.description}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={submit} className="space-y-4 pt-5">
        <Button asChild size="lg" className={authGoogleButtonClass}>
          <a href={`/api/auth/google?next=${encodeURIComponent(next)}`}>
            <GoogleIcon />
            <span>{t.google}</span>
          </a>
        </Button>

        <div className="flex items-center gap-3" aria-hidden="true">
          <span className="h-px flex-1 bg-primary/25" />
          <span className={authSeparatorClass}>{t.separator}</span>
          <span className="h-px flex-1 bg-primary/25" />
        </div>

        <div className="space-y-4">
          <label htmlFor="dc-register-email" className={authLabelClass}>
            {t.email}
            <input
              id="dc-register-email"
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={authFieldClass}
            />
          </label>

          <div>
            <label htmlFor="dc-register-password" className={authLabelClass}>
              {t.password}
            </label>
            <div className="relative">
              <input
                id="dc-register-password"
                required
                minLength={8}
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                aria-describedby="dc-register-password-hint"
                className={authFieldClass + " pr-14"}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className={authPasswordToggleClass}
                aria-pressed={showPassword}
                aria-label={showPassword ? t.hidePassword : t.showPassword}
              >
                {showPassword ? <EyeOff aria-hidden="true" className="size-4" /> : <Eye aria-hidden="true" className="size-4" />}
              </button>
            </div>
            <p id="dc-register-password-hint" className="mt-1.5 text-xs text-muted-foreground">{t.minimum}</p>
          </div>

          <div>
            <label htmlFor="dc-register-password-confirm" className={authLabelClass}>
              {t.confirm}
            </label>
            <div className="relative">
              <input
                id="dc-register-password-confirm"
                required
                minLength={8}
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className={authFieldClass + " pr-14"}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((value) => !value)}
                className={authPasswordToggleClass}
                aria-pressed={showConfirmPassword}
                aria-label={showConfirmPassword ? t.hideConfirm : t.showConfirm}
              >
                {showConfirmPassword ? <EyeOff aria-hidden="true" className="size-4" /> : <Eye aria-hidden="true" className="size-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className={authChoiceBoxClass}>
          <label className="flex cursor-pointer items-start gap-3">
            <input
              required
              type="checkbox"
              checked={agreedTerms}
              onChange={(event) => setAgreedTerms(event.target.checked)}
              className="mt-0.5 size-4 shrink-0 cursor-pointer accent-[var(--primary)]"
            />
            <span className="leading-relaxed">
              {t.terms} <span className="font-medium text-primary">{t.termsName}</span> {t.and} <span className="font-medium text-primary">{t.privacy}</span>.
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={agreedPromo}
              onChange={(event) => setAgreedPromo(event.target.checked)}
              className="mt-0.5 size-4 shrink-0 cursor-pointer accent-[var(--primary)]"
            />
            <span className="leading-relaxed">{t.promo}</span>
          </label>
        </div>

        {error && <p role="alert" className={authErrorClass}>{error}</p>}

        <Button type="submit" disabled={loading} size="lg" className={authSubmitButtonClass}>
          {loading ? t.loading : t.submit}
        </Button>

        <div className="space-y-3 border-t border-primary/15 pt-4 text-center font-[family-name:var(--font-dc-body)] text-sm text-muted-foreground">
          <p>
            {t.haveAccount}{" "}
            <button
              type="button"
              onClick={() => {
                if (onSwitchToLogin) onSwitchToLogin();
                else router.push(`/login?next=${encodeURIComponent(next)}`);
              }}
              className={authSecondaryLinkClass}
            >
              {t.login}
            </button>
          </p>
          <p className="text-xs leading-6">
            {t.vendorText}{" "}
            <Link href="/vendor-register" className={authSecondaryLinkClass}>
              {t.vendorLink}
            </Link>
          </p>
        </div>
      </form>
    </DialogContent>
  );
}
