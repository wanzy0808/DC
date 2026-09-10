"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { servicePackages } from "@/lib/packages/catalog";
import { Button } from "@/components/ui/button";

export default function PackageSelector() {
  const router = useRouter();
  const [selected, setSelected] = useState(servicePackages[0].key);
  const [message, setMessage] = useState("");
  const [proofUrl, setProofUrl] = useState("");

  async function choosePackage() {
    setMessage("Menyiapkan order...");
    const response = await fetch("/api/packages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ packageKey: selected, proofUrl }) });
    const data = await response.json();
    if (!response.ok) return setMessage(data.error ?? "Paket belum dapat dipilih.");
    setMessage("Order dibuat. Kirim bukti transfer dari dashboard.");
    router.push("/dashboard");
  }

  return (
    <main className="relative z-10 min-h-screen w-full px-0 py-12 text-[var(--foreground)]">
      <div className="mx-auto w-full space-y-10">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--primary)]">DC Services</p>
          <h1 className="mt-2 font-[family-name:var(--font-dc-heading)] text-4xl">Pilih layanan</h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--muted-foreground)]">Pilih paket dulu. Setelah transfer dikonfirmasi admin, fitur sesuai paket akan terbuka.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {servicePackages.map((item) => {
            const active = selected === item.key;
            return (
              <button type="button" key={item.key} onClick={() => setSelected(item.key)} className={`rounded-2xl border p-6 text-left transition ${active ? "border-[var(--primary)] bg-[var(--primary)]/[0.08] ring-2 ring-[var(--primary)]/15" : "border-[var(--border)] bg-[var(--card)]/70 hover:border-[var(--primary)]/50"}`}>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--primary)]">DC Wedding</p>
                <h2 className="mt-3 font-[family-name:var(--font-dc-heading)] text-xl">{item.name}</h2>
                <p className="mt-2 text-2xl font-semibold">Rp {item.price.toLocaleString("id-ID")}</p>
                <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">{item.description}</p>
                <ul className="mt-5 space-y-2 text-xs text-[var(--muted-foreground)]">{item.features.map((feature) => <li key={feature}>✓ {feature}</li>)}</ul>
              </button>
            );
          })}
        </div>
        <div className="max-w-xl space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)]/70 p-6">
          <label className="block text-sm">URL bukti transfer <span className="opacity-50">(opsional, bisa dikirim nanti di dashboard)</span><input type="url" value={proofUrl} onChange={(event) => setProofUrl(event.target.value)} placeholder="https://..." className="mt-2 w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2.5" /></label>
          <Button type="button" onClick={choosePackage} size="lg" className="rounded-full">Pilih paket ini</Button>
          {message && <p className="text-sm text-[var(--muted-foreground)]">{message}</p>}
        </div>
      </div>
    </main>
  );
}
