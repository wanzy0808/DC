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

test("catalog popup starts at Cover without changing the original invitation opening", () => {
  assert.match(page, /<TemplateCanvas key=\{selected\.key\} templateKey=\{selected\.key\} sections=\{\{ \.\.\.sections, envelope: false \}\} \/>/);
  assert.match(gallery, /sections = defaultInvitationSections,/);
  assert.doesNotMatch(gallery, /Pratinjau template|Memuat pratinjau/);
});

test("create invitation routes through auth-protected Studio and keeps the selected theme", () => {
  const studio = readFileSync(new URL("../app/studio/page.tsx", import.meta.url), "utf8");
  const entry = readFileSync(new URL("../components/DigitalInvitation/StudioEntrySection.tsx", import.meta.url), "utf8");
  const designer = readFileSync(new URL("../components/InvitationStudio/InvitationDesigner.tsx", import.meta.url), "utf8");
  assert.match(page, /href=\{\`\/studio\?template=\$\{encodeURIComponent\(selected\.key\)\}\`\}/);
  assert.match(studio, /if \(!user\) redirect\(\`\/login\?next=\$\{encodeURIComponent\(studioUrl\)\}\`\)/);
  assert.match(studio, /selectedTemplate=\{selectedTemplate\}/);
  assert.ok(entry.includes('selectedTemplate ? `&template='));
  assert.match(designer, /const requestedTheme = params\.get\("template"\)/);
  assert.match(designer, /setSavedState\(JSON\.stringify\(\[makeInvitationDesignStateKey\(loadedDesign\)/);
});

test("Studio can show and replay the envelope independently of Cover-only catalog popup", () => {
  const designer = readFileSync(new URL("../components/InvitationStudio/InvitationDesigner.tsx", import.meta.url), "utf8");
  assert.match(designer, /setCanvasStage\("envelope"\)/);
  assert.match(designer, /setCanvasStage\("cover"\)/);
  assert.match(designer, /sections=\{canvasStage === "cover" \? \{ \.\.\.design\.sections, envelope: false \} : design\.sections\}/);
  assert.match(designer, /<InvitationPreview[\s\S]*sections=\{design\.sections\}/);
});
