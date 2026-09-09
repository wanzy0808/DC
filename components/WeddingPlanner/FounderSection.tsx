import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export default function FounderSection() {
  return (
    <section className="grid items-center gap-10 lg:grid-cols-12">
      <div className="relative lg:col-span-5">
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-2">
          <div className="relative h-[460px] overflow-hidden rounded-2xl">
            <Image src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1000&auto=format&fit=crop" alt="Founder DC Wedding" fill className="object-cover" />
          </div>
        </div>
        <div className="absolute -bottom-5 -right-3 max-w-xs rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-xl">
          <div className="flex items-center gap-2 text-[var(--primary)]"><Sparkles className="h-4 w-4" /><span className="text-xs font-mono font-semibold">8+ Tahun Pengalaman</span></div>
          <p className="mt-2 text-xs italic leading-6 text-[var(--muted-foreground)]">“Pernikahan bukan sekadar acara satu hari, tetapi momen ketika dua keluarga menyatu.”</p>
        </div>
      </div>
      <div className="space-y-6 lg:col-span-7">
        <p className="text-xs font-mono font-semibold uppercase tracking-[0.24em] text-[var(--primary)]">[ MEET THE FOUNDER ]</p>
        <h2 className="font-[family-name:var(--font-dc-heading)] text-4xl md:text-5xl">Christine</h2>
        <p className="text-sm font-mono uppercase tracking-wider text-[var(--primary)]">Founder & Lead Wedding Planner</p>
        <p className="text-sm leading-7 text-[var(--muted-foreground)] md:text-base">Memulai karier di hospitality dan luxury event execution, Christine membangun DC Wedding dengan satu tujuan: membuat pasangan dapat menikmati proses menuju pernikahan tanpa harus memikul semua detail sendirian.</p>
        <div className="grid grid-cols-3 gap-4 border-t border-[var(--border)] pt-5">
          {[['150+', 'Pernikahan'], ['99%', 'Kepuasan'], ['8+', 'Tahun']].map(([value, label]) => <div key={label}><p className="font-[family-name:var(--font-dc-heading)] text-2xl text-[var(--primary)]">{value}</p><p className="mt-1 text-xs text-[var(--muted-foreground)]">{label}</p></div>)}
        </div>
        <Link href="https://wa.me/6281234567890?text=Halo%20DC%20Wedding,%20saya%20ingin%20konsultasi%20wedding%20planner" target="_blank"><Button className="rounded-full bg-[var(--primary)] px-7 py-6 text-xs font-semibold uppercase tracking-wider text-white hover:brightness-110">Konsultasi dengan Christine →</Button></Link>
      </div>
    </section>
  );
}
