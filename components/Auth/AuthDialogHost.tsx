"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Dialog } from "@/components/ui/dialog";
import LoginDialog from "@/components/Auth/LoginDialog";
import RegisterDialog from "@/components/Layout/Navbar/RegisterDialog";

type AuthMode = "login" | "register" | null;
type AuthOpenRequest = { mode: "login" | "register"; next?: string; error?: string };

function safeNext(value: string | null | undefined) {
  return value?.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\")
    ? value
    : "/dashboard";
}

/**
 * Auth dialogs live outside the burger dropdown, so closing the menu never unmounts
 * the popup. Legacy /login links and Google callback errors open the same dialog
 * using the ?auth= URL parameter without requiring a standalone login screen.
 */
export default function AuthDialogHost() {
  const pathname = usePathname();
  const search = useSearchParams();
  const previousPath = useRef(pathname);
  const [mode, setMode] = useState<AuthMode>(null);
  const [next, setNext] = useState("/dashboard");
  const [googleError, setGoogleError] = useState("");
  const [registrationComplete, setRegistrationComplete] = useState(false);

  useEffect(() => {
    function openFromMenu(event: Event) {
      const request = (event as CustomEvent<AuthOpenRequest>).detail;
      if (request?.mode !== "login" && request?.mode !== "register") return;
      const currentQuery = new URLSearchParams(window.location.search);
      setNext(safeNext(request.next ?? currentQuery.get("next")));
      setGoogleError(request.error ?? "");
      setRegistrationComplete(false);
      setMode(request.mode);
    }
    window.addEventListener("dc-auth-open", openFromMenu);
    return () => window.removeEventListener("dc-auth-open", openFromMenu);
  }, []);

  useEffect(() => {
    const currentMode = search.get("auth");
    if (currentMode === "login" || currentMode === "register") {
      setNext(safeNext(search.get("next")));
      setGoogleError(search.get("error") ?? "");
      setRegistrationComplete(false);
      setMode(currentMode);
    } else if (previousPath.current !== pathname) {
      // Dismiss a dialog when its containing page navigates away.
      setMode(null);
    }
    previousPath.current = pathname;
  }, [pathname, search]);

  function close() {
    if (window.location.search.includes("auth=")) {
      const url = new URL(window.location.href);
      if (url.searchParams.get("auth") === "login" || url.searchParams.get("auth") === "register") {
        url.searchParams.delete("auth");
        url.searchParams.delete("error");
        url.searchParams.delete("next");
        url.searchParams.delete("register");
        window.history.replaceState(null, "", url.pathname + url.search + url.hash);
      }
    }
    setMode(null);
    setGoogleError("");
    setRegistrationComplete(false);
  }

  return (
    <Dialog open={mode !== null} onOpenChange={(open) => { if (!open) close(); }}>
      {mode === "login" ? (
        <LoginDialog
          next={next}
          googleError={googleError}
          registrationComplete={registrationComplete}
          onSwitchToRegister={() => {
            setGoogleError("");
            setRegistrationComplete(false);
            setMode("register");
          }}
        />
      ) : mode === "register" ? (
        <RegisterDialog
          next={next}
          onSwitchToLogin={() => { setGoogleError(""); setMode("login"); }}
          onRegistered={() => { setGoogleError(""); setRegistrationComplete(true); setMode("login"); }}
        />
      ) : null}
    </Dialog>
  );
}
