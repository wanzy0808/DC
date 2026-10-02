import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import sharp from "sharp";
import { join } from "node:path";

const read = (path) => readFileSync(join(process.cwd(), path), "utf8");
const folder = "public/templates/pencil-reverie";
const files = [
  "bookstack.webp", "bycicle.webp", "camera1.webp", "casette.webp",
  "couplesitting.webp", "loveballon1.webp", "loveticket.webp", "polaroidlove.webp",
  "ribbon.webp", "streetlamp.webp", "bingkai.webp", "bungaandlampbg.webp",
  "bungabg.webp", "bungabg1.webp", "sepedabg.webp",
];

const catalog = read("lib/templates/catalog.ts");
const scene = read("components/PublicInvitation/PencilReverieScene.tsx");
const artwork = read("components/PublicInvitation/PencilReverieArtwork.tsx");
const styles = read("components/PublicInvitation/pencil-reverie.css");
const renderer = read("components/PublicInvitation/UniversalInvitationTemplate.tsx");
const themeScenes = read("components/PublicInvitation/InvitationThemeScenes.tsx");
const motion = read("lib/templates/template-motion.ts");
const nativeHook = read("components/PublicInvitation/use-native-visual-animations.ts");
const design = read("lib/templates/design.ts");
const copy = read("lib/templates/editable-copy.ts");
const language = read("lib/invitations/language.ts");

test("Pencil Reverie remains a photo-free illustrated template and uses every shipped asset", () => {
  assert.match(catalog, /key:\s*"pencil-reverie"[\s\S]*?usesPhotos:\s*false[\s\S]*?photoSlots:\s*\[\]/);
  assert.match(catalog, /previewImage:\s*"\/templates\/pencil-reverie\/couplesitting\.webp"/);
  const source = scene + artwork;
  for (const name of files) {
    assert.ok(existsSync(join(process.cwd(), folder, name)), name + " must exist");
    assert.ok(source.includes(name), name + " must remain mapped into the illustrated invitation");
  }
  assert.doesNotMatch(scene, /data-invitation-photo-slot/);
  assert.doesNotMatch(artwork, /data-invitation-photo-slot/);
});

test("Pencil Reverie Cover is an asymmetric memory journal rather than a full background poster", () => {
  for (const marker of [
    "object:cover:paper-sheet",
    "object:cover:heading-group",
    "object:cover:copy-panel",
    "object:cover:illustration-group",
    "object:cover:main-art",
    "object:cover:couple-art",
    "object:cover:lamp-art",
    "object:cover:camera-art",
    "object:cover:ticket-art",
    "object:cover:polaroid-art",
    "object:cover:ribbon-art",
    "object:cover:date",
  ]) assert.match(scene, new RegExp(marker));

  assert.doesNotMatch(scene, /PaperIllustration file="bungaandlampbg\.webp"/);
  assert.match(styles, /\.pr-cover-sheet\{[\s\S]*?left:8%;[\s\S]*?top:8%;[\s\S]*?width:76%;[\s\S]*?rotate:-2\.6deg/);
  assert.match(styles, /\.pr-cover-heading-group\{[\s\S]*?left:13%;[\s\S]*?top:14%;[\s\S]*?width:54%/);
  assert.match(styles, /\.pr-cover-main-art\{[\s\S]*?right:4%;[\s\S]*?bottom:8%;[\s\S]*?width:46%/);
  assert.match(styles, /\.pr-cover-lamp\{[\s\S]*?right:-7%;[\s\S]*?top:9%/);
});

test("Pencil Reverie shared sections remain data-backed while art stays theme-owned", () => {
  assert.match(renderer, /PencilSectionArt section=\{keyName\}/);
  assert.match(renderer, /PencilMemoryGallery/);
  assert.match(renderer, /PencilBackwardClock/);
  assert.match(renderer, /object:identity:parents-group/);
  assert.match(renderer, /object:event:details-group/);
  assert.match(renderer, /data-studio-section-element="location:button"/);
  assert.match(renderer, /data-studio-section-element="gift:button"/);
  assert.match(renderer, /sections\.rsvp && section\("rsvp", \(/);\n  assert.match(renderer, /object:rsvp:form-group/);
  assert.match(renderer, /<RsvpForm slug=\{invitation\.slug\} appearance="zen"/);
  assert.match(renderer, /<GuestWishes[\s\S]*appearance=\{key === "pencil-reverie"[\s\S]*\? "zen" : "default"\}/);
  assert.match(renderer, /key === "pencil-reverie" \? "pr-footer"/);
  assert.match(renderer, /object:footer:pencil-mark/);
});

test("Pencil Reverie opening is gesture-driven and honors Studio motion OFF and reduced motion", () => {
  assert.match(themeScenes, /PencilReverieScene[^\n]*motionEnabled=\{motionEnabled\}/);
  assert.match(scene, /useReducedMotion\(\)/);
  assert.match(scene, /onOpen\(still\)/);
  assert.match(scene, /data-pr-motion=\{still \? "off" : "on"\}/);
  assert.match(scene, /Buka Undangan/);
  assert.ok(!scene.includes("setTimeout(onOpen"), "opening callback must remain on the user gesture for music");
  assert.match(renderer, /key === "pencil-reverie"[\s\S]{0,500}sectionStyles\.envelope\?\.animation === "none"/);
  assert.match(styles, /prefers-reduced-motion:reduce/);
});

test("Pencil Reverie uses native one-shot section choreography without moving countdown values", () => {
  assert.match(motion, /const pencilReverieNative/);
  assert.match(motion, /"pencil-reverie": pencilReverieNative/);
  const start = motion.indexOf("const pencilReverieNative");
  const end = motion.indexOf("const paperCutBotanicalNative");
  const block = motion.slice(start, end);

  assert.match(block, /"object:cover:paper-sheet": \{ animation: "reveal-left"/);
  assert.match(block, /"object:cover:couple-art": \{ animation: "soft-scale"/);
  assert.match(block, /"object:cover:lamp-art": \{ animation: "reveal-up"/);
  assert.match(block, /"object:gallery:memory-board": \{ animation: "rise"/);
  assert.match(block, /"object:countdown:clock-art": \{ animation: "soft-scale"/);
  assert.doesNotMatch(block, /object:countdown:[^"]*-value/);
  assert.match(nativeHook, /const replay = false;/);
  assert.match(nativeHook, /waitForImages:[^\n]*pencil-reverie/);
  assert.doesNotMatch(renderer, /data\.prVisible/);
});

test("Pencil Reverie preserves complete artwork geometry and the full lantern object", async () => {
  assert.match(artwork, /location:\s*\["lamp", "bicycle"\]/);
  assert.match(styles, /\.pr-section-whole-image\{/);
  assert.match(styles, /object-fit:contain!important/);
  assert.doesNotMatch(styles.replace(/\/\*[\s\S]*?\*\//g, ""), /object-fit:\s*cover/i);
  assert.match(styles, /\.pr-section-art\{position:absolute/);
  const metadata = await sharp(join(process.cwd(), folder, "bungaandlampbg.webp")).metadata();
  assert.equal(metadata.format, "webp");
  assert.equal(metadata.width, 1122);
  assert.equal(metadata.height, 1402);
});

test("Pencil Reverie Gallery stays an illustration memory board with accessible lightbox controls", () => {
  assert.match(artwork, /object:gallery:memory-board/);
  assert.match(artwork, /object:gallery:memory-\$\{i \+ 1\}/);
  assert.match(artwork, /if \(preview\) \{ e\.preventDefault\(\); return; \}/);
  assert.match(artwork, /!preview && index!==null/);
  assert.match(artwork, /event\.key === "Escape"/);
  assert.match(artwork, /event\.key === "ArrowRight"/);
  assert.match(artwork, /event\.key === "ArrowLeft"/);
  assert.match(artwork, /Math\.abs\(dx\) > 65/);
  assert.match(styles, /\.pr-memory-grid\{[\s\S]*?grid-template-columns:repeat\(6,minmax\(0,1fr\)\)/);
});

test("Pencil Reverie uses journal copy, paper palette and Young Serif editorial type", () => {
  assert.match(catalog, /key: "pencil-reverie"[\s\S]*preset: \{ layout: "editorial", palette: "pencil", font: "youngInstrument" \}/);
  assert.match(catalog, /editorial romance sketchbook/);
  assert.match(design, /pencil: \{ name: "Pencil Reverie", bg: "#f2e9dd", surface: "#fffaf2", ink: "#302c2a", accent: "#b96f7e", soft: "#d4bfb3" \}/);
  assert.match(design, /youngInstrument: \{ name: "Young Serif \+ Instrument Sans"/);
  assert.match(copy, /templateKey === "pencil-reverie"[\s\S]*Di antara garis pensil, catatan kecil/);
  assert.match(language, /Between pencil lines, little notes/);
});

test("Pencil Reverie still exposes independent editable narrative slots", () => {
  const studio = read("components/InvitationStudio/InvitationDesigner.tsx");
  const selectionInspector = read("components/InvitationStudio/StudioSelectionInspector.tsx");
  assert.match(copy, /attendanceRequest/);
  assert.match(copy, /prayerWish/);
  assert.match(studio, /StudioSelectionInspector/);
  assert.match(selectionInspector, /CopyTextInspector/);
  assert.match(renderer, /text=\{editableCopy\.attendanceRequest \?\? ""\}/);
  assert.match(renderer, /text=\{editableCopy\.prayerWish \?\? ""\}/);
});
