import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { templateHasDefaultMotion, templateNativeMotion, templatePhotoMotion, templateNativeMotionForKey } from "../lib/templates/template-motion.ts";
import { invitationTemplates } from "../lib/templates/catalog.ts";
import { defaultPhotoAssignments, withPhotoAssignments, parsePhotoAssignments } from "../lib/templates/photo-slots.ts";
import { defaultNativeVisualTransform, withNativeVisualTransforms, parseNativeVisualTransforms } from "../lib/templates/native-visual-transforms.ts";
import { observeInvitationEntrances, observeInvitationEntranceRoot } from "../components/PublicInvitation/entrance-animation-runtime.ts";
import { observePhotoParallax } from "../components/PublicInvitation/photo-parallax-runtime.ts";

test("photo parallax OFF survives saving and reload over an active theme default", () => {
  for (const template of ["romantic-rose", "modern-maroon", "midnight-romance", "zen-atelier"]) {
    const defaults = templatePhotoMotion(template).gallery;
    assert.ok(defaults.parallax > 0);
    const assignments = { ...defaultPhotoAssignments(), motion: { gallery: { ...defaults, parallax: 0 } } };
    const restored = parsePhotoAssignments(withPhotoAssignments(template, assignments));
    assert.equal(restored.motion.gallery.parallax, 0);
    assert.equal(templatePhotoMotion(template, restored.motion).gallery.parallax, 0);
    assert.ok(templatePhotoMotion(template, {}).gallery.parallax > 0, "Reset restores the theme value");
  }
  for (const parallax of [NaN, Infinity, "0"]) {
    const restored = parsePhotoAssignments(withPhotoAssignments("romantic-rose", {
      ...defaultPhotoAssignments(), motion: { gallery: { animation: "fade", parallax } },
    }));
    assert.equal(restored.motion.gallery.parallax, undefined, "Malformed values must not become an OFF override");
  }
});

test("theme parallax defaults produce visible pixel movement and clean up without altering frame transforms", (t) => {
  environment(t);
  const frames = [];
  Object.assign(globalThis.window, {
    innerHeight: 800,
    requestAnimationFrame(callback) { frames.push(callback); return frames.length; },
    cancelAnimationFrame() {}, addEventListener() {}, removeEventListener() {},
  });
  for (const template of ["romantic-rose", "modern-maroon", "midnight-romance", "zen-atelier"]) {
    const strength = templatePhotoMotion(template).gallery.parallax;
    const node = { style: { translate: "0 7px", transform: "rotate(12deg)" },
      closest: () => null, getBoundingClientRect: () => ({ top: 100, width: 100, height: 100 }) };
    const stop = observePhotoParallax([{ node, strength }]);
    frames.at(-1)();
    const offset = parseFloat(node.style.translate.split(" ")[1]);
    assert.ok(offset > 0 && offset <= strength && strength <= 20, `${template} must move within its pixel budget`);
    assert.equal(node.style.transform, "rotate(12deg)");
    stop();
    assert.equal(node.style.translate, "0 7px");
  }
});

test("Serein defaults use opposite portrait entrances and persisted photo OFF wins after reload", () => {
  const defaults = templatePhotoMotion("serein");
  assert.equal(defaults.personOne.animation, "glide-left");
  assert.equal(defaults.personTwo.animation, "glide-right");
  const assignments = { ...defaultPhotoAssignments(), motion: { cover: { animation: "none" }, personOne: { animation: "zoom" } } };
  const stored = withPhotoAssignments("serein::serein::crimsonDmSans", assignments);
  const resolved = templatePhotoMotion("serein", parsePhotoAssignments(stored).motion);
  assert.equal(resolved.cover.animation, "none");
  assert.equal(resolved.personOne.animation, "zoom");
  assert.equal(templatePhotoMotion("serein", {}).cover.animation, "reveal-left", "Reset returns to the theme default");
  assert.equal(templatePhotoMotion("romantic-rose").personOne.animation, "glide-left", "Romantic Rose now participates in the shared photo choreography");
  assert.deepEqual(templatePhotoMotion("classic-pearl"), {}, "Photo-free themes acquire no photo defaults");
});

test("every active template carries motion beyond the cover through the final sections", () => {
  const requiredSections = ["greeting", "identity", "event", "dateTime", "gallery", "countdown", "location", "rsvp", "wishes", "gift", "closing"];
  for (const template of invitationTemplates) {
    assert.equal(templateHasDefaultMotion(template.key), true, `${template.key} must own default motion`);
    const motion = templateNativeMotion(template.key);
    for (const section of requiredSections) {
      assert.ok(motion[`heading:${section}`], `${template.key} is missing ${section} heading motion`);
    }
    for (const key of ["object:rsvp:form-group", "object:wishes:form-group"]) {
      assert.ok(motion[key], `${template.key} is missing shared continuation target ${key}`);
    }
  }
  const sectionHook = readFileSync(new URL("../components/PublicInvitation/use-section-animations.ts", import.meta.url), "utf8");
  assert.match(sectionHook, /key === "footer" \? "fade"/, "Footer keeps a final one-shot entrance without wrapping themed footer layouts");
});

test("section OFF and authored timelines suppress photo defaults while explicit photo choices remain authoritative", () => {
  for (const style of [{ animation: "none" }, { timeline: "editorial-sequence" }, { animation: "fade" }]) {
    const resolved = templatePhotoMotion("serein", {}, { identity: style });
    assert.equal(resolved.personOne.animation, undefined);
    assert.equal(resolved.personTwo.animation, undefined);
    assert.equal(templatePhotoMotion("serein", { personOne: { animation: "zoom" } }, { identity: style }).personOne.animation, "zoom");
  }
});

test("native OFF survives design serialization and instance defaults keep the same art direction", () => {
  const key = "object:cover:personOne-name:cover-copy";
  assert.equal(templateNativeMotionForKey("serein", key).animation, "slide-left");
  assert.equal(templateNativeMotionForKey("serein", key, { cover: { animation: "none" } }), undefined);
  const stored = withNativeVisualTransforms("serein", { [key]: { ...defaultNativeVisualTransform, animation: "none" } });
  assert.equal(parseNativeVisualTransforms(stored)[key].animation, "none");
});

function environment(t, reduced = false) {
  const prior = Object.fromEntries(["window", "IntersectionObserver", "MutationObserver"].map((key) => [key, globalThis[key]]));
  const intersections = [], mutations = [];
  class Intersection {
    nodes = new Set();
    constructor(callback) { this.callback = callback; intersections.push(this); }
    observe(node) { this.nodes.add(node); }
    unobserve(node) { this.nodes.delete(node); }
    disconnect() { this.nodes.clear(); }
    emit(node, visible) { this.callback([{ target: node, isIntersecting: visible, intersectionRatio: visible ? 1 : 0 }]); }
  }
  class Mutation {
    constructor(callback) { this.callback = callback; mutations.push(this); }
    observe() {}
    disconnect() { this.stopped = true; }
  }
  globalThis.IntersectionObserver = Intersection;
  globalThis.MutationObserver = Mutation;
  globalThis.window = { IntersectionObserver: Intersection, matchMedia: () => ({ matches: reduced }), getComputedStyle: () => ({ transform: "matrix(1, 0, 0, 1, 8, 0)", opacity: ".6" }) };
  t.after(() => { for (const [key, value] of Object.entries(prior)) { if (value === undefined) delete globalThis[key]; else globalThis[key] = value; } });
  return { intersections, mutations };
}

function element() {
  const listeners = new Map();
  return {
    calls: [],
    querySelectorAll() { return []; },
    addEventListener(type, callback) { listeners.set(type, callback); },
    removeEventListener(type) { listeners.delete(type); },
    replay() { listeners.get("invitation-replay-motion")?.({ currentTarget: this }); },
    animate(frames, options) {
      const result = { frames, options, cancelled: false, finished: new Promise(() => {}), cancel() { this.cancelled = true; } };
      this.calls.push(result);
      return result;
    },
  };
}

test("lazy gallery nodes register once, replay after leaving viewport, and clean up on unmount", (t) => {
  const { intersections, mutations } = environment(t);
  const nodes = [];
  const root = { contains: (node) => nodes.includes(node) };
  const stop = observeInvitationEntranceRoot(root, () => nodes.map((node) => ({ node, animation: "slide-left" })), { replay: true });
  assert.equal(intersections.length, 0);
  const photo = element(); nodes.push(photo);
  mutations[0].callback([{ addedNodes: [{ nodeType: 1 }], removedNodes: [] }]);
  assert.equal(intersections.length, 1);
  intersections[0].emit(photo, true);
  assert.equal(photo.calls.length, 1);
  mutations[0].callback([{ addedNodes: [{ nodeType: 1 }], removedNodes: [] }]);
  assert.equal(intersections.length, 1, "No duplicate observers on subsequent gallery renders");
  intersections[0].emit(photo, false); intersections[0].emit(photo, true);
  assert.equal(photo.calls.length, 2);
  stop();
  assert.ok(photo.calls.every((call) => call.cancelled));
  assert.ok(mutations[0].stopped);
});

test("Studio replay remains usable and motion preserves saved transforms/opacity", (t) => {
  const { intersections } = environment(t);
  const photo = element();
  const stop = observeInvitationEntrances([{ node: photo, animation: "slide-right" }], .14, { preservePresentation: true });
  intersections[0].emit(photo, true);
  assert.ok(photo.calls[0].frames[0].transform.startsWith("matrix(1, 0, 0, 1, 8, 0)"));
  assert.equal(photo.calls[0].frames.at(-1).opacity, .6);
  photo.replay();
  assert.equal(photo.calls.length, 2);
  assert.equal(photo.calls[0].cancelled, true);
  stop(); photo.replay();
  assert.equal(photo.calls.length, 2, "Replay listener is removed on cleanup");
});

test("lazy photo motion waits for the image, cancels its wait offscreen and plays on return", (t) => {
  const { intersections } = environment(t);
  const image = element();
  image.complete = false;
  const listeners = new Map();
  image.addEventListener = (type, callback) => listeners.set(type, callback);
  image.removeEventListener = (type) => listeners.delete(type);
  const photo = element();
  photo.querySelectorAll = () => [image];
  const stop = observeInvitationEntrances([{ node: photo, animation: "glide-left" }], .14, { replay: true, waitForImages: true });
  intersections[0].emit(photo, true);
  assert.equal(photo.calls.length, 0, "No entrance runs on an empty image frame");
  assert.ok(listeners.has("load"));
  intersections[0].emit(photo, false);
  assert.equal(listeners.size, 0, "An offscreen image does not trigger a late entrance");
  image.complete = true;
  intersections[0].emit(photo, true);
  assert.equal(photo.calls.length, 1);
  stop();
});

test("loaded photo enters immediately and pending load listeners are removed on cleanup", (t) => {
  const { intersections } = environment(t);
  const listeners = new Map();
  const image = { complete: false, addEventListener: (type, callback) => listeners.set(type, callback), removeEventListener: (type) => listeners.delete(type) };
  const photo = element();
  photo.querySelectorAll = () => [image];
  const stop = observeInvitationEntrances([{ node: photo, animation: "rise" }], .14, { replay: true, waitForImages: true });
  intersections[0].emit(photo, true);
  const loaded = listeners.get("load");
  image.complete = true; loaded();
  assert.equal(photo.calls.length, 1);
  assert.equal(listeners.size, 0);
  intersections[0].emit(photo, false);
  image.complete = false;
  intersections[0].emit(photo, true);
  assert.ok(listeners.has("load"));
  stop();
  assert.equal(listeners.size, 0);
});

test("reduced motion leaves lazy content visible without observers or moving effects", (t) => {
  const { intersections, mutations } = environment(t, true);
  const photo = element();
  const stop = observeInvitationEntranceRoot({ contains: () => true }, () => [{ node: photo, animation: "glide-left" }]);
  assert.equal(photo.calls.length, 0);
  assert.equal(intersections.length, 0);
  assert.equal(mutations.length, 0);
  stop();
});
