"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { RotateCw } from "lucide-react";
import { studioObjectSections, type InvitationAssetLayer, type StudioObjectSection } from "@/lib/templates/asset-layers";
import InvitationFonts from "@/components/PublicInvitation/InvitationFonts";
import { invitationFontFamily } from "@/lib/templates/presentation";
import { resizeObjectFromHandle, type ObjectResizeHandle } from "@/lib/templates/object-resize";

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
  layer, selected, section, editable, interactionEnabled, onSelect, onUpdate, onCycleSelect,
}: {
  layer: InvitationAssetLayer;
  selected: boolean;
  section: StudioObjectSection;
  editable: boolean;
  interactionEnabled: boolean;
  onSelect?: Props["onSelect"];
  onUpdate?: Props["onUpdate"];
  onCycleSelect?: (id: string, clientX: number, clientY: number) => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const gesture = useRef<{
    pointer: number; mode: "move" | "resize" | "rotate"; handle?: ObjectResizeHandle; objectWidth: number; objectHeight: number;
    startX: number; startY: number; x: number; y: number; width: number; height: number; rotation: number;
    rect: DOMRect; centerX: number; centerY: number; initialAngle: number; moved: boolean;
  } | null>(null);
  const [live, setLive] = useState<LayerPatch>({});
  useEffect(() => { setLive({}); }, [layer.x, layer.y, layer.width, layer.height, layer.rotation, layer.section]);
  const displayed = { ...layer, ...live };

  function begin(event: PointerEvent<HTMLElement>, mode: "move" | "resize" | "rotate", handle?: ObjectResizeHandle) {
    if (!editable || !interactionEnabled || !onUpdate || !root.current || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    const sectionRect = root.current.parentElement?.getBoundingClientRect();
    if (!sectionRect?.width || !sectionRect.height) return;
    const bounds = root.current.getBoundingClientRect();
    const cx = bounds.left + bounds.width / 2;
    const cy = bounds.top + bounds.height / 2;
    gesture.current = {
      pointer: event.pointerId, mode, handle, objectWidth: Math.max(1, root.current.offsetWidth), objectHeight: Math.max(1, root.current.offsetHeight), startX: event.clientX, startY: event.clientY,
      x: layer.x, y: layer.y, width: layer.width, height: layer.height ?? root.current.offsetHeight / sectionRect.width * 100, rotation: layer.rotation ?? 0,
      rect: sectionRect, centerX: cx, centerY: cy,
      initialAngle: Math.atan2(event.clientY - cy, event.clientX - cx),
      moved: false,
    };
    onSelect?.(layer.id);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function calculate(event: PointerEvent<HTMLElement>): LayerPatch {
    const drag = gesture.current;
    if (!drag) return {};
    if (drag.mode === "resize") {
      return resizeObjectFromHandle({
        handle: drag.handle ?? "bottom-right",
        x: drag.x, y: drag.y, width: drag.width, height: drag.height,
        rotation: drag.rotation, sectionWidth: drag.rect.width,
        sectionHeight: drag.rect.height, objectWidth: drag.objectWidth,
        objectHeight: drag.objectHeight,
      }, event.clientX - drag.startX, event.clientY - drag.startY);
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
    if (Math.hypot(event.clientX - gesture.current.startX, event.clientY - gesture.current.startY) > 3) {
      gesture.current.moved = true;
    }
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
    const currentGesture = gesture.current;
    const patch = calculate(event);
    gesture.current = null;
    setLive({});
    if (currentGesture.mode === "move" && !currentGesture.moved && selected) {
      onCycleSelect?.(layer.id, event.clientX, event.clientY);
      return;
    }
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
    <div ref={root} data-studio-design-object={layer.id} className="pointer-events-none absolute" style={{
      left: `${displayed.x}%`, top: `${displayed.y}%`, width: `${displayed.width}%`,
      ...(displayed.height === undefined ? {} : { aspectRatio: `${displayed.width} / ${displayed.height}` }),
      opacity: displayed.opacity, transform: `translate(-50%, -50%) rotate(${displayed.rotation ?? 0}deg)`,
      transformOrigin: "center", touchAction: "none",
    }}>
      {editable ? (
        <button type="button" aria-label={layer.kind === "text" ? "Pilih dan geser teks dekoratif" : "Pilih dan geser ilustrasi"}
          aria-pressed={selected}
          className={`${interactionEnabled ? "pointer-events-auto" : "pointer-events-none"} block w-full cursor-grab border-0 bg-transparent p-0 text-inherit outline-none focus-visible:outline-2 focus-visible:outline-primary active:cursor-grabbing ${displayed.height === undefined ? "" : "h-full"}`}
          style={{ touchAction: "none" }}
          onClick={() => onSelect?.(layer.id)} onPointerDown={(event) => begin(event, "move")}
          onPointerMove={move} onPointerUp={end} onPointerCancel={() => { gesture.current = null; setLive({}); }}
          onKeyDown={keys}>
          {layer.kind === "text" ? <span className="block w-full whitespace-pre-wrap break-words" style={{
            fontFamily: layer.fontFamily
              ? invitationFontFamily(layer.fontFamily)
              : layer.fontRole === "body" ? "inherit" : "var(--inv-heading, var(--font-dc-heading))",
            fontSize: layer.fontSize ?? 24,
            fontWeight: layer.fontWeight ?? 400,
            textAlign: layer.textAlign ?? "center",
            letterSpacing: layer.letterSpacing ?? 0,
            lineHeight: layer.lineHeight ?? 1.2,
            color: layer.color ?? "#C07A84",
          }}>{layer.text}</span> : <img src={layer.src} alt="" draggable={false} className={`pointer-events-none block w-full select-none ${displayed.height === undefined ? "h-auto" : "h-full object-fill"}`} />}
        </button>
      ) : layer.kind === "text" ? <span aria-hidden="true" className="block w-full whitespace-pre-wrap break-words" style={{
        fontFamily: layer.fontFamily
          ? invitationFontFamily(layer.fontFamily)
          : layer.fontRole === "body" ? "inherit" : "var(--inv-heading, var(--font-dc-heading))",
        fontSize: layer.fontSize ?? 24,
        fontWeight: layer.fontWeight ?? 400,
        textAlign: layer.textAlign ?? "center",
        letterSpacing: layer.letterSpacing ?? 0,
        lineHeight: layer.lineHeight ?? 1.2,
        color: layer.color ?? "#C07A84",
      }}>{layer.text}</span> : <img src={layer.src} alt="" draggable={false} aria-hidden="true" className={`block w-full select-none ${displayed.height === undefined ? "h-auto" : "h-full object-fill"}`} />}
      {editable && selected && <>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 border border-primary" />
        <button type="button" aria-label="Putar objek" title="Tarik untuk memutar" className="pointer-events-auto absolute -bottom-9 left-1/2 z-20 grid h-7 w-7 -translate-x-1/2 place-items-center rounded-full border border-primary bg-background text-primary shadow-sm cursor-grab transition hover:bg-primary hover:text-primary-foreground active:cursor-grabbing"
          style={{ touchAction: "none" }} onPointerDown={(event) => begin(event, "rotate")} onPointerMove={move} onPointerUp={end} onPointerCancel={() => { gesture.current = null; setLive({}); }}><RotateCw aria-hidden="true" size={15} strokeWidth={2} /></button>
        {(["top-left", "top", "top-right", "right", "bottom-right", "bottom", "bottom-left", "left"] as const).map((handle) => (
          <button key={handle} type="button" aria-label={`Ubah ukuran dari ${handle}`} title="Tarik untuk mengubah ukuran"
            className={`pointer-events-auto absolute z-20 grid h-5 w-5 place-items-center border-0 bg-transparent p-0 ${handle.includes("top") ? "-top-2.5" : handle.includes("bottom") ? "-bottom-2.5" : "top-1/2 -translate-y-1/2"} ${handle.includes("left") ? "-left-2.5" : handle.includes("right") ? "-right-2.5" : "left-1/2 -translate-x-1/2"} ${handle === "top" || handle === "bottom" ? "cursor-ns-resize" : handle === "left" || handle === "right" ? "cursor-ew-resize" : handle === "top-left" || handle === "bottom-right" ? "cursor-nwse-resize" : "cursor-nesw-resize"}`}
            style={{ touchAction: "none" }} onPointerDown={(event) => begin(event, "resize", handle)} onPointerMove={move} onPointerUp={end} onPointerCancel={() => { gesture.current = null; setLive({}); }}><span aria-hidden="true" className="pointer-events-none h-2.5 w-2.5 rounded-[2px] border border-primary bg-background" /></button>
        ))}
      </>}
    </div>
  );
}

export default function InvitationAssetLayers({ layers, section = "cover", editable = false, selectedId, onSelect, onUpdate }: Props) {
  const visible = layers.filter((layer) => (layer.section ?? "cover") === section);

  function cycleSelection(currentId: string, clientX: number, clientY: number) {
    if (!onSelect) return;
    const hits = visible.filter((layer) => {
      const node = document.querySelector<HTMLElement>(`[data-studio-design-object="${CSS.escape(layer.id)}"]`);
      const rect = node?.getBoundingClientRect();
      return Boolean(rect?.width && rect.height && clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom);
    });
    if (hits.length < 2) return;
    const currentIndex = hits.findIndex((layer) => layer.id === currentId);
    const nextIndex = currentIndex <= 0 ? hits.length - 1 : currentIndex - 1;
    onSelect(hits[nextIndex]!.id);
  }

  if (!visible.length) return null;
  const textFamilies = visible.flatMap((layer) => layer.kind === "text" && layer.fontFamily ? [layer.fontFamily] : []);
  return (
    <>
      {textFamilies.length > 0 && <InvitationFonts families={textFamilies} />}
      <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden" aria-label={editable ? "Objek desain bagian undangan" : undefined}>
      {visible.map((layer) =>
        <EditableLayer key={layer.id} layer={layer} section={section} selected={selectedId === layer.id}
          editable={editable} interactionEnabled={!selectedId || selectedId === layer.id}
          onSelect={onSelect} onUpdate={onUpdate} onCycleSelect={cycleSelection} />,
      )}
      </div>
    </>
  );
}
