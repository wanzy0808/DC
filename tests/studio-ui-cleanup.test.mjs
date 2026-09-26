import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
const studio = read("components/InvitationStudio/InvitationEditorPage.tsx");
const designer = read("components/InvitationStudio/InvitationDesigner.tsx");
const layerList = read("components/InvitationStudio/StudioLayerList.tsx");
const layerOrder = read("components/InvitationStudio/designer-layer-order.ts");
const persistence = read("components/InvitationStudio/designer-persistence.ts");
const layerAnimationControls = read("components/InvitationStudio/LayerAnimationControls.tsx");
const layerAnimationHook = read("components/PublicInvitation/use-layer-animation.ts");
const entranceAnimationRuntime = read("components/PublicInvitation/entrance-animation-runtime.ts");
const layerTextContent = read("components/PublicInvitation/InvitationLayerTextContent.tsx");
const assetLayerModel = read("lib/templates/asset-layers.ts");
const sectionStyles = read("lib/templates/section-styles.ts");
const photoSlots = read("lib/templates/photo-slots.ts");
const photoSlotInspector = read("components/InvitationStudio/PhotoSlotInspector.tsx");
const photoAnimationHook = read("components/PublicInvitation/use-photo-animations.ts");
const photoParallaxRuntime = read("components/PublicInvitation/photo-parallax-runtime.ts");
const copyMotionModel = read("lib/templates/editable-copy-motion.ts");
const copyMotionControls = read("components/InvitationStudio/CopyMotionControls.tsx");
const copyAnimationHook = read("components/PublicInvitation/use-copy-animations.ts");
const ourStorySection = read("components/PublicInvitation/OurStorySection.tsx");
const premiumTimelineModel = read("lib/templates/premium-timelines.ts");
const premiumTimelineHook = read("components/PublicInvitation/use-premium-section-timelines.ts");
const motionPerformance = read("lib/templates/motion-performance.ts");
const canvasSelectionMarkers = read("components/InvitationStudio/useStudioCanvasSelectionMarkers.ts");
const canvasSelectionResolver = read("components/InvitationStudio/studio-canvas-selection.ts");
const selectionInspector = read("components/InvitationStudio/StudioSelectionInspector.tsx");
const canvasToolbarSource = read("components/InvitationStudio/StudioCanvasToolbar.tsx");
const stageControlsSource = read("components/InvitationStudio/StudioStageControls.tsx");
const sectionAnimationHook = read("components/PublicInvitation/use-section-animations.ts");
const sectionInspector = read("components/InvitationStudio/SectionInspector.tsx");
const universalTemplate = read("components/PublicInvitation/UniversalInvitationTemplate.tsx");
const romanticTemplate = read("components/PublicInvitation/RomanticRoseTemplate.tsx");
const themeScenes = read("components/PublicInvitation/InvitationThemeScenes.tsx");
const zenGallery = read("components/PublicInvitation/ZenAtelierGallery.tsx");
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
  assert.match(stageControlsSource, /bg-\[#C07A84\][^"]*text-white[^"]*dark:text-black/);
  assert.match(stageControlsSource, /aria-pressed=\{stage === "envelope"\}/);
  assert.match(stageControlsSource, /aria-pressed=\{stage === "cover" \|\| !envelopeEnabled\}/);
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
  assert.match(stageControlsSource, /min-h-9 shrink-0 rounded-\[var\(--dc-control-radius\)\]/);
  assert.doesNotMatch(stageControlsSource, /min-h-9 shrink-0 rounded-full/);
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
  assert.match(designer, /stage=\{canvasStage\}/);
  assert.match(designer, /onContent=\{\(\) => setCanvasStage\("cover"\)\}/);
});

test("Studio keeps Template Restart Undo Redo Save in one canvas toolbar row", () => {
  assert.match(designer, /save: "Simpan"/);
  assert.doesNotMatch(designer, /save: "Simpan Desain"/);
  assert.doesNotMatch(designer, /<header className="dc-studio-toolbar">/);
  const rail = designer.split('<nav className="dc-studio-rail"')[1]?.split("</nav>")[0] || "";
  assert.doesNotMatch(rail, /onClick=\{restoreDefaults\}|copy\.startOver|onClick=\{undo\}|onClick=\{redo\}|onClick=\{save\}/);
  assert.match(designer, /<StudioCanvasToolbar/);
  assert.match(designer, /onRestore=\{restoreDefaults\}/);
  assert.match(designer, /onUndo=\{undo\}/);
  assert.match(designer, /onRedo=\{redo\}/);
  assert.match(designer, /onSave=\{save\}/);
  assert.match(designer, /canUndo=\{history\.length > 0\}/);
  assert.match(designer, /canRedo=\{future\.length > 0\}/);
  assert.match(canvasToolbarSource, /className="dc-studio-canvas-toolbar"/);
  assert.match(canvasToolbarSource, /dc-studio-history-actions/);
  assert.match(canvasToolbarSource, /onClick=\{onRestore\}/);
  assert.match(canvasToolbarSource, /onClick=\{onUndo\}/);
  assert.match(canvasToolbarSource, /onClick=\{onRedo\}/);
  assert.match(canvasToolbarSource, /onClick=\{onSave\}/);
  assert.match(canvasToolbarSource, /aria-label=\{labels\.replay\}/);
  assert.doesNotMatch(designer, /undoShort|redoShort|restartShort/);
  assert.ok(
    canvasToolbarSource.indexOf("templateName") < canvasToolbarSource.indexOf("onClick={onRestore}") &&
    canvasToolbarSource.indexOf("onClick={onRestore}") < canvasToolbarSource.indexOf("onClick={onUndo}") &&
    canvasToolbarSource.indexOf("onClick={onUndo}") < canvasToolbarSource.indexOf("onClick={onRedo}") &&
    canvasToolbarSource.indexOf("onClick={onRedo}") < canvasToolbarSource.indexOf("onClick={onSave}"),
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
  assert.ok(canvas.indexOf("<StudioStageControls") >= 0 && canvas.indexOf("<StudioStageControls") < canvas.indexOf('className="dc-studio-preview-surface"'));
  assert.match(stageControlsSource, /className="dc-studio-stage-controls"/);
  assert.match(designer, /isUndo && history.length/);
  assert.match(designer, /isRedo && future.length/);
  assert.match(designer, /event\.nativeEvent\.isComposing/);
  assert.match(styles, /\.dc-studio-history-actions \{[^}]*display: flex;[^}]*align-items: center/);
  assert.match(styles, /\.dc-studio-stage-controls button \{[^}]*border-radius: var\(--dc-control-radius\)/);
  assert.doesNotMatch(stageControlsSource, /min-h-9 shrink-0 rounded-full/);
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
  assert.match(designer, /<StudioLayerList/);
  assert.match(layerList, /className="dc-studio-layer-list"/);
  assert.match(layerList, /const automaticLayerName = layer\.kind === "text"/);
  assert.match(layerList, /const layerName = layer\.name\?\.trim\(\) \|\| automaticLayerName/);
  assert.match(layerList, /dc-studio-layer-select-button/);
  assert.match(designer, /onPositionAsset=\{positionAssetLayer\}/);
  assert.match(selectionInspector, /onPosition=\{onPositionAsset\}/);
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
  assert.match(designer, /position: AssetLayerPosition/);
  assert.match(layerOrder, /position === "forward"/);
  assert.match(layerOrder, /position === "backward"/);
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
  assert.match(layerList, /dc-studio-layer-quick/);
  assert.match(layerList, /layerName/);
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
  assert.match(stageControlsSource, /<ZoomOut size=\{14\}/);
  assert.match(stageControlsSource, /<ZoomIn size=\{14\}/);
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
  assert.match(layerList, /event\.shiftKey/);
  assert.match(designer, /selectedAssetLayerIds=\{selectedLayerIds\}/);
  assert.match(layerList, /dc-studio-layer-group-actions/);
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
  assert.match(layerList, /onAlign\("left"\)/);
  assert.match(layerList, /onAlign\("center-x"\)/);
  assert.match(layerList, /onAlign\("right"\)/);
  assert.match(layerList, /onAlign\("top"\)/);
  assert.match(layerList, /onAlign\("center-y"\)/);
  assert.match(layerList, /onAlign\("bottom"\)/);
  assert.match(layerList, /onDistribute\("horizontal"\)/);
  assert.match(layerList, /onDistribute\("vertical"\)/);
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
  const canvasPan = read("components/InvitationStudio/useStudioCanvasPan.ts");
  assert.match(designer, /useStudioCanvasPan\(\)/);
  assert.match(canvasPan, /function beginCanvasPan\(/);
  assert.match(canvasPan, /function moveCanvasPan\(/);
  assert.match(canvasPan, /function endCanvasPan\(/);
  assert.match(canvasPan, /Math\.hypot\(dx, dy\) > 3/);
  assert.match(designer, /data-space-pan=\{canvasPanReady \? "true" : undefined\}/);
  assert.match(designer, /event\.code !== "Space"/);
  assert.match(designer, /onPointerMove=\{moveCanvasPan\}/);
  assert.match(designer, /consumeSuppressedCanvasClick\(\)/);
  assert.match(assetLayers, /data-space-pan="true"/);
  assert.match(styles, /\.dc-studio-canvas-scroll \{[^}]*overflow: auto;/);
  assert.match(styles, /data-panning="true"/);
});


test("Studio layer list supports direct drag reordering while locked layers stay fixed", () => {
  assert.match(designer, /function reorderAssetLayer\(sourceId: string, targetId: string\)/);
  assert.match(layerList, /draggable=\{!layer\.locked\}/);
  assert.match(layerList, /application\/x-dc-layer/);
  assert.match(layerList, /onReorder\(sourceId, layer\.id\)/);
  assert.match(layerList, /data-layer-drag-over/);
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
  assert.match(designer, /await uploadStudioAsset\(invitation\.id, assetType, file\)/);
  assert.match(designer, /await deleteStudioAsset\(id\)/);
  assert.match(designer, /makeStudioServerRevision\(savedInvitation\)/);
  assert.match(persistence, /export async function loadStudioInvitation\(/);
  assert.match(persistence, /fetcher\(\`\/api\/invitations\$\{query\}\`/);
  assert.match(persistence, /export async function saveStudioInvitation\(/);
  assert.match(persistence, /fetcher\("\/api\/invitations"/);
  assert.match(persistence, /export async function createStudioTemplate\(/);
  assert.match(persistence, /fetcher\("\/api\/designer\/templates"/);
  assert.match(persistence, /export async function uploadStudioAsset\(/);
  assert.match(persistence, /fetcher\("\/api\/invitations\/assets\/upload"/);
  assert.match(persistence, /export async function deleteStudioAsset\(/);
});

test("Studio element layers reuse the shared animation catalog and persist timing safely", () => {
  const assetInspector = read("components/InvitationStudio/AssetLayerInspector.tsx");
  const textInspector = read("components/InvitationStudio/TextLayerInspector.tsx");
  const assetRenderer = read("components/PublicInvitation/InvitationAssetLayers.tsx");

  assert.match(assetLayerModel, /animation\?: InvitationSectionAnimation/);
  assert.match(assetLayerModel, /isInvitationSectionAnimation\(entry\.animation\)/);
  assert.match(assetLayerModel, /entry\.animationDuration, 0\.2, 2\.5/);
  assert.match(assetLayerModel, /entry\.animationDelay, 0, 2/);

  assert.match(layerAnimationControls, /sectionAnimationGroups/);
  assert.match(layerAnimationControls, /sectionAnimationPresets/);
  assert.match(layerAnimationControls, /getSectionAnimationPreset\(layer\.animation\)/);
  assert.match(assetInspector, /<LayerAnimationControls locale=\{locale\} layer=\{selectedAssetLayer\}/);
  assert.match(textInspector, /<LayerAnimationControls locale=\{locale\} layer=\{layer\}/);

  assert.match(assetRenderer, /useInvitationLayerAnimation\(motion, layer\)/);
  assert.match(assetRenderer, /data-studio-layer-motion/);
  assert.match(assetRenderer, /data-invitation-layer-motion/);
  assert.match(layerAnimationHook, /observeInvitationEntrances/);
  assert.match(entranceAnimationRuntime, /prefers-reduced-motion: reduce/);
  assert.match(entranceAnimationRuntime, /sectionAnimationKeyframes\(config\.animation\)/);
  assert.match(entranceAnimationRuntime, /getSectionAnimationPreset\(config\.animation\)/);
  assert.match(entranceAnimationRuntime, /IntersectionObserver/);

  assert.match(sectionStyles, /isInvitationSectionAnimation\(source\.animation\)/);
  assert.doesNotMatch(sectionStyles, /invitationSectionAnimationValues/);
});

test("Section and element entrance animations share one playback runtime", () => {
  const sectionHook = read("components/PublicInvitation/use-section-animations.ts");
  assert.match(sectionHook, /observeInvitationEntrances\(targets\)/);
  assert.match(layerAnimationHook, /observeInvitationEntrances\(\[\{/);
  assert.match(entranceAnimationRuntime, /const animations = new Set<Animation>\(\)/);
  assert.match(entranceAnimationRuntime, /duration: Math\.round\(\(config\.duration \?\? preset\.duration\) \* 1000\)/);
  assert.match(entranceAnimationRuntime, /easing: preset\.easing/);
  assert.match(entranceAnimationRuntime, /observer\.unobserve\(node\)/);
});

test("Studio decorative text supports staggered whole word character and line choreography", () => {
  const assetRenderer = read("components/PublicInvitation/InvitationAssetLayers.tsx");

  assert.match(assetLayerModel, /export type InvitationTextAnimationUnit = "whole" \| "word" \| "character" \| "line"/);
  assert.match(assetLayerModel, /textAnimationUnit\?: InvitationTextAnimationUnit/);
  assert.match(assetLayerModel, /animationStagger\?: number/);
  assert.match(assetLayerModel, /entry\.animationStagger, 0\.01, 0\.15/);

  assert.match(layerAnimationControls, /value=\{layer\.textAnimationUnit \?\? "whole"\}/);
  assert.match(layerAnimationControls, /value="word"/);
  assert.match(layerAnimationControls, /value="character"/);
  assert.match(layerAnimationControls, /value="line"/);
  assert.match(layerAnimationControls, /animationStagger/);
  assert.match(layerAnimationControls, /Preview animasi/);
  assert.match(layerAnimationControls, /getAnimations\(\{ subtree: true \}\)/);
  assert.match(layerAnimationControls, /animation\.cancel\(\)/);
  assert.match(layerAnimationControls, /animation\.play\(\)/);

  assert.match(layerTextContent, /data-invitation-text-motion-part/);
  assert.match(layerTextContent, /characterCount > MAX_TEXT_MOTION_PARTS \? "word" : unit/);
  assert.match(layerTextContent, /motionPartCount > MAX_TEXT_MOTION_PARTS/);
  assert.match(assetRenderer, /<InvitationLayerTextContent text=\{layer\.text \?\? ""\} unit=\{layer\.textAnimationUnit\}/);

  assert.match(layerAnimationHook, /querySelectorAll<HTMLElement>\("\[data-invitation-text-motion-part\]"\)/);
  assert.match(layerAnimationHook, /index \* stagger/);
  assert.match(layerAnimationHook, /unit === "character" \? 0\.025/);
});

test("Studio persists photo slot motion inside the existing photos design token", () => {
  assert.match(photoSlots, /export type PhotoMotion = \{/);
  assert.match(photoSlots, /motion\?: PhotoMotionMap/);
  assert.match(photoSlots, /isInvitationSectionAnimation\(source\.animation\)/);
  assert.match(photoSlots, /source\.animationDuration, 0\.2, 2\.5/);
  assert.match(photoSlots, /source\.animationDelay, 0, 2/);
  assert.match(photoSlots, /source\.animationStagger, 0\.01, 0\.2/);
  assert.match(photoSlots, /source\.parallax, 0, 20/);
  assert.match(photoSlots, /motion: sanitizePhotoMotions\(value\.motion\)/);
  assert.match(photoSlots, /motion: sanitizePhotoMotions\(assignments\.motion\)/);
});

test("Studio photo selection opens a visual-only right inspector", () => {
  assert.match(designer, /const \[selectedPhotoSlot, setSelectedPhotoSlot\] = useState<PhotoSlot \| null>\(null\)/);
  assert.match(designer, /function selectPhotoVisual\(slot: PhotoSlot\)/);
  assert.match(canvasSelectionResolver, /target\.closest<HTMLElement>\("\[data-invitation-photo-slot\]"\)/);
  assert.match(designer, /<StudioSelectionInspector/);
  assert.match(selectionInspector, /<PhotoSlotInspector/);
  assert.match(selectionInspector, /motion=\{design\.photos\.motion\?\.\[selectedPhotoSlot\]\}/);
  assert.match(designer, /onUpdatePhotoMotion=\{updatePhotoMotion\}/);
  assert.match(selectionInspector, /onUpdate=\{\(patch\) => onUpdatePhotoMotion\(selectedPhotoSlot, patch\)\}/);
  assert.match(designer, /useStudioCanvasSelectionMarkers\(/);
  assert.match(canvasSelectionMarkers, /node\.dataset\[markerKey\] = "true"/);
  assert.match(canvasSelectionMarkers, /"invitationPhotoSlot", markers\.photoSlot, "studioPhotoSelected"/);
  assert.match(styles, /data-studio-photo-selected="true"/);
  assert.match(photoSlotInspector, /sectionAnimationPresets/);
  assert.match(photoSlotInspector, /Preview animasi/);
  assert.match(photoSlotInspector, /slot === "gallery"/);
  assert.match(photoSlotInspector, /Jeda antar foto/);
  assert.match(photoSlotInspector, /value=\{motion\?\.parallax \?\? 0\}/);
  assert.match(photoSlotInspector, /max="20"/);
});

test("Photo slots and gallery use the shared entrance runtime without touching crop transforms", () => {
  assert.match(photoAnimationHook, /observeInvitationEntrances\(entranceTargets\)/);
  assert.match(photoAnimationHook, /slot === "gallery" \? \(config\.animationStagger \?\? 0\.08\) : 0/);
  assert.match(photoAnimationHook, /\(config\.animationDelay \?\? 0\) \+ index \* stagger/);

  assert.match(themeScenes, /data-invitation-photo-slot="cover"/);
  assert.match(universalTemplate, /data-invitation-photo-slot=\{slot\}/);
  assert.match(universalTemplate, /data-invitation-photo-slot="gallery"/);
  assert.match(romanticTemplate, /data-invitation-photo-slot="personOne"/);
  assert.match(romanticTemplate, /data-invitation-photo-slot="personTwo"/);
  assert.match(romanticTemplate, /data-invitation-photo-slot="gallery"/);

  assert.match(universalTemplate, /useInvitationPhotoAnimations\(rootRef, media\.assignment/);
  assert.match(romanticTemplate, /useInvitationPhotoAnimations\(rootRef, media\.assignment/);
  assert.match(zenGallery, /customMotion \|\| !window\.IntersectionObserver/);
  assert.match(zenGallery, /data-invitation-photo-slot="gallery"/);
  assert.match(photoAnimationHook, /observePhotoParallax\(parallaxTargets\)/);
  assert.match(photoParallaxRuntime, /requestAnimationFrame\(update\)/);
  assert.match(photoParallaxRuntime, /prefers-reduced-motion: reduce/);
  assert.match(photoParallaxRuntime, /node\.style\.translate =/);
  assert.match(photoParallaxRuntime, /strength \* 10/);
});

test("Editable template copy motion is a separate visual design token", () => {
  const designerState = read("components/InvitationStudio/designer-state.ts");
  const designerTypes = read("components/InvitationStudio/designer-types.ts");
  const copyInspector = read("components/InvitationStudio/CopyTextInspector.tsx");

  assert.match(copyMotionModel, /export type EditableCopyMotionUnit = "whole" \| "word" \| "character" \| "line"/);
  assert.match(copyMotionModel, /part\.startsWith\("copyMotion="\)/);
  assert.match(copyMotionModel, /isInvitationSectionAnimation\(source\.animation\)/);
  assert.match(copyMotionModel, /source\.animationDuration, 0\.2, 2\.5/);
  assert.match(copyMotionModel, /source\.animationDelay, 0, 2/);
  assert.match(copyMotionModel, /source\.stagger, 0\.01, 0\.15/);

  assert.match(designerTypes, /copyMotion: EditableCopyMotions/);
  assert.match(designerState, /withEditableCopyMotions\(withEditableCopy\(/);
  assert.match(designerState, /copyMotion: parseEditableCopyMotions\(key\)/);
  assert.match(designer, /copyMotion: \{\}/);
  assert.match(designer, /copyMotion: templateKey === design\.template \? design\.copyMotion : \{\}/);
  assert.match(designer, /function updateCopyMotion\(/);
  assert.match(designer, /function resetNarrativeCopyAndMotion\(/);
  assert.match(designer, /change\(\{ copy, copyMotion \}\)/);

  assert.match(copyInspector, /<CopyMotionControls/);
  assert.match(copyMotionControls, /sectionAnimationPresets/);
  assert.match(copyMotionControls, /value=\{motion\.unit \?\? "whole"\}/);
  assert.match(copyMotionControls, /Preview animasi/);
});

test("Built-in editable copy uses shared whole word character and line choreography", () => {
  assert.match(copyAnimationHook, /observeInvitationEntrances\(targets\)/);
  assert.match(copyAnimationHook, /data-invitation-text-motion-part/);
  assert.match(copyAnimationHook, /index \* stagger/);
  assert.match(copyAnimationHook, /revision/);

  assert.match(universalTemplate, /parseEditableCopyMotions\(activeDesignKey\)/);
  assert.match(universalTemplate, /useInvitationCopyAnimations\(rootRef, copyMotions, editableCopy, String\(opened\)\)/);
  assert.match(universalTemplate, /copyMotions\.greeting\?\.unit/);
  assert.match(universalTemplate, /copyMotions\.closing\?\.unit/);
  assert.match(universalTemplate, /copyMotions\.attendanceRequest\?\.unit/);
  assert.match(universalTemplate, /copyMotions\.prayerWish\?\.unit/);
  assert.match(universalTemplate, /copyMotions\.zenQuote\?\.unit/);

  assert.match(romanticTemplate, /parseEditableCopyMotions\(activeDesignKey\)/);
  assert.match(romanticTemplate, /useInvitationCopyAnimations\(rootRef, copyMotions, editableCopy, String\(opened\)\)/);
  assert.match(romanticTemplate, /copyMotions\.greeting\?\.unit/);
  assert.match(romanticTemplate, /copyMotions\.closing\?\.unit/);

  assert.match(ourStorySection, /motionUnit\?: EditableCopyMotionUnit/);
  assert.match(ourStorySection, /<InvitationLayerTextContent text=\{storyText\} unit=\{motionUnit\}/);
});

test("Premium section timelines lazy-load GSAP only for supported storytelling sections", () => {
  const packageJson = read("package.json");

  assert.match(packageJson, /"gsap": "\^3\.15\.0"/);
  assert.match(premiumTimelineModel, /key: "romantic-cascade"/);
  assert.match(premiumTimelineModel, /key: "editorial-sequence"/);
  assert.match(premiumTimelineModel, /key: "luxe-cinematic"/);
  assert.match(premiumTimelineModel, /key: "paper-story"/);
  assert.match(premiumTimelineModel, /"cover"/);
  assert.match(premiumTimelineModel, /"gallery"/);
  assert.doesNotMatch(premiumTimelineModel, /"rsvp"/);
  assert.doesNotMatch(premiumTimelineModel, /"wishes"/);

  assert.match(sectionStyles, /timeline\?: InvitationPremiumTimeline/);
  assert.match(sectionStyles, /isInvitationPremiumTimeline\(source\.timeline\)/);
  assert.match(sectionStyles, /premiumTimelineSectionKeys\.has\(key as InvitationSectionKey\)/);

  assert.match(sectionInspector, /Timeline premium/);
  assert.match(sectionInspector, /premiumSectionTimelinePresets/);
  assert.match(sectionInspector, /animation: undefined/);
  assert.match(sectionInspector, /GSAP dimuat hanya saat section ini memakainya/);

  const reducedMotionIndex = premiumTimelineHook.indexOf('prefers-reduced-motion: reduce');
  const importIndex = premiumTimelineHook.indexOf('await import("gsap")');
  assert.ok(reducedMotionIndex >= 0 && importIndex > reducedMotionIndex);
  assert.doesNotMatch(premiumTimelineHook, /from "gsap"/);
  assert.match(premiumTimelineHook, /IntersectionObserver/);
  assert.match(premiumTimelineHook, /storyItems\(section\)/);
  assert.match(premiumTimelineHook, /clearProps: "opacity,transform,filter,clipPath"/);
  assert.match(premiumTimelineHook, /revision/);

  assert.match(sectionAnimationHook, /config\?\.timeline \|\| !config\?\.animation/);
  assert.match(universalTemplate, /usePremiumSectionTimelines\(rootRef, sectionStyles, String\(opened\)\)/);
  assert.match(romanticTemplate, /usePremiumSectionTimelines\(rootRef, sectionStyles, String\(opened\)\)/);
  assert.match(universalTemplate, /sectionStyles\[sectionKey\]\?\.timeline/);
});

test("Standard invitation renderers stay free of eager Three R3F and GSAP imports", () => {
  const assetRenderer = read("components/PublicInvitation/InvitationAssetLayers.tsx");
  const standardSources = [universalTemplate, romanticTemplate, assetRenderer, ourStorySection];
  for (const source of standardSources) {
    assert.doesNotMatch(source, /@react-three\/fiber|@react-three\/drei/);
    assert.doesNotMatch(source, /from "three"|import\("three"\)/);
    assert.doesNotMatch(source, /from "gsap"/);
  }
  assert.match(premiumTimelineHook, /await import\("gsap"\)/);
});

test("Invitation motion runtimes enforce shared mobile-oriented budgets", () => {
  assert.match(motionPerformance, /MAX_TEXT_MOTION_PARTS = 96/);
  assert.match(motionPerformance, /MAX_PREMIUM_TIMELINE_ITEMS = 10/);
  assert.match(motionPerformance, /MAX_PHOTO_PARALLAX_TARGETS = 12/);
  assert.match(premiumTimelineHook, /slice\(0, MAX_PREMIUM_TIMELINE_ITEMS\)/);
  assert.match(photoAnimationHook, /slice\(0, MAX_PHOTO_PARALLAX_TARGETS\)/);
  assert.match(layerTextContent, /motionPartCount > MAX_TEXT_MOTION_PARTS/);
  assert.match(layerTextContent, /lines\.length > MAX_TEXT_MOTION_PARTS/);
  assert.match(entranceAnimationRuntime, /prefers-reduced-motion: reduce/);
  assert.match(photoParallaxRuntime, /prefers-reduced-motion: reduce/);
  assert.match(premiumTimelineHook, /prefers-reduced-motion: reduce/);
});

test("Studio canvas selection DOM markers are synchronized by one hook", () => {
  assert.match(designer, /from "@\/components\/InvitationStudio\/useStudioCanvasSelectionMarkers"/);
  assert.match(designer, /useStudioCanvasSelectionMarkers\(/);
  assert.match(canvasSelectionMarkers, /function syncMarker\(/);
  assert.match(canvasSelectionMarkers, /"invitationSection", section, "studioSectionSelected"/);
  assert.match(canvasSelectionMarkers, /"studioRsvpElement", markers\.rsvpElement, "studioRsvpSelected"/);
  assert.match(canvasSelectionMarkers, /"studioSectionElement", sectionElement, "studioSectionElementSelected"/);
  assert.match(canvasSelectionMarkers, /"studioCopyField", markers\.copyField, "studioCopySelected"/);
  assert.match(canvasSelectionMarkers, /"invitationPhotoSlot", markers\.photoSlot, "studioPhotoSelected"/);
  assert.match(canvasSelectionMarkers, /markers\.section === "rsvp" \? null : markers\.section/);
});

test("Studio canvas click selection is resolved outside the large designer component", () => {
  assert.match(designer, /resolveStudioCanvasSelection\(target, canvasRoot\)/);
  assert.match(designer, /function clearCanvasSelection\(\)/);
  assert.match(designer, /setSelectedLayerIds\(\[\]\)/);
  assert.match(canvasSelectionResolver, /kind: "rsvp-element"/);
  assert.match(canvasSelectionResolver, /kind: "section-element"/);
  assert.match(canvasSelectionResolver, /kind: "copy"/);
  assert.match(canvasSelectionResolver, /kind: "photo"/);
  assert.match(canvasSelectionResolver, /kind: "section"/);
  assert.match(canvasSelectionResolver, /kind: "clear"/);
  assert.match(canvasSelectionResolver, /data-studio-photo-crop/);
  assert.match(canvasSelectionResolver, /data-studio-design-object/);
});

