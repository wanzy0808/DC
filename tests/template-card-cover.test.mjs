import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const gallery = readFileSync(new URL("../components/Templates/TemplateGalleryCanvas.tsx", import.meta.url), "utf8");
const page = readFileSync(new URL("../app/template-design/page.tsx", import.meta.url), "utf8");
const featured = readFileSync(new URL("../components/DigitalInvitation/TemplateSection.tsx", import.meta.url), "utf8");

test("every live template catalog card renders the Cover/Hero rather than the envelope", () => {
  assert.match(gallery, /invitationSectionItems\.map\(\(\{ key \}\) => \[key, key === "cover"\]\)/);
  assert.match(gallery, /<TemplateCanvas templateKey=\{templateKey\} designKey=\{designKey\} sections=\{catalogCoverSections\} \/>/);
  assert.match(page, /<TemplateCardCanvas templateKey=\{template\.key\} designKey=\{template\.designKey\} phone \/>/);
  assert.match(featured, /<TemplateCardCanvas templateKey=\{template\.key\} designKey=\{template\.designKey\} phone \/>/);
});

test("public template catalog uses a looping phone wheel with centered preview and details below", () => {
  assert.match(page, /data-template-wheel/);
  assert.match(page, /data-template-wheel-details/);
  assert.match(page, /\[perspective:1200px\]/);
  assert.match(page, /rotateY\(\$\{rotation\}deg\)/);
  assert.match(page, /stage\.addEventListener\("wheel", onWheel, \{ passive: false \}\)/);
  assert.match(page, /onTouchStart=\{handleWheelTouchStart\}/);
  assert.match(page, /const next = \(current \+ direction \+ total\) % total/);
  assert.match(page, /function wheelDistance\(index: number\)/);
  assert.match(page, /if \(distance > half\) distance -= total/);
  assert.match(page, /if \(distance < -half\) distance \+= total/);
  assert.match(page, /if \(distance === 0\)\s*\{\s*openPreview\(template\.key\)/);
  assert.match(page, /wheelIndexRef\.current = index/);
  assert.match(page, /setWheelIndex\(index\)/);
  assert.match(page, /descriptionFor\(activeWheelTemplate\)/);
  assert.match(page, /<TemplateCardCanvas templateKey=\{template\.key\} designKey=\{template\.designKey\} phone \/>/);
  assert.doesNotMatch(page, /<Eye /);
  assert.doesNotMatch(page, /<Button onClick=\{\(\) => openPreview\(template\.key\)\}/);
});

test("template catalog keeps floating search filter sort controls and gives the wheel most of the room", () => {
  assert.match(page, /min-h-\[calc\(100dvh-185px\)\]/);
  assert.match(page, /sm:max-w-\[250px\]/);
  assert.match(page, /ref=\{filterMenuRef\}/);
  assert.match(page, /<SlidersHorizontal/);
  assert.match(page, /\{copy\.photoType\}/);
  assert.match(page, /\{copy\.categoryLabel\}/);
  assert.match(page, /max-h-40 flex-wrap gap-1\.5 overflow-y-auto/);
  assert.match(page, /ref=\{sortMenuRef\}/);
  assert.match(page, /setFilterOpen\(false\)/);
  assert.match(page, /setSortOpen\(false\)/);
  assert.match(page, /max-w-\[940px\] flex-wrap items-center justify-center gap-x-6/);
  assert.doesNotMatch(page, /max-w-\[940px\][\s\S]{0,180}border border-primary\/18 bg-background\/78/);
  assert.match(page, /max-w-\[1220px\]/);
  assert.match(page, /w-\[clamp\(166px,22vw,250px\)\]/);
  assert.match(page, /lg:absolute lg:-left-24 lg:top-14 lg:flex lg:h-\[16rem\].*lg:-translate-x-\[5cm\]/);
  assert.match(page, /lg:right-\[-9rem\] lg:top-\[66%\].*lg:flex lg:h-\[15rem\].*lg:translate-x-\[5cm\]/);
  assert.match(page, /lg:w-\[33rem\]/);
  assert.match(page, /text-\[15px\] font-bold/);
  assert.match(page, /text-foreground\/82/);
  assert.doesNotMatch(page, /\{filteredTemplates\.length\} \{copy\.available\}/);
  assert.match(page, /top-\[50%\] aspect-\[9\/19\.5\]/);
  assert.match(page, /mb-8 flex w-full max-w-\[940px\]/);
  assert.match(page, /lg:flex-col lg:justify-between/);
  assert.match(page, /data-template-wheel-details[\s\S]*mt-4 max-w-2xl/);
  assert.doesNotMatch(page, /Scroll atau geser untuk memilih/);
  assert.doesNotMatch(page, /Scroll or swipe to choose/);
  assert.match(page, /branch-05\.webp/);
  assert.match(page, /Temukan desain yang paling terasa seperti ceritamu/);
});

test("template wheel trigger is a sibling overlay, not a button around live template markup", () => {
  assert.match(page, /<div\s+key=\{template\.key\}[\s\S]*className="group absolute left-1\/2/);
  assert.match(page, /<button[\s\S]*aria-current=\{distance === 0 \? "true" : undefined\}[\s\S]*className="absolute inset-0 z-40/);
  assert.doesNotMatch(page, /<button\s+key=\{template\.key\}[\s\S]*<TemplateCardCanvas/);
});

test("catalog popup starts at Cover without changing the original invitation opening", () => {
  assert.match(page, /<TemplateCanvas key=\{selected\.key\} templateKey=\{selected\.key\} designKey=\{selected\.designKey\} sections=\{\{ \.\.\.sections, envelope: false \}\} \/>/);
  assert.match(gallery, /sections = defaultInvitationSections,/);
  assert.doesNotMatch(gallery, /Pratinjau template|Memuat pratinjau/);
});

test("create invitation routes through auth-protected Studio and keeps the selected theme", () => {
  const studio = readFileSync(new URL("../app/studio/page.tsx", import.meta.url), "utf8");
  const entry = readFileSync(new URL("../components/InvitationStudio/StudioEntrySection.tsx", import.meta.url), "utf8");
  const designer = readFileSync(new URL("../components/InvitationStudio/InvitationDesigner.tsx", import.meta.url), "utf8");
  assert.match(page, /href=\{\`\/studio\?template=\$\{encodeURIComponent\(selected\.key\)\}\`\}/);
  assert.match(studio, /if \(!user\) redirect\(\`\/login\?next=\$\{encodeURIComponent\(studioUrl\)\}\`\)/);
  assert.match(studio, /selectedTemplate=\{selectedTemplate\}/);
  assert.ok(entry.includes('selectedTemplate ? `&template='));
  assert.match(designer, /const requestedTheme = params\.get\("template"\)/);
  assert.match(designer, /const canonicalSavedState = JSON\.stringify\(\[makeInvitationDesignStateKey\(loadedDesign\)/);
  assert.match(designer, /setSavedState\(canonicalSavedState\)/);
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
  const entry = readFileSync(new URL("../components/InvitationStudio/StudioEntrySection.tsx", import.meta.url), "utf8");
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
  assert.match(designer, /const canonicalSavedState = JSON\.stringify\(\[makeInvitationDesignStateKey\(loadedDesign\)/);
  assert.match(designer, /setSavedState\(canonicalSavedState\)/);
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
  const toolbar = readFileSync(new URL("../components/InvitationStudio/StudioCanvasToolbar.tsx", import.meta.url), "utf8");

  assert.match(studio, /handleCanvasEnvelopeOpened = useCallback\(\(\) => \{\s*setCanvasStage\("cover"\);\s*setActiveCanvasSectionId\("cover"\);/);
  assert.match(studio, /onEnvelopeOpened=\{handleCanvasEnvelopeOpened\}/);
  assert.match(studio, /onRestore=\{restoreDefaults\}/);
  assert.match(toolbar, /disabled=\{!invitationReady \|\| busy\}/);
  assert.match(studio, /function restoreDefaults\(\)[\s\S]*setCanvasStage\("envelope"\);[\s\S]*setPreviewVersion/);
  assert.match(studio, /sections=\{canvasStage === "cover" \? \{ \.\.\.design\.sections, envelope: false \} : design\.sections\}/);
  assert.match(preview, /<RomanticRoseTemplate[^>]*onEnvelopeOpened=\{onEnvelopeOpened\}/);
  assert.match(preview, /<UniversalInvitationTemplate[\s\S]*onEnvelopeOpened=\{onEnvelopeOpened\}/);
  assert.match(universal, /setOpened\(true\);\s*setOpening\(false\);\s*onEnvelopeOpened\?\.\(\)/);
  assert.match(universal, /else \{\s*setOpened\(true\);\s*onEnvelopeOpened\?\.\(\)/);
  assert.match(rose, /setOpened\(true\);\s*onEnvelopeOpened\?\.\(\)/);
  assert.ok(studio.includes('sections={canvasStage === "cover" ? { ...design.sections, envelope: false } : design.sections}'));
  assert.doesNotMatch(studio, /<Dialog open=\\{preview\\}|setPreview\\(true\\)/);
});

test("all template previews use the canonical Una & Dara sample names", () => {
  const fixture = readFileSync(new URL("../data/templates/preview-invitation.ts", import.meta.url), "utf8");
  assert.match(fixture, /title: "Pernikahan Una & Dara"/);
  assert.match(fixture, /groomName: "Una"/);
  assert.match(fixture, /brideName: "Dara"/);
  assert.doesNotMatch(fixture, /Denny|Christine/);
});
