"use client";

import { ZoomIn, ZoomOut } from "lucide-react";

export default function StudioStageControls({
  locale,
  envelopeEnabled,
  stage,
  zoom,
  labels,
  onEnvelope,
  onContent,
  onZoomOut,
  onResetZoom,
  onFit,
  onZoomIn,
}: {
  locale: string;
  envelopeEnabled: boolean;
  stage: "envelope" | "cover";
  zoom: number;
  labels: {
    envelope: string;
    cover: string;
    envelopeHint: string;
    coverHint: string;
  };
  onEnvelope: () => void;
  onContent: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onFit: () => void;
  onZoomIn: () => void;
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

      <div className="ml-auto flex items-center gap-1 rounded-[var(--dc-control-radius)] border border-primary/30 bg-background p-1">
        <button
          type="button"
          className="grid h-7 w-7 place-items-center rounded-lg text-primary hover:bg-primary/10"
          onClick={onZoomOut}
          disabled={zoom <= 0.7}
          aria-label={locale === "en" ? "Zoom out canvas" : "Perkecil kanvas"}
          title={locale === "en" ? "Zoom out" : "Perkecil"}
        >
          <ZoomOut size={14} />
        </button>
        <button
          type="button"
          className="min-h-7 min-w-11 rounded-lg px-1.5 text-[10px] font-semibold text-muted-foreground hover:bg-primary/10 hover:text-primary"
          onClick={onResetZoom}
          aria-label={locale === "en" ? "Reset canvas zoom to 100 percent" : "Reset zoom kanvas ke 100 persen"}
          title={locale === "en" ? "Reset to 100%" : "Kembali ke 100%"}
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          type="button"
          className="min-h-7 rounded-lg px-2 text-[10px] font-semibold text-primary hover:bg-primary/10"
          onClick={onFit}
          aria-label={locale === "en" ? "Fit canvas to workspace" : "Sesuaikan kanvas ke area kerja"}
          title={locale === "en" ? "Fit canvas" : "Sesuaikan kanvas"}
        >
          Fit
        </button>
        <button
          type="button"
          className="grid h-7 w-7 place-items-center rounded-lg text-primary hover:bg-primary/10"
          onClick={onZoomIn}
          disabled={zoom >= 1.3}
          aria-label={locale === "en" ? "Zoom in canvas" : "Perbesar kanvas"}
          title={locale === "en" ? "Zoom in" : "Perbesar"}
        >
          <ZoomIn size={14} />
        </button>
      </div>
    </div>
  );
}
