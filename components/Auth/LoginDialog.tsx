"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import GoogleIcon from "@/components/Auth/GoogleIcon";
import {
  authCardClass,
  authDescriptionClass,
  authErrorClass,
  authEyebrowClass,
  authFieldClass,
  authGoogleButtonClass,
  authHeaderClass,
  authLabelClass,
  authPasswordToggleClass,
  authSecondaryLinkClass,
  authSeparatorClass,
  authSubmitButtonClass,
  authTitleClass,
} from "@/components/Auth/auth-styles";
import { useLanguage } from "@/components/I18n/LanguageProvider";
import { dashboardRouteForRole } from "@/lib/auth/dashboard-route";

function destinationForRole(role: string, next: string) {
  const dashboard = dashboardRouteForRole(role);
  return dashboard === "/dashboard" ? next : dashboard;
}

const copy = {
  id: {
    title: "Masuk",
    description: "Lanjutkan mengelola acara dan undanganmu.",
    google: "Masuk dengan Google",
    separator: "atau dengan email",
    email: "Email",
    password: "Kata sandi",
    forgot: "Lupa kata sandi?",
    forgotSent: "Jika email terdaftar, tautan reset akan dikirim.",
    submit: "Masuk",
    loading: "Memproses...",
    noAccount: "Belum punya akun?",
    register: "Daftar",
    showPassword: "Tampilkan kata sandi",
    hidePassword: "Sembunyikan kata sandi",
    googleConfig: "Masuk dengan Google belum tersedia. Periksa konfigurasi OAuth server.",
    googleState: "Sesi Google tidak cocok atau sudah kedaluwarsa. Coba lagi dari alamat situs yang sama.",
    googleDenied: "Akses Google dibatalkan. Pilih akun dan lanjutkan jika ingin masuk.",
    googleToken: "Kode Google tidak dapat diverifikasi. Periksa Client Secret dan alamat callback OAuth.",
    googleProfile: "Google tidak memberikan email yang terverifikasi. Coba akun Google lain.",
    googleDatabase: "Akun atau sesi Google belum bisa disimpan. Periksa koneksi database.",
    googleFailed: "Google Sign-In gagal. Silakan coba lagi.",
    registered: "Akun dibuat. Periksa email untuk verifikasi sebelum masuk.",
    loginFailed: "Login gagal.",
    serverFailed: "Respons server tidak valid.",
    connectionFailed: "Tidak dapat terhubung ke server.",
  },
  en: {
    title: "Sign in",
    description: "Continue managing your events and invitations.",
    google: "Continue with Google",
    separator: "or with email",
    email: "Email",
    password: "Password",
    forgot: "Forgot password?",
    forgotSent: "If the email is registered, a reset link will be sent.",
    submit: "Sign in",
    loading: "Signing in...",
    noAccount: "New here?",
    register: "Create account",
    showPassword: "Show password",
    hidePassword: "Hide password",
    googleConfig: "Google Sign-In is unavailable. Check the server OAuth configuration.",
    googleState: "Your Google sign-in session expired or does not match. Try again on the same site address.",
    googleDenied: "Google access was cancelled. Select an account to continue signing in.",
    googleToken: "Google could not verify the sign-in code. Check the OAuth client secret and callback URL.",
    googleProfile: "Google did not provide a verified email address. Try another Google account.",
    googleDatabase: "Could not save the Google account or session. Check the database connection.",
    googleFailed: "Google Sign-In failed. Please try again.",
    registered: "Account created. Check your email to verify it before signing in.",
    loginFailed: "Sign in failed.",
    serverFailed: "Invalid server response.",
    connectionFailed: "Unable to connect to the server.",
  },
} as const;

export default function LoginDialog({
  next,
  googleError,
  registrationComplete,
  onSwitchToRegister,
}: {
  next: string;
  googleError?: string;
  registrationComplete?: boolean;
  onSwitchToRegister: () => void;
}) {
  const { locale } = useLanguage();
  const t = copy[locale];
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const messages: Record<string, string> = {
      google_config: t.googleConfig,
      google_state: t.googleState,
      google_denied: t.googleDenied,
      google_token: t.googleToken,
      google_profile: t.googleProfile,
      google_database: t.googleDatabase,
    };
    if (googleError?.startsWith("google_")) {
      setError(messages[googleError] ?? t.googleFailed);
    }
  }, [googleError, t]);

  useEffect(() => {
    let active = true;
    // Keep the previous /login behavior: an existing signed-in user goes to
    // their permitted destination instead of seeing the sign-in form again.
    void fetch("/api/auth/session", { cache: "no-store" })
      .then(async (response) => response.ok
        ? await response.json() as { authenticated?: boolean; user?: { role: string } }
        : null)
      .then((session) => {
        if (active && session?.authenticated) {
          window.location.replace(destinationForRole(session.user?.role ?? "USER", next));
        }
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, [next]);

  async function forgotPassword() {
    setError("");
    setNotice("");
    if (!email.trim()) {
      setError(locale === "id" ? "Isi email terlebih dahulu." : "Enter your email first.");
      return;
    }
    setForgotLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json() as { error?: string; message?: string };
      if (!response.ok) setError(data.error ?? t.connectionFailed);
      else setNotice(t.forgotSent);
    } catch {
      setError(t.connectionFailed);
    } finally {
      setForgotLoading(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const text = await response.text();
      let data: { error?: string; user?: { role: string } } = {};
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = { error: t.serverFailed };
        }
      }
      if (!response.ok || !data.user) {
        setError(data.error ?? t.loginFailed);
      } else {
        window.location.replace(destinationForRole(data.user.role, next));
      }
    } catch {
      setError(t.connectionFailed);
    } finally {
      setLoading(false);
    }
  }

  return (
    <DialogContent overlayClassName="z-[100] bg-[#2a1620]/25 backdrop-blur-[2px] dark:bg-black/45" className={`${authCardClass} z-[101] max-h-[calc(100dvh-32px)] w-[min(94vw,480px)] gap-0 overflow-y-auto p-6 sm:max-w-[480px] sm:p-9`}>
      <DialogHeader className={authHeaderClass}>
        <span aria-hidden="true" className={authEyebrowClass} />
        <DialogTitle className={authTitleClass}>{t.title}</DialogTitle>
        <DialogDescription className={authDescriptionClass}>{t.description}</DialogDescription>
      </DialogHeader>

      <form onSubmit={submit} className="space-y-5 pt-7">
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
          <label htmlFor="dc-login-email" className={authLabelClass}>
            {t.email}
            <input
              id="dc-login-email"
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={authFieldClass}
            />
          </label>
          <div>
            <label htmlFor="dc-login-password" className={authLabelClass}>{t.password}</label>
            <div className="relative">
              <input
                id="dc-login-password"
                required
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={authFieldClass + " pr-14"}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? t.hidePassword : t.showPassword}
                aria-pressed={showPassword}
                className={authPasswordToggleClass}
              >
                {showPassword ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
              </button>
            </div>
            <button type="button" disabled={forgotLoading} onClick={forgotPassword} className={`${authSecondaryLinkClass} mt-2 text-sm disabled:opacity-60`}>
              {forgotLoading ? t.loading : t.forgot}
            </button>
          </div>
        </div>

        {notice && !error && <p role="status" className="rounded-[20px] border border-primary/35 bg-primary/10 px-4 py-3 text-sm leading-6 text-[#21191c]">{notice}</p>}
        {registrationComplete && !error && (
          <p role="status" className="rounded-[20px] border border-primary/35 bg-primary/10 px-4 py-3 text-sm leading-6 text-[#21191c] dark:text-[#21191c]">{t.registered}</p>
        )}
        {error && <p role="alert" className={authErrorClass}>{error}</p>}

        <Button type="submit" disabled={loading} size="lg" className={authSubmitButtonClass}>
          {loading ? t.loading : t.submit}
        </Button>

        <p className="text-center text-sm text-[#74646a] dark:text-[#74646a]">
          {t.noAccount}{" "}
          <button type="button" onClick={onSwitchToRegister} className={authSecondaryLinkClass}>
            {t.register}
          </button>
        </p>
      </form>
    </DialogContent>
  );
}
