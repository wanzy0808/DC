import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
const studio = read("components/InvitationStudio/InvitationEditorPage.tsx");
const designer = read("components/InvitationStudio/InvitationDesigner.tsx");
const panels = read("components/InvitationStudio/DesignerPanels.tsx");
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
  assert.match(designer, /invitationTitleCase\(invitation\?\.title \|\| "Studio"\)/);
  assert.match(panels, /invitationTitleCase\(invitation\?\.title/);
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
  assert.match(panels, /aria-label=\{en \? "Search templates" : "Cari template"\}/);
  assert.match(panels, /sectionNamesEnglish/);
  assert.match(photos, /const en = locale === "en"/);
});

test("Studio custom button states follow DC Organizer light/dark text and sorting has an inset chevron", () => {
  assert.match(panels, /photoFilter === key \? "bg-\[#C07A84\] text-white [^"]*dark:text-black/);
  assert.doesNotMatch(panels, /photoFilter === key \? "bg-primary text-black"/);
  assert.match(designer, /canvasStage === "envelope" \? "bg-\[#C07A84\] text-white [^"]*dark:text-black/);
  assert.match(designer, /canvasStage === "cover" \|\| design\.sections\.envelope === false \? "bg-\[#C07A84\] text-white [^"]*dark:text-black/);
  assert.match(panels, /w-\[204px\] max-w-\[68%\] shrink-0/);
  assert.match(panels, /className="h-9 w-full appearance-none [^"]*pl-4 pr-11/);
  assert.match(panels, /<ChevronDown size=\{15\} [^>]*className="pointer-events-none absolute right-4/);
  assert.match(styles, /grid-template-columns: 108px 380px minmax\(0, 1fr\)/);
});
