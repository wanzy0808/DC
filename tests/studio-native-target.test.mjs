import assert from "node:assert/strict";
import test from "node:test";
import { observeStudioNativeTarget } from "../components/InvitationStudio/studio-native-target.ts";
import { nativeVisualSelector } from "../lib/templates/native-visual-transforms.ts";

function setup(slot = "personOne") {
  const canvas = new EventTarget();
  const windowTarget = new EventTarget();
  const selector = `.undara-studio-preview-surface ${nativeVisualSelector(`photo:${slot}`)}`;
  const nodes = new Map();
  canvas.querySelector = (query) => nodes.get(query) ?? null;
  const frames = new Map();
  const observed = [];
  const measured = [];
  let frameId = 0;
  let resizeCallback, mutationCallback;
  let resizeDisconnects = 0, mutationDisconnects = 0;
  const environment = {
    windowTarget,
    requestFrame(callback) { frames.set(++frameId, callback); return frameId; },
    cancelFrame(id) { frames.delete(id); },
    createResizeObserver(callback) {
      resizeCallback = callback;
      return { observe(node) { observed.push(node); }, disconnect() { resizeDisconnects++; } };
    },
    createMutationObserver(callback) {
      mutationCallback = callback;
      return {
        observe(root, options) { assert.equal(root, canvas); assert.deepEqual(options, { childList: true, subtree: true }); },
        disconnect() { mutationDisconnects++; },
      };
    },
  };
  const stop = observeStudioNativeTarget(canvas, selector, () => measured.push(canvas.querySelector(selector)), environment);
  const flush = () => { const pending = [...frames.values()]; frames.clear(); pending.forEach((callback) => callback()); };
  return {
    canvas, windowTarget, selector, nodes, frames, observed, measured, flush, stop,
    resize: () => resizeCallback(), mutate: () => mutationCallback(),
    disconnects: () => ({ resize: resizeDisconnects, mutation: mutationDisconnects }),
  };
}

test("portrait handles attach when the selected renderer mounts after selection, independently for each partner", () => {
  for (const slot of ["personOne", "personTwo"]) {
    const state = setup(slot);
    state.flush();
    assert.deepEqual(state.measured, [null]);
    const photo = { slot };
    state.nodes.set(state.selector, photo);
    state.mutate();
    state.flush();
    assert.deepEqual(state.observed, [photo]);
    assert.deepEqual(state.measured, [null, photo]);
    state.stop();
  }
});

test("scroll, viewport resize and photo resize coalesce into one measurement per frame", () => {
  const state = setup();
  const photo = { slot: "personOne" };
  state.nodes.set(state.selector, photo);
  state.flush();
  state.canvas.dispatchEvent(new Event("scroll"));
  state.windowTarget.dispatchEvent(new Event("resize"));
  state.resize();
  state.mutate();
  assert.equal(state.frames.size, 1);
  state.flush();
  assert.deepEqual(state.measured, [photo, photo]);
  assert.deepEqual(state.observed, [photo]);
  state.stop();
});

test("removing or replacing a portrait releases the old resize target and reattaches to the new node", () => {
  const state = setup();
  const first = { version: 1 };
  state.nodes.set(state.selector, first);
  state.flush();
  state.nodes.delete(state.selector);
  state.mutate();
  state.flush();
  const second = { version: 2 };
  state.nodes.set(state.selector, second);
  state.mutate();
  state.flush();
  assert.deepEqual(state.observed, [first, second]);
  assert.deepEqual(state.measured, [first, null, second]);
  assert.equal(state.disconnects().resize, 3);
  state.stop();
});

test("closing selection cancels pending measurements and removes all observer/event subscriptions", () => {
  const state = setup();
  assert.equal(state.frames.size, 1);
  state.stop();
  state.canvas.dispatchEvent(new Event("scroll"));
  state.windowTarget.dispatchEvent(new Event("resize"));
  state.resize();
  state.mutate();
  state.flush();
  assert.equal(state.frames.size, 0);
  assert.deepEqual(state.measured, []);
  assert.deepEqual(state.disconnects(), { resize: 1, mutation: 1 });
});
