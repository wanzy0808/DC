"use client";

import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardAccessNotice from "@/components/Dashboard/DashboardAccessNotice";
import { DashboardSurface } from "@/components/Dashboard/DashboardPrimitives";
import { useDashboardI18n } from "@/components/Dashboard/useDashboardI18n";

interface FeatureGateProps {
  allowed: boolean;
  title: string;
  description?: string;
  upgradeLabel?: string;
  onUpgrade?: () => void;
  children: ReactNode;
}

/** Keeps locked dashboard features visible while preventing access. */
export default function FeatureGate({
  allowed,
  title,
  description,
  upgradeLabel,
  onUpgrade,
  children,
}: FeatureGateProps) {
  if (allowed) {
    return <>{children}</>;
  }

  return (
    <DashboardSurface className="mx-auto grid w-[80vw] max-w-full min-w-0 overflow-hidden">
      <div
        className="pointer-events-none col-start-1 row-start-1 min-w-0 select-none opacity-35 blur-[2px]"
        aria-hidden="true"
        inert
      >
        {children}
      </div>
      <div className="relative col-start-1 row-start-1 flex items-center justify-center bg-background/88 px-6 py-10 backdrop-blur-[2px] sm:p-10">
        <DashboardSurface className="w-full max-w-lg p-4 sm:p-5">
          <DashboardAccessNotice
            title={title}
            description={resolvedDescription}
            label={d("Akses paket")}
            heading="h3"
          >
            <Button
              type="button"
              onClick={onUpgrade}
              size="lg"
              className="h-auto min-h-11 max-w-full whitespace-normal py-3 text-left"
              title={resolvedUpgradeLabel}
            >
              <Sparkles className="size-4 shrink-0" aria-hidden="true" />
              {resolvedUpgradeLabel}
            </Button>
          </DashboardAccessNotice>
        </DashboardSurface>
      </div>
    </DashboardSurface>
  );
}
