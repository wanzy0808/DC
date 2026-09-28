"use client";

import Footer from "@/components/Layout/Footer";
import { MarketingAudioControls } from "@/components/Layout/MarketingAudio";
import { useLanguage } from "@/components/I18n/LanguageProvider";

export function MarketingInstagramLink() {
  return <a href="https://www.instagram.com/dc.organizer/?hl=en" target="_blank" rel="noopener noreferrer" aria-label="Instagram Undara" title="Instagram Undara" className="flex size-8 shrink-0 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
    <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2.5" y="2.5" width="19" height="19" rx="5.5" /><circle cx="12" cy="12" r="4.1" /><circle cx="17.8" cy="6.4" r="1" fill="currentColor" stroke="none" /></svg>
  </a>;
}

/** Fixed bottom edge of the landing-style frame, shared by marketing subpages. */
export default function MarketingFrameFooter({ landingLayout = false }: { landingLayout?: boolean }) {
  const { messages } = useLanguage();

  if (landingLayout) {
    return (
      <div className="relative z-40 shrink-0">
        <div className="grid min-h-11 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-x-3 bg-transparent px-3 sm:min-h-12 sm:px-6">
          <div className="min-w-0 justify-self-start">
            <MarketingAudioControls />
          </div>

          <p className="whitespace-nowrap text-center font-[family-name:var(--font-dc-mono)] text-[9px] tracking-[0.06em] text-foreground/48 sm:text-[10px]">
            © {new Date().getFullYear()} Undara. {messages.footer.rights}
          </p>

          <div className="justify-self-end">
            <MarketingInstagramLink />
          </div>
        </div>
      </div>
    );
  }

  return <div className="relative z-40 grid min-h-12 shrink-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 bg-transparent px-3 sm:px-6">
    <MarketingAudioControls />
    <div className="pointer-events-none absolute inset-x-0 flex justify-center [&_a]:pointer-events-auto [&_button]:pointer-events-auto"><Footer embedded /></div>
    <div aria-hidden="true" />
    <MarketingInstagramLink />
  </div>;
}
