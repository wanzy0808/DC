import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminLogoutButton from "@/components/Admin/AdminLogoutButton";
import AdminPayments from "@/components/Admin/AdminPayments";

export default async function AdminPage() {
  const user = await getCurrentUser();
  const [userCount, invitationCount] = await Promise.all([
    prisma.user.count(),
    prisma.invitation.count(),
  ]);

  return (
    <main className="min-h-screen bg-[#FAF7F2] px-6 py-12 text-[#1A1A1A]">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[#7A1C25]">DC Admin</p>
          <h1 className="mt-2 font-serif text-4xl">Halo, {user?.firstName}</h1>
          <p className="mt-2 text-sm opacity-60">Kelola pengguna dan aktivitas platform.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <section className="rounded-2xl border border-black/10 bg-white p-6">
            <p className="text-sm opacity-60">Total pengguna</p>
            <p className="mt-2 font-serif text-4xl">{userCount}</p>
          </section>
          <section className="rounded-2xl border border-black/10 bg-white p-6">
            <p className="text-sm opacity-60">Total undangan</p>
            <p className="mt-2 font-serif text-4xl">{invitationCount}</p>
          </section>
        </div>

        <AdminPayments />

        <AdminLogoutButton />
      </div>
    </main>
  );
}