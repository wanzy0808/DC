import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminLogoutButton from "@/components/Admin/AdminLogoutButton";
import AdminPayments from "@/components/Admin/AdminPayments";
import AdminOperations from "@/components/Admin/AdminOperations";

export default async function AdminPage() {
  const user = await getCurrentUser();
  const [userCount, invitationCount] = await Promise.all([prisma.user.count(), prisma.invitation.count()]);

  return (
    <div className="dc-dashboard min-h-screen bg-background text-foreground">
      <main className="mx-auto w-[80vw] max-w-full space-y-8 px-5 py-8 font-[family-name:var(--font-fauna)]">
        <header>
          <p className="font-[family-name:var(--font-dm-mono)] text-xs uppercase tracking-[.2em] text-primary">Admin Dashboard</p>
          <h1 className="mt-2 font-[family-name:var(--font-cinzel)] text-3xl font-semibold">Halo, {user?.firstName}</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Database dapat dipantau di sini. Perubahan dibatasi pada bantuan operasional yang memang menjadi tugas Admin.</p>
        </header>
        <AdminOperations />
        <div>
          <div className="grid gap-4 sm:grid-cols-2">
            <section className="border border-border bg-background p-6">
              <p className="text-sm text-muted-foreground">Total pengguna</p>
              <p className="mt-2 font-[family-name:var(--font-dm-mono)] text-4xl">{userCount}</p>
            </section>
            <section className="border border-border bg-background p-6">
              <p className="text-sm text-muted-foreground">Total undangan</p>
              <p className="mt-2 font-[family-name:var(--font-dm-mono)] text-4xl">{invitationCount}</p>
            </section>
          </div>
          <div className="mt-6"><AdminPayments /></div>
          <AdminLogoutButton />
        </div>
      </main>
    </div>
  );
}
