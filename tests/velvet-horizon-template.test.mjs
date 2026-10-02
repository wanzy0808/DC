import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const universal = read("components/PublicInvitation/UniversalInvitationTemplate.tsx");
const scenes = read("components/PublicInvitation/InvitationThemeScenes.tsx");
const scene = read("components/PublicInvitation/VelvetHorizonScene.tsx");
const artwork = read("components/PublicInvitation/VelvetHorizonArtwork.tsx");
const gallery = read("components/PublicInvitation/VelvetHorizonGallery.tsx");
const css = read("components/PublicInvitation/velvet-horizon.css");
const motion = read("lib/templates/template-motion.ts");
const catalog = read("lib/templates/catalog.ts");
const design = read("lib/templates/design.ts");

test("Velvet Horizon stays on the shared 14-section invitation contract", () => {
  assert.match(scenes, /VelvetHorizonScene/);
  assert.match(scenes, /theme === "velvet-horizon"/);
  assert.match(universal, /velvet-horizon-invitation/);
  assert.match(universal, /velvet \? "vh-section"/);
  assert.match(universal, /<VelvetHorizonSectionArt section=\{keyName\}/);
  assert.match(universal, /<VelvetHorizonGallery photos=\{media\.gallery\}/);
  assert.match(catalog, /key: "velvet-horizon"[\s\S]*usesPhotos: true[\s\S]*photoSlots: \["cover", "personOne", "personTwo", "gallery"\]/);
});

test("Velvet Horizon cover keeps one clear three-layer hierarchy", () => {
  assert.match(scene, /data-invitation-photo-slot="cover"/);
  assert.match(scene, /StudioPhotoCropOverlay/);
  assert.match(scene, /object:cover:arch-art/);
  assert.match(scene, /object:cover:drape-art/);
  assert.match(scene, /object:cover:blossom-art/);
  assert.doesNotMatch(scene, /object:cover:sunset-disc-art/);
  assert.doesNotMatch(scene, /object:cover:lantern-art/);
  assert.match(css, /\/\* Cover — three layers: photo, architecture, content\. \*\//);
  assert.match(css, /\.vh-cover-copy \{[\s\S]*?width:min\(62%,350px\)/);
});

test("Velvet Horizon uses only the Mediterranean-compatible borrowed artwork set", () => {
  for (const asset of [
    "04_fabric_wave.webp",
    "10_romantic_lit_wedding_arch.webp",
    "03_romantic_lantern_arrangement.webp",
    "05_vintage_garden_tea_table.webp",
    "08_elegant_garden_fountain.webp",
    "09_ivory_bridal_garland_swag.webp",
  ]) assert.match(artwork, new RegExp(asset.replace(".", "\\.")));

  assert.doesNotMatch(artwork, /01_sakura_branch\.webp|03_ink_mountain_landscape\.webp|06_japanese_cloud_band\.webp|08_red_sun_clouds\.webp/);
  assert.match(artwork, /const sectionAssets:[\s\S]*greeting: "garland"[\s\S]*closing: "arch"/);
  assert.doesNotMatch(artwork, /VelvetHorizonArtworkKey\?/);
});

test("Velvet Horizon gallery is a stable responsive grid instead of overlapping absolute cards", () => {
  assert.match(gallery, /data-invitation-photo-slot="gallery"/);
  assert.match(gallery, /data-studio-photo-id=\{asset\.id\}/);
  assert.match(gallery, /className="vh-gallery-grid"/);
  assert.match(css, /\.vh-gallery-grid \{[\s\S]*display:grid;[\s\S]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css, /\.vh-gallery-card:first-child \{[\s\S]*grid-column:1 \/ -1/);
  assert.doesNotMatch(css, /\.vh-gallery-card-1 \{[^}]*position:absolute/);
});

test("Velvet Horizon keeps restrained motion after the cleanup", () => {
  assert.match(design, /velvetHorizon: \{ name: "Velvet Horizon"/);
  assert.match(catalog, /preset: \{ layout: "editorial", palette: "velvetHorizon", font: "cormorantManrope" \}/);
  assert.match(motion, /const velvetHorizonPhotos/);
  assert.match(motion, /"velvet-horizon": velvetHorizonPhotos/);
  assert.match(motion, /gallery: \{ animation: "rise"/);
  assert.match(motion, /"object:cover:drape-art": \{ animation: "reveal-up"/);
  assert.match(motion, /"object:cover:blossom-art": \{ animation: "fade"/);
  const block = motion.slice(motion.indexOf("const velvetHorizonNative"), motion.indexOf("const zenAtelierNative"));
  assert.doesNotMatch(block, /object:cover:sunset-disc-art|object:cover:lantern-art/);
  assert.doesNotMatch(block, /object:countdown:[^"]*-value/);
  assert.match(css, /@media\(prefers-reduced-motion:reduce\)/);
});

test("Velvet Horizon keeps shared RSVP wishes map and gift engines aligned to one width", () => {
  assert.match(universal, /object:rsvp:form-group/);
  assert.match(universal, /object:wishes:form-group/);
  assert.match(universal, /key === "velvet-horizon" \? "vh-action"/);
  assert.match(universal, /data-studio-section-element="location:button"/);
  assert.match(universal, /data-studio-section-element="gift:button"/);
  assert.match(css, /object:rsvp:form-group[\s\S]*object:wishes:form-group[\s\S]*max-width:410px/);
});
