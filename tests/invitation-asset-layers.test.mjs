import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  isTemplateIllustration, MAX_ASSET_LAYERS, parseAssetLayers,
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
  const route = read("app/api/templates/assets/route.ts");
  assert.match(editor, /<DesignerTool active=\{panel === "assets"\}/);
  assert.match(editor, /<AssetPanel layers=\{design\.layers\}/);
  assert.match(editor, /onMoveAssetLayer=\{\(id, x, y\)/);
  assert.match(browser, /draggable=\{layers\.length < MAX_ASSET_LAYERS\}/);
  assert.match(browser, /onDragStart=\{\(event\) =>/);
  assert.match(editor, /onDragOver=\{onAssetDragOver\}/);
  assert.match(editor, /onDrop=\{onAssetDrop\}/);
  assert.match(editor, /findCoverDropTarget\(event\.clientX, event\.clientY\)/);
  assert.match(editor, /const rect = section\.getBoundingClientRect\(\)/);
  assert.match(editor, /x: clamp\(\(event\.clientX - rect\.left\) \/ rect\.width \* 100\)/);
  assert.match(editor, /templateKey: designKey,/);
  assert.match(editor, /font: requestedPreset\.font, copy: \{\}, layers: \[\]/);
  assert.match(route, /entry\.isSymbolicLink\(\)/);
  assert.match(state, /withAssetLayers\(withEditableCopy\(/);
  assert.match(state, /layers: parseAssetLayers\(key\)/);
  assert.match(preview, /selectedAssetLayerId=\{selectedAssetLayerId\}/);
  assert.match(universal, /parseAssetLayers\(activeDesignKey\)/);
  assert.match(romantic, /parseAssetLayers\(designKey \|\| invitation\.templateKey\)/);
  assert.match(universal, /<InvitationAssetLayers layers=\{illustrationLayers\}/);
  assert.match(romantic, /<InvitationAssetLayers layers=\{illustrationLayers\}/);
  assert.match(browser, /onReorder\(selected\.id, 1\)/);
  assert.match(browser, /selected\.opacity/);
  assert.match(route, /getCurrentUser\(\)/);
  assert.match(route, /"template", "templates"/);
});
