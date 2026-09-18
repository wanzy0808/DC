"use client";

import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardPage, DashboardPageHeader, DashboardSurface } from "@/components/Dashboard/DashboardPrimitives";
import { useDashboardI18n } from "@/components/Dashboard/useDashboardI18n";

interface FeatureGateProps {
  allowed: boolean;
  title: string;
  description?: string;
  upgradeLabel?: string;
  onUpgrade?: () => void;
  children: ReactNode;
}

/** Presents unavailable capabilities with the same readable dashboard hierarchy. */
export default function FeatureGate({
  allowed,
  title,
  description,
  upgradeLabel,
  onUpgrade,
  children,
}: FeatureGateProps) {
  const { d } = useDashboardI18n();
  const resolvedDescription =
    description ?? d("Paket aktif diperlukan untuk membuka fitur ini.");
  const resolvedUpgradeLabel =
    upgradeLabel ?? d("Lihat paket yang tersedia");

  if (allowed) {
    return <>{children}</>;
  }

  return (
    <DashboardPage>
      <DashboardPageHeader eyebrow={d("Akses")} title={title} description={resolvedDescription} />
      <DashboardSurface className="p-5 sm:p-6">
        <span className="mb-4 grid size-11 place-items-center rounded-full bg-primary/10 text-primary"><Sparkles className="size-5" /></span>
        <p className="mb-4 text-sm leading-6 text-muted-foreground">{d("Paket aktif diperlukan untuk membuka fitur ini.")}</p>
        <Button type="button" onClick={onUpgrade} size="lg" className="h-auto min-h-11 whitespace-normal py-3">{resolvedUpgradeLabel}</Button>
      </DashboardSurface>
    </DashboardPage>
  );
}
