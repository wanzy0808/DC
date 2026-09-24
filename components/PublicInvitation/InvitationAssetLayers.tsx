"use client";

import { useEffect, useRef, useState, type PointerEvent, type KeyboardEvent } from "react";
import type { InvitationAssetLayer } from "@/lib/templates/asset-layers";

/** Coordinates are percentages of the actual Cover, not the Studio viewport. */
function CoverLayer({
  layer, selected, editable, onSelect, onMove,
}: {
  layer: InvitationAssetLayer;
  selected: boolean;
  editable: boolean;
  onSelect?: (id: string) => void;
  onMove?: (id: string, x: number, y: number) => void;
}) {
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  const drag = useRef<{ id: number; x: number; y: number; startX: number; startY: number; width: number; height: number } | null>(null);
  useEffect(() => { setDragPosition(null); }, [layer.x, layer.y]);

  function start(event: PointerEvent<HTMLButtonElement>) {
    if (!editable || !onMove) return;
    event.preventDefault();
    event.stopPropagation();
    const cover = event.currentTarget.parentElement?.getBoundingClientRect();
    if (!cover?.width || !cover.height) return;
    onSelect?.(layer.id);
    drag.current = { id: event.pointerId, x: layer.x, y: layer.y, startX: event.clientX, startY: event.clientY, width: cover.width, height: cover.height };
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function move(event: PointerEvent<HTMLButtonElement>) {
    const current = drag.current;
    if (!current || current.id !== event.pointerId) return;
    setDragPosition({
      x: Math.max(0, Math.min(100, current.x + (event.clientX - current.startX) / current.width * 100)),
      y: Math.max(0, Math.min(100, current.y + (event.clientY - current.startY) / current.height * 100)),
    });
  }
  function finish(event: PointerEvent<HTMLButtonElement>) {
    const current = drag.current;
    if (!current || current.id !== event.pointerId) return;
    drag.current = null;
    const x = Math.max(0, Math.min(100, current.x + (event.clientX - current.startX) / current.width * 100));
    const y = Math.max(0, Math.min(100, current.y + (event.clientY - current.startY) / current.height * 100));
    setDragPosition(null);
    if (Math.abs(x - current.x) > 0.1 || Math.abs(y - current.y) > 0.1) onMove?.(layer.id, Math.round(x * 10) / 10, Math.round(y * 10) / 10);
  }
  function keyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (!editable || !onMove || !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
    event.preventDefault();
    const delta = event.shiftKey ? 5 : 1;
    const x = layer.x + (event.key === "ArrowLeft" ? -delta : event.key === "ArrowRight" ? delta : 0);
    const y = layer.y + (event.key === "ArrowUp" ? -delta : event.key === "ArrowDown" ? delta : 0);
    onMove(layer.id, Math.min(100, Math.max(0, x)), Math.min(100, Math.max(0, y)));
  }

  const position = dragPosition ?? layer;
  const style = {
    left: `${position.x}%`, top: `${position.y}%`, width: `${layer.width}%`,
    opacity: layer.opacity, transform: "translate(-50%, -50%)", touchAction: "none" as const,
  };
  if (!editable) return <div className="absolute" style={{ ...style, pointerEvents: "none" }} aria-hidden="true"><img src={layer.src} alt="" draggable={false} className="block h-auto w-full select-none" /></div>;
  return (
    <button type="button" aria-label={`Pilih dan geser ilustrasi ${layer.id}`} aria-pressed={selected}
      className="pointer-events-auto absolute cursor-grab border-0 bg-transparent p-0 outline-none focus-visible:outline-2 focus-visible:outline-primary active:cursor-grabbing"
      style={style} onClick={() => onSelect?.(layer.id)} onPointerDown={start} onPointerMove={move} onPointerUp={finish} onPointerCancel={() => { drag.current = null; setDragPosition(null); }} onKeyDown={keyDown}>
      <img src={layer.src} alt="" draggable={false} className="pointer-events-none block h-auto w-full select-none" />
    </button>
  );
}

export default function InvitationAssetLayers({
  layers, editable = false, selectedId, onSelect, onMove,
}: {
  layers: InvitationAssetLayer[];
  editable?: boolean;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  onMove?: (id: string, x: number, y: number) => void;
}) {
  if (!layers.length) return null;
  return (
    <div className="absolute inset-0 z-30 overflow-hidden" style={{ pointerEvents: "none" }} aria-label={editable ? "Lapisan ilustrasi cover" : undefined}>
      {layers.map((layer) =>
        <div key={layer.id} className="absolute inset-0" style={{ pointerEvents: "none" }}>
          <CoverLayer layer={layer} selected={selectedId === layer.id} editable={editable} onSelect={onSelect} onMove={onMove} />
        </div>,
      )}
    </div>
  );
}
