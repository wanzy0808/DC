"use client";

import { usePathname } from "next/navigation";
import { isFramedMarketingPath, isMarketingPath } from "@/lib/marketing-paths";
import MarketingFrameFooter from "@/components/Layout/MarketingFrameFooter";

/** Fallback for a future marketing route that intentionally does not use the main frame. */
export default function MarketingFloatingControls() {
  const pathname = usePathname();
  if (!isMarketingPath(pathname) || isFramedMarketingPath(pathname)) return null;

  return (
    <div className="fixed inset-x-3 bottom-4 z-[60] overflow-hidden rounded-[16px] border border-primary/25 bg-background/92 shadow-lg backdrop-blur-md sm:inset-x-5 sm:bottom-5">
      <MarketingFrameFooter />
    </div>
  );
}
