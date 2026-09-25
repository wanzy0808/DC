"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { studioObjectSections, type InvitationAssetLayer, type StudioObjectSection } from "@/lib/templates/asset-layers";

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
    if (!studioObjectSections.includes(node.dataset.invitationSection as StudioObjectSection)) continue;
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
    pointer: number; mode: "move" | "resize" | "rotate"; corner?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
    startX: number; startY: number; x: number; y: number; width: number; rotation: number;
    rect: DOMRect; centerX: number; centerY: number; initialAngle: number;
  } | null>(null);
  const [live, setLive] = useState<LayerPatch>({});
  useEffect(() => { setLive({}); }, [layer.x, layer.y, layer.width, layer.rotation, layer.section]);
  const displayed = { ...layer, ...live };

  function begin(event: PointerEvent<HTMLElement>, mode: "move" | "resize" | "rotate", corner?: "top-left" | "top-right" | "bottom-left" | "bottom-right") {
    if (!editable || !onUpdate || !root.current) return;
    event.preventDefault();
    event.stopPropagation();
    const sectionRect = root.current.parentElement?.getBoundingClientRect();
    if (!sectionRect?.width || !sectionRect.height) return;
    const bounds = root.current.getBoundingClientRect();
    const cx = bounds.left + bounds.width / 2;
    const cy = bounds.top + bounds.height / 2;
    gesture.current = {
      pointer: event.pointerId, mode, corner, startX: event.clientX, startY: event.clientY,
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
      // Selection frame stays centred; project pointer movement into the rotated object X axis.
      const radians = drag.rotation * Math.PI / 180;
      const dx = event.clientX - drag.startX;
      const dy = event.clientY - drag.startY;
      const localX = dx * Math.cos(radians) + dy * Math.sin(radians);
      const sign = drag.corner?.endsWith("left") ? -1 : 1;
      return { width: round(clamp(drag.width + sign * localX / drag.rect.width * 200, 5, 85)) };
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
      x: round(clamp(destination && destination.section !== section ? (event.clientX - rect.left) / rect.width * 100
        : drag.x + (event.clientX - drag.startX) / drag.rect.width * 100, 0, 100)),
      y: round(clamp(destination && destination.section !== section ? (event.clientY - rect.top) / rect.height * 100
        : drag.y + (event.clientY - drag.startY) / drag.rect.height * 100, 0, 100)),
      ...(destination && destination.section !== section ? { section: destination.section } : {}),
    };
  }

  function move(event: PointerEvent<HTMLElement>) {
    if (gesture.current?.pointer !== event.pointerId) return;
    if (gesture.current.mode === "move") {
      const scroller = root.current?.closest<HTMLElement>(".dc-studio-canvas-scroll");
      const viewport = scroller?.getBoundingClientRect();
      if (scroller && viewport) {
        if (event.clientY > viewport.bottom - 42) scroller.scrollTop += 14;
        else if (event.clientY < viewport.top + 42) scroller.scrollTop -= 14;
      }
    }
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
            fontFamily: layer.fontRole === "body" ? "inherit" : "var(--inv-heading, var(--font-dc-heading))",
            fontSize: layer.fontSize ?? 24, color: layer.color ?? "#C07A84",
          }}>{layer.text}</span> : <img src={layer.src} alt="" draggable={false} className="pointer-events-none block h-auto w-full select-none" />}
        </button>
      ) : layer.kind === "text" ? <span aria-hidden="true" className="block w-full whitespace-pre-wrap break-words text-center leading-snug" style={{
        fontFamily: layer.fontRole === "body" ? "inherit" : "var(--inv-heading, var(--font-dc-heading))",
        fontSize: layer.fontSize ?? 24, color: layer.color ?? "#C07A84",
      }}>{layer.text}</span> : <img src={layer.src} alt="" draggable={false} aria-hidden="true" className="block h-auto w-full select-none" />}
      {editable && selected && <>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 border border-primary" />
        <div aria-hidden="true" className="pointer-events-none absolute bottom-full left-1/2 h-6 w-px -translate-x-1/2 bg-primary" />
        <button type="button" aria-label="Putar objek" title="Tarik untuk memutar" className="pointer-events-auto absolute -top-10 left-1/2 z-20 grid h-6 w-6 -translate-x-1/2 place-items-center rounded-full border-2 border-primary bg-background shadow-sm cursor-grab active:cursor-grabbing"
          style={{ touchAction: "none" }} onPointerDown={(event) => begin(event, "rotate")} onPointerMove={move} onPointerUp={end} onPointerCancel={() => { gesture.current = null; setLive({}); }}><span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-primary" /></button>
        {(["top-left", "top-right", "bottom-left", "bottom-right"] as const).map((corner) => (
          <button key={corner} type="button" aria-label={`Ubah ukuran dari ${corner}`} title="Tarik titik sudut untuk resize"
            className={`pointer-events-auto absolute z-20 grid h-5 w-5 place-items-center border-0 bg-transparent p-0 ${corner.startsWith("top") ? "-top-2.5" : "-bottom-2.5"} ${corner.endsWith("left") ? "-left-2.5" : "-right-2.5"} ${corner === "top-left" || corner === "bottom-right" ? "cursor-nwse-resize" : "cursor-nesw-resize"}`}
            style={{ touchAction: "none" }} onPointerDown={(event) => begin(event, "resize", corner)} onPointerMove={move} onPointerUp={end} onPointerCancel={() => { gesture.current = null; setLive({}); }}><span aria-hidden="true" className="pointer-events-none h-2.5 w-2.5 rounded-[2px] border border-primary bg-background" /></button>
        ))}
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
