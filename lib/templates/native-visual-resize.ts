import type { NativeVisualTransform } from "./native-visual-transforms";

export type NativeResizeHandle = "top-left" | "top" | "top-right" | "right" | "bottom-right" | "bottom" | "bottom-left" | "left";
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const round = (value: number) => Math.round(value * 100) / 100;

/** Keep the opposite edge fixed while preserving the element's non-geometric styles. */
export function resizeNativeVisual(
  start: NativeVisualTransform,
  handle: NativeResizeHandle,
  width: number,
  height: number,
  dx: number,
  dy: number,
): NativeVisualTransform {
  width = Math.max(1, width);
  height = Math.max(1, height);
  const radians = start.rotation * Math.PI / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const localX = dx * cos + dy * sin;
  const localY = -dx * sin + dy * cos;
  const signX = handle.includes("left") ? -1 : handle.includes("right") ? 1 : 0;
  const signY = handle.includes("top") ? -1 : handle.includes("bottom") ? 1 : 0;
  const scaleX = signX ? round(clamp(start.scaleX + signX * localX / width, 0.25, 3)) : start.scaleX;
  const scaleY = signY ? round(clamp(start.scaleY + signY * localY / height, 0.25, 3)) : start.scaleY;
  const shiftX = signX * (scaleX - start.scaleX) * width / 2;
  const shiftY = signY * (scaleY - start.scaleY) * height / 2;
  return {
    ...start,
    x: round(clamp(start.x + (shiftX * cos - shiftY * sin) / width * 100, -2000, 2000)),
    y: round(clamp(start.y + (shiftX * sin + shiftY * cos) / height * 100, -2000, 2000)),
    scaleX,
    scaleY,
  };
}
