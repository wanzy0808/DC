import Link from "next/link";
import { ArrowRight, QrCode, Radio, Users } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="grid gap-10 lg:grid-cols-12 lg:items-end">
      <div className="lg:col-span-8">
        <p className="font-[family-name:var(--font-dm-mono)] text-xs font-semibold uppercase tracking-[0.24em] text-primary">
          [ DIGITAL GUESTBOOK SYSTEM ]
        </p>
        <h1 className="mt-4 max-w-5xl font-[family-name:var(--font-cinzel)] text-4xl leading-[1.05] md:text-6xl lg:text-7xl">
          Tamu datang dengan tenang. <span className="opacity-75">Tim acara tetap terkendali.</span>
        </h1>
        <p className="mt-6 max-w-2xl font-[family-name:var(--font-fauna)] text-sm leading-7 text-muted-foreground md:text-base">
          Verifikasi tamu, QR check-in, seating, greeting, dan attendance dari satu sistem Guestbook Digital DC Organizer untuk hari acara.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/packages" className={buttonVariants({ size: "lg" })}>
            Lihat paket
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/d-invitation" className={buttonVariants({ size: "lg" })}>
            Lihat Undangan Digital
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 lg:col-span-4">
        {[
          { icon: QrCode, label: "QR Entry" },
          { icon: Users, label: "Guest Data" },
          { icon: Radio, label: "Realtime" },
        ].map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="rounded-2xl border border-border bg-card/70 p-4 text-center"
          >
            <Icon className="mx-auto h-5 w-5 text-primary" />
            <p className="mt-3 font-[family-name:var(--font-dm-mono)] text-[10px] uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
