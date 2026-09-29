"use client";

import type { InvitationLanguage } from "@/lib/invitations/language";

export default function StudioStageControls({
  locale,
  envelopeEnabled,
  stage,
  labels,
  onEnvelope,
  onContent,
  invitationLanguage,
  onInvitationLanguage,
}: {
  locale: string;
  envelopeEnabled: boolean;
  stage: "envelope" | "cover";
  labels: {
    envelope: string;
    cover: string;
    envelopeHint: string;
    coverHint: string;
  };
  onEnvelope: () => void;
  onContent: () => void;
  invitationLanguage: InvitationLanguage;
  onInvitationLanguage: (language: InvitationLanguage) => void;
}) {
  const buttonClass =
    "min-h-9 shrink-0 rounded-[var(--undara-control-radius)] border border-primary bg-primary px-2.5 text-[11px] text-primary-foreground hover:bg-primary/90";

  return (
    <div
      className="undara-studio-stage-controls"
      role="group"
      aria-label={locale === "en" ? "Invitation view" : "Tampilan undangan"}
    >
      <div className="undara-studio-stage-buttons">
        {envelopeEnabled ? (
          <button
            type="button"
            aria-pressed={stage === "envelope"}
            className={buttonClass}
            onClick={onEnvelope}
            title={labels.envelopeHint}
          >
            {labels.envelope}
          </button>
        ) : null}

        <button
          type="button"
          aria-pressed={stage === "cover" || !envelopeEnabled}
          className={buttonClass}
          onClick={onContent}
          title={labels.coverHint}
        >
          {labels.cover}
        </button>
      </div>
      <div className="undara-studio-language-toggle" role="group" aria-label={locale === "en" ? "Invitation language" : "Bahasa undangan"}>
        {(["ID", "EN"] as const).map((language) => <button key={language} type="button" aria-pressed={invitationLanguage === language} lang={language === "ID" ? "id" : "en"} onClick={() => onInvitationLanguage(language)}>{language}</button>)}
      </div>
    </div>
  );
}
