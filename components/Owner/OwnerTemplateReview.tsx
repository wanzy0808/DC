"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type ReviewTemplate = {
  id: string;
  templateNo: string;
  name: string;
  previewUrl: string;
  category: string;
  description: string;
  status: string;
  updatedAt: string;
  designer: {
    id: string;
    firstName: string;
    lastName: string | null;
    email: string;
  };
};

export default function OwnerTemplateReview() {
  const [templates, setTemplates] = useState<ReviewTemplate[]>([]);
  const [message, setMessage] = useState("Memuat antrean review...");
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    const response = await fetch("/api/designer/templates?scope=review", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || "Antrean review belum dapat dimuat.");
      return;
    }
    setTemplates(Array.isArray(data.templates) ? data.templates : []);
    setMessage("");
  }

  useEffect(() => { void load(); }, []);

  async function transition(id: string, action: "PUBLISH" | "RETURN_DRAFT") {
    if (busyId) return;
    setBusyId(id);
    setMessage("");
    try {
      const response = await fetch("/api/designer/templates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Status template belum dapat diubah.");
      await load();
      setMessage(action === "PUBLISH"
        ? "Template dipublikasikan dan sekarang dapat masuk katalog."
        : "Template dikembalikan ke Designer sebagai Draft.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Status template belum dapat diubah.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="rounded-2xl border border-primary/35 bg-background p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-undara-heading)] text-xl text-primary">Review Template</h2>
          <p className="mt-1 text-sm text-muted-foreground">Draft Designer yang sudah dikirim untuk persetujuan katalog.</p>
        </div>
        <span className="font-[family-name:var(--font-undara-mono)] text-xs text-muted-foreground">{templates.length} menunggu</span>
      </div>

      {message && <p className="mt-4 text-sm text-muted-foreground" role="status">{message}</p>}

      {!templates.length && !message ? (
        <p className="mt-5 text-sm text-muted-foreground">Tidak ada template yang menunggu review.</p>
      ) : (
        <div className="mt-5 divide-y divide-border">
          {templates.map((item) => {
            const designerName = [item.designer.firstName, item.designer.lastName].filter(Boolean).join(" ");
            return (
              <article key={item.id} className="grid gap-4 py-5 first:pt-0 sm:grid-cols-[120px_minmax(0,1fr)]">
                <img src={item.previewUrl} alt={item.name} className="aspect-[4/3] w-full rounded-xl border border-border object-cover" />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-[family-name:var(--font-undara-mono)] text-xs text-primary">#{item.templateNo}</span>
                    <span className="rounded-md border border-primary/30 px-2 py-1 text-[10px] font-semibold text-primary">Review</span>
                  </div>
                  <h3 className="mt-2 font-[family-name:var(--font-undara-heading)] text-lg">{item.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{designerName || item.designer.email} · {item.category}</p>
                  {item.description && <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/owner/studio?draft=${encodeURIComponent(item.id)}`}>Buka di Studio</Link>
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      disabled={busyId === item.id}
                      onClick={() => void transition(item.id, "PUBLISH")}
                    >
                      {busyId === item.id ? "Memproses..." : "Publish ke Katalog"}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={busyId === item.id}
                      onClick={() => void transition(item.id, "RETURN_DRAFT")}
                    >
                      Kembalikan Draft
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
