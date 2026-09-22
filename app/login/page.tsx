"use client";

import { FormEvent, useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import GoogleIcon from "@/components/Auth/GoogleIcon";
import { authErrorClass, authFieldClass, authGoogleButtonClass, authSubmitButtonClass } from "@/components/Auth/auth-styles";
import { useLanguage } from "@/components/I18n/LanguageProvider";
import { Dialog } from "@/components/ui/dialog";
import RegisterDialog from "@/components/Layout/Navbar/RegisterDialog";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
  },
} as const;

export default function LoginPage() {
  const { locale } = useLanguage();
  const t = copy[locale];
  const reducedMotion = useReducedMotion();
  const [registerOpen, setRegisterOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [next, setNext] = useState("/dashboard");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedNext = params.get("next");
    if (params.get("register") === "1") setRegisterOpen(true);
    if (requestedNext?.startsWith("/") && !requestedNext.startsWith("//")) {
      setNext(requestedNext);
    }

    const googleError = params.get("error");
    if (googleError?.startsWith("google_")) {
      setError(
        googleError === "google_config"
          ? "Google Sign-In belum dikonfigurasi di server."
          : "Google Sign-In gagal. Silakan coba lagi.",
      );
      window.history.replaceState(
        {},
        "",
        `/login${requestedNext ? `?next=${encodeURIComponent(requestedNext)}` : ""}`,
      );
      return;
    }

    fetch("/api/auth/session", { cache: "no-store" })
      .then((response) =>
        response.ok
          ? (response.json() as Promise<{
              authenticated?: boolean;
              user?: { role: string };
            }>)
          : null,
      )
      .then((data) => {
        if (data?.authenticated) {
          window.location.replace(
            destinationForRole(
              data.user?.role ?? "USER",
              requestedNext?.startsWith("/") && !requestedNext.startsWith("//")
                ? requestedNext
                : "/dashboard",
            ),
          );
        }
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
      const text = await response.text();
      let data: { error?: string; user?: { role: string } } = {};
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = { error: "Response server tidak valid." };
        }
      }

      if (!response.ok || !data.user) {
        setError(data.error ?? "Login gagal.");
      } else {
        window.location.replace(destinationForRole(data.user.role, next));
      }
    } catch {
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  const registerHref = `/login?register=1&next=${encodeURIComponent(next)}`;
  const googleHref = `/api/auth/google?next=${encodeURIComponent(next)}`;

  const closeRegister = () => {
    setRegisterOpen(false);
    window.history.replaceState({}, "", `/login?next=${encodeURIComponent(next)}`);
  };

  return (
    <main className="relative isolate flex w-full flex-1 items-center justify-center overflow-hidden px-4 py-12 text-foreground sm:px-6 sm:py-16">
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[580px] w-[min(100%,900px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(192,122,132,0.17),transparent_72%)] dark:bg-[radial-gradient(ellipse,rgba(192,122,132,0.12),transparent_72%)]" />
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[480px]"
      >
        <form
          onSubmit={submit}
          className="relative w-full space-y-6 rounded-[32px] border border-primary/35 bg-card/85 p-6 text-foreground shadow-[0_18px_75px_rgba(75,35,47,0.11)] backdrop-blur-md sm:p-10"
        >
          <div className="space-y-3 text-center">
            <span aria-hidden="true" className="mx-auto block h-1 w-12 rounded-full bg-primary/70" />
            <h1 className="font-[family-name:var(--font-dc-heading)] text-3xl font-normal text-primary sm:text-4xl">
              {t.title}
            </h1>
            <p className="mx-auto max-w-[33ch] font-[family-name:var(--font-dc-body)] text-sm leading-7 text-muted-foreground">
              {t.description}
            </p>
          </div>

          <Button asChild size="lg" className={authGoogleButtonClass}>
            <a href={googleHref}>
              <GoogleIcon />
              <span>{t.google}</span>
            </a>
          </Button>

          <div className="flex items-center gap-3" aria-hidden="true">
            <span className="h-px flex-1 bg-primary/25" />
            <span className="font-[family-name:var(--font-dc-mono)] text-[11px] text-muted-foreground">{t.separator}</span>
            <span className="h-px flex-1 bg-primary/25" />
          </div>

          <div className="space-y-4">
            <label htmlFor="dc-login-email" className="block text-sm font-medium text-foreground">
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
              <label htmlFor="dc-login-password" className="block text-sm font-medium text-foreground">{t.password}</label>
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
                  className="absolute right-2 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full text-primary transition-colors hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  {showPassword ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
                </button>
              </div>
            </div>
          </div>

          {error && <p role="alert" className={authErrorClass}>{error}</p>}

          <Button type="submit" disabled={loading} size="lg" className={authSubmitButtonClass}>
            {loading ? t.loading : t.submit}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {t.noAccount}{" "}
            <Link
              href={registerHref}
              onClick={() => setRegisterOpen(true)}
              className="font-semibold text-primary underline underline-offset-4 transition-colors hover:text-primary/75"
            >
              {t.register}
            </Link>
          </p>
        </form>
      </motion.div>
      <Dialog open={registerOpen} onOpenChange={(open) => { if (open) setRegisterOpen(true); else closeRegister(); }}>
        <RegisterDialog onSwitchToLogin={closeRegister} onRegistered={closeRegister} />
      </Dialog>
    </main>
  );
}
