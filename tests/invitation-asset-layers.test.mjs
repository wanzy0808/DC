import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  isTemplateIllustration, MAX_ASSET_LAYERS, studioObjectSections, parseAssetLayers,
  sanitizeAssetLayers, withAssetLayers,
} from "../lib/templates/asset-layers.ts";
import { resizeObjectFromHandle } from "../lib/templates/object-resize.ts";

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
  const stretched = { ...image, width: 48, height: 72 };
  assert.deepEqual(parseAssetLayers(withAssetLayers(original, [stretched])), [stretched]);
  assert.deepEqual(parseAssetLayers(withAssetLayers(original, [image])), [image]);
  assert.equal(sanitizeAssetLayers([{ ...stretched, height: 999 }])[0].height, 200);
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
  assert.match(editor, /showDesignSection\(patch\.section\)/);
  assert.match(editor, /if \(section === "envelope"\) setPreviewVersion\(/);
  assert.match(textPanel, /onAdd\(value, selectedSection\)/);
  assert.match(textPanel, /maxLength=\{180\}/);
  assert.match(inspector, /onUpdate\(selectedAssetLayer\.id, \{ section:/);
  assert.match(inspector, /onUpdate\(selectedAssetLayer\.id, \{ fontRole:/);
  assert.match(renderer, /begin\(event, "resize", handle\)/);
  assert.match(renderer, /"top-left", "top", "top-right", "right", "bottom-right", "bottom", "bottom-left", "left"/);
  assert.match(renderer, /absolute inset-0 z-10 border border-primary/);
  assert.match(renderer, /onPointerDown=\{\(event\) => begin\(event, "rotate"\)\}/);


  assert.match(renderer, /"cursor-ns-resize"/);
  assert.match(renderer, /"cursor-ew-resize"/);



  assert.match(renderer, /aspectRatio: `\$\{displayed\.width\} \/ \$\{displayed\.height\}`/);
  assert.match(renderer, /return resizeObjectFromHandle\(\{/);
  const geometry = read("lib/templates/object-resize.ts");
  assert.match(geometry, /const localX = dx \* cos \+ dy \* sin/);
  assert.match(geometry, /const localY = -dx \* sin \+ dy \* cos/);
  assert.match(inspector, /selectedAssetLayer\.height !== undefined/);
  assert.match(inspector, /height: undefined/);
  assert.match(renderer, /absolute -bottom-10 left-1\/2/);
  assert.match(inspector, /type="number" min="-180" max="180" step="1"/);
  assert.match(inspector, /Math\.min\(180, Math\.max\(-180, angle\)\)/);
  assert.match(renderer, /findSectionAt\(event\.clientX, event\.clientY, root\.current\)/);
  assert.match(renderer, /data-studio-design-object=\{layer\.id\}/);
  assert.match(editor, /target\.closest\("\[data-studio-design-object\], \.dc-studio-layer-side, button, a, input, select, textarea, \[contenteditable\], \[role=button\]"\)/);
  assert.match(editor, /setSelectedLayerId\(null\);/);
  assert.match(editor, /target\.closest\("\.dc-studio-preview-surface"\)/);
  assert.match(renderer, /layer\.kind === "text"/);
  assert.match(universal, /objectOverlay\(keyName\)/);
  assert.match(universal, /objectOverlay\("cover"\)/);
  assert.match(romantic, /objectOverlay\("greeting"\)/);
  assert.match(romantic, /objectOverlay\("closing"\)/);
});

test("each side grip moves only the dragged edge, not the opposite edge", () => {
  const start = {
    handle: "right", x: 50, y: 50, width: 30, height: 20,
    rotation: 0, sectionWidth: 400, sectionHeight: 800,
    objectWidth: 120, objectHeight: 80,
  };
  const right = resizeObjectFromHandle(start, 40, 0);
  assert.deepEqual(right, { x: 55, y: 50, width: 40, height: 20 });
  assert.equal(right.x - right.width / 2, start.x - start.width / 2, "left edge stays still");

  const left = resizeObjectFromHandle({ ...start, handle: "left" }, -40, 0);
  assert.deepEqual(left, { x: 45, y: 50, width: 40, height: 20 });
  assert.equal(left.x + left.width / 2, start.x + start.width / 2, "right edge stays still");

  const top = resizeObjectFromHandle({ ...start, handle: "top" }, 0, -40);
  assert.deepEqual(top, { x: 50, y: 47.5, width: 30, height: 30 });
  assert.equal(top.y + top.height * start.sectionWidth / start.sectionHeight / 2,
    start.y + start.height * start.sectionWidth / start.sectionHeight / 2, "bottom edge stays still");

  const bottom = resizeObjectFromHandle({ ...start, handle: "bottom" }, 0, 40);
  assert.deepEqual(bottom, { x: 50, y: 52.5, width: 30, height: 30 });
  assert.equal(bottom.y - bottom.height * start.sectionWidth / start.sectionHeight / 2,
    start.y - start.height * start.sectionWidth / start.sectionHeight / 2, "top edge stays still");

  const corner = resizeObjectFromHandle({ ...start, handle: "bottom-right" }, 24, 16);
  assert.deepEqual(corner, { x: 53, y: 51, width: 36, height: 24 });
  assert.equal(corner.x - corner.width / 2, start.x - start.width / 2, "diagonal resize keeps left edge");

  const rotated = resizeObjectFromHandle({ ...start, handle: "right", rotation: 90 }, 0, 40);
  assert.deepEqual(rotated, { x: 50, y: 52.5, width: 40, height: 20 });
});

test("desktop Studio docks the entire tool rail and property inspector at the far right", () => {
  const editor = read("components/InvitationStudio/InvitationDesigner.tsx");
  const css = read("components/InvitationStudio/studio.css");
  const canvas = editor.indexOf('<div className="dc-studio-canvas">');
  const inspector = editor.indexOf('<aside className="dc-studio-inspector"');
  const rail = editor.indexOf('<nav className="dc-studio-rail"');
  assert.ok(canvas >= 0 && canvas < inspector && inspector < rail,
    "DOM reading and grid order should be canvas → inspector → far-right tool rail");
  assert.match(css, /\.dc-studio-workspace \{[^}]*grid-template-columns: minmax\(0, 1fr\) 360px 98px/);
  assert.match(css, /@media \(min-width: 1280px\)[^\n]*\.dc-studio-workspace \{ grid-template-columns: minmax\(0, 1fr\) 380px 108px/);
  assert.match(css, /data-inspector=false\] \.dc-studio-workspace \{ grid-template-columns: minmax\(0, 1fr\) 98px/);
  assert.match(css, /\.dc-studio-inspector > \.dc-studio-layer-side \{ position: static; width: 100%/);
  assert.ok(editor.indexOf("<AssetLayerInspector", inspector) < rail,
    "selected-layer controls belong inside the right inspector rather than beside the canvas");
  assert.match(css, /\.dc-studio-rail \{ display: flex; grid-row: 1;/,
    "mobile should keep its scrollable tool selector above the canvas/properties");
  assert.match(editor, /<PanelRightClose size=\{18\} \/> : <PanelRightOpen size=\{18\} \/>/);
});
