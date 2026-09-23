"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Shared Owner/Admin logout: revoke the server session before navigating. */
export default function SessionLogoutButton() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function logout() {
    if (submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("Logout belum berhasil. Coba lagi.");
      window.location.replace("/login");
    } catch {
      setError("Logout belum berhasil. Coba lagi.");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <Button type="button" variant="outline" size="lg" onClick={logout} disabled={submitting}>
        <LogOut className="size-4" aria-hidden="true" />
        {submitting ? "Keluar..." : "Logout"}
      </Button>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
