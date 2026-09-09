import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, Gift, LockKeyhole, QrCode, ScanLine, Users } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPaidGuestbook } from "@/lib/packages/access";
import UsherApp from "@/components/UsherApp/UsherApp";

export const dynamic = "force-dynamic";

export default async function UsherPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const invitation = await prisma.invitation.findFirst({
    where: { ownerId: user.id },
    include: { payment: true },
    orderBy: { createdAt: "asc" },
  });

  const usherActive = hasPaidGuestbook(invitation?.payment);

  if (usherActive) return <UsherApp />;

  return (
    <main className="min-h-screen bg-[#faf8f5] px-5 py-10 text-[#211d1e] sm:px-8 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <Link href="/dashboard" className="text-xs text-[#7A1C25] hover:underline">← Kembali ke Dashboard</Link>
        <section className="mt-6 overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm">
          <div className="grid lg:grid-cols-[1.05fr_.95fr]">
            <div className="p-7 sm:p-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#E60087]/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#E60087]"><LockKeyhole className="h-3.5 w-3.5" /> Add-on belum aktif</div>
              <h1 className="mt-5 font-serif text-4xl sm:text-5xl">Usher App</h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-black/55">Aplikasi khusus hari-H untuk memvalidasi tamu sebelum masuk venue. Tamu wajib menunjukkan QR check-in yang terhubung dengan RSVP undangan digital.</p>
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {[[ScanLine, "QR Check-in"], [Users, "Realtime Attendance"], [QrCode, "Smart RSVP"], [Gift, "Gift & Giving Management"]].map(([Icon, label]) => { const FeatureIcon = Icon as typeof ScanLine; return <div key={String(label)} className="flex items-center gap-3 rounded-xl bg-[#fafafa] p-3 text-xs"><FeatureIcon className="h-4 w-4 text-[#E60087]" />{label}</div>; })}
              </div>
              <Link href="/packages" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#E60087] px-5 py-3 text-xs font-medium text-white hover:bg-[#c90077]">Aktifkan Guestbook Digital →</Link>
            </div>
            <div className="flex min-h-[430px] items-center justify-center bg-[#fff1fa] p-8">
              <div className="w-full max-w-sm rounded-3xl border border-black/10 bg-white p-7 shadow-xl">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#E60087] text-white"><ScanLine className="h-8 w-8" /></div>
                <p className="mt-6 text-center text-[10px] uppercase tracking-[0.2em] text-[#E60087]">Venue access</p>
                <h2 className="mt-2 text-center font-serif text-2xl">QR adalah tiket masuk</h2>
                <div className="mt-6 grid grid-cols-3 gap-2"><Mini label="Scan" icon={ScanLine} /><Mini label="Verify" icon={CheckCircle2} /><Mini label="Enter" icon={Users} /></div>
                <p className="mt-6 text-center text-[10px] leading-5 text-black/40">Tanpa QR, usher dapat mencari nama tamu yang sudah terdaftar sebagai jalur bantuan manual.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Mini({ label, icon: Icon }: { label: string; icon: typeof ScanLine }) {
  return <div className="rounded-xl bg-[#fafafa] p-3 text-center"><Icon className="mx-auto h-4 w-4 text-[#E60087]" /><p className="mt-2 text-[9px] text-black/50">{label}</p></div>;
}
