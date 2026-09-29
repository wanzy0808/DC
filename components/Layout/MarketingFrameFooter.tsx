"use client";

import { MarketingAudioControls } from "@/components/Layout/MarketingAudio";
import { useLanguage } from "@/components/I18n/LanguageProvider";
import UndaraSocialIcons from "@/components/Layout/UndaraSocialIcons";

/** One bottom edge shared by every framed marketing page. */
export default function MarketingFrameFooter() {
  const { messages } = useLanguage();

  return (
    <div className="relative z-40 shrink-0 bg-transparent">
      <div className="grid min-h-[4.5rem] grid-cols-[minmax(0,1fr)_auto] grid-rows-[auto_auto] items-center gap-x-3 gap-y-2 px-3 py-2 sm:min-h-12 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:grid-rows-1 sm:gap-y-0 sm:px-6 sm:py-0">
        <div className="min-w-0 justify-self-start">
          <MarketingAudioControls />
        </div>

        <p className="col-span-2 row-start-2 whitespace-nowrap text-center font-[family-name:var(--font-undara-mono)] text-[8px] tracking-[0.055em] text-foreground/48 sm:col-span-1 sm:col-start-2 sm:row-start-1 sm:text-[10px]">
          © {new Date().getFullYear()} Undara. {messages.footer.rights}
        </p>

        <div className="col-start-2 row-start-1 justify-self-end sm:col-start-3">
          <UndaraSocialIcons compact />
        </div>
      </div>
    </div>
  );
}
