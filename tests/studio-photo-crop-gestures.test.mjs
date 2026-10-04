import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import ts from "typescript";

const loadDependency = createRequire(import.meta.url);
const source = readFileSync(new URL("../components/InvitationStudio/StudioPhotoCropOverlay.tsx", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
}).outputText;

// Run the real pointer/zoom handlers; DOM geometry and hook scheduling are fixtures.
function cropHarness(initialCrop) {
  const refs = [];
  const states = [];
  const effects = [];
  const updates = [];
  const image = { style: {} };
  const frame = {
    closest: () => null,
    getBoundingClientRect: () => ({ width: 200, height: 300 }),
    setPointerCapture() {},
    parentElement: { querySelector: () => image },
  };
  let refIndex = 0, stateIndex = 0, effectIndex = 0;
  let pending = [];
  const react = {
    ...loadDependency("react"),
    useRef(value) {
      const index = refIndex++;
      return refs[index] ??= { current: value };
    },
    useState(value) {
      const index = stateIndex++;
      if (!(index in states)) states[index] = value;
      return [states[index], (next) => { states[index] = next; }];
    },
    useEffect(callback, deps) {
      const index = effectIndex++;
      if (!effects[index] || deps.some((value, part) => !Object.is(value, effects[index][part]))) {
        effects[index] = deps;
        pending.push(callback);
      }
    },
  };
  const overlayModule = { exports: {} };
  new Function("require", "module", "exports", compiled)(
    (name) => name === "react" ? react : loadDependency(name), overlayModule, overlayModule.exports,
  );
  let crop = initialCrop;
  let tree;
  function render(next = crop) {
    crop = next;
    refIndex = stateIndex = effectIndex = 0;
    pending = [];
    tree = overlayModule.exports.default({ crop, onChange: (value) => updates.push(value), onDone() {} });
    refs[0].current = frame;
    pending.forEach((callback) => callback());
    return tree;
  }
  function buttons(node) {
    if (Array.isArray(node)) return node.flatMap((child) => buttons(child));
    if (!node?.props) return [];
    return [...(node.type === "button" ? [node] : []), ...buttons(node.props.children)];
  }
  render();
  return {
    render, updates, image,
    get props() { return tree.props; },
    button: (label) => buttons(tree).find((button) => button.props["aria-label"] === label)?.props,
    event: (values = {}) => ({ button: 0, pointerId: 1, clientX: 0, clientY: 0,
      currentTarget: frame, preventDefault() {}, stopPropagation() {}, ...values }),
  };
}

test("crop drag retains aspect and zoom, ignores a second pointer and commits one change", () => {
  const crop = { x: 50, y: 50, zoom: 1.75, aspect: "4:5" };
  const h = cropHarness(crop);
  h.props.onPointerDown(h.event());
  h.props.onPointerDown(h.event({ pointerId: 2 }));
  h.props.onPointerMove(h.event({ pointerId: 2, clientX: 100 }));
  h.props.onPointerMove(h.event({ clientX: 40, clientY: -30 }));
  assert.equal(h.image.style.objectPosition, "30% 60%");
  assert.equal(h.image.style.transform, "scale(1.75)");
  assert.equal(h.updates.length, 0);
  h.props.onPointerUp(h.event());
  assert.deepEqual(h.updates, [{ x: 30, y: 60, zoom: 1.75, aspect: "4:5" }]);
  assert.deepEqual(crop, { x: 50, y: 50, zoom: 1.75, aspect: "4:5" });
});

test("losing crop pointer capture restores the saved preview without committing the cancelled drag", () => {
  const h = cropHarness({ x: 40, y: 70, zoom: 1.5, aspect: "16:9" });
  h.props.onPointerDown(h.event());
  h.props.onPointerMove(h.event({ clientX: 300, clientY: -300 }));
  assert.equal(h.image.style.objectPosition, "0% 100%");
  h.props.onLostPointerCapture(h.event());
  assert.equal(h.image.style.objectPosition, "40% 70%");
  h.props.onPointerUp(h.event());
  assert.equal(h.updates.length, 0);
});

test("changing only the crop ratio updates the next zoom operation", () => {
  const crop = { x: 50, y: 50, zoom: 1.75, aspect: "4:5" };
  const h = cropHarness(crop);
  h.render({ ...crop, aspect: "16:9" });
  h.render();
  h.button("Perbesar foto").onClick(h.event());
  assert.deepEqual(h.updates, [{ x: 50, y: 50, zoom: 1.85, aspect: "16:9" }]);
});

test("photo zoom preserves slider precision and stops at its bounds without extra history changes", () => {
  const h = cropHarness({ x: 50, y: 50, zoom: 1.05 });
  h.button("Perbesar foto").onClick(h.event());
  assert.equal(h.updates[0].zoom, 1.15);
  for (const [zoom, label] of [[1, "Perkecil foto"], [3, "Perbesar foto"]]) {
    const bounded = cropHarness({ x: 50, y: 50, zoom, aspect: "original" });
    assert.equal(bounded.button(label).disabled, true);
    bounded.button(label).onClick(bounded.event());
    assert.equal(bounded.updates.length, 0);
  }
});
