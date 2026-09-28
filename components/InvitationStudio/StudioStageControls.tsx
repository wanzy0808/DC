"use client";

export default function StudioStageControls({
  locale,
  envelopeEnabled,
  stage,
  labels,
  onEnvelope,
  onContent,
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
}) {
  const buttonClass =
    "min-h-9 shrink-0 rounded-[var(--dc-control-radius)] border border-primary bg-primary px-2.5 text-[11px] text-primary-foreground hover:bg-primary/90";

  return (
    <div
      className="dc-studio-stage-controls"
      role="group"
      aria-label={locale === "en" ? "Invitation view" : "Tampilan undangan"}
    >
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
  );
}
