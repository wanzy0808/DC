import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const universal = read("components/PublicInvitation/UniversalInvitationTemplate.tsx");
const scenes = read("components/PublicInvitation/InvitationThemeScenes.tsx");
const scene = read("components/PublicInvitation/CelestialInkScene.tsx");
const artwork = read("components/PublicInvitation/CelestialInkArtwork.tsx");
const gallery = read("components/PublicInvitation/CelestialInkGallery.tsx");
const css = read("components/PublicInvitation/celestial-ink.css");
const motion = read("lib/templates/template-motion.ts");
const catalog = read("lib/templates/catalog.ts");

test("Celestial Ink owns dedicated photo-free scene and section world", () => {
  assert.match(scenes, /CelestialInkScene/);
  assert.match(scenes, /theme === "celestial-ink"/);
  assert.match(universal, /celestial-ink-invitation/);
  assert.match(universal, /celestial \? "ci-section"/);
  assert.match(universal, /<CelestialInkSectionArt section=\{keyName\}/);
  assert.match(universal, /<CelestialInkIdentity/);
  assert.match(universal, /key === "celestial-ink" \? <CelestialInkGallery/);
  assert.match(catalog, /key: "celestial-ink"[\s\S]*usesPhotos: false[\s\S]*photoSlots: \[\]/);
});

test("Celestial Ink cover is an asymmetric moonlit ceremonial pavilion", () => {
  for (const marker of [
    "object:cover:drapery-art",
    "object:cover:screen-art",
    "object:cover:moon-gate-art",
    "object:cover:lantern-art",
    "object:cover:copy-panel",
    "object:cover:date",
  ]) assert.match(scene, new RegExp(marker));
  assert.doesNotMatch(scene, /object:cover:photo-frame/);
  assert.match(css, /\.ci-cover-copy \{[^}]*width:min\(68%,360px\);[^}]*text-align:left;/);
  assert.match(css, /\.ci-cover-moon-gate \{[^}]*right:-12%;[^}]*width:78%;/);
  assert.match(css, /\.ci-cover-screen \{[^}]*left:-18%;[^}]*width:63%;/);
});

test("Celestial Ink maps all ten props and preserves full artwork", () => {
  for (const asset of [
    "01_celestial_lantern_pillars.webp",
    "02_celestial_tea_ceremony.webp",
    "03_celestial_gramophone_music_box.webp",
    "04_celestial_drapery_header.webp",
    "05_celestial_calligraphy_set.webp",
    "06_celestial_hanging_lantern.webp",
    "07_celestial_mirror_frame.webp",
    "08_celestial_folding_screen.webp",
    "09_celestial_chaise_lounge.webp",
    "10_celestial_moon_gate.webp",
  ]) assert.match(artwork, new RegExp(asset.replace(".", "\\.")));
  assert.match(css, /\.ci-art img \{[^}]*object-fit: contain/);
});

test("Celestial Ink gallery stays photo-free and editorial", () => {
  assert.doesNotMatch(gallery, /data-invitation-photo-slot/);
  assert.match(gallery, /object:gallery:toast-group/);
  assert.match(gallery, /object:gallery:rhythm-group/);
  assert.match(gallery, /object:gallery:reflection-group/);
  assert.match(gallery, /object:gallery:tea-art/);
  assert.match(gallery, /object:gallery:gramophone-art/);
  assert.match(gallery, /object:gallery:mirror-art/);
});

test("Celestial Ink motion is restrained and never animates countdown values", () => {
  assert.match(motion, /const celestialInkNative/);
  assert.match(motion, /"celestial-ink": celestialInkNative/);
  const block = motion.slice(motion.indexOf("const celestialInkNative"), motion.indexOf("const zenAtelierNative"));
  assert.doesNotMatch(block, /object:countdown:[^"]*-value/);
  assert.match(block, /"object:cover:moon-gate-art": \{ animation: "glide-right"/);
  assert.match(block, /"object:cover:screen-art": \{ animation: "glide-left"/);
  assert.match(block, /"object:gallery:toast-group": \{ animation: "tilt-in"/);
  assert.match(css, /@media \(prefers-reduced-motion:reduce\)/);
});

test("Celestial Ink catalog describes the redesigned night theatre", () => {
  assert.match(catalog, /moonlit ceremonial pavilion|paviliun seremoni malam/);
  assert.match(catalog, /previewImage: "\/templates\/celestial-ink\/10_celestial_moon_gate\.webp"/);
});
