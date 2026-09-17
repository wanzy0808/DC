"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { servicePackages } from "@/lib/packages/catalog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/I18n/LanguageProvider";

type Props = {
  initialPackage?: string;
  invitationId?: string;
};

export default function PackageSelector({
  initialPackage = "INVITATION_BASIC",
  invitationId,
}: Props) {
  const router = useRouter();
  const { locale } = useLanguage();
  const visiblePackages = useMemo(
    () =>
      invitationId
        ? servicePackages
        : servicePackages.filter((item) => item.key !== "WA_BLAST_50"),
    [invitationId],
  );
  const initial = visiblePackages.some((item) => item.key === initialPackage)
    ? initialPackage
    : visiblePackages[0]?.key || "INVITATION_BASIC";
  const [selected, setSelected] = useState(initial);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => setSelected(initial), [initial]);

  const copy =
    locale === "en"
      ? {
          eyebrow: "DC Services",
          title: invitationId ? "Activate this event" : "Choose a service",
          description: invitationId
            ? "Your purchase is attached to this event only. Additional events can be created and activated separately."
            : "Digital Invitation is purchased per event. Payment is activated after our team verifies your manual transfer.",
          choose: "Continue to payment",
          preparing: "Preparing invoice…",
          fallbackError: "This product could not be selected yet.",
          eventContext: "Event-specific purchase",
        }
      : {
          eyebrow: "DC Services",
          title: invitationId ? "Aktifkan acara ini" : "Pilih layanan",
          description: invitationId
            ? "Pembelian hanya berlaku untuk acara ini. Acara lain dapat dibuat dan diaktifkan secara terpisah."
            : "Undangan Digital dibeli per acara. Produk aktif setelah transfer manual diverifikasi oleh tim kami.",
          choose: "Lanjut ke pembayaran",
          preparing: "Menyiapkan invoice…",
          fallbackError: "Produk belum dapat dipilih.",
          eventContext: "Pembelian khusus acara",
        };

  async function choosePackage() {
    setLoading(true);
    setMessage(copy.preparing);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageKey: selected, invitationId }),
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
    <main className="relative z-10 min-h-screen w-full px-5 py-12 text-foreground sm:px-8">
      <div className="mx-auto w-[80vw] max-w-full space-y-10">
        <div className="mx-auto max-w-4xl text-center">
          <p className="font-[family-name:var(--font-dm-mono)] text-xs uppercase tracking-[0.25em] text-primary">
            {copy.eyebrow}
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-cinzel)] text-4xl">
            {copy.title}
          </h1>
          <p className="mx-auto mt-2 max-w-2xl font-[family-name:var(--font-fauna)] text-sm leading-7 text-muted-foreground">
            {copy.description}
          </p>
          {invitationId && (
            <p className="mt-3 font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.14em] text-primary">
              {copy.eventContext}
            </p>
          )}
        </div>

        <div className="mx-auto grid w-full max-w-[1200px] justify-center gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visiblePackages.map((item) => {
            const active = selected === item.key;
            return (
              <label
                key={item.key}
                className={`relative flex cursor-pointer rounded-2xl border p-6 transition duration-200 ${
                  active
                    ? "border-primary bg-primary/[0.045] ring-2 ring-primary/10"
                    : "border-border bg-background hover:border-primary/40"
                }`}
              >
                <input
                  type="radio"
                  name="service-package"
                  value={item.key}
                  checked={active}
                  onChange={() => setSelected(item.key)}
                  className="sr-only"
                />
                <span className="min-w-0">
                  <span className="flex items-center justify-between gap-3">
                    <span className="font-[family-name:var(--font-dm-mono)] text-[10px] uppercase tracking-[0.2em] text-primary">
                      DC Organizer
                    </span>
                    {active && <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />}
                  </span>
                  <span className="mt-3 block font-[family-name:var(--font-cinzel)] text-xl">
                    {item.name[locale]}
                  </span>
                  <span className="mt-2 block text-2xl font-semibold">
                    Rp {item.price.toLocaleString("id-ID")}
                  </span>
                  <span className="mt-3 block font-[family-name:var(--font-fauna)] text-sm leading-6 text-muted-foreground">
                    {item.description[locale]}
                  </span>
                  <span className="mt-5 block space-y-2 font-[family-name:var(--font-fauna)] text-xs text-muted-foreground">
                    {item.features[locale].map((feature) => (
                      <span key={feature} className="flex gap-2">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                        <span>{feature}</span>
                      </span>
                    ))}
                  </span>
                </span>
              </label>
            );
          })}
        </div>

        <div className="mx-auto max-w-xl rounded-2xl border border-border bg-foreground/[0.018] p-6">
          {selected === "WA_BLAST_50" && (
            <p className="mb-4 rounded-xl border border-primary/10 bg-primary/[0.035] px-4 py-3 text-xs leading-5 text-muted-foreground">
              Add-on ini menambah 50 quota pada acara yang dipilih dan dapat dibeli kembali kapan pun dibutuhkan.
            </p>
          )}
          <Button
            type="button"
            disabled={loading}
            onClick={choosePackage}
            size="lg"
            className="min-h-11 w-full"
          >
            {loading ? copy.preparing : copy.choose}
          </Button>
          {message && <p className="mt-3 text-sm text-muted-foreground">{message}</p>}
        </div>
      </div>
    </main>
  );
}
