import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminLogoutButton from "@/components/Admin/AdminLogoutButton";
import AdminPayments from "@/components/Admin/AdminPayments";
import AdminOperations from "@/components/Admin/AdminOperations";

export default async function AdminPage() {
  const user = await getCurrentUser();
  const [userCount, invitationCount] = await Promise.all([prisma.user.count(), prisma.invitation.count()]);
  return <main className="min-h-screen bg-white text-[#111] dark:bg-[#0B0B0C] dark:text-white"><div className="mx-auto max-w-7xl space-y-8 py-10"><header className="px-6"><p className="font-[family-name:var(--font-dm-mono)] text-xs uppercase tracking-[0.25em] text-[#C07A84]">Admin Dashboard</p><h1 className="mt-2 font-[family-name:var(--font-cinzel)] text-4xl">Halo, {user?.firstName}</h1><p className="mt-2 text-sm opacity-60">Database dapat dipantau di sini. Perubahan dibatasi pada bantuan operasional yang memang menjadi tugas Admin.</p></header><AdminOperations/><div className="px-6"><div className="grid gap-4 sm:grid-cols-2"><section className="rounded-2xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-[#121116]"><p className="text-sm opacity-60">Total pengguna</p><p className="mt-2 font-[family-name:var(--font-dm-mono)] text-4xl">{userCount}</p></section><section className="rounded-2xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-[#121116]"><p className="text-sm opacity-60">Total undangan</p><p className="mt-2 font-[family-name:var(--font-dm-mono)] text-4xl">{invitationCount}</p></section></div><div className="mt-6"><AdminPayments/></div><AdminLogoutButton/></div></div></main>;
}
