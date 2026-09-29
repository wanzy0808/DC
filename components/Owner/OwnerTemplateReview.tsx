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
  const [ownTemplates, setOwnTemplates] = useState<ReviewTemplate[]>([]);
  const [message, setMessage] = useState("Memuat antrean review...");
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    try {
      const [reviewResponse, ownResponse] = await Promise.all([
        fetch("/api/designer/templates?scope=review", { cache: "no-store" }),
        fetch("/api/designer/templates", { cache: "no-store" }),
      ]);
      const [reviewData, ownData] = await Promise.all([reviewResponse.json(), ownResponse.json()]);
      if (!reviewResponse.ok || !ownResponse.ok) {
        setMessage(reviewData.error || ownData.error || "Template belum dapat dimuat.");
        return;
      }
      setTemplates(Array.isArray(reviewData.templates) ? reviewData.templates : []);
      setOwnTemplates(Array.isArray(ownData.templates) ? ownData.templates : []);
      setMessage("");
    } catch {
      setMessage("Template belum dapat dimuat.");
    }
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

  async function duplicateDraft(id: string) {
    if (busyId) return;
    setBusyId(id);
    setMessage("");
    try {
      const response = await fetch("/api/designer/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "DUPLICATE_DRAFT", sourceId: id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Draft revisi belum dapat dibuat.");
      await load();
      setMessage("Draft revisi dibuat. Template yang sudah terbit tetap tersedia.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Draft revisi belum dapat dibuat.");
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

      {ownTemplates.some((item) => item.status === "PUBLISHED") && (
        <div className="mt-6 border-t border-border pt-5">
          <h3 className="font-[family-name:var(--font-undara-heading)] text-lg">Template Owner yang Terbit</h3>
          <p className="mt-1 text-xs text-muted-foreground">Buat salinan Draft untuk revisi tanpa mengubah template yang sudah terbit.</p>
          <div className="mt-4 space-y-3">
            {ownTemplates.filter((item) => item.status === "PUBLISHED").map((item) => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-3">
                <span className="text-sm font-medium">#{item.templateNo} · {item.name}</span>
                <Button type="button" size="sm" variant="outline" disabled={busyId !== null}
                  onClick={() => void duplicateDraft(item.id)}>
                  {busyId === item.id ? "Membuat..." : "Buat Draft Revisi"}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {ownTemplates.some((item) => item.status === "DRAFT") && (
        <div className="mt-6 border-t border-border pt-5">
          <h3 className="font-[family-name:var(--font-undara-heading)] text-lg">Draft Template Owner</h3>
          <div className="mt-4 space-y-3">
            {ownTemplates.filter((item) => item.status === "DRAFT").map((item) => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-3">
                <span className="text-sm font-medium">#{item.templateNo} · {item.name}</span>
                <Button asChild size="sm" variant="outline"><Link href={`/owner/studio?draft=${encodeURIComponent(item.id)}`}>Lanjut edit</Link></Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
