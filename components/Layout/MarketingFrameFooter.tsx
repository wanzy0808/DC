"use client";

import { MarketingAudioControls } from "@/components/Layout/MarketingAudio";
import { useLanguage } from "@/components/I18n/LanguageProvider";
import UndaraSocialIcons from "@/components/Layout/UndaraSocialIcons";

/** One bottom edge shared by every framed marketing page. */
export default function MarketingFrameFooter() {
  const { messages } = useLanguage();

  return (
    <div className="relative z-40 shrink-0 bg-transparent">
      <div className="grid min-h-11 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-x-3 px-3 sm:min-h-12 sm:px-6">
        <div className="min-w-0 justify-self-start">
          <MarketingAudioControls />
        </div>

        <p className="whitespace-nowrap text-center font-[family-name:var(--font-undara-mono)] text-[9px] tracking-[0.06em] text-foreground/48 sm:text-[10px]">
          © {new Date().getFullYear()} Undara. {messages.footer.rights}
        </p>

        <div className="justify-self-end">
          <UndaraSocialIcons />
        </div>
      </div>
    </div>
  );
}
