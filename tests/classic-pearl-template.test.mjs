import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const universal = read("components/PublicInvitation/UniversalInvitationTemplate.tsx");
const scenes = read("components/PublicInvitation/InvitationThemeScenes.tsx");
const scene = read("components/PublicInvitation/ClassicPearlScene.tsx");
const artwork = read("components/PublicInvitation/ClassicPearlArtwork.tsx");
const gallery = read("components/PublicInvitation/ClassicPearlGallery.tsx");
const css = read("components/PublicInvitation/classic-pearl.css");
const motion = read("lib/templates/template-motion.ts");
const catalog = read("lib/templates/catalog.ts");
const design = read("lib/templates/design.ts");

test("Classic Pearl uses dedicated photo-free scenes and heirloom sections", () => {
  assert.match(scenes, /ClassicPearlScene/);
  assert.match(scenes, /theme === "classic-pearl"/);
  assert.doesNotMatch(scenes, /if \(theme === "classic-pearl"\) return <section/);
  assert.doesNotMatch(scenes, /"classic-pearl": \{ backdrop:/);
  assert.match(universal, /classic-pearl-invitation/);
  assert.match(universal, /classic \? "cp-section"/);
  assert.match(universal, /<ClassicPearlSectionArt section=\{keyName\}/);
  assert.match(universal, /<ClassicPearlIdentity/);
  assert.match(universal, /key === "classic-pearl" \? <ClassicPearlGallery/);
  assert.match(catalog, /key: "classic-pearl"[\s\S]*usesPhotos: false[\s\S]*photoSlots: \[\]/);
});

test("Classic Pearl maps all ten local WebP heirloom assets without cropping them", () => {
  for (const asset of [
    "01_ornate_golden_candelabra.webp",
    "02_ivory_victorian_chaise_lounge.webp",
    "03_pearl_crested_baroque_mirror_frame.webp",
    "04_pearl_adorned_perfume_bottle.webp",
    "05_gold_pearl_bridal_tiara.webp",
    "06_crystal_pearl_chandelier.webp",
    "07_bridal_tea_table.webp",
    "08_ivory_gold_wedding_arch.webp",
    "09_ivory_bridal_garland_swag.webp",
    "10_golden_bridal_carriage.webp",
  ]) assert.match(artwork, new RegExp(asset.replace(".", "\\.")));
  assert.match(css, /\.cp-art img \{[^}]*object-fit: contain/);
});

test("Classic Pearl keeps event identity and shared functional engines protected", () => {
  assert.match(scene, /object:cover:date/);
  assert.match(artwork, /object:identity:personOne-name/);
  assert.match(artwork, /object:identity:personTwo-name/);
  assert.match(artwork, /object:identity:personOne-parents/);
  assert.match(artwork, /object:identity:personTwo-parents/);
  assert.match(universal, /classic-pearl[\s\S]{0,800}<RsvpForm[^>]*appearance="zen"/);
  assert.match(universal, /<GuestWishes[\s\S]*classic-pearl[\s\S]*\? "zen" : "default"/);
  assert.match(universal, /data-studio-section-element="location:button"/);
  assert.match(universal, /data-studio-section-element="gift:button"/);
  assert.match(universal, /usesPhotos && gallerySettings\.presentation !== "template"/);
});

test("Classic Pearl replaces generic section icons with its themed object world", () => {
  assert.match(universal, /key !== "botanical-ivory" && key !== "midnight-romance" && key !== "classic-pearl" && <CalendarDays/);
  assert.match(universal, /key !== "botanical-ivory" && key !== "midnight-romance" && key !== "classic-pearl" && <MapPin/);
  assert.match(universal, /key !== "botanical-ivory" && key !== "midnight-romance" && key !== "classic-pearl" && <Gift/);
  assert.match(artwork, /event: "teaTable"/);
  assert.match(artwork, /location: "carriage"/);
  assert.match(artwork, /gift: "perfume"/);
});

test("Classic Pearl registers native motion without animating changing countdown values", () => {
  assert.match(motion, /const classicPearlNative/);
  assert.match(motion, /"classic-pearl": classicPearlNative/);
  const block = motion.slice(motion.indexOf("const classicPearlNative"), motion.indexOf("const midnightRomanceNative"));
  assert.doesNotMatch(block, /object:countdown:[^"]*-value/);
  assert.match(block, /object:cover:arch-art/);
  assert.match(block, /object:identity:mirror-art/);
  assert.match(block, /object:gallery:keepsake-grid/);
  assert.match(css, /@media \(prefers-reduced-motion:reduce\)/);
});

test("Classic Pearl uses its atelier palette and Cormorant editorial pairing", () => {
  assert.match(catalog, /key: "classic-pearl"[\s\S]*preset: \{ layout: "classic", palette: "pearlAtelier", font: "cormorantManrope" \}/);
  assert.match(design, /pearlAtelier: \{ name: "Classic Pearl"/);
  assert.match(design, /cormorantManrope: \{ name: "Cormorant Garamond \+ Manrope"/);
  assert.match(catalog, /photo-free classic atelier/);
});

test("Classic Pearl entrance motion is one-shot and waits for local artwork", () => {
  const nativeHook = read("components/PublicInvitation/use-native-visual-animations.ts");
  const photoHook = read("components/PublicInvitation/use-photo-animations.ts");
  assert.match(nativeHook, /!\["modern-maroon", "garden-light", "midnight-romance", "classic-pearl"\]\.includes\(template\)/);
  assert.match(photoHook, /!\["modern-maroon", "garden-light", "midnight-romance", "classic-pearl"\]\.includes\(theme\?\.template \?\? ""\)/);
  assert.match(nativeHook, /waitForImages:[^\n]*classic-pearl/);
  assert.match(universal, /key === "classic-pearl"[\s\S]{0,300}sectionStyles\.envelope\?\.animation === "none"/);
});

test("Classic Pearl keepsake Gallery stays photo-free and romantic", () => {
  assert.doesNotMatch(gallery, /data-invitation-photo-slot/);
  assert.match(gallery, /Galeri Kenangan/);
  assert.match(gallery, /object:gallery:tiara-art/);
  assert.match(gallery, /object:gallery:perfume-art/);
  assert.match(gallery, /object:gallery:mirror-art/);
  assert.match(gallery, /Yang tetap tinggal/);
  assert.match(gallery, /Yang ingin dikenang/);
  assert.match(gallery, /Yang tumbuh bersama/);
});
