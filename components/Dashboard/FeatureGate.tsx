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
  if (allowed) return <>{children}</>;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-dc-maroon/15 bg-white dark:border-white/10 dark:bg-[#121116]">
      <div className="pointer-events-none select-none blur-[2px] opacity-45" aria-hidden="true">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-[#FAF7F2]/75 p-6 dark:bg-[#060508]/75">
        <div className="max-w-sm text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-dc-maroon/10 text-dc-maroon dark:bg-dc-pink-light/10 dark:text-dc-pink-light">
            <LockKeyhole className="h-5 w-5" />
          </div>
          <h3 className="mt-4 font-[family-name:var(--font-dc-heading)] text-lg">{title}</h3>
          <p className="mt-2 font-[family-name:var(--font-dc-sans)] text-xs opacity-65">{description}</p>
          <Button
            type="button"
            onClick={onUpgrade}
            className="mt-4 gap-2 rounded-xl bg-dc-maroon text-white hover:bg-dc-maroon/90 dark:bg-dc-pink-light dark:text-black dark:hover:bg-dc-pink-light/90"
          >
            <Sparkles className="h-4 w-4" />
            {upgradeLabel}
          </Button>
        </div>
      </div>
    </section>
  );
}
