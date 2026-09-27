import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  sanitizeNativeVisualTransforms, parseNativeVisualTransforms,
  withNativeVisualTransforms, nativeVisualStyleSheet, nativeVisualScopeClass, nativeVisualSelector,
} from "../lib/templates/native-visual-transforms.ts";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("built-in transforms round-trip without changing invitation data", () => {
  const base = "botanical-ivory::pearl::cinzelFauna";
  const transform = { x: 25, y: -10, scaleX: 1.4, scaleY: 0.8, rotation: 32 };
  const key = withNativeVisualTransforms(base, {
    "copy:greeting": transform,
    "heading:envelope": { ...transform, rotation: -15 },
  });
  assert.deepEqual(parseNativeVisualTransforms(key)["copy:greeting"], transform);
  assert.equal(withNativeVisualTransforms(key, {}), base);
  assert.equal(key.split("::").filter((part) => part.startsWith("nativeVisuals=")).length, 1);
  assert.match(nativeVisualStyleSheet(key), /translate:25% -10%;rotate:32deg;scale:1.4 0.8/);
  assert.match(nativeVisualStyleSheet(key), new RegExp(nativeVisualScopeClass(key)));
});

test("built-in transform codec rejects arbitrary CSS keys and bounds geometry", () => {
  const values = sanitizeNativeVisualTransforms({
    "copy:greeting": { x: 900, y: -900, scaleX: 99, scaleY: 0, rotation: 500 },
    "copy:greeting\"}{color:red}": { x: 10, y: 10, scaleX: 1, scaleY: 1, rotation: 0 },
    "element:gift:button": { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
  });
  assert.deepEqual(values, {
    "copy:greeting": { x: 150, y: -150, scaleX: 3, scaleY: 0.25, rotation: 180 },
  });
  assert.doesNotMatch(nativeVisualStyleSheet(withNativeVisualTransforms("rose", values)), /color:red/);
  assert.deepEqual(parseNativeVisualTransforms("rose::nativeVisuals=%BAD"), {});
});

test("Studio and public renderers share the built-in transform contract", () => {
  const designer = read("components/InvitationStudio/InvitationDesigner.tsx");
  const universal = read("components/PublicInvitation/UniversalInvitationTemplate.tsx");
  const rose = read("components/PublicInvitation/RomanticRoseTemplate.tsx");
  const handles = read("components/InvitationStudio/StudioNativeTransformHandles.tsx");
  assert.match(designer, /<StudioNativeTransformHandles/);
  assert.match(designer, /change\(\{ nativeVisuals: next \}\)/);
  for (const renderer of [universal, rose]) {
    assert.match(renderer, /nativeVisualScopeClass\(activeDesignKey\)/);
    assert.match(renderer, /nativeVisualStyleSheet\(activeDesignKey\)/);
  }
  assert.match(handles, /onPointerDown=\{\(event\) => begin\(event, "rotate"\)\}/);
  assert.match(handles, /onPointerDown=\{\(event\) => begin\(event, handle\)\}/);
});


test("envelope and content photo transforms have separate targets", () => {
  assert.equal(nativeVisualSelector("photo:envelope:cover"),
    '[data-invitation-section="envelope"] [data-invitation-photo-slot="cover"]');
  assert.equal(nativeVisualSelector("photo:cover"),
    '[data-invitation-section="cover"] [data-invitation-photo-slot="cover"]');
  assert.equal(nativeVisualSelector("heading:cover"),
    '[data-invitation-section="cover"] [data-studio-native-heading]');
  assert.equal(nativeVisualSelector("script:arbitrary"), null);
});


test("gallery visuals are keyed by one safe photo ID", () => {
  assert.equal(nativeVisualSelector("photo:gallery:photo_123"),
    '[data-invitation-photo-slot="gallery"][data-studio-photo-id="photo_123"]');
  assert.equal(nativeVisualSelector('photo:gallery:x"]{color:red}'), null);
  const design = withNativeVisualTransforms("botanical-ivory", {
    "photo:gallery:photo_123": { x: 8, y: 4, scaleX: 1.2, scaleY: 1, rotation: 3 },
  });
  assert.equal(parseNativeVisualTransforms(design)["photo:gallery:photo_123"].x, 8);
  assert.match(read("components/PublicInvitation/UniversalInvitationTemplate.tsx"), /data-studio-photo-id=\{asset\.id\}/);
  assert.match(read("components/PublicInvitation/RomanticRoseTemplate.tsx"), /data-studio-photo-id=\{photo\.id\}/);
});
