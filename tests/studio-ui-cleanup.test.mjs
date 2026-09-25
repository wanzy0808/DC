import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
const studio = read("components/InvitationStudio/InvitationEditorPage.tsx");
const designer = read("components/InvitationStudio/InvitationDesigner.tsx");
const layerOrder = read("components/InvitationStudio/designer-layer-order.ts");
const persistence = read("components/InvitationStudio/designer-persistence.ts");
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

test("Studio text tool uses a simple Type icon instead of a text cursor icon", () => {
  const rail = designer.split('<nav className="dc-studio-rail"')[1]?.split("</nav>")[0] || "";
  assert.match(rail, /label=\{copy\.text\} icon=\{<Type/);
  assert.doesNotMatch(designer, /TextCursorInput/);
});

test("Studio left rail names the template browser Katalog", () => {
  const rail = designer.split('<nav className="dc-studio-rail"')[1]?.split("</nav>")[0] || "";
  assert.match(rail, /label=\{locale === "en" \? "Catalog" : "Katalog"\}/);
  assert.doesNotMatch(rail, /label="Template"/);
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

test("Studio left rail follows Catalog Isi Teks Foto Aset Musik Warna order", () => {
  const rail = designer.split('<nav className="dc-studio-rail"')[1]?.split("</nav>")[0] || "";
  const order = [
    'panel === "template"',
    'panel === "sections"',
    'panel === "text"',
    'panel === "decor"',
    'panel === "assets"',
    'panel === "music"',
    'panel === "color"',
  ];
  let previous = -1;
  for (const token of order) {
    const index = rail.indexOf(token);
    assert.ok(index > previous, `expected ${token} after previous Studio rail item`);
    previous = index;
  }
  assert.match(rail, /label=\{locale === "en" \? "Catalog" : "Katalog"\}/);
  assert.doesNotMatch(rail, /dc-studio-rail-divider/);
});

test("Studio folds Font into Text with four quick font pairs and See more", () => {
  const textPanel = read("components/InvitationStudio/TextObjectPanel.tsx");
  const types = read("components/InvitationStudio/designer-types.ts");
  const rail = designer.split('<nav className="dc-studio-rail"')[1]?.split("</nav>")[0] || "";
  assert.doesNotMatch(rail, /label="Font"|panel === "font"|setPanel\("font"\)/);
  assert.match(rail, /label=\{copy\.text\}/);
  assert.doesNotMatch(designer, /<FontPanel|panel === "font"/);
  assert.doesNotMatch(types, /\| "font"/);
  assert.match(textPanel, /orderedFonts\.slice\(0, 4\)/);
  assert.match(textPanel, /Kombinasi font/);
  assert.match(textPanel, /Lihat lebih banyak/);
  assert.match(textPanel, /setShowMoreFonts\(\(value\) => !value\)/);
  assert.match(textPanel, /onFontSelect\(key\)/);
  assert.match(textPanel, /<Button[\s\S]*variant="outline"[\s\S]*See more/);
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

test("Studio stage labels use Amplop and Isi while keeping internal cover state", () => {
  assert.match(designer, /envelope: "Amplop", cover: "Isi"/);
  assert.match(designer, /envelope: "Envelope", cover: "Content"/);
  assert.match(designer, /canvasStage === "cover"/);
  assert.match(designer, /setCanvasStage\("cover"\)/);
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


test("asset library inserts images by drag-and-drop only", () => {
  const assetPanel = read("components/InvitationStudio/AssetPanel.tsx");
  assert.doesNotMatch(assetPanel, /onAdd:\s*\(src: string\)/);
  assert.doesNotMatch(assetPanel, /onClick=\{\(\) => onAdd\(asset\.src\)\}/);
  assert.match(assetPanel, /draggable=\{layers\.length < MAX_ASSET_LAYERS\}/);
  assert.match(assetPanel, /onDragAssetStart\(asset\.src\)/);
  assert.match(assetPanel, /Seret gambar ke section undangan/);
  assert.doesNotMatch(designer, /<AssetPanel[^>]*onAdd=\{addAssetLayer\}/);
});

test("selected Studio objects use an icon rotate handle without a connector line", () => {
  const assetLayers = read("components/PublicInvitation/InvitationAssetLayers.tsx");
  assert.match(assetLayers, /import \{ Lock, RotateCw \} from "lucide-react"/);
  assert.match(assetLayers, /<RotateCw aria-hidden="true" size=\{15\}/);
  assert.match(assetLayers, /aria-label="Putar objek"/);
  assert.doesNotMatch(assetLayers, /top-full left-1\/2 h-6 w-px/);
  assert.doesNotMatch(assetLayers, /h-1\.5 w-1\.5 rounded-full bg-primary/);
});

test("asset clicks cannot bubble into section selection", () => {
  const sectionInstance = read("components/PublicInvitation/EditableSectionInstance.tsx");
  const assetLayers = read("components/PublicInvitation/InvitationAssetLayers.tsx");
  assert.match(sectionInstance, /target\.closest\([\s\S]*\[data-studio-design-object\]/);
  assert.match(assetLayers, /event\.stopPropagation\(\); if \(event\.detail === 0\) onSelect\?\.\(layer\.id, event\.shiftKey\)/);
});

test("overlapping Studio assets use left-click selection and cycle to the layer underneath", () => {
  const assetLayers = read("components/PublicInvitation/InvitationAssetLayers.tsx");
  assert.match(assetLayers, /event\.button !== 0/);
  assert.match(assetLayers, /moved: boolean/);
  assert.match(assetLayers, /Math\.hypot\([^)]*\) > 3/);
  assert.match(assetLayers, /onCycleSelect\?\.\(layer\.id, event\.clientX, event\.clientY\)/);
  assert.match(assetLayers, /zIndex: editable && selected \? 40 : undefined/);
  assert.match(assetLayers, /layer\.locked \? "cursor-default" : "cursor-grab active:cursor-grabbing"/);
  assert.doesNotMatch(assetLayers, /interactionEnabled/);
  assert.match(assetLayers, /currentIndex <= 0 \? hits\.length - 1 : currentIndex - 1/);
});

test("right-side text size styling reaches nested RSVP and wishes fields", () => {
  const rsvpPanels = read("components/InvitationStudio/RsvpPanels.tsx");
  const wishes = read("components/PublicInvitation/GuestWishes.tsx");
  assert.match(rsvpPanels, /const inputFontSize = rsvpConfig\.elementStyles\.inputs\?\.fontSize/);
  assert.match(rsvpPanels, /const inputTextStyle = inputFontSize !== undefined/);
  assert.match(rsvpPanels, /style=\{inputTextStyle\}/);
  assert.match(wishes, /const inputTextStyle = inputStyle\?\.fontSize !== undefined/);
  assert.match(wishes, /style=\{inputTextStyle\}/);
});

test("right-side Studio inspectors avoid redundant component labels and use one Reset label", () => {
  const rsvpInspector = read("components/InvitationStudio/RsvpElementInspector.tsx");
  const sectionElementInspector = read("components/InvitationStudio/SectionElementInspector.tsx");
  const copyInspector = read("components/InvitationStudio/CopyTextInspector.tsx");
  const sectionInspector = read("components/InvitationStudio/SectionInspector.tsx");

  assert.doesNotMatch(rsvpInspector, />Komponen RSVP<|>RSVP component</);
  assert.doesNotMatch(sectionElementInspector, />Komponen<|>Component</);
  assert.doesNotMatch(sectionInspector, /functionalNotes|>Komponen<|>Components</);
  assert.doesNotMatch(rsvpInspector, /Reset komponen|Reset component/);
  assert.doesNotMatch(sectionElementInspector, /Reset komponen|Reset component/);
  assert.doesNotMatch(copyInspector, /Reset teks|Reset text/);
  assert.doesNotMatch(sectionInspector, /Reset section/);
  assert.match(rsvpInspector, />\s*Reset\s*</);
  assert.match(sectionElementInspector, />\s*Reset\s*</);
  assert.match(copyInspector, />\s*Reset\s*</);
  assert.match(sectionInspector, />\s*Reset\s*</);
});

test("selected assets use a compact left list and right-side properties panel", () => {
  const assetPanel = read("components/InvitationStudio/AssetPanel.tsx");
  const layerInspector = read("components/InvitationStudio/AssetLayerInspector.tsx");
  assert.match(designer, /className="dc-studio-canvas-layout"/);
  assert.match(designer, /className="dc-studio-layer-list"/);
  assert.match(designer, /const automaticLayerName = layer\.kind === "text"/);
  assert.match(designer, /const layerName = layer\.name\?\.trim\(\) \|\| automaticLayerName/);
  assert.match(designer, /dc-studio-layer-select-button/);
  assert.match(designer, /onPosition=\{positionAssetLayer\}/);
  assert.match(layerInspector, /numberInput\("X"/);
  assert.match(layerInspector, /numberInput\("Y"/);
  assert.match(layerInspector, /numberInput\(en \? "Size" : "Size"/);
  assert.match(layerInspector, /numberInput\(en \? "Rotation" : "Rotasi"/);
  assert.match(layerInspector, /type="range"/);
  assert.match(layerInspector, /onPosition\(selectedAssetLayer\.id, "front"\)/);
  assert.match(layerInspector, /onPosition\(selectedAssetLayer\.id, "forward"\)/);
  assert.match(layerInspector, /onPosition\(selectedAssetLayer\.id, "backward"\)/);
  assert.match(layerInspector, /onPosition\(selectedAssetLayer\.id, "back"\)/);
  assert.match(layerInspector, /function LayerStackIcon/);
  assert.match(layerInspector, /<rect x="3\.5" y="8\.5"/);
  assert.match(layerInspector, /<rect x="6\.5" y="5\.5"/);
  assert.match(layerInspector, /<rect x="9\.5" y="2\.5"/);
  assert.match(layerInspector, /<LayerStackIcon action="front" \/>/);
  assert.match(layerInspector, /<LayerStackIcon action="forward" \/>/);
  assert.match(layerInspector, /<LayerStackIcon action="backward" \/>/);
  assert.match(layerInspector, /<LayerStackIcon action="back" \/>/);
  assert.doesNotMatch(layerInspector, /ChevronDown|ChevronUp|ChevronsDown|ChevronsUp/);
  assert.match(designer, /position: "front" \| "forward" \| "backward" \| "back"/);
  assert.match(designer, /position === "forward"/);
  assert.match(designer, /position === "backward"/);
  assert.match(styles, /\.dc-studio-layer-order \{[^}]*grid-template-columns: repeat\(4, minmax\(0, 1fr\)\)/);
  assert.doesNotMatch(layerInspector, /Trash2|onRemove|onCopy|onPaste/);
  assert.doesNotMatch(assetPanel, /selectedId|onReorder|onRemove|selected\.opacity/);
  assert.match(styles, /\.dc-studio-layer-list \{[^}]*width: 104px/);
  assert.match(styles, /\.dc-studio-layer-side \{[^}]*position: sticky;[^}]*width: 230px;[^}]*justify-self: end/);
  assert.match(styles, /\.dc-studio-section-side \{[^}]*width: 236px;[^}]*padding: 14px/);
  assert.match(styles, /\.dc-studio-section-side-head strong \{[^}]*font-size: 15px;[^}]*font-weight: 700/);
  assert.match(styles, /\.dc-studio-section-field \{[^}]*font-size: 12px;[^}]*font-weight: 600/);
});


test("Studio supports standard cut and non-destructive photo crop controls", () => {
  const photoSlots = read("lib/templates/photo-slots.ts");
  assert.match(designer, /shortcutKey === "x"/);
  assert.match(designer, /setCopiedAssetLayers\(copies\)/);
  assert.match(designer, /setCopiedAssetLayer\(copies\.at\(-1\) \?\? null\)/);
  assert.match(designer, /removeAssetLayer\(selectedAssetLayer\.id\)/);
  assert.match(designer, /shortcutKey === "d"/);
  assert.match(designer, /duplicateSelectedAssetLayer\(\)/);
  assert.match(photos, /Crop & posisi/);
  assert.match(photos, /onSetCrop/);
  assert.match(photos, /onResetCrop/);
  assert.match(photoSlots, /export type PhotoCrop = \{ x: number; y: number; zoom: number; aspect\?: PhotoCropAspect \}/);
  assert.match(photoSlots, /crop: Record<CroppablePhotoSlot, PhotoCrop \| null>/);
  assert.match(photoSlots, /photoCropStyle/);
});


test("Studio layers can be locked and hidden without removing them from the design", () => {
  const assetLayers = read("lib/templates/asset-layers.ts");
  const assetRenderer = read("components/PublicInvitation/InvitationAssetLayers.tsx");
  const assetInspector = read("components/InvitationStudio/AssetLayerInspector.tsx");
  const textInspector = read("components/InvitationStudio/TextLayerInspector.tsx");

  assert.match(assetLayers, /locked\?: boolean/);
  assert.match(assetLayers, /hidden\?: boolean/);
  assert.match(assetLayers, /entry\.locked === true/);
  assert.match(assetLayers, /entry\.hidden === true/);
  assert.match(assetRenderer, /&& !layer\.hidden/);
  assert.match(assetRenderer, /layer\.locked/);
  assert.match(assetInspector, /Buka kunci layer|Unlock layer/);
  assert.match(assetInspector, /Sembunyikan layer|Hide layer/);
  assert.match(textInspector, /Terkunci/);
  assert.match(textInspector, /Tersembunyi/);
  assert.match(designer, /dc-studio-layer-quick/);
  assert.match(designer, /layerName/);
});


test("Studio design layers snap to section and nearby alignment guides", () => {
  const assetRenderer = read("components/PublicInvitation/InvitationAssetLayers.tsx");
  assert.match(assetRenderer, /const xCandidates = \[/);
  assert.match(assetRenderer, /target: 50, guide: 50/);
  assert.match(assetRenderer, /siblings\.filter/);
  assert.match(assetRenderer, /distance: 1\.4/);
  assert.match(assetRenderer, /guides\.x !== undefined/);
  assert.match(assetRenderer, /guides\.y !== undefined/);
  assert.match(assetRenderer, /event\.shiftKey \? 5 : 1/);
});


test("Studio crop mode edits the photo inside its fixed canvas frame", () => {
  const cropOverlay = read("components/InvitationStudio/StudioPhotoCropOverlay.tsx");
  const preview = read("components/InvitationStudio/InvitationPreview.tsx");
  const universal = read("components/PublicInvitation/UniversalInvitationTemplate.tsx");
  const rose = read("components/PublicInvitation/RomanticRoseTemplate.tsx");

  assert.match(designer, /cropModeSlot/);
  assert.match(designer, /activeCropSlot=\{cropModeSlot\}/);
  assert.match(cropOverlay, /data-studio-photo-crop/);
  assert.match(cropOverlay, /setPointerCapture/);
  assert.match(cropOverlay, /onChange\(liveRef\.current\)/);
  assert.match(cropOverlay, /Geser untuk atur posisi/);
  assert.match(preview, /activeCropSlot/);
  assert.match(universal, /StudioPhotoCropOverlay/);
  assert.match(rose, /StudioPhotoCropOverlay/);
});


test("Studio canvas has local zoom controls that do not alter saved invitation geometry", () => {
  assert.match(designer, /canvasZoom/);
  assert.match(designer, /<ZoomOut size=\{14\}/);
  assert.match(designer, /<ZoomIn size=\{14\}/);
  assert.match(designer, /style=\{\{ zoom: canvasZoom \}\}/);
  assert.match(designer, /Math\.max\(0\.7/);
  assert.match(designer, /Math\.min\(1\.3/);
});


test("Studio image layers support flip transforms and quick centering", () => {
  const assetLayers = read("lib/templates/asset-layers.ts");
  const assetRenderer = read("components/PublicInvitation/InvitationAssetLayers.tsx");
  const assetInspector = read("components/InvitationStudio/AssetLayerInspector.tsx");
  const textInspector = read("components/InvitationStudio/TextLayerInspector.tsx");

  assert.match(assetLayers, /flipX\?: boolean/);
  assert.match(assetLayers, /flipY\?: boolean/);
  assert.match(assetRenderer, /scaleX\(\$\{layer\.flipX \? -1 : 1\}\)/);
  assert.match(assetRenderer, /scaleY\(\$\{layer\.flipY \? -1 : 1\}\)/);
  assert.match(assetInspector, /Posisi cepat/);
  assert.match(assetInspector, /flipX/);
  assert.match(assetInspector, /flipY/);
  assert.match(textInspector, /Posisi cepat/);
});


test("Studio clipboard shortcuts never hijack text editing", () => {
  assert.match(designer, /closest\('input, textarea, select, \[contenteditable="true"\], \[role="textbox"\]'\)/);
  assert.match(designer, /window\.getSelection\(\)\?\.toString\(\)/);
  assert.match(designer, /event\.isComposing/);
  assert.match(designer, /shortcutKey === "c"/);
  assert.match(designer, /shortcutKey === "x"/);
  assert.match(designer, /shortcutKey === "v"/);
});


test("Studio supports shift multi-select and persistent group controls", () => {
  const assetLayers = read("lib/templates/asset-layers.ts");
  const assetRenderer = read("components/PublicInvitation/InvitationAssetLayers.tsx");
  const preview = read("components/InvitationStudio/InvitationPreview.tsx");

  assert.match(assetLayers, /groupId\?: string/);
  assert.match(designer, /selectedLayerIds/);
  assert.match(designer, /function groupSelectedAssetLayers\(\)/);
  assert.match(designer, /function ungroupSelectedAssetLayers\(\)/);
  assert.match(designer, /event\.shiftKey/);
  assert.match(designer, /selectedAssetLayerIds=\{selectedLayerIds\}/);
  assert.match(designer, /dc-studio-layer-group-actions/);
  assert.match(assetRenderer, /selectedIds\?: string\[\]/);
  assert.match(assetRenderer, /onSelect\?: \(id: string, additive\?: boolean\)/);
  assert.match(preview, /selectedAssetLayerIds\?: string\[\]/);
});


test("Studio has standard multi-select keyboard shortcuts", () => {
  assert.match(designer, /shortcutKey === "a"/);
  assert.match(designer, /shortcutKey === "g"/);
  assert.match(designer, /event\.shiftKey && shortcutKey === "g"/);
  assert.match(designer, /groupSelectedAssetLayers\(\)/);
  assert.match(designer, /ungroupSelectedAssetLayers\(\)/);
});


test("Studio photo crop includes persisted aspect-ratio presets without destructive image edits", () => {
  const photoSlots = read("lib/templates/photo-slots.ts");
  assert.match(photos, /Rasio crop|Aspect ratio/);
  assert.match(photos, /"original"/);
  assert.match(photos, /"1:1"/);
  assert.match(photos, /"4:5"/);
  assert.match(photos, /"3:4"/);
  assert.match(photos, /"16:9"/);
  assert.match(photoSlots, /export type PhotoCropAspect = "template" \| "original" \| "1:1" \| "4:5" \| "3:4" \| "16:9"/);
  assert.match(photoSlots, /aspectRatio/);
});


test("Studio multi-select exposes align and distribute controls", () => {
  assert.match(designer, /function alignSelectedAssetLayers\(mode:/);
  assert.match(designer, /function distributeSelectedAssetLayers\(axis:/);
  assert.match(designer, /alignSelectedAssetLayers\("left"\)/);
  assert.match(designer, /alignSelectedAssetLayers\("center-x"\)/);
  assert.match(designer, /alignSelectedAssetLayers\("right"\)/);
  assert.match(designer, /alignSelectedAssetLayers\("top"\)/);
  assert.match(designer, /alignSelectedAssetLayers\("center-y"\)/);
  assert.match(designer, /alignSelectedAssetLayers\("bottom"\)/);
  assert.match(designer, /distributeSelectedAssetLayers\("horizontal"\)/);
  assert.match(designer, /distributeSelectedAssetLayers\("vertical"\)/);
});


test("Studio clipboard operations preserve multi-selection and copied groups", () => {
  assert.match(designer, /const \[copiedAssetLayers, setCopiedAssetLayers\] = useState<InvitationAssetLayer\[]>\(\[\]\)/);
  assert.match(designer, /function currentClipboardSelection\(/);
  assert.match(designer, /function cloneAssetLayers\(/);
  assert.match(designer, /setCopiedAssetLayers\(copies\)/);
  assert.match(designer, /groupIds = new Map<string, string>\(\)/);
  assert.match(designer, /setSelectedLayerIds\(ids\)/);
  assert.match(designer, /const cuttable = currentClipboardSelection\(false\)/);
});


test("Studio canvas zoom supports reset to 100 percent and fit-to-workspace", () => {
  assert.match(designer, /function fitCanvasZoom\(\)/);
  assert.match(designer, /querySelector<HTMLElement>\("\.dc-studio-preview-surface"\)/);
  assert.match(designer, /setCanvasZoom\(1\)/);
  assert.match(designer, /onClick=\{fitCanvasZoom\}/);
  assert.match(designer, />Fit<\/button>/);
});


test("Studio canvas supports Space-drag panning at zoomed sizes", () => {
  const assetLayers = read("components/PublicInvitation/InvitationAssetLayers.tsx");
  assert.match(designer, /function beginCanvasPan\(/);
  assert.match(designer, /function moveCanvasPan\(/);
  assert.match(designer, /function endCanvasPan\(/);
  assert.match(designer, /data-space-pan=\{canvasPanReady \? "true" : undefined\}/);
  assert.match(designer, /event\.code !== "Space"/);
  assert.match(designer, /onPointerMove=\{moveCanvasPan\}/);
  assert.match(assetLayers, /data-space-pan="true"/);
  assert.match(styles, /\.dc-studio-canvas-scroll \{[^}]*overflow: auto;/);
  assert.match(styles, /data-panning="true"/);
});


test("Studio layer list supports direct drag reordering while locked layers stay fixed", () => {
  assert.match(designer, /function reorderAssetLayer\(sourceId: string, targetId: string\)/);
  assert.match(designer, /draggable=\{!layer\.locked\}/);
  assert.match(designer, /application\/x-dc-layer/);
  assert.match(designer, /reorderAssetLayer\(sourceId, layer\.id\)/);
  assert.match(designer, /data-layer-drag-over/);
  assert.match(styles, /data-layer-drag-over="true"/);
});

test("Studio keeps layer ordering rules in a pure helper module", () => {
  assert.match(designer, /from "@\/components\/InvitationStudio\/designer-layer-order"/);
  assert.match(designer, /reorderAssetLayers\(design\.layers, sourceId, targetId\)/);
  assert.match(designer, /positionAssetLayers\(design\.layers, id, position\)/);
  assert.match(layerOrder, /export function reorderAssetLayers\(/);
  assert.match(layerOrder, /source\.locked/);
  assert.match(layerOrder, /export function positionAssetLayers\(/);
  assert.match(layerOrder, /position === "forward"/);
  assert.match(layerOrder, /position === "backward"/);
  assert.match(layerOrder, /position === "front"/);
  assert.match(layerOrder, /next\.unshift\(layer\)/);
});

test("Studio keeps invitation and template persistence outside the canvas component", () => {
  assert.match(designer, /from "@\/components\/InvitationStudio\/designer-persistence"/);
  assert.match(designer, /await loadStudioInvitation\(invitationId, legacyType\)/);
  assert.match(designer, /await saveStudioInvitation\(/);
  assert.match(designer, /await createStudioTemplate\(/);
  assert.match(designer, /makeStudioServerRevision\(savedInvitation\)/);
  assert.match(persistence, /export async function loadStudioInvitation\(/);
  assert.match(persistence, /fetcher\(\`\/api\/invitations\$\{query\}\`/);
  assert.match(persistence, /export async function saveStudioInvitation\(/);
  assert.match(persistence, /fetcher\("\/api\/invitations"/);
  assert.match(persistence, /export async function createStudioTemplate\(/);
  assert.match(persistence, /fetcher\("\/api\/designer\/templates"/);
});

