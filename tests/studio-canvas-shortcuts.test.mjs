import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { isStudioCanvasShortcutTarget, resolveStudioHistoryShortcut } from "../components/InvitationStudio/studio-canvas-shortcuts.ts";

const shortcut = (overrides = {}) => resolveStudioHistoryShortcut({
  key: "z", ctrlKey: false, metaKey: false, altKey: false, shiftKey: false,
  defaultPrevented: false, isComposing: false, ...overrides,
});

test("Ctrl/Cmd Z and Shift Z map to the existing design Undo/Redo actions", () => {
  for (const modifier of ["ctrlKey", "metaKey"]) {
    assert.equal(shortcut({ [modifier]: true }), "undo");
    assert.equal(shortcut({ [modifier]: true, shiftKey: true, key: "Z" }), "redo");
  }
});

test("Ctrl Y supports redo while Cmd Y and unrelated browser shortcuts stay native", () => {
  assert.equal(shortcut({ key: "y", ctrlKey: true }), "redo");
  assert.equal(shortcut({ key: "Y", ctrlKey: true }), "redo");
  assert.equal(shortcut({ key: "y", metaKey: true }), null);
  assert.equal(shortcut({ key: "y", ctrlKey: true, shiftKey: true }), null);
  for (const key of ["a", "c", "v", "d", "r", "l", "ArrowLeft", "Escape"]) {
    assert.equal(shortcut({ key, ctrlKey: true }), null);
  }
});

test("plain typing, Alt combinations, IME composition and handled keys cannot trigger history", () => {
  assert.equal(shortcut(), null);
  assert.equal(shortcut({ shiftKey: true, key: "Z" }), null);
  for (const flag of ["altKey", "isComposing", "defaultPrevented"]) {
    assert.equal(shortcut({ ctrlKey: true, [flag]: true }), null);
    assert.equal(shortcut({ metaKey: true, shiftKey: true, [flag]: true }), null);
  }
});

test("mutation shortcuts require a target inside the canvas, even while an object remains selected", () => {
  const target = { closest: () => null };
  const members = new Set([target]);
  const canvas = { contains: (node) => members.has(node) };
  assert.equal(isStudioCanvasShortcutTarget(canvas, target), true);
  const outside = { closest: () => null };
  assert.equal(isStudioCanvasShortcutTarget(canvas, outside), false);
  assert.equal(isStudioCanvasShortcutTarget(null, target), false);
  assert.equal(isStudioCanvasShortcutTarget(canvas, null), false);
  members.delete(target);
  assert.equal(isStudioCanvasShortcutTarget(canvas, target), false);
});

test("native text controls and contenteditable targets inside the canvas keep their own shortcuts", () => {
  let selector;
  const input = { closest: (query) => { selector = query; return input; } };
  const canvas = { contains: () => true };
  assert.equal(isStudioCanvasShortcutTarget(canvas, input), false);
  assert.match(selector, /input, textarea, select/);
  assert.match(selector, /\[contenteditable\]:not\(\[contenteditable="false"\]\)/);
  assert.match(selector, /\[role="textbox"\]/);
});

test("canvas history uses current React actions and clipboard mutation is scoped to its own viewport", () => {
  const source = readFileSync(new URL("../components/InvitationStudio/InvitationDesigner.tsx", import.meta.url), "utf8");
  const handler = source.split("function handleLayerShortcut")[1]?.split('window.addEventListener("keydown"')[0];
  assert.ok(handler);
  assert.match(handler, /isStudioCanvasShortcutTarget\(canvasScrollRef\.current/);
  const scope = handler.indexOf("isStudioCanvasShortcutTarget");
  assert.ok(scope < handler.indexOf("clearCanvasSelection()"));
  assert.ok(scope < handler.indexOf('shortcutKey === "c"'));
  const keydown = source.split('className="undara-studio-canvas-scroll"')[1]?.split("onKeyUp=")[0];
  assert.ok(keydown);
  assert.match(keydown, /isStudioCanvasShortcutTarget\(event\.currentTarget/);
  assert.match(keydown, /window\.getSelection\(\)\?\.toString\(\)/);
  assert.match(keydown, /resolveStudioHistoryShortcut\(event\.nativeEvent\)/);
  assert.match(keydown, /if \(saving \|\| audioBusy\) return;/);
  assert.match(keydown, /historyAction === "undo"\) undo\(\);[\s\S]*else redo\(\);/);
});
