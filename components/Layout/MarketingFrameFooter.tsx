"use client";

import Footer from "@/components/Layout/Footer";
import { MarketingAudioControls } from "@/components/Layout/MarketingAudio";
import { useLanguage } from "@/components/I18n/LanguageProvider";

export function MarketingInstagramLink() {
  return <a href="https://www.instagram.com/dc.organizer/?hl=en" target="_blank" rel="noopener noreferrer" aria-label="Instagram Undara" title="Instagram Undara" className="flex size-8 shrink-0 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
    <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2.5" y="2.5" width="19" height="19" rx="5.5" /><circle cx="12" cy="12" r="4.1" /><circle cx="17.8" cy="6.4" r="1" fill="currentColor" stroke="none" /></svg>
  </a>;
}

function FooterRootDivider() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-3 -top-[17px] overflow-visible sm:inset-x-6 sm:-top-[19px]"
    >
      <svg
        viewBox="0 0 1200 92"
        preserveAspectRatio="none"
        className="h-[30px] w-full overflow-visible text-primary/24 dark:text-[#D6B38C]/24"
        fill="none"
      >
        <path
          d="M12 20 C118 17 210 24 302 20 C392 16 476 24 566 20 C658 16 742 24 834 20 C930 16 1036 24 1188 19"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        <path d="M112 19 C116 30 111 39 100 49 C91 57 88 66 91 78" stroke="currentColor" strokeWidth="1.05" strokeLinecap="round" opacity="0.62" />
        <path d="M252 21 C248 32 250 43 262 54 C271 62 274 70 272 81" stroke="currentColor" strokeWidth="0.95" strokeLinecap="round" opacity="0.52" />
        <path d="M408 19 C412 30 408 43 395 56 C387 64 385 72 390 84" stroke="currentColor" strokeWidth="1.05" strokeLinecap="round" opacity="0.66" />
        <path d="M535 21 C532 31 534 40 545 49 C553 56 556 65 554 76" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" opacity="0.48" />
        <path d="M640 20 C645 33 642 45 630 57 C621 66 620 75 626 86" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" opacity="0.72" />
        <path d="M752 20 C748 30 750 41 762 51 C772 60 776 70 773 82" stroke="currentColor" strokeWidth="0.95" strokeLinecap="round" opacity="0.54" />
        <path d="M898 20 C903 30 900 42 889 54 C881 63 878 72 882 83" stroke="currentColor" strokeWidth="1.05" strokeLinecap="round" opacity="0.64" />
        <path d="M1042 20 C1038 31 1040 41 1051 50 C1060 58 1064 68 1061 80" stroke="currentColor" strokeWidth="0.95" strokeLinecap="round" opacity="0.52" />

        <path d="M100 49 C110 49 119 53 126 61" stroke="currentColor" strokeWidth="0.82" strokeLinecap="round" opacity="0.42" />
        <path d="M395 56 C386 56 377 60 370 68" stroke="currentColor" strokeWidth="0.82" strokeLinecap="round" opacity="0.45" />
        <path d="M630 57 C618 58 609 63 602 71" stroke="currentColor" strokeWidth="0.88" strokeLinecap="round" opacity="0.50" />
        <path d="M762 51 C773 53 782 57 789 65" stroke="currentColor" strokeWidth="0.78" strokeLinecap="round" opacity="0.40" />
        <path d="M889 54 C899 55 908 59 916 67" stroke="currentColor" strokeWidth="0.82" strokeLinecap="round" opacity="0.44" />
      </svg>
    </div>
  );
}

/** Fixed bottom edge of the landing-style frame, shared by marketing subpages. */
export default function MarketingFrameFooter({ landingLayout = false }: { landingLayout?: boolean }) {
  const { messages } = useLanguage();

  if (landingLayout) {
    return (
      <div className="relative z-40 shrink-0">
        <FooterRootDivider />

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
