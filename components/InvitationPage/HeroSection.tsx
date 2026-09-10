import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const templates = [
  { name: "Eternal Blossom", image: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800" },
];

export default function HeroSection() {
  return (
    <section className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-6">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-dc-maroon dark:text-dc-pink-light">[Undangan Digital]</p>
        <h1 className="max-w-xl font-serif text-5xl leading-[1.08] md:text-7xl">Undanganmu tak hanya cantik tetapi, <em className="text-dc-maroon dark:text-dc-pink-light">cepat dan mudah.</em></h1>
        <p className="max-w-lg text-sm leading-7 opacity-70 md:text-base">Percantik undanganmu dengan desain kustom dan fitur lengkap, serta mempermudah proses RSVP dan komunikasi dengan tamu.</p>
        <div className="flex flex-wrap gap-3">
          <Link href="/template-design" className="rounded-full bg-primary px-6 py-3 text-xs font-medium uppercase tracking-[0.16em] text-primary-foreground transition hover:bg-primary/85">Jelajahi undangan <ArrowRight className="ml-2 inline h-3.5 w-3.5" /></Link>
        </div>
      </div>
      <div className="relative mx-auto w-full max-w-xl">
        <div className="absolute -left-6 top-10 h-32 w-32 rounded-full bg-dc-pink/20 blur-3xl" />
        <div className="relative mx-auto w-[min(100%,420px)]">
          <div className="relative aspect-[0.68] overflow-hidden rounded-[38px] border-8 border-[#33252a] bg-black p-2 shadow-2xl">
            <div className="relative h-full overflow-hidden rounded-[28px]">
              <Image src={templates[0].image} alt={`Preview undangan ${templates[0].name}`} fill priority className="object-cover" sizes="(max-width: 768px) 100vw, 40vw" />
            </div>
            <div className="absolute bottom-10 left-1/2 z-10 w-4/5 -translate-x-1/2 rounded-lg bg-white/85 p-4 text-center backdrop-blur">
              <p className="font-serif text-lg text-dc-maroon">Vidi &amp; Hening</p>
              <p className="mt-1 text-[8px] uppercase tracking-widest text-dc-maroon/70">The wedding invitation</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}