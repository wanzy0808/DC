import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import sharp from "sharp";
import { join } from "node:path";

const read = (path) => readFileSync(join(process.cwd(), path), "utf8");
const folder = "public/templates/pencil-reverie";
const files = ["bookstack.webp", "bycicle.webp", "camera1.webp", "casette.webp",
  "couplesitting.webp", "loveballon1.webp", "loveticket.webp", "polaroidlove.webp",
  "ribbon.webp", "streetlamp.webp", "bingkai.webp", "bungaandlampbg.webp",
  "bungabg.webp", "bungabg1.webp", "sepedabg.webp"];

test("Pencil Reverie uses every existing illustration without photo slots", () => {
  const catalog = read("lib/templates/catalog.ts");
  assert.match(catalog, /key:\s*"pencil-reverie"[\s\S]*?usesPhotos:\s*false[\s\S]*?photoSlots:\s*\[\]/);
  assert.match(catalog, /previewImage:\s*"\/templates\/pencil-reverie\/bungaandlampbg.webp"/);
  const source = read("components/PublicInvitation/PencilReverieScene.tsx") +
    read("components/PublicInvitation/PencilReverieArtwork.tsx");
  for (const name of files) {
    assert.ok(existsSync(join(process.cwd(), folder, name)), name + " must exist");
    assert.ok(source.includes(name), name + " must appear in an illustrated scene or section");
  }
});

test("Pencil Reverie uses shared sections and an actual gesture-driven opening", () => {
  const renderer = read("components/PublicInvitation/UniversalInvitationTemplate.tsx");
  const scene = read("components/PublicInvitation/PencilReverieScene.tsx");
  assert.match(renderer, /PencilSectionArt section=\{keyName\}/);
  assert.match(renderer, /PencilMemoryGallery/);
  assert.match(renderer, /PencilBackwardClock/);
  assert.match(renderer, /key === "zen-atelier" \|\| key === "pencil-reverie"/);
  assert.match(scene, /onOpen\(\)/);
  assert.match(scene, /Buka Undangan/);
  assert.ok(!scene.includes("setTimeout(onOpen"), "Opening callback must run on the user gesture for audio");
});

test("Pencil Reverie animation respects reduced motion and avoids silent background loops", () => {
  const css = read("components/PublicInvitation/pencil-reverie.css");
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(css, /data-pr-active=false/);
  assert.match(css, /pr-clock-back/);
  const music = read("lib/templates/music.ts");
  assert.match(music, /"pencil-reverie":\s*\{\s*title:/);
});


test("illustrations are full-aspect sheets and the complete lantern is retained", async () => {
  const scene = read("components/PublicInvitation/PencilReverieScene.tsx");
  const artwork = read("components/PublicInvitation/PencilReverieArtwork.tsx");
  const styles = read("components/PublicInvitation/pencil-reverie.css");
  assert.match(scene, /PaperIllustration file="bungaandlampbg\.webp"/);
  assert.match(scene, /PaperIllustration file="bingkai\.webp"/);
  assert.match(artwork, /location:\s*"lamp"/);
  assert.match(styles, /pr-section-whole-image/);
  assert.match(styles, /object-fit:contain!important/);
  assert.doesNotMatch(styles.replace(/\/\*[\s\S]*?\*\//g, ""), /object-fit:\s*cover/i);
  assert.match(styles, /pr-cover-paper\{width:100%;height:auto!important;object-fit:contain/);
  assert.match(styles, /pr-section-art\{position:relative!important/);
  const metadata = await sharp(join(process.cwd(), folder, "bungaandlampbg.webp")).metadata();
  assert.equal(metadata.format, "webp");
  assert.equal(metadata.width, 1122);
  assert.equal(metadata.height, 1402);
});

test("Pencil Reverie exposes actual independent editable narrative slots", () => {
  const fields=read("lib/templates/editable-copy.ts");
  const studio=read("components/InvitationStudio/InvitationDesigner.tsx");
  const selectionInspector=read("components/InvitationStudio/StudioSelectionInspector.tsx");
  const live=read("components/PublicInvitation/UniversalInvitationTemplate.tsx");
  assert.match(fields,/templateKey === "pencil-reverie"/);
  assert.match(fields,/attendanceRequest/);
  assert.match(fields,/prayerWish/);
  assert.match(studio,/StudioSelectionInspector/);
  assert.match(selectionInspector,/CopyTextInspector/);
  assert.match(live,/text=\{editableCopy\.attendanceRequest \?\? ""\}/);
  assert.match(live,/text=\{editableCopy\.prayerWish \?\? ""\}/);
});
