import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  sanitizeNativeVisualTransforms, parseNativeVisualTransforms,
  withNativeVisualTransforms, nativeVisualStyleSheet, nativeVisualScopeClass, nativeVisualSelector,
  nativeVisualCapabilities, nativeVisualFontFamilies,
} from "../lib/templates/native-visual-transforms.ts";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("built-in transforms round-trip without changing invitation data", () => {
  const base = "botanical-ivory::pearl::cinzelFauna";
  const transform = { x: 25, y: -10, scaleX: 1.4, scaleY: 0.8, rotation: 32 };
  const key = withNativeVisualTransforms(base, {
    "copy:greeting": transform,
    "heading:envelope": { ...transform, rotation: -15 },
  });
  assert.deepEqual(parseNativeVisualTransforms(key)["copy:greeting"], transform);
  assert.equal(withNativeVisualTransforms(key, {}), base);
  assert.equal(key.split("::").filter((part) => part.startsWith("nativeVisuals=")).length, 1);
  assert.match(nativeVisualStyleSheet(key), /translate:25% -10%;rotate:32deg;scale:1.4 0.8/);
  assert.match(nativeVisualStyleSheet(key), new RegExp(nativeVisualScopeClass(key)));
});

test("built-in transform codec rejects arbitrary CSS keys and bounds geometry", () => {
  const values = sanitizeNativeVisualTransforms({
    "copy:greeting": { x: 9000, y: -9000, scaleX: 99, scaleY: 0, rotation: 500 },
    "copy:greeting\"}{color:red}": { x: 10, y: 10, scaleX: 1, scaleY: 1, rotation: 0 },
    "element:gift:button": { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
  });
  assert.deepEqual(values, {
    "copy:greeting": { x: 2000, y: -2000, scaleX: 3, scaleY: 0.25, rotation: 180 },
  });
  assert.doesNotMatch(nativeVisualStyleSheet(withNativeVisualTransforms("rose", values)), /color:red/);
  assert.deepEqual(parseNativeVisualTransforms("rose::nativeVisuals=%BAD"), {});
});

test("Studio and public renderers share the built-in transform contract", () => {
  const designer = read("components/InvitationStudio/InvitationDesigner.tsx");
  const universal = read("components/PublicInvitation/UniversalInvitationTemplate.tsx");
  const rose = read("components/PublicInvitation/RomanticRoseTemplate.tsx");
  const handles = read("components/InvitationStudio/StudioNativeTransformHandles.tsx");
  assert.match(designer, /<StudioNativeTransformHandles/);
  assert.match(designer, /change\(\{ nativeVisuals: next \}\)/);
  for (const renderer of [universal, rose]) {
    assert.match(renderer, /nativeVisualScopeClass\(activeDesignKey\)/);
    assert.match(renderer, /nativeVisualStyleSheet\(activeDesignKey\)/);
  }
  assert.match(handles, /onPointerDown=\{\(event\) => begin\(event, "rotate"\)\}/);
  assert.match(handles, /onPointerDown=\{\(event\) => begin\(event, handle\)\}/);
  assert.match(handles, /canvas\.scrollTop \+= 14/);
  assert.match(handles, /canvas\.scrollLeft \+= 14/);
  assert.match(handles, /drag\.scrollTop/);
  assert.match(handles, /-2000, 2000/);
});


test("envelope and content photo transforms have separate targets", () => {
  assert.equal(nativeVisualSelector("photo:envelope:cover"),
    '[data-invitation-section="envelope"] [data-invitation-photo-slot="cover"]');
  assert.equal(nativeVisualSelector("photo:cover"),
    '[data-invitation-section="cover"] [data-invitation-photo-slot="cover"]');
  assert.equal(nativeVisualSelector("heading:cover"),
    '[data-invitation-section="cover"] [data-studio-native-heading]');
  assert.equal(nativeVisualSelector("script:arbitrary"), null);
});


test("gallery visuals are keyed by one safe photo ID", () => {
  assert.equal(nativeVisualSelector("photo:gallery:photo_123"),
    '[data-invitation-photo-slot="gallery"][data-studio-photo-id="photo_123"]');
  assert.equal(nativeVisualSelector('photo:gallery:x"]{color:red}'), null);
  assert.equal(nativeVisualSelector("photo:gallery:photo_123:gallery_copy2"),
    '[data-section-instance-id="gallery_copy2"] [data-invitation-photo-slot="gallery"][data-studio-photo-id="photo_123"]');
  const design = withNativeVisualTransforms("botanical-ivory", {
    "photo:gallery:photo_123": { x: 8, y: 4, scaleX: 1.2, scaleY: 1, rotation: 3 },
  });
  assert.equal(parseNativeVisualTransforms(design)["photo:gallery:photo_123"].x, 8);
  assert.match(read("components/PublicInvitation/UniversalInvitationTemplate.tsx"), /data-studio-photo-id=\{asset\.id\}/);
  assert.match(read("components/PublicInvitation/RomanticRoseTemplate.tsx"), /data-studio-photo-id=\{photo\.id\}/);
});


test("protected link and gift buttons remain inert in Studio preview", () => {
  for (const path of [
    "components/PublicInvitation/UniversalInvitationTemplate.tsx",
    "components/PublicInvitation/RomanticRoseTemplate.tsx",
  ]) {
    const renderer = read(path);
    assert.match(renderer, /onClick=\{preview \? \(event\) => event\.preventDefault\(\) : undefined\}/);
    assert.match(renderer, /if \(preview/);
  }
});


test("context inspector edits native transforms without replacing copy or component settings", () => {
  const selection = read("components/InvitationStudio/StudioSelectionInspector.tsx");
  const inspector = read("components/InvitationStudio/StudioNativeVisualInspector.tsx");
  assert.match(selection, /dc-studio-selection-stack/);
  assert.match(selection, /\{nativeControls\}/);
  assert.match(inspector, /scaleX/);
  assert.match(inspector, /scaleY/);
  assert.match(inspector, /rotation/);
  assert.match(inspector, /onChange\(defaultNativeVisualTransform\)/);
});


test("duplicated sections can move one heading or copy without moving its sibling", () => {
  assert.equal(nativeVisualSelector("heading:identity:identity_copy2"),
    '[data-section-instance-id="identity_copy2"] [data-invitation-section="identity"] [data-studio-native-heading]');
  assert.equal(nativeVisualSelector("copy:greeting:greeting_copy2"),
    '[data-section-instance-id="greeting_copy2"] [data-studio-copy-field="greeting"]');
  assert.equal(nativeVisualSelector("element:gift:button:gift_copy2"),
    '[data-section-instance-id="gift_copy2"] [data-studio-section-element="gift:button"]');
  assert.equal(nativeVisualSelector('copy:greeting:x"]{color:red}'), null);
  const key = withNativeVisualTransforms("botanical-ivory", {
    "copy:greeting:greeting_copy2": { x: 14, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
  });
  assert.equal(parseNativeVisualTransforms(key)["copy:greeting:greeting_copy2"].x, 14);
  assert.match(read("components/InvitationStudio/studio-canvas-selection.ts"), /instanceId/);
});


test("template-authored native objects use safe selectors and section-instance scope", () => {
  assert.equal(nativeVisualSelector("object:cover:flower-left"),
    '[data-studio-native-object="object:cover:flower-left"]');
  assert.equal(nativeVisualSelector("object:identity:theme-art:identity_copy2"),
    '[data-section-instance-id="identity_copy2"] [data-studio-native-object="object:identity:theme-art"]');
  assert.equal(nativeVisualSelector('object:cover:x"]{color:red}'), null);
  assert.match(read("components/InvitationStudio/studio-canvas-selection.ts"), /data-studio-native-object/);
});

test("theme-authored decorations and special cover headings are selectable in Studio", () => {
  const themeScenes = read("components/PublicInvitation/InvitationThemeScenes.tsx");
  const pencil = read("components/PublicInvitation/PencilReverieScene.tsx");
  const zen = read("components/PublicInvitation/ZenAtelierScene.tsx");
  const pencilArt = read("components/PublicInvitation/PencilReverieArtwork.tsx");
  const zenArt = read("components/PublicInvitation/ZenAtelierArtwork.tsx");
  assert.match(themeScenes, /object:cover:flower-left/);
  assert.match(themeScenes, /object:envelope:open-button/);
  assert.match(pencil, /data-studio-native-heading/);
  assert.match(pencil, /object:cover:main-art/);
  assert.match(zen, /data-studio-native-heading/);
  assert.match(zen, /object:envelope:mizuhiki/);
  assert.match(pencilArt, /object:\$\{section\}:theme-art/);
  assert.match(zenArt, /object:\$\{section\}:theme-art/);
});


test("shared built-in display nodes expose Studio native-object markers without replacing business data", () => {
  const universal = read("components/PublicInvitation/UniversalInvitationTemplate.tsx");
  const rose = read("components/PublicInvitation/RomanticRoseTemplate.tsx");
  for (const renderer of [universal, rose]) {
    assert.match(renderer, /object:dateTime:panel/);
    assert.match(renderer, /object:location:venue/);
    assert.match(renderer, /object:gift:account-number/);
    assert.match(renderer, /object:closing:names/);
    assert.match(renderer, /object:footer:rule/);
    assert.match(renderer, /data-studio-section-element="location:button"/);
    assert.match(renderer, /data-studio-section-element="gift:button"/);
  }
  assert.match(universal, /object:\$\{keyName\}:divider/);
  assert.match(rose, /object:envelope:top-fold/);
  assert.match(rose, /section="rsvp"/);
});


test("generic theme envelope and cover artwork expose transform targets for visual parts", () => {
  const scenes = read("components/PublicInvitation/InvitationThemeScenes.tsx");
  for (const marker of [
    "object:envelope:frame-border",
    "object:envelope:card",
    "object:envelope:flap",
    "object:envelope:seal",
    "object:envelope:letter-kicker",
    "object:envelope:date",
    "object:cover:photo-frame",
    "object:cover:kicker",
    "object:cover:date",
    "object:cover:starfield",
    "object:cover:card",
  ]) assert.ok(scenes.includes(marker), `missing Studio marker ${marker}`);
  assert.ok(!scenes.includes("<BotanicalSprig /><BotanicalSprig mirrored />"));
  assert.ok(!scenes.includes('<Lines className="mt-9" />'));
});

test("Zen envelope seal participates in native visual transforms", () => {
  const zen = read("components/PublicInvitation/ZenAtelierScene.tsx");
  assert.match(zen, /zen-jp-seal" lang="ja" data-studio-native-object="object:envelope:seal"/);
});


test("template-authored supporting visuals remain directly selectable without section wrappers stealing the click", () => {
  const story = read("components/PublicInvitation/OurStorySection.tsx");
  const zenGallery = read("components/PublicInvitation/ZenAtelierGallery.tsx");
  const rose = read("components/PublicInvitation/RomanticRoseTemplate.tsx");
  const universal = read("components/PublicInvitation/UniversalInvitationTemplate.tsx");
  const instance = read("components/PublicInvitation/EditableSectionInstance.tsx");

  assert.match(story, /object:identity:our-story-kicker/);
  assert.match(story, /object:identity:our-story-heading/);
  assert.match(story, /object:identity:our-story-divider/);
  assert.match(zenGallery, /data-studio-photo-id=\{photo\.id\}/);
  assert.match(zenGallery, /if \(preview\) \{ event\.preventDefault\(\); return; \}/);
  assert.match(zenGallery, /!preview && <dialog/);
  assert.match(zenGallery, /object:gallery:quote/);
  const pencilGallery = read("components/PublicInvitation/PencilReverieArtwork.tsx");
  assert.match(pencilGallery, /object:gallery:memory-\$\{i \+ 1\}/);
  assert.match(pencilGallery, /if \(preview\) \{ e\.preventDefault\(\); return; \}/);
  assert.match(pencilGallery, /!preview && index!==null/);
  assert.match(rose, /object:envelope:letter-card/);
  assert.match(rose, /object:cover:background-photo/);
  assert.match(rose, /object:cover:gradient-overlay/);
  assert.match(universal, /object:gallery:memory-panel/);
  assert.match(universal, /object:gallery:memory-symbols/);
  assert.match(universal, /object:identity:\$\{slot\}-symbol/);
  assert.match(instance, /\[data-studio-native-object\]/);
  assert.match(instance, /\[data-studio-native-heading\]/);
  assert.match(instance, /\[data-invitation-photo-slot\]/);
  const selection = read("components/InvitationStudio/studio-canvas-selection.ts");
  assert.match(selection, /studioObjectSections\.includes\(sectionName\)/);
});



test("native visual styling stays inside the validated nativeVisuals contract", () => {
  const values = sanitizeNativeVisualTransforms({
    "object:cover:kicker": {
      x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0,
      opacity: 9,
      color: "#ABCDEF",
      background: "red",
      borderColor: "#123456",
      fontSize: 999,
      fontWeight: 557,
      textAlign: "justify",
      letterSpacing: 99,
      lineHeight: 0,
    },
  });
  assert.deepEqual(values["object:cover:kicker"], {
    x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0,
    opacity: 1,
    color: "#abcdef",
    borderColor: "#123456",
    fontSize: 160,
    fontWeight: 600,
    letterSpacing: 20,
    lineHeight: 0.7,
  });
  const css = nativeVisualStyleSheet(withNativeVisualTransforms("botanical-ivory", values));
  assert.match(css, /opacity:1/);
  assert.match(css, /color:#abcdef/);
  assert.match(css, /border-color:#123456/);
  assert.match(css, /font-size:160px/);
  assert.doesNotMatch(css, /background-color:red|text-align:justify/);
});

test("native visual capabilities avoid duplicating protected component styling", () => {
  assert.deepEqual(nativeVisualCapabilities("heading:cover"), { opacity: true, colors: true, typography: true });
  assert.deepEqual(nativeVisualCapabilities("copy:greeting"), { opacity: true, colors: true, typography: true });
  assert.deepEqual(nativeVisualCapabilities("object:location:venue"), { opacity: true, colors: true, typography: true });
  assert.deepEqual(nativeVisualCapabilities("object:identity:our-story-heading"), { opacity: true, colors: true, typography: true });
  assert.deepEqual(nativeVisualCapabilities("object:cover:flower-left"), { opacity: true, colors: true, typography: false });
  assert.deepEqual(nativeVisualCapabilities("photo:cover"), { opacity: true, colors: false, typography: false });
  assert.deepEqual(nativeVisualCapabilities("element:gift:button"), { opacity: false, colors: false, typography: false });
  assert.deepEqual(nativeVisualCapabilities("rsvp:button"), { opacity: false, colors: false, typography: false });
});

test("native inspector exposes visual styling without adding functional controls", () => {
  const inspector = read("components/InvitationStudio/StudioNativeVisualInspector.tsx");
  assert.match(inspector, /nativeVisualCapabilities/);
  assert.match(inspector, /current\.opacity/);
  assert.match(inspector, /current\.fontSize/);
  assert.match(inspector, /current\.fontWeight/);
  assert.match(inspector, /current\.textAlign/);
  assert.match(inspector, /current\.letterSpacing/);
  assert.match(inspector, /current\.lineHeight/);
  assert.doesNotMatch(inspector, /href|endpoint|required|capacity/i);
});


test("native font overrides use the invitation font catalog and load in public renderers", () => {
  const clean = sanitizeNativeVisualTransforms({
    "object:cover:kicker": {
      x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0,
      fontFamily: "Playfair Display",
    },
    "object:cover:date": {
      x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0,
      fontFamily: "Arial; color:red",
    },
  });
  assert.equal(clean["object:cover:kicker"].fontFamily, "Playfair Display");
  assert.equal(clean["object:cover:date"], undefined);
  const design = withNativeVisualTransforms("botanical-ivory", clean);
  assert.deepEqual(nativeVisualFontFamilies(design), ["Playfair Display"]);
  assert.match(nativeVisualStyleSheet(design), /font-family:"Playfair Display"/);
  assert.doesNotMatch(nativeVisualStyleSheet(design), /Arial|color:red/);

  const universal = read("components/PublicInvitation/UniversalInvitationTemplate.tsx");
  const rose = read("components/PublicInvitation/RomanticRoseTemplate.tsx");
  const inspector = read("components/InvitationStudio/StudioNativeVisualInspector.tsx");
  assert.match(universal, /nativeVisualFontFamilies\(activeDesignKey\)/);
  assert.match(rose, /nativeVisualFontFamilies\(activeDesignKey\)/);
  assert.match(rose, /<InvitationFonts families=\{nativeVisualFontFamilies\(activeDesignKey\)\} \/>/);
  assert.match(inspector, /nativeFontFamilies/);
  assert.match(inspector, /current\.fontFamily/);
  assert.match(inspector, /<InvitationFonts families=\{current\.fontFamily/);
});
