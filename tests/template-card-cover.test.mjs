import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const gallery = readFileSync(new URL("../components/Templates/TemplateGalleryCanvas.tsx", import.meta.url), "utf8");
const page = readFileSync(new URL("../app/template-design/page.tsx", import.meta.url), "utf8");
const featured = readFileSync(new URL("../components/DigitalInvitation/TemplateSection.tsx", import.meta.url), "utf8");

test("every live template catalog card renders the Cover/Hero rather than the envelope", () => {
  assert.match(gallery, /invitationSectionItems\.map\(\(\{ key \}\) => \[key, key === "cover"\]\)/);
  assert.match(gallery, /<TemplateCanvas templateKey=\{templateKey\} sections=\{catalogCoverSections\} \/>/);
  assert.match(page, /<TemplateCardCanvas templateKey=\{template\.key\} \/>/);
  assert.match(featured, /<TemplateCardCanvas templateKey=\{template\.key\} phone \/>/);
});

test("full invitation preview retains its own section toggles and opening envelope", () => {
  assert.match(page, /<TemplateCanvas key=\{selected\.key\} templateKey=\{selected\.key\} sections=\{sections\} \/>/);
  assert.match(gallery, /sections = defaultInvitationSections,/);
  assert.doesNotMatch(gallery, /Pratinjau template|Memuat pratinjau/);
});
