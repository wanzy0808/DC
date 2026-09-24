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
  assert.ok(designer.includes('sections={canvasStage === "cover" ? { ...design.sections, envelope: false } : design.sections}'));
  assert.doesNotMatch(designer, /<Dialog open=\\{preview\\}|setPreview\\(true\\)/);
});

test("pending template survives login and event creation without an automatic database overwrite", () => {
  const intent = readFileSync(new URL("../lib/templates/template-intent.ts", import.meta.url), "utf8");
  const studio = readFileSync(new URL("../app/studio/page.tsx", import.meta.url), "utf8");
  const entry = readFileSync(new URL("../components/DigitalInvitation/StudioEntrySection.tsx", import.meta.url), "utf8");
  const dashboard = readFileSync(new URL("../app/dashboard/page.tsx", import.meta.url), "utf8");
  const events = readFileSync(new URL("../components/Dashboard/EventPanel.tsx", import.meta.url), "utf8");
  const designer = readFileSync(new URL("../components/InvitationStudio/InvitationDesigner.tsx", import.meta.url), "utf8");

  assert.match(page, /rememberTemplateSelection\(selected\.key\)/);
  assert.match(intent, /MAX_AGE_MS = 7 \* 24 \* 60 \* 60 \* 1000/);
  assert.match(intent, /window\.localStorage\.setItem\(STORAGE_KEY/);
  assert.match(intent, /document\.cookie = `\$\{PENDING_TEMPLATE_COOKIE\}/);
  assert.match(intent, /isSelectableTemplate\(key\)/);
  assert.match(studio, /\(await cookies\(\)\)\.get\(PENDING_TEMPLATE_COOKIE\)/);
  assert.match(entry, /\/dashboard\?tab=events&from=template&template=/);
  assert.match(dashboard, /params\.get\("from"\) === "template"/);
  assert.match(dashboard, /selectedTemplate=\{pendingTemplate \|\| undefined\}/);
  assert.match(events, /onSaved\(editorMode === "new" \? \{ id:/);
  assert.match(designer, /setSavedState\(JSON\.stringify\(\[makeInvitationDesignStateKey\(loadedDesign\)/);
  assert.match(designer, /clearTemplateSelection\(\)/);
  assert.match(designer, /location\.searchParams\.delete\("template"\)/);
  assert.match(designer, /location\.searchParams\.set\("template", templateKey\)/);
});

test("Studio template panel supports searching, photo filters, sorting and incremental cards", () => {
  const panel = readFileSync(new URL("../components/InvitationStudio/TemplatePanel.tsx", import.meta.url), "utf8");
  assert.match(panel, /aria-label=\{en \? "Search templates" : "Cari template"\}/);
  assert.match(panel, /setSearch\(event\.target\.value\)/);
  assert.match(panel, /aria-label=\{en \? "Filter templates by photos" : "Filter foto template"\}/);
  assert.match(panel, /Nama A–Z/);
  assert.match(panel, /Nama Z–A/);
  assert.match(panel, /filtered\.slice\(0, limit\)/);
  assert.match(panel, /Tampilkan Lagi/);
  assert.match(panel, /selected === item\.key/);
});

test("Studio stage tracks opening the real envelope for every renderer", () => {
  const studio = readFileSync(new URL("../components/InvitationStudio/InvitationDesigner.tsx", import.meta.url), "utf8");
  const preview = readFileSync(new URL("../components/InvitationStudio/InvitationPreview.tsx", import.meta.url), "utf8");
  const universal = readFileSync(new URL("../components/PublicInvitation/UniversalInvitationTemplate.tsx", import.meta.url), "utf8");
  const rose = readFileSync(new URL("../components/PublicInvitation/RomanticRoseTemplate.tsx", import.meta.url), "utf8");

  assert.match(studio, /handleCanvasEnvelopeOpened = useCallback\(\(\) => setCanvasStage\("cover"\), \[\]\)/);
  assert.match(studio, /onEnvelopeOpened=\{handleCanvasEnvelopeOpened\}/);
  assert.match(studio, /onClick=\{\(\) => \{ setCanvasStage\("envelope"\); setPreviewVersion/);
  assert.match(studio, /sections=\{canvasStage === "cover" \? \{ \.\.\.design\.sections, envelope: false \} : design\.sections\}/);
  assert.match(preview, /<RomanticRoseTemplate[^>]*onEnvelopeOpened=\{onEnvelopeOpened\}/);
  assert.match(preview, /<UniversalInvitationTemplate[\s\S]*onEnvelopeOpened=\{onEnvelopeOpened\}/);
  assert.match(universal, /setOpened\(true\);\s*setOpening\(false\);\s*onEnvelopeOpened\?\.\(\)/);
  assert.match(universal, /else \{\s*setOpened\(true\);\s*onEnvelopeOpened\?\.\(\)/);
  assert.match(rose, /setOpened\(true\);\s*onEnvelopeOpened\?\.\(\)/);
  assert.ok(studio.includes('sections={canvasStage === "cover" ? { ...design.sections, envelope: false } : design.sections}'));
  assert.doesNotMatch(studio, /<Dialog open=\\{preview\\}|setPreview\\(true\\)/);
});
