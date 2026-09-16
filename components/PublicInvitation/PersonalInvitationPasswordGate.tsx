"use client";

import { FormEvent, useState } from "react";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function PersonalInvitationPasswordGate({
  slug,
  token,
  guestName,
}: {
  slug: string;
  token: string;
  guestName: string;
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `/api/invite/${encodeURIComponent(slug)}/personal/${encodeURIComponent(token)}/password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        },
      );
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || "Password salah.");
      window.location.reload();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Password belum dapat diverifikasi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 text-foreground">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-xl border border-border bg-background p-7 text-center shadow-sm md:p-9">
        <div className="mx-auto grid h-10 w-10 place-items-center rounded-lg bg-primary/[0.08] text-primary">
          <LockKeyhole className="h-5 w-5" />
        </div>
        <p className="mt-5 font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.18em] text-primary">Personal Invitation</p>
        <h1 className="mt-2 font-[family-name:var(--font-cinzel)] text-2xl font-semibold">Untuk {guestName}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Masukkan password untuk membuka undangan personal ini.</p>
        <Input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          placeholder="Password undangan"
          className="mt-6"
        />
        {error && <p className="mt-3 text-xs text-destructive">{error}</p>}
        <Button type="submit" disabled={loading || !password} size="lg" className="mt-4 w-full">
          {loading ? "Memverifikasi..." : "Buka undangan"}
        </Button>
      </form>
    </main>
  );
}