"use client";

import { usePathname } from "next/navigation";
import { isMarketingPath } from "@/lib/marketing-paths";
import { MarketingAudioControls } from "@/components/Layout/MarketingAudio";
import { MarketingInstagramLink } from "@/components/Layout/MarketingFrameFooter";

/** Public pages without the landing-style frame still expose the same controls. */
export default function MarketingFloatingControls() {
  const pathname = usePathname();
  if (!isMarketingPath(pathname) || pathname === "/" || pathname === "/pagecontoh" || pathname === "/d-invitation") return null;
  return <div className="fixed bottom-4 left-1/2 z-[60] flex w-[min(94vw,460px)] -translate-x-1/2 items-center justify-between gap-4 rounded-xl border border-primary/25 bg-background/90 px-3 py-2 shadow-lg backdrop-blur-md sm:bottom-5">
    <MarketingAudioControls />
    <MarketingInstagramLink />
  </div>;
}
