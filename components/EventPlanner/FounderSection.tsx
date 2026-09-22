import Image from "next/image";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const CONSULTATION_URL =
  "https://wa.me/6282124786516?text=Halo%2C%20aku%20ingin%20tanya2%20mengenai%20paket%20Event%20Planner.";

export default function FounderSection() {
  return (
    <section className="grid items-center gap-10 lg:grid-cols-12">
      <div className="relative lg:col-span-5">
        <div className="rounded-[32px] border border-primary/35 bg-[var(--card)]/75 p-2">
          <div className="relative h-[360px] overflow-hidden rounded-[25px] sm:h-[460px]">
            <Image
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1000&auto=format&fit=crop"
              alt="Founder DC Organizer"
              fill
              className="object-cover"
            />
          </div>
        </div>
        <div className="absolute -bottom-5 right-0 w-[min(18rem,calc(100%-1rem))] rounded-[24px] border border-primary/35 bg-[var(--card)] p-5 shadow-xl sm:-right-3">
          <div className="flex items-center gap-2 text-[var(--primary)]">
            <Sparkles className="h-4 w-4" />
            <span className="font-[family-name:var(--font-dc-mono)] text-xs font-semibold">
              8+ Tahun Pengalaman
            </span>
          </div>
          <p className="mt-2 text-xs italic leading-6 text-[var(--muted-foreground)]">
            “Acara yang baik bukan hanya terlihat indah, tapi terasa terarah bagi host, keluarga, vendor, dan setiap tamu.”
          </p>
        </div>
      </div>

      <div className="space-y-6 lg:col-span-7">
        <p className="font-[family-name:var(--font-dc-mono)] text-xs font-semibold uppercase tracking-[0.24em] text-[var(--primary)]">
          [ MEET THE FOUNDER ]
        </p>
        <h2 className="font-[family-name:var(--font-dc-heading)] text-4xl md:text-5xl">
          Christine
        </h2>
        <p className="font-[family-name:var(--font-dc-mono)] text-sm uppercase tracking-wider text-[var(--primary)]">
          Founder & Lead Event Planner
        </p>
        <p className="font-[family-name:var(--font-dc-body)] text-sm leading-7 text-[var(--muted-foreground)] md:text-base">
          Berangkat dari pengalaman hospitality dan event execution, Christine membangun DC Organizer untuk membantu klien mengubah banyak detail menjadi alur acara yang jelas, terkoordinasi, dan tetap terasa personal.
        </p>

        <div className="grid grid-cols-3 gap-4 border-t border-[var(--border)] pt-5">
          {[
            ["150+", "Acara"],
            ["99%", "Kepuasan"],
            ["8+", "Tahun"],
          ].map(([value, label]) => (
            <div key={label}>
              <p className="font-[family-name:var(--font-dc-heading)] text-2xl text-[var(--primary)]">
                {value}
              </p>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">{label}</p>
            </div>
          ))}
        </div>

        <Button asChild>
          <Link href={CONSULTATION_URL} target="_blank" rel="noreferrer">
            Konsultasi dengan Christine
          </Link>
        </Button>
      </div>
    </section>
  );
}
