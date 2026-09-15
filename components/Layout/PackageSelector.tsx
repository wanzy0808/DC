"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { servicePackages } from "@/lib/packages/catalog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/I18n/LanguageProvider";

export default function PackageSelector() {
  const router = useRouter();
  const { locale } = useLanguage();
  const [selected, setSelected] = useState(servicePackages[0].key);
  const [message, setMessage] = useState("");
  const [proofUrl, setProofUrl] = useState("");

  const copy = locale === "en" ? {
    eyebrow: "DC Services",
    title: "Choose the right service",
    description: "Select your package first. Once your transfer is confirmed by our team, the features included in your package will be activated.",
    optional: "optional — you can submit this from the dashboard later",
    proof: "Transfer proof URL",
    choose: "Choose this package",
    preparing: "Preparing your order…",
    fallbackError: "This package could not be selected yet.",
    success: "Order created. Submit your transfer proof from the dashboard.",
  } : {
    eyebrow: "DC Services",
    title: "Pilih layanan yang tepat",
    description: "Pilih paket terlebih dahulu. Setelah transfer dikonfirmasi oleh tim kami, fitur sesuai paket akan diaktifkan.",
    optional: "opsional — bisa dikirim nanti dari dashboard",
    proof: "URL bukti transfer",
    choose: "Pilih paket ini",
    preparing: "Menyiapkan order…",
    fallbackError: "Paket belum dapat dipilih.",
    success: "Order dibuat. Kirim bukti transfer dari dashboard.",
  };

  async function choosePackage() {
    setMessage(copy.preparing);
    const response = await fetch("/api/packages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ packageKey: selected, proofUrl }) });
    const data = await response.json();
    if (!response.ok) return setMessage(data.error ?? copy.fallbackError);
    setMessage(copy.success);
    router.push("/dashboard");
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
            return (
              <Button
                type="button"
                key={item.key}
                onClick={() => setSelected(item.key)}
                className={`h-auto w-full min-w-0 justify-start whitespace-normal rounded-2xl border p-6 text-left transition duration-300 hover:-translate-y-1 ${active ? "border-[var(--primary)] bg-[var(--primary)]/[0.08] ring-2 ring-[var(--primary)]/15" : "border-[var(--border)] bg-[var(--card)]/70 hover:border-[var(--primary)]/50"}`}
              >
                <span>
                  <span className="block font-[family-name:var(--font-dc-mono)] text-[10px] uppercase tracking-[0.2em] text-[var(--primary)]">DC Organizer</span>
                  <span className="mt-3 block font-[family-name:var(--font-dc-heading)] text-xl">{item.name[locale]}</span>
                  <span className="mt-2 block text-2xl font-semibold">Rp {item.price.toLocaleString("id-ID")}</span>
                  <span className="mt-3 block text-sm leading-6 text-[var(--muted-foreground)]">{item.description[locale]}</span>
                  <span className="mt-5 block space-y-2 text-xs text-[var(--muted-foreground)]">{item.features[locale].map((feature) => <span key={feature} className="block">✓ {feature}</span>)}</span>
                </span>
              </Button>
            );
          })}
        </div>
        <div className="mx-auto max-w-xl space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)]/70 p-6">
          <label className="block text-sm">{copy.proof} <span className="opacity-50">({copy.optional})</span><input type="url" value={proofUrl} onChange={(event) => setProofUrl(event.target.value)} placeholder="https://..." className="mt-2 w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2.5" /></label>
          <Button type="button" onClick={choosePackage} size="lg" className="min-h-11 rounded-xl">{copy.choose}</Button>
          {message && <p className="text-sm text-[var(--muted-foreground)]">{message}</p>}
        </div>
      </div>
    </main>
  );
}
