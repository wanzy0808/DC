import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
const studio = read("components/InvitationStudio/InvitationEditorPage.tsx");
const designer = read("components/InvitationStudio/InvitationDesigner.tsx");
const panels = read("components/InvitationStudio/DesignerPanels.tsx");
const templatePanel = read("components/InvitationStudio/TemplatePanel.tsx");
const photos = read("components/InvitationStudio/PhotoPanel.tsx");
const styles = read("components/InvitationStudio/studio.css");
const dashboard = read("components/Dashboard/InvitationWorkspacePanel.tsx");

test("Studio header has landing-style ID/EN and dark/light toggles without its own publish CTA", () => {
  assert.match(studio, /<ThemeToggle \/>/);
  assert.match(studio, /<LanguageToggle \/>/);
  assert.doesNotMatch(studio, /onClick=\{publish\}|async function publish\(|>Terbitkan<|Paket diperlukan saat terbitkan/);
  assert.doesNotMatch(studio, /Desain bisa disimpan sekarang/);
  assert.match(styles, /\.dc-studio-page-header \.dc-theme-toggle/);
  assert.match(styles, /\.dc-studio-page-header \.dc-language-toggle button/);
  assert.match(dashboard, /async function publishInvitation\(/);
});

test("Studio uses display-only event title capitalization and one live canvas without preview dialog", () => {
  assert.match(studio, /setDocumentTitle\(invitationTitleCase\(data\.invitation\.title \|\| "Studio"\)\)/);
  assert.match(panels, /export function ContentPanel\(/);
  assert.doesNotMatch(panels.split("export function ContentPanel(")[1]?.split("export function MusicPanel(")[0] || "", /invitationTitleCase|formatInvitationEventDate|setEventTag|setDressCode/);
  assert.match(designer, /<InvitationPreview\s/);
  assert.doesNotMatch(designer, /setPreview\(true\)|<Dialog open=\{preview\}|\bPratinjau\s*<\/Button>/);
  assert.match(designer, /<LanguageToggle|useLanguage\(\)/);
  assert.ok(designer.includes('key={`${design.template}-${design.sections.envelope !== false}-${previewVersion}`}'));
});

test("Studio has a wider inspector, compact side tools and a smaller invitation canvas", () => {
  assert.match(styles, /grid-template-columns: 98px 360px minmax\(0, 1fr\)/);
  assert.match(styles, /\.dc-studio-tool \{[^}]*gap: 10px;[^}]*min-height: 74px;/);
  assert.match(styles, /\.dc-studio-preview-surface \{[^}]*width: 340px;/);
});

test("Studio ID/EN switch updates its navigation, template search and photo controls", () => {
  assert.match(designer, /const \{ locale \} = useLanguage\(\)/);
  assert.match(designer, /locale === "en" \?/);
  assert.match(templatePanel, /aria-label=\{en \? "Search templates" : "Cari template"\}/);
  assert.match(panels, /sectionNamesEnglish/);
  assert.match(photos, /const en = locale === "en"/);
});


test("Studio uses one left-rail Isi menu for sections and functional components", () => {
  assert.match(designer, /sections: "Isi"/);
  const rail = designer.split('<nav className="dc-studio-rail"')[1]?.split("</nav>")[0] || "";
  assert.match(rail, /label=\{copy\.sections\}/);
  assert.doesNotMatch(rail, /panel === "content"|copy\.content|FilePenLine/);
  const mergedPanel = designer.split('{panel === "sections" && (')[1]?.split('{panel === "color"')[0] || "";
  assert.match(mergedPanel, /<ContentPanel/);
  assert.doesNotMatch(mergedPanel, /<SectionsPanel/);
  assert.match(panels, /<Heading title="Isi" description="" \/>/);
  assert.match(panels, /sectionFunctionalElements/);
});

test("Studio custom button states follow DC Organizer light/dark text and sorting has an inset chevron", () => {
  assert.match(templatePanel, /photoFilter === key \? "bg-\[#C07A84\] text-white [^"]*dark:text-black/);
  assert.doesNotMatch(templatePanel, /photoFilter === key \? "bg-primary text-black"/);
  assert.match(designer, /canvasStage === "envelope" \? "bg-\[#C07A84\] text-white [^"]*dark:text-black/);
  assert.match(designer, /canvasStage === "cover" \|\| design\.sections\.envelope === false \? "bg-\[#C07A84\] text-white [^"]*dark:text-black/);
  assert.match(templatePanel, /w-\[204px\] max-w-\[68%\] shrink-0/);
  assert.match(templatePanel, /className="h-9 w-full appearance-none [^"]*pl-4 pr-11/);
  assert.match(templatePanel, /<ChevronDown size=\{15\} [^>]*className="pointer-events-none absolute right-4/);
  assert.match(styles, /grid-template-columns: 108px 380px minmax\(0, 1fr\)/);
});

test("landing and Studio share one rounded-rectangle button radius instead of pill controls", () => {
  const globalStyles = read("app/globals.css");
  const buttons = read("components/ui/button-variants.ts");
  const controls = read("components/ui/control-styles.ts");
  const catalog = read("app/template-design/page.tsx");
  assert.match(globalStyles, /--dc-control-radius:\s*16px;/);
  assert.match(globalStyles, /--dc-control-menu-radius:\s*18px;/);
  assert.doesNotMatch(globalStyles, /--dc-control-radius:\s*9999px;/);
  assert.match(buttons, /rounded-\[var\(--dc-control-radius\)\]/);
  assert.match(controls, /rounded-\[var\(--dc-control-radius\)\]/);
  assert.match(templatePanel, /photoFilter === key/);
  assert.match(templatePanel, /h-9 w-full appearance-none rounded-\[var\(--dc-control-radius\)\]/);
  assert.match(designer, /min-h-9 shrink-0 rounded-\[var\(--dc-control-radius\)\]/);
  assert.doesNotMatch(designer, /min-h-9 shrink-0 rounded-full/);
  assert.match(styles, /\.dc-studio-icon \{[^}]*border-radius: var\(--dc-control-radius\)/);
  assert.match(catalog, /aria-label=\{copy\.close\} className="[^"]*rounded-\[var\(--dc-control-radius\)\]/);
});

test("Ucapan Tamu section label has no stale unavailable caption", () => {
  const sections = read("lib/templates/sections.ts");
  assert.match(sections, /\{ key: "wishes", title: "Ucapan Tamu" \}/);
  assert.doesNotMatch(panels, /Pengiriman ucapan belum tersedia|Sending wishes is not available yet/);
  assert.doesNotMatch(panels, /wishes.*text-xs.*unavailable/i);
});

test("Studio keeps Template Restart Undo Redo Save in one canvas toolbar row", () => {
  assert.match(designer, /save: "Simpan"/);
  assert.doesNotMatch(designer, /save: "Simpan Desain"/);
  assert.doesNotMatch(designer, /<header className="dc-studio-toolbar">/);
  const rail = designer.split('<nav className="dc-studio-rail"')[1]?.split("</nav>")[0] || "";
  assert.doesNotMatch(rail, /onClick=\{restoreDefaults\}|copy\.startOver|onClick=\{undo\}|onClick=\{redo\}|onClick=\{save\}/);
  const canvasToolbar = designer.split('<div className="dc-studio-canvas-toolbar">')[1]?.split("</div>\n          <div ref={canvasScrollRef}")[0] || "";
  assert.match(canvasToolbar, /dc-studio-history-actions/);
  assert.match(canvasToolbar, /onClick=\{restoreDefaults\}/);
  assert.match(canvasToolbar, /onClick=\{undo\} disabled=\{!invitation \|\| saving \|\| audioBusy \|\| !history.length\}/);
  assert.match(canvasToolbar, /onClick=\{redo\} disabled=\{!invitation \|\| saving \|\| audioBusy \|\| !future.length\}/);
  assert.match(canvasToolbar, /onClick=\{save\}/);
  assert.match(canvasToolbar, /aria-label=\{copy\.replay\}/);
  assert.match(canvasToolbar, /<Button size="icon-sm" onClick=\{restoreDefaults\}[^>]*title=\{copy\.defaultsHint\}/);
  assert.match(canvasToolbar, /<Button size="icon-sm" onClick=\{undo\}[^>]*title=\{copy\.undo\}/);
  assert.match(canvasToolbar, /<Button size="icon-sm" onClick=\{redo\}[^>]*title=\{copy\.redo\}/);
  assert.match(canvasToolbar, /<Button onClick=\{save\}[^>]*size="sm"/);
  assert.doesNotMatch(designer, /undoShort|redoShort|restartShort/);
  assert.ok(
    canvasToolbar.indexOf("template?.name") < canvasToolbar.indexOf("onClick={restoreDefaults}") &&
    canvasToolbar.indexOf("onClick={restoreDefaults}") < canvasToolbar.indexOf("onClick={undo}") &&
    canvasToolbar.indexOf("onClick={undo}") < canvasToolbar.indexOf("onClick={redo}") &&
    canvasToolbar.indexOf("onClick={redo}") < canvasToolbar.indexOf("onClick={save}"),
  );
  const reset = designer.split("function restoreDefaults()")[1]?.split("async function deleteMusic")[0] || "";
  assert.match(reset, /layers: \[\]/);
  assert.match(reset, /photos: defaultPhotoAssignments\(\)/);
  assert.match(reset, /copy: \{\}/);
  assert.match(reset, /sections: \{ \.\.\.defaultInvitationSections \}/);
  assert.match(reset, /setMusicUrl\(""\)/);
  assert.match(reset, /setCanvasStage\("envelope"\)/);
  assert.match(reset, /setPreviewVersion/);
  assert.match(reset, /setSelectedLayerId\(null\)/);
  assert.match(reset, /setCopiedAssetLayer\(null\)/);
  assert.match(reset, /File upload tetap tersimpan di koleksi media/);
  assert.doesNotMatch(designer, /Smartphone|copy\.phone|phone: "Ponsel"|phone: "Mobile"/);
  const canvas = designer.split('<div className="dc-studio-preview-workspace">')[1] || "";
  assert.ok(canvas.indexOf("dc-studio-stage-controls") >= 0 && canvas.indexOf("dc-studio-stage-controls") < canvas.indexOf('className="dc-studio-preview-surface"'));
  assert.match(designer, /isUndo && history.length/);
  assert.match(designer, /isRedo && future.length/);
  assert.match(designer, /event\.nativeEvent\.isComposing/);
  assert.match(styles, /\.dc-studio-history-actions \{[^}]*display: flex;[^}]*align-items: center/);
  assert.match(styles, /\.dc-studio-stage-controls button \{[^}]*border-radius: var\(--dc-control-radius\)/);
  assert.doesNotMatch(designer, /min-h-9 shrink-0 rounded-full/);
});


test("selected assets use a compact left list and right-side properties panel", () => {
  const assetPanel = read("components/InvitationStudio/AssetPanel.tsx");
  const layerInspector = read("components/InvitationStudio/AssetLayerInspector.tsx");
  assert.match(designer, /className="dc-studio-canvas-layout"/);
  assert.match(designer, /className="dc-studio-layer-list"/);
  assert.match(designer, /Asset \{assetNumber\}\/\{MAX_ASSET_LAYERS\}/);
  assert.match(designer, /onPosition=\{positionAssetLayer\}/);
  assert.match(layerInspector, /numberInput\("X"/);
  assert.match(layerInspector, /numberInput\("Y"/);
  assert.match(layerInspector, /numberInput\(en \? "Size" : "Size"/);
  assert.match(layerInspector, /numberInput\(en \? "Rotation" : "Rotasi"/);
  assert.match(layerInspector, /type="range"/);
  assert.match(layerInspector, /<option value="front">/);
  assert.match(layerInspector, /<option value="back">/);
  assert.doesNotMatch(layerInspector, /Trash2|onRemove|onCopy|onPaste/);
  assert.doesNotMatch(assetPanel, /selectedId|onReorder|onRemove|selected\.opacity/);
  assert.match(styles, /\.dc-studio-layer-list \{[^}]*width: 104px/);
  assert.match(styles, /\.dc-studio-layer-side \{[^}]*position: sticky;[^}]*width: 230px;[^}]*justify-self: end/);
  assert.match(styles, /\.dc-studio-section-side \{[^}]*width: 236px;[^}]*padding: 14px/);
  assert.match(styles, /\.dc-studio-section-side-head strong \{[^}]*font-size: 15px;[^}]*font-weight: 700/);
  assert.match(styles, /\.dc-studio-section-field \{[^}]*font-size: 12px;[^}]*font-weight: 600/);
});
