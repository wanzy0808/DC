import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  isTemplateIllustration, MAX_ASSET_LAYERS, studioObjectSections, parseAssetLayers,
  sanitizeAssetLayers, withAssetLayers,
} from "../lib/templates/asset-layers.ts";

const read = (name) => readFileSync(new URL(`../${name}`, import.meta.url), "utf8");
const asset = (id, src = "/templates/pencil-reverie/flower.webp") => ({
  id, src, x: 50, y: 35, width: 28, opacity: 0.8,
});

test("only browser-public template illustrations can be placed", () => {
  assert.ok(isTemplateIllustration("/template/rose/branch.png"));
  assert.ok(isTemplateIllustration("/templates/Zen%20Atelier/ornament.webp"));
  for (const invalid of [
    "/assets/private.svg", "https://example.com/image.png", "//evil.com/flower.png",
    "/templates/../secret.png", "/templates/%2e%2e/secret.png",
    "/templates/rose/../../secret.webp", "/templates/rose/%252e%252e/flower.webp",
    "/templates/rose/file.pdf",
  ]) assert.equal(isTemplateIllustration(invalid), false, invalid);
});

test("asset layer codec keeps bounded coordinates, transparency, IDs and stacking order", () => {
  const original = "pencil-reverie::pencil::cinzelFauna::sections=rsvp,wishes,gift";
  const layers = [
    asset("front", "/templates/pencil-reverie/flower.webp"),
    { ...asset("back"), id: "back", x: -10, y: 999, opacity: 2, width: 100 },
    asset("front"),
    { ...asset("unknown"), src: "https://example.com/flower.png" },
  ];
  const value = withAssetLayers(original, layers);
  assert.equal(value.split("::").filter((part) => part.startsWith("layers=")).length, 1);
  assert.deepEqual(parseAssetLayers(value), [
    layers[0],
    { ...layers[1], x: 0, y: 100, opacity: 1, width: 85 },
  ]);
  assert.equal(withAssetLayers(value, []), original);
  assert.equal(parseAssetLayers(original).length, 0);
  assert.deepEqual(parseAssetLayers("rose::layers=%BAD"), []);
  assert.equal(sanitizeAssetLayers(Array.from({ length: 20 }, (_, index) => asset(String(index)))).length, MAX_ASSET_LAYERS);
});

test("Studio saves, previews and reopens the same per-invitation cover artwork", () => {
  const editor = read("components/InvitationStudio/InvitationDesigner.tsx");
  const state = read("components/InvitationStudio/designer-state.ts");
  const preview = read("components/InvitationStudio/InvitationPreview.tsx");
  const universal = read("components/PublicInvitation/UniversalInvitationTemplate.tsx");
  const romantic = read("components/PublicInvitation/RomanticRoseTemplate.tsx");
  const browser = read("components/InvitationStudio/AssetPanel.tsx");
  const layerInspector = read("components/InvitationStudio/AssetLayerInspector.tsx");
  const route = read("app/api/templates/assets/route.ts");
  assert.match(editor, /<DesignerTool active=\{panel === "assets"\}/);
  assert.match(editor, /<AssetPanel layers=\{design\.layers\}/);
  assert.match(editor, /onMoveAssetLayer=\{\(id, x, y\)/);
  assert.match(browser, /draggable=\{layers\.length < MAX_ASSET_LAYERS\}/);
  assert.match(browser, /onDragStart=\{\(event\) =>/);
  assert.match(editor, /onDragOver=\{onAssetDragOver\}/);
  assert.match(editor, /onDrop=\{onAssetDrop\}/);
  assert.match(editor, /event\.key === "Delete" \|\| event\.key === "Backspace"/);
  assert.match(editor, /event\.key\.toLowerCase\(\) === "c"/);
  assert.match(editor, /event\.key\.toLowerCase\(\) === "v"/);
  assert.match(editor, /event\.ctrlKey \|\| event\.metaKey/);
  assert.match(editor, /closest\('input, textarea, select,/);
  assert.match(editor, /window\.getSelection\(\)\?\.toString\(\)/);
  assert.match(layerInspector, /<aside className="dc-studio-layer-side"/);
  assert.match(layerInspector, /onClick=\{onCopy\}/);
  assert.match(layerInspector, /onClick=\{onPaste\}/);
  assert.match(editor, /design\.layers\.length >= MAX_ASSET_LAYERS/);
  assert.match(editor, /<AssetLayerInspector/);
  assert.match(layerInspector, /layerCount >= MAX_ASSET_LAYERS/);

  assert.match(editor, /findSectionDropTarget\(event\.clientX, event\.clientY\)/);
  assert.match(editor, /const rect = section\.getBoundingClientRect\(\)/);
  assert.match(editor, /x: clamp\(\(event\.clientX - rect\.left\) \/ rect\.width \* 100\)/);
  assert.match(editor, /templateKey: designKey,/);
  assert.match(editor, /font: requestedPreset\.font, copy: \{\}, layers: \[\]/);
  assert.match(route, /entry\.isSymbolicLink\(\)/);
  assert.match(state, /withAssetLayers\(withEditableCopy\(/);
  assert.match(state, /layers: parseAssetLayers\(key\)/);
  assert.match(preview, /selectedAssetLayerId=\{selectedAssetLayerId\}/);
  assert.match(preview, /onUpdateAssetLayer=\{onUpdateAssetLayer\}/);
  assert.match(universal, /parseAssetLayers\(activeDesignKey\)/);
  assert.match(romantic, /parseAssetLayers\(designKey \|\| invitation\.templateKey\)/);
  assert.match(universal, /<InvitationAssetLayers layers=\{illustrationLayers\}/);
  assert.match(romantic, /<InvitationAssetLayers layers=\{illustrationLayers\}/);
  assert.match(browser, /onReorder\(selected\.id, 1\)/);
  assert.match(browser, /selected\.opacity/);
  assert.match(layerInspector, /onUpdate\(selectedAssetLayer\.id, \{ rotation:/);
  assert.match(layerInspector, /selectedAssetLayer\.kind === "text"/);
  assert.match(route, /getCurrentUser\(\)/);
  assert.match(route, /"template", "templates"/);
});

test("decorative text and section-targeted artwork survive the shared design-key codec", () => {
  assert.ok(studioObjectSections.includes("greeting"));
  assert.ok(studioObjectSections.includes("closing"));
  assert.ok(!studioObjectSections.includes("music"));
  const original = "pencil-reverie::pencil::cinzelFauna";
  const image = { ...asset("flower"), section: "greeting", rotation: -32 };
  const text = {
    id: "caption", kind: "text", src: "", text: "Together, always.", section: "closing",
    x: 45, y: 55, width: 65, opacity: 0.75, rotation: 17, fontSize: 31,
    fontRole: "heading", color: "#C07A84",
  };
  const key = withAssetLayers(original, [image, text]);
  assert.deepEqual(parseAssetLayers(key), [image, text]);
  assert.equal(parseAssetLayers(withAssetLayers(key, [] )).length, 0);
  assert.deepEqual(sanitizeAssetLayers([{ ...text, text: "<script>ignored</script>", color: "url(javascript:evil)" }])[0], {
    ...text, text: "<script>ignored</script>", color: "#C07A84",
  });
  assert.deepEqual(sanitizeAssetLayers([{ ...text, text: "   " }]), []);
  assert.deepEqual(sanitizeAssetLayers([{ ...text, section: "not-a-section", rotation: 9999, fontSize: 1000 }])[0], {
    ...(() => { const { section: _section, ...rest } = text; return rest; })(), rotation: 180, fontSize: 72,
  });
});

test("section selection, pointer resize/rotation, and decorative text are wired to both renderers", () => {
  const editor = read("components/InvitationStudio/InvitationDesigner.tsx");
  const renderer = read("components/PublicInvitation/InvitationAssetLayers.tsx");
  const universal = read("components/PublicInvitation/UniversalInvitationTemplate.tsx");
  const romantic = read("components/PublicInvitation/RomanticRoseTemplate.tsx");
  const textPanel = read("components/InvitationStudio/TextObjectPanel.tsx");
  const inspector = read("components/InvitationStudio/AssetLayerInspector.tsx");
  assert.match(editor, /<DesignerTool active=\{panel === "text"\}/);
  assert.match(editor, /<TextObjectPanel layers=\{design\.layers\}/);
  assert.match(editor, /onUpdateAssetLayer=\{updateAssetLayer\}/);
  assert.match(editor, /section: section\.dataset\.invitationSection as StudioObjectSection/);
  assert.match(editor, /setCanvasStage\(patch\.section === "envelope"/);
  assert.match(textPanel, /onAdd\(value, selectedSection\)/);
  assert.match(textPanel, /maxLength=\{180\}/);
  assert.match(inspector, /onUpdate\(selectedAssetLayer\.id, \{ section:/);
  assert.match(inspector, /onUpdate\(selectedAssetLayer\.id, \{ fontRole:/);
  assert.match(renderer, /onPointerDown=\{\(event\) => begin\(event, "resize"\)\}/);
  assert.match(renderer, /onPointerDown=\{\(event\) => begin\(event, "rotate"\)\}/);
  assert.match(renderer, /findSectionAt\(event\.clientX, event\.clientY, root\.current\)/);
  assert.match(renderer, /layer\.kind === "text"/);
  assert.match(universal, /objectOverlay\(keyName\)/);
  assert.match(universal, /objectOverlay\("cover"\)/);
  assert.match(romantic, /objectOverlay\("greeting"\)/);
  assert.match(romantic, /objectOverlay\("closing"\)/);
});
