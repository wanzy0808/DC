import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const universal = read("components/PublicInvitation/UniversalInvitationTemplate.tsx");
const scenes = read("components/PublicInvitation/InvitationThemeScenes.tsx");
const scene = read("components/PublicInvitation/PaperCutBotanicalScene.tsx");
const artwork = read("components/PublicInvitation/PaperCutBotanicalArtwork.tsx");
const gallery = read("components/PublicInvitation/PaperCutBotanicalGallery.tsx");
const css = read("components/PublicInvitation/paper-cut-botanical.css");
const motion = read("lib/templates/template-motion.ts");
const catalog = read("lib/templates/catalog.ts");
const design = read("lib/templates/design.ts");
const nativeHook = read("components/PublicInvitation/use-native-visual-animations.ts");

test("Paper Cut Botanical uses dedicated photo-free scenes instead of the generic botanical envelope", () => {
  assert.match(scenes, /PaperCutBotanicalScene/);
  assert.match(scenes, /theme === "paper-cut-botanical"/);
  assert.doesNotMatch(scenes, /"paper-cut-botanical": \{ backdrop:/);
  assert.match(universal, /paper-cut-botanical-invitation/);
  assert.match(universal, /paper \? "pcb-section"/);
  assert.match(universal, /<PaperCutBotanicalSectionArt section=\{keyName\}/);
  assert.match(universal, /<PaperCutBotanicalIdentity/);
  assert.match(universal, /key === "paper-cut-botanical" \? <PaperCutBotanicalGallery/);
  assert.match(catalog, /key: "paper-cut-botanical"[\s\S]*usesPhotos: false[\s\S]*photoSlots: \[\]/);
});

test("Paper Cut Botanical cover is an asymmetric layered paper theatre", () => {
  for (const marker of [
    "object:cover:paper-back",
    "object:cover:paper-middle",
    "object:cover:paper-window",
    "object:cover:ribbon-art",
    "object:cover:couple-art",
    "object:cover:ticket-art",
    "object:cover:seal-art",
    "object:cover:copy-panel",
    "object:cover:date",
  ]) assert.match(scene, new RegExp(marker));
  assert.doesNotMatch(scene, /object:cover:photo-frame/);
  assert.match(css, /\.pcb-cover-copy \{[\s\S]*?left:9%;[\s\S]*?top:25%;[\s\S]*?text-align:left;/);
  assert.match(css, /\.pcb-cover-couple \{[\s\S]*?right:-2%;[\s\S]*?top:19%;/);
  assert.match(css, /\.pcb-cover-date \{[\s\S]*?writing-mode:vertical-rl;/);
});

test("Paper Cut Botanical maps ten reused local WebP assets and keeps artwork contained", () => {
  for (const asset of [
    "01_story_couple.webp",
    "02_love_ticket.webp",
    "03_ribbon.webp",
    "04_wax_seal.webp",
    "05_lantern.webp",
    "06_bicycle.webp",
    "07_bookstack.webp",
    "08_polaroid.webp",
    "09_love_balloon.webp",
    "10_garden_stroll.webp",
  ]) assert.match(artwork, new RegExp(asset.replace(".", "\\.")));
  assert.match(css, /\.pcb-art img \{[\s\S]*?object-fit:\s*contain/);
});

test("Paper Cut Botanical varies section props instead of repeating a leaf badge", () => {
  assert.match(artwork, /greeting: "ribbon"/);
  assert.match(artwork, /event: "ticket"/);
  assert.match(artwork, /dateTime: "lantern"/);
  assert.match(artwork, /countdown: "balloon"/);
  assert.match(artwork, /location: "bicycle"/);
  assert.match(artwork, /rsvp: "waxSeal"/);
  assert.match(artwork, /wishes: "polaroid"/);
  assert.match(artwork, /gift: "bookstack"/);
  assert.doesNotMatch(universal, /theme-circle/);
});

test("Paper Cut Botanical keeps protected event data and shared functional engines", () => {
  assert.match(scene, /object:cover:date/);
  assert.match(artwork, /object:identity:personOne-name/);
  assert.match(artwork, /object:identity:personTwo-name/);
  assert.match(artwork, /object:identity:personOne-parents/);
  assert.match(artwork, /object:identity:personTwo-parents/);
  assert.match(universal, /paper-cut-botanical[\s\S]{0,1200}<RsvpForm[^>]*appearance="zen"/);
  assert.match(universal, /<GuestWishes[\s\S]*paper-cut-botanical[\s\S]*\? "zen" : "default"/);
  assert.match(universal, /data-studio-section-element="location:button"/);
  assert.match(universal, /data-studio-section-element="gift:button"/);
});

test("Paper Cut Botanical default Gallery is photo-free paper storytelling", () => {
  assert.doesNotMatch(gallery, /data-invitation-photo-slot/);
  assert.match(gallery, /Kolase Kertas/);
  assert.match(gallery, /object:gallery:keepsake-group/);
  assert.match(gallery, /object:gallery:note-group/);
  assert.match(gallery, /object:gallery:journey-group/);
  assert.match(gallery, /Selembar Cerita/);
  assert.match(gallery, /Catatan Kecil/);
  assert.match(gallery, /Ruang untuk Tumbuh/);
  assert.match(universal, /paper && keyName === "gallery" \? "Kolase Kertas"/);
});

test("Paper Cut Botanical uses restrained one-shot native motion without animating countdown values", () => {
  assert.match(motion, /const paperCutBotanicalNative/);
  assert.match(motion, /"paper-cut-botanical": paperCutBotanicalNative/);
  const block = motion.slice(motion.indexOf("const paperCutBotanicalNative"), motion.indexOf("const goldenArtDecoNative"));
  assert.match(block, /"object:cover:paper-back": \{ animation: "paper-cut"/);
  assert.match(block, /"object:cover:couple-art": \{ animation: "soft-scale"/);
  assert.match(block, /"object:gallery:keepsake-group": \{ animation: "tilt-in"/);
  assert.doesNotMatch(block, /object:countdown:[^"]*-value/);
  assert.match(nativeHook, /const replay = false;/);
  assert.match(nativeHook, /waitForImages:[^\n]*paper-cut-botanical/);
  assert.match(css, /@media \(prefers-reduced-motion:reduce\)/);
});

test("Paper Cut Botanical uses its paper palette and editorial display typography", () => {
  assert.match(catalog, /key: "paper-cut-botanical"[\s\S]*preset: \{ layout: "garden", palette: "paperMeadow", font: "yesevaJosefin" \}/);
  assert.match(design, /paperMeadow: \{ name: "Paper Cut Botanical"/);
  assert.match(catalog, /layered botanical paper theatre/);
});
