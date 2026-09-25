"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Check, Minus, Plus } from "lucide-react";
import type { PhotoCrop } from "@/lib/templates/photo-slots";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const round = (value: number) => Math.round(value * 10) / 10;

export default function StudioPhotoCropOverlay({
  crop,
  onChange,
  onDone,
  locale = "id",
}: {
  crop: PhotoCrop;
  onChange: (crop: PhotoCrop) => void;
  onDone: () => void;
  locale?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const liveRef = useRef<PhotoCrop>(crop);
  const [live, setLive] = useState(crop);
  const dragRef = useRef<{
    pointer: number;
    startX: number;
    startY: number;
    crop: PhotoCrop;
    rect: DOMRect;
  } | null>(null);

  useEffect(() => {
    liveRef.current = crop;
    setLive(crop);
  }, [crop.x, crop.y, crop.zoom]);

  function applyPreview(next: PhotoCrop) {
    liveRef.current = next;
    setLive(next);
    const image = rootRef.current?.parentElement?.querySelector<HTMLImageElement>("img");
    if (!image) return;
    image.style.objectPosition = `${next.x}% ${next.y}%`;
    image.style.transform = next.zoom === 1 ? "" : `scale(${next.zoom})`;
    image.style.transformOrigin = `${next.x}% ${next.y}%`;
  }

  function begin(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || !rootRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    const rect = rootRef.current.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    dragRef.current = {
      pointer: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      crop: liveRef.current,
      rect,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function move(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointer !== event.pointerId) return;
    event.preventDefault();
    const dx = (event.clientX - drag.startX) / drag.rect.width * 100;
    const dy = (event.clientY - drag.startY) / drag.rect.height * 100;
    applyPreview({
      x: round(clamp(drag.crop.x - dx, 0, 100)),
      y: round(clamp(drag.crop.y - dy, 0, 100)),
      zoom: drag.crop.zoom,
    });
  }

  function finish(event: PointerEvent<HTMLDivElement>) {
    if (dragRef.current?.pointer !== event.pointerId) return;
    dragRef.current = null;
    onChange(liveRef.current);
  }

  function cancel() {
    dragRef.current = null;
    applyPreview(crop);
  }

  function changeZoom(delta: number) {
    const next = {
      ...liveRef.current,
      zoom: round(clamp(liveRef.current.zoom + delta, 1, 3)),
    };
    applyPreview(next);
    onChange(next);
  }

  const en = locale === "en";
  return (
    <div
      ref={rootRef}
      data-studio-photo-crop
      className="absolute inset-0 z-30 cursor-move touch-none select-none border-2 border-primary bg-black/5"
      onPointerDown={begin}
      onPointerMove={move}
      onPointerUp={finish}
      onPointerCancel={cancel}
      aria-label={en ? "Drag photo to crop" : "Geser foto untuk crop"}
    >
      <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-1/3 w-px bg-white/70 shadow-sm" />
      <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-2/3 w-px bg-white/70 shadow-sm" />
      <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-1/3 h-px bg-white/70 shadow-sm" />
      <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-2/3 h-px bg-white/70 shadow-sm" />

      <div className="absolute left-2 top-2 rounded-md bg-black/65 px-2 py-1 text-[10px] font-medium text-white">
        {en ? "Drag to reposition" : "Geser untuk atur posisi"}
      </div>

      <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-[var(--dc-control-radius)] bg-background/95 p-1 shadow-lg">
        <button
          type="button"
          className="grid h-8 w-8 place-items-center rounded-lg text-primary hover:bg-primary/10"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => { event.stopPropagation(); changeZoom(-0.1); }}
          aria-label={en ? "Zoom out" : "Perkecil foto"}
          title={en ? "Zoom out" : "Perkecil foto"}
        >
          <Minus size={15} />
        </button>
        <span className="min-w-12 text-center text-[10px] font-semibold">{live.zoom.toFixed(1)}×</span>
        <button
          type="button"
          className="grid h-8 w-8 place-items-center rounded-lg text-primary hover:bg-primary/10"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => { event.stopPropagation(); changeZoom(0.1); }}
          aria-label={en ? "Zoom in" : "Perbesar foto"}
          title={en ? "Zoom in" : "Perbesar foto"}
        >
          <Plus size={15} />
        </button>
        <button
          type="button"
          className="ml-1 flex h-8 items-center gap-1 rounded-lg bg-primary px-2 text-[10px] font-semibold text-primary-foreground"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => { event.stopPropagation(); onDone(); }}
        >
          <Check size={13} />
          {en ? "Done" : "Selesai"}
        </button>
      </div>
    </div>
  );
}
