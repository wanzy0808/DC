"use client";

import type React from "react";
import { useLanguage } from "@/components/I18n/LanguageProvider";

type SocialIconProps = { className?: string };

function InstagramIcon({ className = "size-5" }: SocialIconProps) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
      <circle cx="12" cy="12" r="4.1" />
      <circle cx="17.8" cy="6.4" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TiktokIcon({ className = "size-5" }: SocialIconProps) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-5.2-1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V5.8a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 12a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.37a8.16 8.16 0 0 0 4.91 1.62V7.54a4.85 4.85 0 0 1-1-.85z" />
    </svg>
  );
}

function FacebookIcon({ className = "size-5" }: SocialIconProps) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.5 22v-8.2h2.77l.41-3.2H13.5V8.56c0-.93.26-1.56 1.59-1.56h1.7V4.14c-.29-.04-1.28-.14-2.44-.14-2.42 0-4.08 1.48-4.08 4.19v2.41H7.5v3.2h2.77V22h3.23z" />
    </svg>
  );
}

type SocialProfile = {
  id: "instagram" | "tiktok" | "facebook";
  label: string;
  href: string | null;
  Icon: React.ComponentType<SocialIconProps>;
};

const SOCIAL_PROFILES: readonly SocialProfile[] = [
  { id: "instagram", label: "Instagram Undara", href: null, Icon: InstagramIcon },
  { id: "tiktok", label: "TikTok Undara", href: null, Icon: TiktokIcon },
  { id: "facebook", label: "Facebook Undara", href: null, Icon: FacebookIcon },
];

/**
 * One source for Undara social actions.
 * Until the official profiles are ready, icons stay visible but intentionally non-clickable.
 */
export default function UndaraSocialIcons({ compact = false }: { compact?: boolean }) {
  const { locale } = useLanguage();
  const pending = locale === "en" ? "link coming soon" : "tautan segera hadir";
  const groupLabel = locale === "en" ? "Undara social media" : "Media sosial Undara";

  return (
    <div className="flex items-center justify-end gap-2 sm:gap-3" aria-label={groupLabel}>
      {SOCIAL_PROFILES.map(({ id, label, href, Icon }) =>
        href ? (
          <a
            key={id}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            title={label}
            className="undara-control-surface undara-footer-control"
          >
            <Icon className={compact ? "size-4" : "size-5"} />
          </a>
        ) : (
          <span
            key={id}
            role="img"
            aria-label={`${label} — ${pending}`}
            title={`${label} — ${pending}`}
            className="undara-control-surface undara-footer-control cursor-default"
            data-social={id}
            data-social-pending="true"
          >
            <Icon className={compact ? "size-4" : "size-5"} />
          </span>
        ),
      )}
    </div>
  );
}
