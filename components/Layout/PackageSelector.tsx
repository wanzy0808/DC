"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { servicePackages } from "@/lib/packages/catalog";

export default function PackageSelector() {
  const router = useRouter();
  const [selected, setSelected] = useState(servicePackages[0].key);
  const [message, setMessage] = useState("");
  const [proofUrl, setProofUrl] = useState("");

  async function choosePackage() {
    setMessage("Menyiapkan order...");
    const response = await fetch("/api/packages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ packageKey: selected, proofUrl }),
    });
    const data = await response.json();
    if (!response.ok)
      return setMessage(data.error ?? "Paket belum dapat dipilih.");
    setMessage("Order dibuat. Kirim bukti transfer dari dashboard.");
    router.push("/dashboard");
  }

  return (
    <main className="relative z-10 min-h-screen px-6 py-12 text-[var(--foreground)]">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[#7A1C25]">
            DC Services
          </p>
          <h1 className="mt-2 font-serif text-4xl">Pilih layanan</h1>
          <p className="mt-2 text-sm opacity-60">
            Pilih paket dulu. Setelah transfer dikonfirmasi admin, fitur sesuai
            paket akan terbuka.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {servicePackages.map((item) => (
            <button
              type="button"
              key={item.key}
              onClick={() => setSelected(item.key)}
              className={`text-left rounded-2xl border p-5 transition ${selected === item.key ? "border-[#7A1C25] bg-[#7A1C25]/5 ring-2 ring-[#7A1C25]/20" : "border-black/10 bg-white"}`}
            >
              <h2 className="font-serif text-xl">{item.name}</h2>
              <p className="mt-2 text-2xl font-semibold">
                Rp {item.price.toLocaleString("id-ID")}
              </p>
              <p className="mt-3 text-sm opacity-70">{item.description}</p>
              <ul className="mt-4 space-y-1 text-xs opacity-70">
                {item.features.map((feature) => (
                  <li key={feature}>✓ {feature}</li>
                ))}
              </ul>
            </button>
          ))}
        </div>
        <div className="max-w-xl space-y-3 rounded-2xl border border-black/10 bg-white p-5">
          <label className="block text-sm">
            URL bukti transfer (opsional, bisa dikirim nanti di dashboard)
            <input
              type="url"
              value={proofUrl}
              onChange={(event) => setProofUrl(event.target.value)}
              placeholder="https://..."
              className="mt-2 w-full rounded-xl border border-black/10 px-3 py-2.5"
            />
          </label>
          <button
            type="button"
            onClick={choosePackage}
            className="rounded-xl bg-[#7A1C25] px-5 py-3 text-sm font-medium text-white"
          >
            Pilih paket ini
          </button>
          {message && <p className="text-sm opacity-70">{message}</p>}
        </div>
      </div>
    </main>
  );
}
