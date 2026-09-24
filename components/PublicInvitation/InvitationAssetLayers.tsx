"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import type { InvitationAssetLayer, StudioObjectSection } from "@/lib/templates/asset-layers";

/** Overlay geometry is relative to its owning invitation section, not the Studio viewport. */
type LayerPatch = Partial<InvitationAssetLayer>;
type Props = {
  layers: InvitationAssetLayer[];
  section?: StudioObjectSection;
  editable?: boolean;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  onUpdate?: (id: string, patch: LayerPatch) => void;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const round = (value: number) => Math.round(value * 10) / 10;

function findSectionAt(x: number, y: number, root: HTMLElement): { section: StudioObjectSection; rect: DOMRect } | null {
  const invitation = root.closest(".dc-studio-preview-surface");
  if (!invitation) return null;
  for (const node of invitation.querySelectorAll<HTMLElement>("[data-invitation-section]")) {
    const rect = node.getBoundingClientRect();
    if (rect.width && rect.height && x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
      return { section: node.dataset.invitationSection as StudioObjectSection, rect };
    }
  }
  return null;
}

function EditableLayer({
  layer, selected, section, editable, onSelect, onUpdate,
}: {
  layer: InvitationAssetLayer;
  selected: boolean;
  section: StudioObjectSection;
  editable: boolean;
  onSelect?: Props["onSelect"];
  onUpdate?: Props["onUpdate"];
}) {
  const root = useRef<HTMLDivElement>(null);
  const gesture = useRef<{
    pointer: number; mode: "move" | "resize" | "rotate";
    startX: number; startY: number; x: number; y: number; width: number; rotation: number;
    rect: DOMRect; centerX: number; centerY: number; initialAngle: number;
  } | null>(null);
  const [live, setLive] = useState<LayerPatch>({});
  useEffect(() => { setLive({}); }, [layer.x, layer.y, layer.width, layer.rotation, layer.section]);
  const displayed = { ...layer, ...live };

  function begin(event: PointerEvent<HTMLElement>, mode: "move" | "resize" | "rotate") {
    if (!editable || !onUpdate || !root.current) return;
    event.preventDefault();
    event.stopPropagation();
    const sectionRect = root.current.parentElement?.getBoundingClientRect();
    if (!sectionRect?.width || !sectionRect.height) return;
    const bounds = root.current.getBoundingClientRect();
    const cx = bounds.left + bounds.width / 2;
    const cy = bounds.top + bounds.height / 2;
    gesture.current = {
      pointer: event.pointerId, mode, startX: event.clientX, startY: event.clientY,
      x: layer.x, y: layer.y, width: layer.width, rotation: layer.rotation ?? 0,
      rect: sectionRect, centerX: cx, centerY: cy,
      initialAngle: Math.atan2(event.clientY - cy, event.clientX - cx),
    };
    onSelect?.(layer.id);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function calculate(event: PointerEvent<HTMLElement>): LayerPatch {
    const drag = gesture.current;
    if (!drag) return {};
    if (drag.mode === "resize") {
      return { width: round(clamp(drag.width + (event.clientX - drag.startX) / drag.rect.width * 100, 5, 85)) };
    }
    if (drag.mode === "rotate") {
      const angle = Math.atan2(event.clientY - drag.centerY, event.clientX - drag.centerX);
      let next = drag.rotation + (angle - drag.initialAngle) * 180 / Math.PI;
      while (next > 180) next -= 360;
      while (next < -180) next += 360;
      return { rotation: round(next) };
    }
    const destination = root.current && findSectionAt(event.clientX, event.clientY, root.current);
    const rect = destination?.rect ?? drag.rect;
    return {
      x: round(clamp(destination ? (event.clientX - rect.left) / rect.width * 100
        : drag.x + (event.clientX - drag.startX) / rect.width * 100, 0, 100)),
      y: round(clamp(destination ? (event.clientY - rect.top) / rect.height * 100
        : drag.y + (event.clientY - drag.startY) / rect.height * 100, 0, 100)),
      ...(destination && destination.section !== section ? { section: destination.section } : {}),
    };
  }

  function move(event: PointerEvent<HTMLElement>) {
    if (gesture.current?.pointer !== event.pointerId) return;
    setLive(calculate(event));
  }
  function end(event: PointerEvent<HTMLElement>) {
    if (gesture.current?.pointer !== event.pointerId) return;
    const patch = calculate(event);
    gesture.current = null;
    setLive({});
    if (Object.keys(patch).some((key) => patch[key as keyof LayerPatch] !== layer[key as keyof InvitationAssetLayer])) {
      onUpdate?.(layer.id, patch);
    }
  }
  function keys(event: KeyboardEvent<HTMLButtonElement>) {
    if (!editable || !onUpdate || !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
    event.preventDefault();
    const step = event.shiftKey ? 5 : 1;
    onUpdate(layer.id, {
      x: clamp(layer.x + (event.key === "ArrowLeft" ? -step : event.key === "ArrowRight" ? step : 0), 0, 100),
      y: clamp(layer.y + (event.key === "ArrowUp" ? -step : event.key === "ArrowDown" ? step : 0), 0, 100),
    });
  }

  return (
    <div ref={root} className="pointer-events-none absolute" style={{
      left: `${displayed.x}%`, top: `${displayed.y}%`, width: `${displayed.width}%`,
      opacity: displayed.opacity, transform: `translate(-50%, -50%) rotate(${displayed.rotation ?? 0}deg)`,
      transformOrigin: "center", touchAction: "none",
    }}>
      {editable ? (
        <button type="button" aria-label={layer.kind === "text" ? "Pilih dan geser teks dekoratif" : "Pilih dan geser ilustrasi"}
          aria-pressed={selected}
          className="pointer-events-auto block w-full cursor-grab border-0 bg-transparent p-0 text-inherit outline-none focus-visible:outline-2 focus-visible:outline-primary active:cursor-grabbing"
          style={{ touchAction: "none" }}
          onClick={() => onSelect?.(layer.id)} onPointerDown={(event) => begin(event, "move")}
          onPointerMove={move} onPointerUp={end} onPointerCancel={() => { gesture.current = null; setLive({}); }}
          onKeyDown={keys}>
          {layer.kind === "text" ? <span className="block w-full whitespace-pre-wrap break-words text-center leading-snug" style={{
            fontFamily: layer.fontRole === "body" ? "var(--inv-body, var(--font-dc-body))" : "var(--inv-heading, var(--font-dc-heading))",
            fontSize: layer.fontSize ?? 24, color: layer.color ?? "#C07A84",
          }}>{layer.text}</span> : <img src={layer.src} alt="" draggable={false} className="pointer-events-none block h-auto w-full select-none" />}
        </button>
      ) : layer.kind === "text" ? <span aria-hidden="true" className="block w-full whitespace-pre-wrap break-words text-center leading-snug" style={{
        fontFamily: layer.fontRole === "body" ? "var(--inv-body, var(--font-dc-body))" : "var(--inv-heading, var(--font-dc-heading))",
        fontSize: layer.fontSize ?? 24, color: layer.color ?? "#C07A84",
      }}>{layer.text}</span> : <img src={layer.src} alt="" draggable={false} aria-hidden="true" className="block h-auto w-full select-none" />}
      {editable && selected && <>
        <button type="button" aria-label="Rotasi objek" title="Putar" className="pointer-events-auto absolute -top-8 left-1/2 grid h-7 w-7 -translate-x-1/2 place-items-center rounded-full border border-primary bg-background text-primary shadow-sm"
          style={{ touchAction: "none" }} onPointerDown={(event) => begin(event, "rotate")} onPointerMove={move} onPointerUp={end} onPointerCancel={() => { gesture.current = null; setLive({}); }}>↻</button>
        <button type="button" aria-label="Ubah ukuran objek" title="Tarik untuk mengubah ukuran" className="pointer-events-auto absolute -bottom-3 -right-3 grid h-7 w-7 cursor-nwse-resize place-items-center rounded-[var(--dc-control-radius)] border border-primary bg-background text-primary shadow-sm"
          style={{ touchAction: "none" }} onPointerDown={(event) => begin(event, "resize")} onPointerMove={move} onPointerUp={end} onPointerCancel={() => { gesture.current = null; setLive({}); }}>↘</button>
      </>}
    </div>
  );
}

export default function InvitationAssetLayers({ layers, section = "cover", editable = false, selectedId, onSelect, onUpdate }: Props) {
  const visible = layers.filter((layer) => (layer.section ?? "cover") === section);
  if (!visible.length) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden" aria-label={editable ? "Objek desain bagian undangan" : undefined}>
      {visible.map((layer) =>
        <EditableLayer key={layer.id} layer={layer} section={section} selected={selectedId === layer.id}
          editable={editable} onSelect={onSelect} onUpdate={onUpdate} />,
      )}
    </div>
  );
}
