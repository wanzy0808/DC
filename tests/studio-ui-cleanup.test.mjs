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
  assert.match(styles, /grid-template-columns: 168px 360px minmax\(0, 1fr\)/);
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

test("Studio custom button states follow DC Organizer light/dark text and sorting has an inset chevron", () => {
  assert.match(templatePanel, /photoFilter === key \? "bg-\[#C07A84\] text-white [^"]*dark:text-black/);
  assert.doesNotMatch(templatePanel, /photoFilter === key \? "bg-primary text-black"/);
  assert.match(designer, /canvasStage === "envelope" \? "bg-\[#C07A84\] text-white [^"]*dark:text-black/);
  assert.match(designer, /canvasStage === "cover" \|\| design\.sections\.envelope === false \? "bg-\[#C07A84\] text-white [^"]*dark:text-black/);
  assert.match(templatePanel, /w-\[204px\] max-w-\[68%\] shrink-0/);
  assert.match(templatePanel, /className="h-9 w-full appearance-none [^"]*pl-4 pr-11/);
  assert.match(templatePanel, /<ChevronDown size=\{15\} [^>]*className="pointer-events-none absolute right-4/);
  assert.match(styles, /grid-template-columns: 168px 380px minmax\(0, 1fr\)/);
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

test("Studio keeps Save in the header, history beside Default and stages directly above the invitation", () => {
  assert.match(designer, /save: "Simpan"/);
  assert.doesNotMatch(designer, /save: "Simpan Desain"/);
  const toolbar = designer.split('<header className="dc-studio-toolbar">')[1]?.split("</header>")[0] || "";
  assert.match(toolbar, /onClick=\{save\}/);
  assert.doesNotMatch(toolbar, /onClick=\{undo\}|onClick=\{redo\}/);
  const rail = designer.split('<nav className="dc-studio-rail"')[1]?.split("</nav>")[0] || "";
  const row = rail.split('<div className="dc-studio-reset-history-row"')[1]?.split('</div>\n          </div>')[0] || "";
  assert.match(row, /onClick=\{restoreDefaults\}/);
  assert.match(row, /dc-studio-history-actions/);
  assert.ok(row.indexOf("onClick={restoreDefaults}") < row.indexOf("onClick={undo}") && row.indexOf("onClick={undo}") < row.indexOf("onClick={redo}"));
  assert.match(rail, /onClick=\{undo\} disabled=\{!invitation \|\| saving \|\| audioBusy \|\| !history.length\}/);
  assert.match(rail, /onClick=\{redo\} disabled=\{!invitation \|\| saving \|\| audioBusy \|\| !future.length\}/);
  const canvas = designer.split('<div className="dc-studio-preview-workspace">')[1] || "";
  assert.ok(canvas.indexOf("dc-studio-stage-controls") >= 0 && canvas.indexOf("dc-studio-stage-controls") < canvas.indexOf('className="dc-studio-preview-surface"'));
  assert.match(designer, /isUndo && history.length/);
  assert.match(designer, /isRedo && future.length/);
  assert.match(designer, /event\.nativeEvent\.isComposing/);
  assert.match(styles, /\.dc-studio-reset-history-row \{[^}]*display: flex;[^}]*align-items: center/);
  assert.match(styles, /\.dc-studio-reset-history-row \.dc-studio-history-actions button \{[^}]*width: 44px; height: 44px/);
  assert.match(styles, /\.dc-studio-stage-controls button \{[^}]*border-radius: var\(--dc-control-radius\)/);
  assert.doesNotMatch(designer, /min-h-9 shrink-0 rounded-full/);
});
