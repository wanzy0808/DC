import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AccountConfirmationPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  let message = "Token konfirmasi tidak ditemukan.";
  if (token) {
    const baseUrl = process.env.APP_URL ?? "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/owner/account-confirmation?token=${encodeURIComponent(token)}`, { cache: "no-store" });
    const data = await response.json().catch(() => null) as { message?: string; error?: string } | null;
    message = data?.message ?? data?.error ?? "Konfirmasi belum dapat diproses.";
  }
  return <main className="grid min-h-screen place-items-center bg-white px-6 dark:bg-[#0B0B0C]"><section className="w-full max-w-md rounded-3xl border border-black/10 bg-white p-8 text-center shadow-xl dark:border-white/10 dark:bg-[#121116]"><p className="font-[family-name:var(--font-dm-mono)] text-xs uppercase tracking-[.2em] text-[#C07A84]">DC Organizer</p><h1 className="mt-3 font-[family-name:var(--font-cinzel)] text-2xl">Konfirmasi akun</h1><p className="mt-3 text-sm opacity-70">{message}</p><Button asChild className="mt-6"><Link href="/owner">Kembali ke Owner Dashboard</Link></Button></section></main>;
}
