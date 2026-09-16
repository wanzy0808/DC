"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { servicePackages } from "@/lib/packages/catalog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/I18n/LanguageProvider";

type Props = { initialPackage?: string };

export default function PackageSelector({ initialPackage = "INVITATION_BASIC" }: Props) {
  const router = useRouter();
  const { locale } = useLanguage();
  const initial = servicePackages.some((item) => item.key === initialPackage) ? initialPackage : servicePackages[0].key;
  const [selected, setSelected] = useState(initial);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [previousInitial, setPreviousInitial] = useState(initial);
  if (initial !== previousInitial) {
    setPreviousInitial(initial);
    setSelected(initial);
  }

  const copy = locale === "en"
    ? {
        eyebrow: "DC Services",
        title: "Choose the right service",
        description: "Choose a package to create an invoice. Your package stays inactive until our team verifies your manual transfer.",
        choose: "Continue to payment",
        preparing: "Preparing invoice…",
        fallbackError: "This package could not be selected yet.",
      }
    : {
        eyebrow: "DC Services",
        title: "Pilih layanan yang tepat",
        description: "Pilih paket untuk membuat invoice. Paket belum aktif sampai tim kami memverifikasi transfer manual kamu.",
        choose: "Lanjut ke pembayaran",
        preparing: "Menyiapkan invoice…",
        fallbackError: "Paket belum dapat dipilih.",
      };

  async function choosePackage() {
    setLoading(true);
    setMessage(copy.preparing);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageKey: selected }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error ?? copy.fallbackError);
        return;
      }
      router.push(data.invoiceUrl ?? `/checkout/${data.order.id}`);
    } catch {
      setMessage(copy.fallbackError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative z-10 min-h-screen w-full px-5 py-12 text-[var(--foreground)] sm:px-8">
      <div className="mx-auto w-[min(92vw,1400px)] space-y-10">
        <div className="mx-auto max-w-4xl text-center">
          <p className="font-[family-name:var(--font-dc-mono)] text-xs uppercase tracking-[0.25em] text-[var(--primary)]">{copy.eyebrow}</p>
          <h1 className="mt-2 font-[family-name:var(--font-dc-heading)] text-4xl">{copy.title}</h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-7 text-[var(--muted-foreground)]">{copy.description}</p>
        </div>
        <div className="mx-auto grid w-full max-w-[1200px] justify-center gap-5 md:grid-cols-2 xl:grid-cols-3">
          {servicePackages.map((item) => {
            const active = selected === item.key;
            return <Button type="button" key={item.key} onClick={() => setSelected(item.key)} className={`h-auto w-full min-w-0 justify-start whitespace-normal rounded-2xl border p-6 text-left transition duration-300 hover:-translate-y-1 ${active ? "border-[var(--primary)] bg-[var(--primary)]/[0.08] ring-2 ring-[var(--primary)]/15" : "border-[var(--border)] bg-[var(--card)]/70 hover:border-[var(--primary)]/50"}`}><span><span className="block font-[family-name:var(--font-dc-mono)] text-[10px] uppercase tracking-[0.2em] text-[var(--primary)]">DC Organizer</span><span className="mt-3 block font-[family-name:var(--font-dc-heading)] text-xl">{item.name[locale]}</span><span className="mt-2 block text-2xl font-semibold">Rp {item.price.toLocaleString("id-ID")}</span><span className="mt-3 block text-sm leading-6 text-[var(--muted-foreground)]">{item.description[locale]}</span><span className="mt-5 block space-y-2 text-xs text-[var(--muted-foreground)]">{item.features[locale].map((feature) => <span key={feature} className="block">✓ {feature}</span>)}</span></span></Button>;
          })}
        </div>
        <div className="mx-auto max-w-xl space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)]/70 p-6">
          {selected === "GUESTBOOK_DIGITAL" && <p className="rounded-xl bg-[var(--primary)]/8 px-4 py-3 text-xs leading-5 text-[var(--muted-foreground)]">Jika Digital Invitation sudah aktif, pembayaran Guestbook hanya menagihkan selisih harga paket.</p>}
          <Button type="button" disabled={loading} onClick={choosePackage} size="lg" className="min-h-11 w-full rounded-xl">{loading ? copy.preparing : copy.choose}</Button>
          {message && <p className="text-sm text-[var(--muted-foreground)]">{message}</p>}
        </div>
      </div>
    </main>
  );
}
