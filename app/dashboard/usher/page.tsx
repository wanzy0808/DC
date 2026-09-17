import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Gift, QrCode, ScanLine, Users } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPaidGuestbook } from "@/lib/packages/access";
import DashboardAccessNotice from "@/components/Dashboard/DashboardAccessNotice";
import { Button } from "@/components/ui/button";
import UsherApp from "@/components/UsherApp/UsherApp";

type Feature = { icon: typeof ScanLine; label: string };
const features: Feature[] = [
  { icon: ScanLine, label: "QR Check-in" },
  { icon: Users, label: "Realtime Attendance" },
  { icon: QrCode, label: "Smart RSVP" },
  { icon: Gift, label: "Gift & Giving Management" },
];

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
    <div className="dc-dashboard min-h-dvh bg-background text-foreground">
      <main>
        <div className="mx-auto w-[80vw] max-w-full pb-16 pt-8 sm:pt-10">
          <Link
            href="/dashboard"
            className="inline-flex min-h-11 items-center gap-2 text-sm text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Kembali ke Dashboard
          </Link>
          <section className="mt-6 grid border-y border-border lg:grid-cols-2">
            <div className="min-w-0 py-8 lg:pr-10">
              <DashboardAccessNotice
                title="Usher App"
                heading="h1"
                label="Add-on belum aktif"
                description="Aplikasi khusus hari-H untuk memvalidasi tamu sebelum masuk venue. Tamu wajib menunjukkan QR check-in yang terhubung dengan daftar undangan."
              >
                <ul className="grid gap-x-6 sm:grid-cols-2">
                  {features.map(({ icon: FeatureIcon, label }) => (
                    <li key={label} className="flex items-center gap-3 border-b border-border py-4 text-sm">
                      <FeatureIcon className="size-4 shrink-0 text-primary" aria-hidden="true" />
                      {label}
                    </li>
                  ))}
                </ul>
                <Button asChild size="lg" className="mt-6">
                  <Link href="/packages">
                    Aktifkan Guestbook Digital
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
              </DashboardAccessNotice>
            </div>
            <div className="min-w-0 border-t border-border py-8 lg:border-l lg:border-t-0 lg:pl-10">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Venue access</p>
              <h2 className="mt-3 font-heading text-2xl leading-tight text-primary">QR adalah tiket masuk</h2>
              <ol className="mt-6 divide-y divide-border">
                <Step label="Scan" icon={ScanLine} description="Pindai QR resmi yang ditunjukkan tamu." />
                <Step label="Verify" icon={CheckCircle2} description="Periksa kecocokan QR dengan daftar undangan." />
                <Step label="Enter" icon={Users} description="Kehadiran tercatat setelah check-in berhasil." />
              </ol>
              <p className="mt-6 text-sm leading-6 text-muted-foreground">
                Jika tamu datang tanpa RSVP, usher memeriksa namanya di daftar undangan lalu membuat QR resmi. QR tersebut tetap harus di-scan sebelum tamu masuk.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function Step({ label, icon: Icon, description }: { label: string; icon: typeof ScanLine; description: string }) {
  return (
    <li className="flex gap-4 py-4">
      <Icon className="mt-1 size-5 shrink-0 text-primary" aria-hidden="true" />
      <div className="min-w-0">
        <h3 className="font-heading text-base text-primary">{label}</h3>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
    </li>
  );
}
