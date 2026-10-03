import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { bindStudioCanvasPanLifecycle, createStudioCanvasPan } from "../components/InvitationStudio/studio-canvas-pan.ts";

const point = (pointerId = 1, clientX = 100, clientY = 100) => ({ pointerId, clientX, clientY });
function fixture() {
  const states = [];
  const captured = new Set();
  const node = {
    scrollLeft: 100, scrollTop: 200,
    setPointerCapture(id) { captured.add(id); },
    hasPointerCapture(id) { return captured.has(id); },
    releasePointerCapture(id) { captured.delete(id); },
  };
  return { pan: createStudioCanvasPan((state) => states.push(state)), node, captured, states };
}
function lifecycleFixture() {
  const result = fixture();
  const windowTarget = new EventTarget();
  const documentTarget = Object.assign(new EventTarget(), { hidden: false });
  const readiness = [];
  const dispose = bindStudioCanvasPanLifecycle(result.pan, (ready) => readiness.push(ready), windowTarget, documentTarget);
  return { ...result, windowTarget, documentTarget, readiness, dispose };
}
const keyup = (code) => Object.assign(new Event("keyup"), { code });

test("a background tap keeps its original section target and does not pan on pointer jitter", () => {
  const { pan, node, captured, states } = fixture();
  assert.equal(pan.begin(point(), node, false), true);
  assert.equal(captured.size, 0);
  assert.equal(pan.move(point(1, 102, 101)), false);
  assert.equal(captured.size, 0);
  assert.equal(node.scrollLeft, 100);
  assert.equal(node.scrollTop, 200);
  pan.end(1);
  assert.deepEqual(states, []);
  assert.equal(pan.consumeSuppressedClick(), false);
});

test("background drag captures only after the threshold and suppresses only that drag's click", () => {
  const { pan, node, captured, states } = fixture();
  pan.begin(point(), node, false);
  assert.equal(pan.begin(point(2), node, false), false);
  assert.equal(pan.move(point(2, 140, 150)), false);
  assert.equal(pan.move(point(1, 103, 100)), false);
  assert.equal(captured.size, 0);
  assert.equal(pan.move(point(1, 104, 110)), true);
  assert.deepEqual([...captured], [1]);
  assert.deepEqual(states, [true]);
  assert.equal(node.scrollLeft, 96);
  assert.equal(node.scrollTop, 190);
  pan.end(1);
  assert.equal(captured.size, 0);
  assert.deepEqual(states, [true, false]);
  assert.equal(pan.consumeSuppressedClick(), true);
  assert.equal(pan.consumeSuppressedClick(), false);
});

test("cancelling a pending background tap does not leave a capture or swallow the next click", () => {
  const { pan, node, windowTarget, captured, states, dispose } = lifecycleFixture();
  pan.begin(point(), node, false);
  windowTarget.dispatchEvent(new Event("blur"));
  assert.equal(captured.size, 0);
  assert.deepEqual(states, []);
  assert.equal(pan.begin(point(2), node, false), true);
  pan.end(2);
  assert.equal(pan.consumeSuppressedClick(), false);
  dispose();
});

test("release outside the canvas clears a pending background gesture and listeners are removed on unmount", () => {
  const { pan, node, windowTarget, captured, states, dispose } = lifecycleFixture();
  pan.begin(point(), node, false);
  windowTarget.dispatchEvent(Object.assign(new Event("pointerup"), { pointerId: 1 }));
  assert.equal(pan.begin(point(2), node, false), true);
  windowTarget.dispatchEvent(Object.assign(new Event("pointercancel"), { pointerId: 2 }));
  assert.equal(captured.size, 0);
  assert.deepEqual(states, []);
  assert.equal(pan.consumeSuppressedClick(), false);
  dispose();
  pan.begin(point(3), node, false);
  windowTarget.dispatchEvent(Object.assign(new Event("pointerup"), { pointerId: 3 }));
  assert.equal(pan.begin(point(4), node, false), false);
  pan.cancel();
});

test("pan moves both axes from the initial viewport without depending on canvas zoom", () => {
  const { pan, node, captured, states } = fixture();
  assert.equal(pan.begin(point(), node), true);
  pan.move(point(1, 125, 75));
  assert.equal(node.scrollLeft, 75);
  assert.equal(node.scrollTop, 225);
  pan.move(point(1, 90, 120));
  assert.equal(node.scrollLeft, 110);
  assert.equal(node.scrollTop, 180);
  pan.end(1);
  assert.equal(captured.size, 0);
  assert.deepEqual(states, [true, false]);
});

test("a second pointer cannot replace, move or end the active pan", () => {
  const { pan, node, captured, states } = fixture();
  pan.begin(point(), node);
  assert.equal(pan.begin(point(2, 500, 500), node), false);
  pan.move(point(2, 550, 550));
  pan.end(2);
  pan.cancel(2);
  assert.equal(node.scrollLeft, 100);
  assert.equal(node.scrollTop, 200);
  assert.deepEqual([...captured], [1]);
  assert.deepEqual(states, [true]);
  pan.move(point(1, 125, 125));
  assert.equal(node.scrollLeft, 75);
  pan.end(1);
  assert.deepEqual(states, [true, false]);
});

test("only a completed drag suppresses its following click, once", () => {
  const { pan, node } = fixture();
  pan.begin(point(), node);
  pan.move(point(1, 102, 101));
  pan.end(1);
  assert.equal(pan.consumeSuppressedClick(), false);
  pan.begin(point(), node);
  pan.move(point(1, 104, 100));
  pan.end(1);
  assert.equal(pan.consumeSuppressedClick(), true);
  assert.equal(pan.consumeSuppressedClick(), false);
});

test("cancel and a new pointer gesture never swallow the next selection click", () => {
  const { pan, node, captured } = fixture();
  pan.begin(point(), node);
  pan.move(point(1, 125, 125));
  pan.cancel(1);
  assert.equal(captured.size, 0);
  assert.equal(pan.consumeSuppressedClick(), false);
  pan.begin(point(), node);
  pan.move(point(1, 125, 125));
  pan.end(1);
  pan.clearSuppressedClick();
  assert.equal(pan.consumeSuppressedClick(), false);
});

test("lost pointer capture cancels cleanly even when the browser already released it", () => {
  const { pan, node, captured, states } = fixture();
  pan.begin(point(), node);
  captured.clear();
  pan.cancel(1);
  pan.cancel(1);
  assert.deepEqual(states, [true, false]);
  assert.equal(pan.begin(point(2), node), true);
  pan.end(2);
});

test("Space released outside the canvas clears pan readiness without breaking an active drag", () => {
  const { pan, node, windowTarget, readiness, states, dispose } = lifecycleFixture();
  pan.begin(point(), node);
  windowTarget.dispatchEvent(keyup("KeyA"));
  assert.deepEqual(readiness, []);
  windowTarget.dispatchEvent(keyup("Space"));
  assert.deepEqual(readiness, [false]);
  assert.deepEqual(states, [true]);
  pan.move(point(1, 125, 125));
  assert.equal(node.scrollLeft, 75);
  pan.end(1);
  dispose();
});

test("window blur clears Space mode and releases an interrupted pan", () => {
  const { pan, node, windowTarget, readiness, captured, states, dispose } = lifecycleFixture();
  pan.begin(point(), node);
  pan.move(point(1, 125, 125));
  windowTarget.dispatchEvent(new Event("blur"));
  assert.deepEqual(readiness, [false]);
  assert.deepEqual(states, [true, false]);
  assert.equal(captured.size, 0);
  assert.equal(pan.consumeSuppressedClick(), false);
  assert.equal(pan.begin(point(2), node), true);
  dispose();
});

test("tab hidden and unmount stop pan and remove lifecycle listeners", () => {
  const { pan, node, windowTarget, documentTarget, readiness, captured, states, dispose } = lifecycleFixture();
  pan.begin(point(), node);
  documentTarget.dispatchEvent(new Event("visibilitychange"));
  assert.deepEqual(states, [true]);
  documentTarget.hidden = true;
  documentTarget.dispatchEvent(new Event("visibilitychange"));
  assert.deepEqual(readiness, [false]);
  assert.equal(captured.size, 0);
  pan.begin(point(2), node);
  dispose();
  assert.deepEqual(states, [true, false, true, false]);
  assert.equal(captured.size, 0);
  windowTarget.dispatchEvent(keyup("Space"));
  windowTarget.dispatchEvent(new Event("blur"));
  documentTarget.dispatchEvent(new Event("visibilitychange"));
  assert.deepEqual(readiness, [false]);
});

test("canvas wires cancellation and keeps Space available to Amplop/Isi buttons", () => {
  const source = readFileSync(new URL("../components/InvitationStudio/InvitationDesigner.tsx", import.meta.url), "utf8");
  const canvas = source.split('className="undara-studio-canvas-scroll"')[1]?.split('className="undara-studio-canvas-layout"')[0];
  assert.ok(canvas);
  assert.match(canvas, /onKeyDown=[\s\S]*target\.closest\('button, a, input/);
  assert.match(canvas, /onBlur=[\s\S]*!event\.currentTarget\.contains\(event\.relatedTarget as Node\)/);
  assert.match(canvas, /onPointerCancel=\{\(event\) => \{ cancelCanvasPan\(event\.pointerId\)/);
  assert.match(canvas, /onLostPointerCapture=\{\(event\) => cancelCanvasPan\(event\.pointerId\)/);
});
