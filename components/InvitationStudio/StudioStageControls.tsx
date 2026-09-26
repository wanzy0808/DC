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
    "min-h-9 shrink-0 rounded-[var(--dc-control-radius)] border border-primary/50 bg-[#C07A84] px-2.5 text-[11px] text-white hover:bg-[#A65E69] dark:text-black dark:hover:bg-[#D9A3AA]";

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
