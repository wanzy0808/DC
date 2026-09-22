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

function destinationForRole(role: string, next: string) {
  if (role === "OWNER") return "/owner";
  if (role === "ADMIN" || role === "FINANCE") return "/admin";
  if (role === "DESIGNER" || role === "EDITOR") return "/designer";
  return next;
}

const copy = {
  id: {
    title: "Masuk",
    description: "Lanjutkan mengelola acara dan undanganmu.",
    google: "Masuk dengan Google",
    separator: "atau dengan email",
    email: "Email",
    password: "Kata sandi",
    submit: "Masuk",
    loading: "Memproses...",
    noAccount: "Belum punya akun?",
    register: "Daftar",
    showPassword: "Tampilkan kata sandi",
    hidePassword: "Sembunyikan kata sandi",
    googleConfig: "Google Sign-In belum dikonfigurasi di server.",
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
    submit: "Sign in",
    loading: "Signing in...",
    noAccount: "New here?",
    register: "Create account",
    showPassword: "Show password",
    hidePassword: "Hide password",
    googleConfig: "Google Sign-In is not configured on the server.",
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

  useEffect(() => {
    if (googleError?.startsWith("google_")) {
      setError(googleError === "google_config" ? t.googleConfig : t.googleFailed);
    }
  }, [googleError, t.googleConfig, t.googleFailed]);

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
          </div>
        </div>

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
