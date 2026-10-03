import assert from "node:assert/strict";
import test from "node:test";
import { resizeNativeVisual } from "../lib/templates/native-visual-resize.ts";
import { defaultNativeVisualTransform, parseNativeVisualTransforms, withNativeVisualTransforms } from "../lib/templates/native-visual-transforms.ts";

const start = Object.freeze({
  ...defaultNativeVisualTransform, x: 12, y: -9, scaleX: 1.2, scaleY: 0.9, rotation: 37,
  opacity: 0.7, color: "#345678", background: "#abcdef", borderColor: "#789abc",
  fontSize: 28, fontWeight: 600, textAlign: "right", lineHeight: 1.4, letterSpacing: 2,
  animation: "rise", animationDuration: 1.1, animationDelay: 0.2,
});
const handles = ["top-left", "top", "top-right", "right", "bottom-right", "bottom", "bottom-left", "left"];

test("resizing every native handle preserves styling and animation through the design codec", () => {
  for (const handle of handles) {
    const next = resizeNativeVisual(start, handle, 250, 140, 80, 30);
    const persisted = parseNativeVisualTransforms(withNativeVisualTransforms("serein", { "heading:greeting": next }))["heading:greeting"];
    for (const property of Object.keys(start).filter((key) => !["x", "y", "scaleX", "scaleY"].includes(key))) {
      assert.equal(next[property], start[property], `${handle} keeps ${property}`);
      assert.equal(persisted[property], start[property], `${handle} persists ${property}`);
    }
    assert.notDeepEqual(next, start);
  }
});

const anchor = (value, signX, signY, width, height) => {
  const radians = value.rotation * Math.PI / 180;
  const localX = -signX * value.scaleX * width / 2;
  const localY = -signY * value.scaleY * height / 2;
  return {
    x: value.x / 100 * width + localX * Math.cos(radians) - localY * Math.sin(radians),
    y: value.y / 100 * height + localX * Math.sin(radians) + localY * Math.cos(radians),
  };
};

test("all rotated handles keep the opposite edge or corner anchored", () => {
  for (const handle of handles) {
    const signX = handle.includes("left") ? -1 : handle.includes("right") ? 1 : 0;
    const signY = handle.includes("top") ? -1 : handle.includes("bottom") ? 1 : 0;
    const next = resizeNativeVisual(start, handle, 250, 140, 80, 30);
    const before = anchor(start, signX, signY, 250, 140);
    const after = anchor(next, signX, signY, 250, 140);
    assert.ok(Math.abs(before.x - after.x) < 0.03, `${handle} anchors x`);
    assert.ok(Math.abs(before.y - after.y) < 0.03, `${handle} anchors y`);
    if (!signX) assert.equal(next.scaleX, start.scaleX);
    if (!signY) assert.equal(next.scaleY, start.scaleY);
  }
});

test("native resize bounds dimensions and remains consistent across viewport zoom", () => {
  const plain = { ...defaultNativeVisualTransform };
  assert.deepEqual(resizeNativeVisual(plain, "right", 100, 100, 200, 0), { ...plain, x: 100, scaleX: 3 });
  assert.deepEqual(resizeNativeVisual(plain, "left", 100, 100, 200, 0), { ...plain, x: 37.5, scaleX: 0.25 });
  const reference = resizeNativeVisual(start, "bottom-right", 250, 140, 80, 30);
  for (const zoom of [0.1, 0.5, 2, 5]) {
    assert.deepEqual(resizeNativeVisual(start, "bottom-right", 250 * zoom, 140 * zoom, 80 * zoom, 30 * zoom), reference);
  }
});
