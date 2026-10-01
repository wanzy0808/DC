import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const universal = readFileSync(new URL("../components/PublicInvitation/UniversalInvitationTemplate.tsx", import.meta.url), "utf8");
const scenes = readFileSync(new URL("../components/PublicInvitation/InvitationThemeScenes.tsx", import.meta.url), "utf8");
const motion = readFileSync(new URL("../lib/templates/template-motion.ts", import.meta.url), "utf8");
const catalog = readFileSync(new URL("../lib/templates/catalog.ts", import.meta.url), "utf8");
const css = readFileSync(new URL("../components/PublicInvitation/modern-maroon.css", import.meta.url), "utf8");

test("Modern Maroon uses a dedicated editorial presentation instead of the generic section stack", () => {
  assert.match(universal, /modern-maroon-invitation/);
  assert.match(universal, /mm-section mm-\$\{keyName\}/);
  assert.match(universal, /mm-identity-layout/);
  assert.match(universal, /mm-event-story/);
  assert.match(universal, /mm-date-poster/);
  assert.match(universal, /mm-gallery-grid/);
  assert.match(universal, /mm-countdown-grid/);
  assert.match(universal, /mm-location-card/);
  assert.match(universal, /mm-gift-ticket/);
  assert.match(universal, /mm-closing-copy/);
});

test("Modern Maroon keeps shared data and Studio targets while changing presentation", () => {
  assert.match(universal, /data-invitation-photo-slot=\{slot\}/);
  assert.match(universal, /data-studio-native-object=\{\`object:identity:\$\{slot\}-group\`\}/);
  assert.match(universal, /<RsvpForm[\s\S]*appearance="zen"/);
  assert.match(universal, /<GuestWishes[\s\S]*modern-maroon[\s\S]*\? "zen" : "default"/);
  assert.match(universal, /data-studio-section-element="location:button"/);
  assert.match(universal, /data-studio-section-element="gift:button"/);
});

test("Modern Maroon envelope and Cover are independently art-directed and editable", () => {
  assert.match(scenes, /theme === "modern-maroon"/);
  assert.match(scenes, /object:envelope:block-left/);
  assert.match(scenes, /object:envelope:photo-frame/);
  assert.match(scenes, /object:envelope:copy-panel/);
  assert.match(scenes, /object:cover:block-left/);
  assert.match(scenes, /object:cover:block-right/);
  assert.match(scenes, /object:cover:monogram/);
  assert.match(scenes, /object:cover:media-group/);
  assert.match(scenes, /object:cover:copy-panel/);
  assert.match(scenes, /data-invitation-photo-slot="cover"/);
});

test("Modern Maroon uses the shared ornament asset and its own motion choreography", () => {
  assert.match(css, /branch-05\.webp/);
  assert.match(css, /mm-gallery-item:nth-child/);
  assert.match(universal, /ModernMaroonSectionArt section=\{keyName\}/);
  assert.match(scenes, /\/templates\/modern-maroon\/09_watercolor_bg\.webp/);
  assert.match(scenes, /\/templates\/modern-maroon\/06_gold_curve_lines\.webp/);
  for (const asset of ["01_flower_cascade.webp", "02_flower_cluster.webp", "04_fabric_wave.webp", "05_petal_fall.webp", "06_gold_curve_lines.webp", "08_minimal_divider.webp", "10_leaf_branch.webp"]) {
    assert.match(css + universal + scenes + readFileSync(new URL("../components/PublicInvitation/ModernMaroonArtwork.tsx", import.meta.url), "utf8"), new RegExp(asset.replace(".", "\\.")));
  }
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(motion, /const modernMaroonPhotos/);
  assert.match(motion, /"modern-maroon": modernMaroonPhotos/);
  assert.match(motion, /const modernMaroonNative/);
  assert.match(motion, /"modern-maroon": modernMaroonNative/);
  assert.match(motion, /gallery: \{ animation: "tilt-in"/);
});

test("Modern Maroon preserves Studio palette customization", () => {
  assert.match(universal, /color-mix\(in srgb, var\(--inv-surface\) 78%, var\(--inv-soft\)\)/);
  assert.match(universal, /readableInk\(modernDarkSection \? palette\.bg/);
  assert.match(css, /color: inherit !important/);
});

test("Modern Maroon defaults to its modern type pairing", () => {
  assert.match(catalog, /key: "modern-maroon"[\s\S]*preset: \{ layout: "maroon", palette: "maroon", font: "syneInter" \}/);
  assert.match(catalog, /Editorial maroon asimetris/);
});
