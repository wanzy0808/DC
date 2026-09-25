"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Template = {
  id: string;
  templateNo: string;
  name: string;
  tags: string[];
  previewUrl: string;
  templateFile: string | null;
  designKey?: string | null;
  status: string;
  salesCount: number;
  orderValue: number;
  createdAt: string;
};

type Summary = {
  templateCount: number;
  templatesWithSales: number;
  salesCount: number;
  orderValue: number;
};

function rupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function DesignerDashboard() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [summary, setSummary] = useState<Summary>({
    templateCount: 0,
    templatesWithSales: 0,
    salesCount: 0,
    orderValue: 0,
  });
  const [message, setMessage] = useState("Memuat template...");

  async function load() {
    const response = await fetch("/api/designer/templates", { cache: "no-store" });
    const data = await response.json();
    if (response.ok) {
      setTemplates(data.templates ?? []);
      setSummary(data.summary ?? {
        templateCount: data.templates?.length ?? 0,
        templatesWithSales: 0,
        salesCount: 0,
        orderValue: 0,
      });
      setMessage("");
    } else {
      setMessage(data.error ?? "Template belum dapat dimuat.");
    }
  }

  useEffect(() => { void load(); }, []);


  return (
    <main className="mx-auto w-[80vw] max-w-full space-y-8 px-5 py-8 font-[family-name:var(--font-fauna)]">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-[family-name:var(--font-dm-mono)] text-xs uppercase tracking-[.2em] text-primary">Designer Dashboard</p>
          <h1 className="mt-2 font-[family-name:var(--font-cinzel)] text-3xl font-semibold">Template Studio</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Kelola template dan lihat berapa banyak template kamu dipakai pada transaksi yang sudah PAID.</p>
        </div>
        <Button asChild><Link href="/designer/studio">Buka Template Studio</Link></Button>
      </header>

      <div className="grid gap-4 sm:grid-cols-4">
        <section className="rounded-2xl border border-border bg-background p-5">
          <p className="text-sm text-muted-foreground">Template saya</p>
          <p className="mt-2 text-3xl font-semibold">{summary.templateCount}</p>
        </section>
        <section className="rounded-2xl border border-border bg-background p-5">
          <p className="text-sm text-muted-foreground">Pernah terjual</p>
          <p className="mt-2 text-3xl font-semibold">{summary.templatesWithSales}</p>
        </section>
        <section className="rounded-2xl border border-border bg-background p-5">
          <p className="text-sm text-muted-foreground">Total terjual</p>
          <p className="mt-2 text-3xl font-semibold">{summary.salesCount}</p>
        </section>
        <section className="rounded-2xl border border-border bg-background p-5">
          <p className="text-sm text-muted-foreground">Nilai order terkait</p>
          <p className="mt-2 text-xl font-semibold">{rupiah(summary.orderValue)}</p>
        </section>
      </div>

      <div className="grid gap-6">
        <section className="rounded-2xl border border-border bg-background p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-[family-name:var(--font-cinzel)] text-xl">Template saya</h2>
            <p className="font-[family-name:var(--font-dc-mono)] text-xs text-muted-foreground">{templates.length} template</p>
          </div>

          {!templates.length ? (
            <p className="mt-6 text-sm text-muted-foreground">Belum ada template.</p>
          ) : (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {templates.map((item) => (
                <article key={item.id} className="overflow-hidden rounded-2xl border border-border">
                  <img src={item.previewUrl} alt={item.name} className="aspect-[4/3] w-full object-cover" />
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-[family-name:var(--font-dc-mono)] text-xs text-primary">#{item.templateNo}</p>
                      <p className="text-xs font-medium text-primary">{item.salesCount} terjual</p>
                    </div>
                    <h3 className="mt-1 font-[family-name:var(--font-cinzel)] text-lg">{item.name}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">Nilai order terkait: {rupiah(item.orderValue)}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {item.tags.map((tag) => (
                        <span key={tag} className="rounded-md border border-border px-2 py-1 text-[10px] text-muted-foreground">{tag}</span>
                      ))}
                    </div>
                    {item.templateFile ? (
                      <a className="mt-3 inline-block text-xs text-primary underline" href={item.templateFile} target="_blank" rel="noreferrer">Buka file template</a>
                    ) : (
                      <p className="mt-3 text-xs text-primary">Template Studio · siap katalog</p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
