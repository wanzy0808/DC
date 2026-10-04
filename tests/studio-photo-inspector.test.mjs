import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { LanguageProvider } from "../components/I18n/LanguageProvider.tsx";
import PhotoPanelModule from "../components/InvitationStudio/PhotoPanel.tsx";
import StudioSelectionInspectorModule from "../components/InvitationStudio/StudioSelectionInspector.tsx";
import { defaultPhotoAssignments } from "../lib/templates/photo-slots.ts";
import { defaultInvitationRsvpConfig } from "../lib/templates/rsvp-config.ts";

const assets = [
  { id: "photo-a", type: "IMAGE", title: "Foto A", url: "/event-a/photo-a.webp" },
  { id: "photo-b", type: "IMAGE", title: "Foto B", url: "/event-a/photo-b.webp" },
  { id: "photo-c", type: "IMAGE", title: "Foto C", url: "/event-a/photo-c.webp" },
  { id: "audio-a", type: "AUDIO", title: "Lagu A", url: "/event-a/audio.mp3" },
];
const noop = () => {};
// tsx exposes CJS default exports differently from Next's bundler.
const PhotoPanel = PhotoPanelModule.default ?? PhotoPanelModule;
const StudioSelectionInspector = StudioSelectionInspectorModule.default ?? StudioSelectionInspectorModule;
const renderLeft = (activeSlot, locale = "id") => renderToStaticMarkup(createElement(LanguageProvider, { initialLocale: locale },
  createElement(PhotoPanel, {
    photos: assets, slots: ["cover", "gallery"], assignments: defaultPhotoAssignments(), activeSlot,
    onActiveSlotChange: noop, onSetPhoto: noop, onToggleGallery: noop, onUpload: noop,
  }),
));
const renderRight = (slot, assignments, overrides = {}) => renderToStaticMarkup(createElement(StudioSelectionInspector, {
  locale: "id", design: { template: "garden-light", layers: [], photos: assignments, sectionStyles: {} },
  selectedAssetLayer: null, selectedAssetIndex: -1, maxAssetLayers: 10,
  selectedPhotoSlot: slot, photoAssets: assets, photoEditingDisabled: false,
  selectedRsvpElementKey: null, selectedSectionElement: null, selectedCopyField: null,
  selectedSectionKey: null, selectedNativeKey: null,
  onSetPhotoFocus: noop, onSetPhotoCrop: noop, onResetPhotoCrop: noop,
  onStartPhotoCrop: noop,
  onGallerySettings: noop, onReorderGallery: noop, onUpdatePhotoMotion: noop,
  onResetPhotoMotion: noop, onClosePhoto: noop, ...overrides,
}));

test("Wishes exposes saved transform controls, while RSVP custom fields keep only supported component properties", () => {
  const design = {
    template: "serein", layers: [], photos: defaultPhotoAssignments(), sectionStyles: {},
    sectionElementStyles: {}, rsvpConfig: defaultInvitationRsvpConfig,
    nativeVisuals: { "element:wishes:button:wishes_copy2": { x: 14, y: -6, scaleX: 1.3, scaleY: 1, rotation: 8 } },
  };
  const wishes = renderRight(null, design.photos, {
    design, selectedSectionElement: { section: "wishes", kind: "button" },
    selectedNativeKey: "element:wishes:button:wishes_copy2",
    onUpdateSectionElementStyles: noop, onCloseSectionElement: noop, onCloseNative: noop,
  });
  assert.match(wishes, /Properti visual/);
  assert.match(wishes, /aria-label="X"[^>]*value="14"/);
  assert.match(wishes, /value="130"/);
  const custom = renderRight(null, design.photos, {
    design, selectedRsvpElementKey: "custom:question_1", selectedNativeKey: "rsvp:custom:question_1:rsvp_copy2",
    onUpdateRsvpConfig: noop, onCloseRsvp: noop,
  });
  assert.match(custom, /Properti komponen RSVP/);
  assert.doesNotMatch(custom, /Properti visual|aria-label="X"/);
});

test("left Photo panel keeps upload/assignment and contains no editing controls for cover or gallery", () => {
  for (const slot of ["cover", "gallery"]) {
    const markup = renderLeft(slot);
    assert.match(markup, /Koleksi Foto/);
    assert.match(markup, /Penempatan Foto/);
    assert.match(markup, /Tambah Foto/);
    assert.match(markup, /type="file"/);
    assert.doesNotMatch(markup, /<select\b|type="range"|draggable="true"/);
    assert.doesNotMatch(markup, /Fokus foto|Crop &amp; posisi|Urutan foto|Gaya galeri|Autoplay|Animasi saat muncul/);
  }
  assert.match(renderLeft("gallery"), /aria-label="Kosongkan pilihan galeri"/);
  assert.match(renderLeft("cover"), /aria-label="Kembali ke bawaan: Cover utama"[^>]*>Kembali ke bawaan<\/button>/);
  assert.match(renderLeft("cover", "en"), /aria-label="Back to default: Main Cover"[^>]*>Back to default<\/button>/);
});

test("right cover inspector preserves saved crop values without offering an unsupported aspect ratio", () => {
  const assignments = defaultPhotoAssignments();
  assignments.cover = "photo-a";
  assignments.crop.cover = { x: 24, y: 83, zoom: 1.7, aspect: "4:5" };
  const before = JSON.stringify(assignments);
  const markup = renderRight("cover", assignments);
  assert.match(markup, /aria-label="Properti foto"/);
  assert.match(markup, /Fokus foto/);
  assert.doesNotMatch(markup, /Rasio crop|aria-pressed="true"[^>]*>4:5<\/button>/);
  for (const value of ["24", "83", "1.7"]) assert.match(markup, new RegExp(`value="${value}"`));
  assert.match(markup, /Animasi saat muncul/);
  assert.match(markup, /Parallax/);
  assert.doesNotMatch(markup, /Gaya galeri|Urutan foto|Autoplay galeri/);
  assert.equal(JSON.stringify(assignments), before);
});

test("both portrait inspectors expose their own frame geometry and an explicit canvas crop action", () => {
  for (const [slot, x] of [["personOne", -18], ["personTwo", 24]]) {
    const key = `photo:${slot}`;
    const markup = renderRight(slot, defaultPhotoAssignments(), {
      selectedNativeKey: key, onUpdateNative: noop, onCloseNative: noop,
      design: { template: "garden-light", layers: [], photos: defaultPhotoAssignments(), sectionStyles: {},
        nativeVisuals: { [key]: { x, y: 7, scaleX: 1.2, scaleY: 0.9, rotation: 12 } } },
    });
    assert.match(markup, /aria-label="X"/);
    assert.match(markup, /aria-label="Y"/);
    assert.match(markup, new RegExp(`value="${x}"`));
    assert.match(markup, /value="120"/);
    assert.match(markup, /value="90"/);
    assert.match(markup, /value="12"/);
    assert.match(markup, /aria-label="Crop foto di canvas"/);
  }
});

test("crop ratios are available only on templates whose portrait image sizing supports them", () => {
  const assignments = defaultPhotoAssignments();
  assignments.crop.personOne = { x: 20, y: 65, zoom: 1.75, aspect: "4:5" };
  const original = JSON.stringify(assignments);
  for (const template of ["romantic-rose", "eternal-blossom", "garden-light", "midnight-romance", "velvet-horizon"]) {
    const markup = renderRight("personOne", assignments, {
      design: { template, layers: [], photos: assignments, sectionStyles: {} },
    });
    assert.match(markup, /Rasio crop/);
    assert.match(markup, /aria-pressed="true"[^>]*>4:5<\/button>/);
  }
  for (const template of ["modern-maroon", "serein", "zen-atelier", "confetti-club", "blank-canvas", "unknown-template"]) {
    const markup = renderRight("personOne", assignments, {
      design: { template, layers: [], photos: assignments, sectionStyles: {} },
    });
    assert.doesNotMatch(markup, /Rasio crop/);
    assert.match(markup, /value="1.75"/);
  }
  assert.equal(JSON.stringify(assignments), original);
});

test("right gallery inspector preserves saved order, filters unavailable/non-image IDs and exposes slideshow settings", () => {
  const assignments = defaultPhotoAssignments();
  assignments.gallery = ["photo-b", "foreign-photo", "audio-a", "photo-a"];
  assignments.gallerySettings = { presentation: "carousel", autoplay: true, interval: 7, transition: "fade", transitionDuration: 1.2 };
  const markup = renderRight("gallery", assignments);
  assert.ok(markup.indexOf(assets[1].url) < markup.indexOf(assets[0].url));
  assert.doesNotMatch(markup, /photo-c\.webp|audio\.mp3|foreign-photo/);
  assert.match(markup, /Urutan foto/);
  assert.match(markup, /Gaya galeri/);
  assert.match(markup, /role="switch"[^>]*aria-checked="true"/);
  assert.match(markup, /Jeda slide/);
  assert.match(markup, /value="7"/);
  assert.match(markup, /value="fade" selected=""/);
  assert.match(markup, /Durasi transisi/);
  assert.match(markup, /Jeda antar foto/);
  assert.doesNotMatch(markup, /Rasio crop|Fokus foto/);
});

test("template gallery style keeps autoplay disabled and hides unsupported slide controls", () => {
  const markup = renderRight("gallery", defaultPhotoAssignments());
  const autoplay = markup.match(/<button[^>]*role="switch"[^>]*>/)?.[0];
  assert.ok(autoplay);
  assert.match(autoplay, /disabled=""/);
  assert.match(autoplay, /aria-checked="false"/);
  assert.doesNotMatch(markup, /Jeda slide|Transisi slide|Durasi transisi/);
});

test("photo inspector remains localized and disables editing during save while keeping close available", () => {
  const markup = renderRight("personOne", defaultPhotoAssignments(), { locale: "en", photoEditingDisabled: true });
  assert.match(markup, /First portrait/);
  assert.match(markup, /Photo focus/);
  assert.match(markup, /Aspect ratio/);
  assert.match(markup, /Entrance animation/);
  assert.match(markup, /<fieldset[^>]*disabled=""/);
  const close = markup.split("<fieldset")[0];
  assert.match(close, /aria-label="Close photo properties"/);
  assert.doesNotMatch(close, /disabled=""/);
});

test("left slot/asset selection uses the shared photo selector and only right inspector receives editing callbacks", () => {
  const source = readFileSync(new URL("../components/InvitationStudio/InvitationDesigner.tsx", import.meta.url), "utf8");
  const left = source.split("<PhotoPanel")[1]?.split("/>")[0];
  assert.ok(left);
  assert.match(left, /onActiveSlotChange=\{selectPhotoFromPanel\}/);
  const navigation = source.split("function selectPhotoFromPanel(")[1]?.split("function startPhotoCrop(")[0];
  assert.match(navigation, /selectPhotoVisual\(slot\)/);
  assert.match(navigation, /revealPhotoInCanvas\(slot\)/);
  const click = source.split("function editPhotoFromCanvas(")[1]?.split("function revealPhotoInCanvas(")[0];
  assert.match(click, /selectPhotoVisual\(slot\)/);
  assert.match(click, /activateCanvasEditing\(\)/);
  const activation = source.split("function activateCanvasEditing(")[1]?.split("function handleCanvasSelection(")[0];
  assert.match(activation, /setInspectorOpen\(true\)/);
  assert.match(activation, /setMobileCanvas\(true\)/);
  assert.match(activation, /isStudioCanvasShortcutTarget/);
  assert.doesNotMatch(click, /setCropModeSlot/);
  const rail = source.split('<nav className="undara-studio-rail"')[1]?.split("</nav>")[0];
  assert.match(rail, /label=\{copy\.photos\}[\s\S]*onClick=\{openPhotoPanel\}/);
  assert.doesNotMatch(left, /onSetFocus|onSetCrop|onGallerySettings|onReorderGallery|onGalleryMotion/);
  const right = source.split("<StudioSelectionInspector")[1]?.split("/>")[0];
  assert.ok(right);
  assert.match(right, /onSetPhotoFocus=\{setPhotoFocus\}/);
  assert.match(right, /onSetPhotoCrop=\{setPhotoCrop\}/);
  assert.match(right, /onStartPhotoCrop=\{startPhotoCrop\}/);
  assert.match(right, /onGallerySettings=\{updateGallerySettings\}/);
  assert.match(right, /onReorderGallery=\{reorderGalleryPhoto\}/);
  assert.match(right, /photoEditingDisabled=\{!invitation \|\| saving\}/);
  assert.match(right, /onClosePhoto=\{clearCanvasSelection\}/);
  assert.match(source, /onFinishCrop=\{finishPhotoCrop\}/);
  const panel = readFileSync(new URL("../components/InvitationStudio/PhotoPanel.tsx", import.meta.url), "utf8");
  assert.match(panel, /onActiveSlotChange\(slot\);[\s\S]*onToggleGallery\(photo\.id\)/);
});
