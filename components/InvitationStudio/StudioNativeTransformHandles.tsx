"use client";

import { useEffect, useRef, useState, type PointerEvent, type RefObject } from "react";
import { Lock, RotateCcw, RotateCw } from "lucide-react";
import {
  defaultNativeVisualTransform, nativeVisualSelector, nativeVisualUsesSystemContent,
  type NativeVisualTransform,
} from "@/lib/templates/native-visual-transforms";

type Handle = "move" | "rotate" | "top-left" | "top" | "top-right" | "right" | "bottom-right" | "bottom" | "bottom-left" | "left";
type Box = { left: number; top: number; width: number; height: number };
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const round = (value: number) => Math.round(value * 100) / 100;

export default function StudioNativeTransformHandles({
  canvasRef, targetKey, transform, zoom, revision, onCommit,
}: {
  canvasRef: RefObject<HTMLDivElement | null>;
  targetKey: string | null;
  transform?: NativeVisualTransform;
  zoom: number;
  revision: string;
  onCommit: (key: string, value: NativeVisualTransform) => void;
}) {
  const [box, setBox] = useState<Box | null>(null);
  const gesture = useRef<{
    pointer: number; handle: Handle; startX: number; startY: number;
    start: NativeVisualTransform; rect: DOMRect; node: HTMLElement;
    scrollLeft: number; scrollTop: number; initialAngle: number; moved: boolean;
  } | null>(null);

  function target() {
    const selector = targetKey && nativeVisualSelector(targetKey);
    return selector ? canvasRef.current?.querySelector<HTMLElement>(`.dc-studio-preview-surface ${selector}`) ?? null : null;
  }

  function measure() {
    const canvas = canvasRef.current;
    const node = target();
    if (!canvas || !node) { setBox(null); return; }
    const rect = node.getBoundingClientRect();
    const origin = canvas.getBoundingClientRect();
    setBox({
      left: rect.left - origin.left + canvas.scrollLeft,
      top: rect.top - origin.top + canvas.scrollTop,
      width: rect.width,
      height: rect.height,
    });
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !targetKey) { setBox(null); return; }
    const node = target();
    const observer = new ResizeObserver(measure);
    if (node) observer.observe(node);
    canvas.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    const frame = requestAnimationFrame(measure);
    return () => {
      observer.disconnect();
      canvas.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
      cancelAnimationFrame(frame);
    };
  // The revision and transform trigger a remeasure when the renderer changes.
  }, [canvasRef, targetKey, zoom, revision, transform?.x, transform?.y, transform?.scaleX, transform?.scaleY, transform?.rotation]);

  function apply(node: HTMLElement, next: NativeVisualTransform) {
    node.style.translate = `${next.x}% ${next.y}%`;
    node.style.rotate = `${next.rotation}deg`;
    node.style.scale = `${next.scaleX} ${next.scaleY}`;
  }

  function clear(node: HTMLElement) {
    node.style.removeProperty("translate");
    node.style.removeProperty("rotate");
    node.style.removeProperty("scale");
  }

  function calculate(event: PointerEvent<HTMLElement>) {
    const drag = gesture.current;
    if (!drag) return null;
    const canvas = canvasRef.current;
    const dx = event.clientX - drag.startX + ((canvas?.scrollLeft ?? drag.scrollLeft) - drag.scrollLeft);
    const dy = event.clientY - drag.startY + ((canvas?.scrollTop ?? drag.scrollTop) - drag.scrollTop);
    const start = drag.start;
    if (drag.handle === "move") return {
      ...start,
      x: round(clamp(start.x + dx / Math.max(1, drag.node.offsetWidth * zoom) * 100, -2000, 2000)),
      y: round(clamp(start.y + dy / Math.max(1, drag.node.offsetHeight * zoom) * 100, -2000, 2000)),
    };
    if (drag.handle === "rotate") {
      const angle = Math.atan2(event.clientY - drag.rect.top - drag.rect.height / 2,
        event.clientX - drag.rect.left - drag.rect.width / 2);
      let rotation = start.rotation + (angle - drag.initialAngle) * 180 / Math.PI;
      while (rotation > 180) rotation -= 360;
      while (rotation < -180) rotation += 360;
      return { ...start, rotation: round(rotation) };
    }
    const radians = start.rotation * Math.PI / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    const localX = dx * cos + dy * sin;
    const localY = -dx * sin + dy * cos;
    const signX = drag.handle.includes("left") ? -1 : drag.handle.includes("right") ? 1 : 0;
    const signY = drag.handle.includes("top") ? -1 : drag.handle.includes("bottom") ? 1 : 0;
    const width = Math.max(1, drag.node.offsetWidth * zoom);
    const height = Math.max(1, drag.node.offsetHeight * zoom);
    const scaleX = signX ? round(clamp(start.scaleX + signX * localX / width, 0.25, 3)) : start.scaleX;
    const scaleY = signY ? round(clamp(start.scaleY + signY * localY / height, 0.25, 3)) : start.scaleY;
    const shiftX = signX * (scaleX - start.scaleX) * width / 2;
    const shiftY = signY * (scaleY - start.scaleY) * height / 2;
    return {
      x: round(clamp(start.x + (shiftX * cos - shiftY * sin) / width * 100, -2000, 2000)),
      y: round(clamp(start.y + (shiftX * sin + shiftY * cos) / height * 100, -2000, 2000)),
      scaleX, scaleY, rotation: start.rotation,
    };
  }

  function begin(event: PointerEvent<HTMLButtonElement>, handle: Handle) {
    if (!targetKey || event.button !== 0) return;
    const node = target();
    if (!node) return;
    event.preventDefault();
    event.stopPropagation();
    const rect = node.getBoundingClientRect();
    gesture.current = {
      pointer: event.pointerId, handle, startX: event.clientX, startY: event.clientY,
      start: { ...defaultNativeVisualTransform, ...transform }, rect, node,
      scrollLeft: canvasRef.current?.scrollLeft ?? 0,
      scrollTop: canvasRef.current?.scrollTop ?? 0,
      initialAngle: Math.atan2(event.clientY - rect.top - rect.height / 2,
        event.clientX - rect.left - rect.width / 2),
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function move(event: PointerEvent<HTMLButtonElement>) {
    const drag = gesture.current;
    if (!drag || drag.pointer !== event.pointerId) return;
    if (Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) > 2) drag.moved = true;
    const canvas = canvasRef.current;
    const viewport = canvas?.getBoundingClientRect();
    if (canvas && viewport) {
      if (event.clientY > viewport.bottom - 42) canvas.scrollTop += 14;
      else if (event.clientY < viewport.top + 42) canvas.scrollTop -= 14;
      if (event.clientX > viewport.right - 42) canvas.scrollLeft += 14;
      else if (event.clientX < viewport.left + 42) canvas.scrollLeft -= 14;
    }
    const next = calculate(event);
    if (!next) return;
    apply(drag.node, next);
    measure();
  }

  function end(event: PointerEvent<HTMLButtonElement>, cancelled = false) {
    const drag = gesture.current;
    if (!drag || drag.pointer !== event.pointerId) return;
    const next = calculate(event);
    gesture.current = null;
    if (!cancelled && drag.moved && next && targetKey) onCommit(targetKey, next);
    requestAnimationFrame(() => { clear(drag.node); measure(); });
  }

  if (!box || !targetKey) return null;
  const handles = ["top-left", "top", "top-right", "right", "bottom-right", "bottom", "bottom-left", "left"] as const;
  return (
    <div className="dc-studio-native-transform" style={{ left: box.left, top: box.top, width: box.width, height: box.height }}
      aria-label="Transformasi elemen bawaan">
      {nativeVisualUsesSystemContent(targetKey) && (
        <span className="dc-studio-native-content-lock" title="Isi dari data acara terkunci; styling tetap editable" aria-label="Isi data acara terkunci">
          <Lock size={12} />
        </span>
      )}
      <button type="button" className="dc-studio-native-move" aria-label="Geser elemen" title="Tarik untuk menggeser"
        onPointerDown={(event) => begin(event, "move")} onPointerMove={move} onPointerUp={end}
        onPointerCancel={(event) => end(event, true)} />
      {handles.map((handle) => (
        <button key={handle} type="button" className={`dc-studio-native-handle dc-studio-native-handle--${handle}`}
          aria-label={`Ubah ukuran dari ${handle}`} title={`Tarik untuk mengubah ukuran dari ${handle}`}
          onPointerDown={(event) => begin(event, handle)} onPointerMove={move} onPointerUp={end}
          onPointerCancel={(event) => end(event, true)} />
      ))}
      {transform && <button type="button" className="dc-studio-native-reset" aria-label="Reset posisi ukuran dan rotasi elemen"
        title="Reset transformasi" onClick={(event) => { event.stopPropagation(); onCommit(targetKey, defaultNativeVisualTransform); }}>
        <RotateCcw size={14} />
      </button>}
      <button type="button" className="dc-studio-native-rotate" aria-label="Putar elemen"
        title="Tarik untuk memutar" onPointerDown={(event) => begin(event, "rotate")}
        onPointerMove={move} onPointerUp={end} onPointerCancel={(event) => end(event, true)}>
        <RotateCw size={15} />
      </button>
    </div>
  );
}
