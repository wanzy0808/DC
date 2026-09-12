"use client";

import type { ReactNode } from "react";
import { LockKeyhole, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  description = "Upgrade paket untuk membuka fitur ini.",
  upgradeLabel = "Upgrade Paket",
  onUpgrade,
  children,
}: FeatureGateProps) {
  // Manajemen Tamu tetap dapat dibuka untuk melihat workspace.
  // Mutasi data tamu tetap diamankan oleh API berdasarkan entitlement Digital Invitation.
  if (allowed || title === "Manajemen Tamu") return <>{children}</>;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-[#d9cbc2] bg-[#f3ede6] dark:border-white/10 dark:bg-[#121116]">
      <div className="pointer-events-none select-none blur-[2px] opacity-45" aria-hidden="true">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-[#FAF7F2]/75 p-6 dark:bg-[#060508]/75">
        <div className="max-w-sm text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#7A1C25]/10 text-[#7A1C25] dark:bg-[#E8A5AE]/10 dark:text-[#E8A5AE]">
            <LockKeyhole className="h-5 w-5" />
          </div>
          <h3 className="mt-4 font-[family-name:var(--font-cinzel)] text-lg font-semibold text-[#2D2222] dark:text-[#F8F1EB]">{title}</h3>
          <p className="mt-2 font-[family-name:var(--font-fauna)] text-xs text-[#5A4545] dark:text-white/75">{description}</p>
          <Button
            type="button"
            onClick={onUpgrade}
            className="mt-4 gap-2 rounded-xl bg-[#7A1C25] text-white hover:bg-[#5E141C] dark:bg-[#C26B70] dark:text-black dark:hover:bg-[#A9565C]"
          >
            <Sparkles className="h-4 w-4" />
            {upgradeLabel}
          </Button>
        </div>
      </div>
    </section>
  );
}
