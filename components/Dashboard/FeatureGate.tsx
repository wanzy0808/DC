"use client";

import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardAccessNotice from "@/components/Dashboard/DashboardAccessNotice";

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
  description = "Paket aktif diperlukan untuk membuka fitur ini.",
  upgradeLabel = "Lihat paket yang tersedia",
  onUpgrade,
  children,
}: FeatureGateProps) {
  // Workspaces with their own event-level selector remain visible.
  // Their mutation APIs still enforce invitation ownership and entitlement server-side.
  if (
    allowed ||
    title === "Manajemen Tamu" ||
    title === "Personal Invitation"
  ) {
    return <>{children}</>;
  }

  return (
    <section className="mx-auto grid w-[80vw] max-w-full min-w-0 overflow-hidden rounded-2xl border border-border/70 bg-background shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div
        className="pointer-events-none col-start-1 row-start-1 min-w-0 select-none opacity-35 blur-[2px]"
        aria-hidden="true"
        inert
      >
        {children}
      </div>
      <div className="relative col-start-1 row-start-1 flex items-center justify-center bg-background/88 px-6 py-10 backdrop-blur-[2px] sm:p-10">
        <div className="w-full max-w-lg rounded-xl border border-primary/15 bg-background p-4 shadow-sm sm:p-5">
          <DashboardAccessNotice title={title} description={description} heading="h3">
            <Button
              type="button"
              onClick={onUpgrade}
              size="lg"
              className="h-auto min-h-11 max-w-full whitespace-normal py-3 text-left"
              title={upgradeLabel}
            >
              <Sparkles className="size-4 shrink-0" aria-hidden="true" />
              {upgradeLabel}
            </Button>
          </DashboardAccessNotice>
        </div>
      </div>
    </section>
  );
}
