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

test("Velvet Horizon is a dedicated 14-section romantic editorial theme", () => {
  assert.match(scenes, /VelvetHorizonScene/);
  assert.match(scenes, /theme === "velvet-horizon"/);
  assert.match(universal, /velvet-horizon-invitation/);
  assert.match(universal, /velvet \? "vh-section"/);
  assert.match(universal, /<VelvetHorizonSectionArt section=\{keyName\}/);
  assert.match(universal, /<VelvetHorizonGallery photos=\{media\.gallery\}/);
  assert.match(catalog, /key: "velvet-horizon"[\s\S]*usesPhotos: true[\s\S]*photoSlots: \["cover", "personOne", "personTwo", "gallery"\]/);
});

test("Velvet Horizon cover keeps real editable photo ownership behind the sunset architecture", () => {
  assert.match(scene, /data-invitation-photo-slot="cover"/);
  assert.match(scene, /StudioPhotoCropOverlay/);
  assert.match(scene, /object:cover:arch-art/);
  assert.match(scene, /object:cover:drape-art/);
  assert.match(scene, /object:cover:blossom-art/);
  assert.match(scene, /object:cover:lantern-art/);
  assert.match(scene, /object:cover:copy-panel/);
  assert.match(css, /\.vh-cover-copy \{[^}]*left:8%;[^}]*width:min\(68%,380px\)/);
});

test("Velvet Horizon reuses its uploaded horizon pack without forcing the Japanese props that do not fit the art direction", () => {
  for (const asset of [
    "01_sakura_branch.webp",
    "03_ink_mountain_landscape.webp",
    "06_japanese_cloud_band.webp",
    "08_red_sun_clouds.webp",
  ]) assert.match(artwork, new RegExp(asset.replace(".", "\\.")));

  for (const intentionallyUnused of [
    "07_mizuhiki_knot.webp",
    "09_shoji_sakura_corner.webp",
    "10_sakura_folding_fan.webp",
  ]) assert.doesNotMatch(artwork, new RegExp(intentionallyUnused.replace(".", "\\.")));

  assert.match(artwork, /10_romantic_lit_wedding_arch\.webp/);
  assert.match(artwork, /04_fabric_wave\.webp/);
  assert.match(css, /\.vh-art img \{[^}]*object-fit:contain/);
});

test("Velvet Horizon gallery is a real photo collage and not a decorative fake gallery", () => {
  assert.match(gallery, /data-invitation-photo-slot="gallery"/);
  assert.match(gallery, /data-studio-photo-id=\{asset\.id\}/);
  assert.match(gallery, /vh-gallery-card-\$\{index \+ 1\}/);
  assert.match(css, /\.vh-gallery-card-1/);
  assert.match(css, /\.vh-gallery-card-6/);
});

test("Velvet Horizon owns palette and restrained Studio-native motion", () => {
  assert.match(design, /velvetHorizon: \{ name: "Velvet Horizon"/);
  assert.match(catalog, /preset: \{ layout: "editorial", palette: "velvetHorizon", font: "cormorantManrope" \}/);
  assert.match(motion, /const velvetHorizonPhotos/);
  assert.match(motion, /"velvet-horizon": velvetHorizonPhotos/);
  assert.match(motion, /const velvetHorizonNative/);
  assert.match(motion, /"velvet-horizon": velvetHorizonNative/);
  assert.match(motion, /"object:cover:drape-art": \{ animation: "glide-right"/);
  assert.match(motion, /gallery: \{ animation: "tilt-in"/);
  assert.doesNotMatch(motion.slice(motion.indexOf("const velvetHorizonNative"), motion.indexOf("const zenAtelierNative")), /object:countdown:[^"]*-value/);
  assert.match(css, /@media\(prefers-reduced-motion:reduce\)/);
});

test("Velvet Horizon keeps shared RSVP, wishes, map and gift engines", () => {
  assert.match(universal, /velvet-horizon[\s\S]{0,600}<RsvpForm[^>]*appearance="zen"/);
  assert.match(universal, /<GuestWishes[\s\S]*velvet-horizon[\s\S]*\? "zen" : "default"/);
  assert.match(universal, /key === "velvet-horizon" \? "vh-action"/);
  assert.match(universal, /data-studio-section-element="location:button"/);
  assert.match(universal, /data-studio-section-element="gift:button"/);
});
