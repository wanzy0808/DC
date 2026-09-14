import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

const templates = [
  {
    name: "Eternal Blossom",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800",
  },
];

export default function HeroSection() {
  return (
    <section className="grid items-center gap-14 border-b border-border/70 pb-20 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16 lg:pb-24">
      <div className="max-w-2xl">
        <p className="font-[family-name:var(--font-dc-mono)] text-[10px] uppercase tracking-[0.28em] text-primary">
          Digital Invitation / 01
        </p>
        <h1 className="mt-6 max-w-xl font-[family-name:var(--font-dc-heading)] text-5xl font-normal leading-[1.02] tracking-[-0.045em] text-primary md:text-7xl">
          Bukan sekadar undangan.
          <span className="mt-2 block text-foreground">Awali ceritamu dengan indah.</span>
        </h1>
        <p className="mt-7 max-w-xl text-base leading-8 text-foreground/70 md:text-lg">
          Hadirkan kabar bahagia dengan undangan digital yang terasa personal—indah saat dibuka, mudah dibagikan, dan dirancang untuk membuat perjalanan menuju hari besar terasa lebih ringan.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/template-design"
            className={buttonVariants({ variant: "default", size: "lg", className: "gap-2" })}
          >
            Jelajahi koleksi
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link
            href="#fitur"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            Lihat fiturnya
          </Link>
        </div>
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 font-[family-name:var(--font-dc-mono)] text-[9px] uppercase tracking-[0.14em] text-foreground/55">
          <span>Personal</span>
          <span>Easy RSVP</span>
          <span>Ready for the big day</span>
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-xl lg:pr-4">
        <div className="absolute -right-8 top-12 h-48 w-48 rounded-full bg-primary/6 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto w-[min(100%,430px)]">
          <div className="relative aspect-[0.68] overflow-hidden rounded-[34px] border border-border bg-card p-2 shadow-2xl shadow-black/10 dark:shadow-black/30">
            <div className="relative h-full overflow-hidden rounded-[27px] bg-black">
              <Image
                src={templates[0].image}
                alt={`Preview template ${templates[0].name}`}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 90vw, 42vw"
              />
            </div>
            <div className="absolute inset-x-7 bottom-7 rounded-2xl border border-white/25 bg-black/35 p-5 text-left text-white backdrop-blur-md">
              <p className="font-[family-name:var(--font-dc-heading)] text-2xl">Vidi &amp; Hening</p>
              <p className="mt-1 font-[family-name:var(--font-dc-mono)] text-[8px] uppercase tracking-[0.22em] text-white/70">
                A beginning worth remembering
              </p>
            </div>
          </div>
          <p className="mt-4 text-center font-[family-name:var(--font-dc-mono)] text-[9px] uppercase tracking-[0.18em] text-foreground/45">
            A glimpse of your invitation
          </p>
        </div>
      </div>
    </section>
  );
}
