"use client";

import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import type { InvitationSectionKey } from "@/lib/templates/sections";

export type CanvasNavigationItem = { id: string; key: InvitationSectionKey; title: string };

const englishTitles: Partial<Record<InvitationSectionKey, string>> = {
  envelope: "Envelope", cover: "Cover", greeting: "Greeting", identity: "Identity",
  event: "Event details", dateTime: "Date & time", gallery: "Gallery",
  countdown: "Countdown", location: "Location", rsvp: "RSVP",
  wishes: "Guest wishes", gift: "Gift", closing: "Closing", footer: "Footer",
};

export default function StudioCanvasFooter({
  locale, items, activeId, zoom, onNavigate, onZoomOut, onZoomChange, onResetZoom, onFit, onZoomIn,
}: {
  locale: string;
  items: CanvasNavigationItem[];
  activeId: string;
  zoom: number;
  onNavigate: (id: string) => void;
  onZoomOut: () => void;
  onZoomChange: (zoom: number) => void;
  onResetZoom: () => void;
  onFit: () => void;
  onZoomIn: () => void;
}) {
  const index = Math.max(0, items.findIndex((item) => item.id === activeId));
  const current = items[index];
  const en = locale === "en";
  const title = current ? (en ? englishTitles[current.key] ?? current.title : current.title) : (en ? "Canvas" : "Kanvas");

  return (
    <div className="dc-studio-canvas-footer" role="group" aria-label={en ? "Canvas navigation and zoom" : "Navigasi dan zoom kanvas"}>
      <div className="dc-studio-canvas-pages">
        <button type="button" onClick={() => onNavigate(items[index - 1]!.id)} disabled={index <= 0}
          aria-label={en ? "Previous section" : "Bagian sebelumnya"} title={en ? "Previous section" : "Bagian sebelumnya"}>
          <ChevronLeft size={16} />
        </button>
        <span className="dc-studio-canvas-page-label" title={title}>
          {items.length ? `${index + 1}/${items.length}` : "0/0"} <span aria-hidden="true">·</span> {title}
        </span>
        <button type="button" onClick={() => onNavigate(items[index + 1]!.id)} disabled={index >= items.length - 1}
          aria-label={en ? "Next section" : "Bagian berikutnya"} title={en ? "Next section" : "Bagian berikutnya"}>
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="dc-studio-canvas-zoom" role="group" aria-label={en ? "Canvas zoom" : "Zoom kanvas"}>
        <button type="button" onClick={onZoomOut} disabled={zoom <= 0.1} aria-label={en ? "Zoom out canvas" : "Perkecil kanvas"}><ZoomOut size={15} /></button>
        <input type="range" min={10} max={500} step={1} value={Math.round(zoom * 100)}
          onChange={(event) => onZoomChange(Number(event.currentTarget.value) / 100)}
          aria-label={en ? "Canvas zoom percentage" : "Persentase zoom kanvas"}
          aria-valuetext={`${Math.round(zoom * 100)}%`} />
        <button type="button" className="dc-studio-canvas-zoom-value" onClick={onResetZoom}
          aria-label={en ? "Reset canvas zoom to 100 percent" : "Reset zoom kanvas ke 100 persen"}
          title={en ? "Reset to 100%" : "Kembali ke 100%"}>{Math.round(zoom * 100)}%</button>
        <button type="button" onClick={onFit} aria-label={en ? "Fit canvas to workspace" : "Sesuaikan kanvas ke area kerja"}>Fit</button>
        <button type="button" onClick={onZoomIn} disabled={zoom >= 5} aria-label={en ? "Zoom in canvas" : "Perbesar kanvas"}><ZoomIn size={15} /></button>
      </div>
    </div>
  );
}
