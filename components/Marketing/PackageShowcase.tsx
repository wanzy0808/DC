import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { getServicePackage } from "@/lib/packages/catalog";

type PackageShowcaseProps = {
  eyebrow: string;
  title: string;
  description: string;
  packageKeys: string[];
  note?: string;
};

export default function PackageShowcase({ eyebrow, title, description, packageKeys, note }: PackageShowcaseProps) {
  const packages = packageKeys.map(getServicePackage).filter(Boolean);

  return (
    <section className="space-y-10">
      <div className="mx-auto max-w-3xl space-y-3 text-center">
        <p className="text-xs font-mono font-semibold uppercase tracking-[0.24em] text-[var(--primary)]">[ {eyebrow} ]</p>
        <h2 className="font-[family-name:var(--font-dc-heading)] text-3xl md:text-4xl lg:text-5xl">{title}</h2>
        <p className="text-sm leading-7 text-[var(--muted-foreground)] md:text-base">{description}</p>
      </div>
      <div className={`mx-auto grid max-w-5xl gap-5 ${packages.length === 2 ? "lg:grid-cols-2" : "lg:grid-cols-3"}`}>
        {packages.map((item, index) => {
          if (!item) return null;
          const featured = packageKeys.length === 3 && index === 2;
          return (
            <article key={item.key} className={`relative flex h-full flex-col rounded-3xl border p-6 md:p-7 ${featured ? "border-[var(--primary)] bg-[var(--primary)]/[0.07] shadow-[0_20px_60px_rgba(122,28,37,0.12)]" : "border-[var(--border)] bg-[var(--card)]/75"}`}>
              {featured ? <span className="absolute right-5 top-5 rounded-full bg-[var(--primary)] px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-white">Paling lengkap</span> : null}
              <p className="text-xs font-mono uppercase tracking-[0.18em] text-[var(--primary)]">DC Wedding</p>
              <h3 className="mt-3 max-w-[85%] font-[family-name:var(--font-dc-heading)] text-2xl">{item.name}</h3>
              <p className="mt-4 text-2xl font-semibold">Rp {item.price.toLocaleString("id-ID")}</p>
              <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">{item.description}</p>
              <ul className="mt-6 flex-1 space-y-3">{item.features.map((feature) => <li key={feature} className="flex gap-2 text-sm"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" /><span>{feature}</span></li>)}</ul>
              <Link href="/packages" className={`mt-7 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] transition ${featured ? "bg-[var(--primary)] text-white hover:brightness-110" : "border border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--primary)]"}`}>Pilih paket <ArrowRight className="h-3.5 w-3.5" /></Link>
            </article>
          );
        })}
      </div>
      {note ? <p className="text-center text-xs text-[var(--muted-foreground)]">{note}</p> : null}
    </section>
  );
}
