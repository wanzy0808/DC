"use client";

import { usePathname } from "next/navigation";
import { isMarketingPath } from "@/lib/marketing-paths";
import { MarketingAudioControls } from "@/components/Layout/MarketingAudio";
import { MarketingInstagramLink } from "@/components/Layout/MarketingFrameFooter";

/** Unframed marketing pages keep music at bottom-left and Instagram at bottom-right. */
export default function MarketingFloatingControls() {
  const pathname = usePathname();
  if (!isMarketingPath(pathname) || pathname === "/" || pathname === "/pagecontoh" || pathname === "/d-invitation") return null;
  return <>
    <div className="fixed bottom-4 left-3 z-[60] rounded-xl border border-primary/25 bg-background/90 px-2 py-1.5 shadow-lg backdrop-blur-md sm:bottom-5 sm:left-5">
      <MarketingAudioControls />
    </div>
    <div className="fixed bottom-4 right-3 z-[60] rounded-full border border-primary/25 bg-background/90 p-1 shadow-lg backdrop-blur-md sm:bottom-5 sm:right-5">
      <MarketingInstagramLink />
    </div>
  </>;
}
