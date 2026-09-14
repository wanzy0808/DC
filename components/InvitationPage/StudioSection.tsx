import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function StudioSection() {
  return (
    <section className="border-y border-border/70 py-14 md:py-16">
      <div className="grid items-end gap-8 md:grid-cols-[1fr_auto] md:gap-12">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 font-[family-name:var(--font-dc-mono)] text-[10px] uppercase tracking-[0.25em] text-primary">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Design Studio / 04
          </div>
          <h2 className="mt-4 font-[family-name:var(--font-dc-heading)] text-3xl font-normal leading-tight text-primary md:text-5xl">
            Mulai dari template. Jadikan sepenuhnya milik kalian.
          </h2>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-foreground/65 md:text-base md:leading-8">
            Masukkan foto yang paling kamu sayangi, pilih warna yang terasa tepat, tuliskan kisah kalian, lalu biarkan setiap detail mengantarkan tamu pada hari yang sudah lama dinantikan.
          </p>
        </div>
        <Link
          href="/dashboard/editor"
          className={buttonVariants({ variant: "default", size: "lg", className: "gap-2" })}
        >
          Masuk Design Studio
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
