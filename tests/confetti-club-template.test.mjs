import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { BirthdayCake, ConfettiClubSectionArt } from "../components/PublicInvitation/ConfettiClubArtwork.tsx";
import { invitationTemplates, getInvitationTemplate } from "../lib/templates/catalog.ts";
import { invitationPalettes, invitationFonts, parseDesignKey, makeDesignKey } from "../lib/templates/design.ts";
import { availableEditableCopyFields, invitationCopyDefaults, withEditableCopy } from "../lib/templates/editable-copy.ts";
import { invitationText, localizedEditableCopy } from "../lib/invitations/language.ts";
import { getInvitationDefaultMusic, resolveInvitationMusic } from "../lib/templates/music.ts";
import { templateHasDefaultMotion, templateHasDefaultPhotoMotion, templateNativeMotionForKey, templatePhotoMotion } from "../lib/templates/template-motion.ts";
import { isNativeVisualKey, nativeVisualUsesSystemContent } from "../lib/templates/native-visual-transforms.ts";
import { getTemplateDemoInvitation, templateDemoInvitation } from "../data/templates/preview-invitation.ts";

const key = "confetti-club";
const designKey = "confetti-club::confetti::syneInter";
const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");

test("Confetti Club registers one birthday theme with honest photo capabilities", () => {
  assert.equal(invitationTemplates.filter((item) => item.key === key).length, 1);
  const theme = getInvitationTemplate(designKey);
  assert.equal(theme.key, key);
  assert.deepEqual(theme.photoSlots, ["cover", "gallery"]);
  assert.equal(theme.usesPhotos, true);
  assert.deepEqual(theme.preset, { layout: "editorial", palette: "confetti", font: "syneInter" });
  assert.equal(makeDesignKey(key, "confetti", "syneInter"), designKey);
  assert.equal(parseDesignKey(designKey).palette, "confetti");
  assert.equal(invitationFonts.syneInter.heading, "Syne");
  assert.equal(theme.previewImage, "/templates/confetti-club/preview.svg");
  assert.match(read("public/templates/confetti-club/preview.svg"), /viewBox="0 0 390 760"/);
});

test("birthday gallery previews use one honoree without altering wedding fixtures", () => {
  const birthday = getTemplateDemoInvitation(designKey);
  assert.equal(birthday.eventCategory, "BIRTHDAY");
  assert.equal(birthday.groomName, "Dara");
  assert.equal(birthday.brideName, "");
  assert.equal(birthday.description, null, "The birthday preview uses the theme's own narrative");
  assert.equal(birthday.ceremonyTime, "16:00");
  assert.ok(birthday.assets.every((asset) => !asset.url.includes("/couple")));
  assert.equal(getTemplateDemoInvitation("serein"), templateDemoInvitation);
  assert.equal(templateDemoInvitation.groomName, "Una");
  assert.equal(templateDemoInvitation.brideName, "Dara");
  const canvas = read("components/Templates/TemplateGalleryCanvas.tsx");
  assert.match(canvas, /getTemplateDemoInvitation\(rendererKey\)/);
  assert.match(canvas, /allowEnvelopeOpen/);
  assert.doesNotMatch(read("components/PublicInvitation/UniversalInvitationTemplate.tsx"), /preview-invitation/);
});

test("birthday narrative slots preserve customer text and support English defaults", () => {
  const fields = ["greeting", "attendanceRequest", "prayerWish", "closing"];
  assert.deepEqual(availableEditableCopyFields(key, false), fields);
  const defaults = invitationCopyDefaults(key);
  for (const field of fields) {
    assert.ok(defaults[field]?.trim());
    assert.notEqual(invitationText("EN", defaults[field]), defaults[field]);
  }
  assert.doesNotMatch(Object.values(defaults).join(" "), /pernikahan|mempelai|Dara|Una|\b18\b/i);
  assert.equal(invitationCopyDefaults(key, "Pesan milik keluarga").greeting, "Pesan milik keluarga");
  const saved = withEditableCopy(designKey, { closing: "See you, Raka!" });
  assert.equal(localizedEditableCopy(saved, key, null, "EN").closing, "See you, Raka!");
  assert.equal(localizedEditableCopy(saved, key, "Pesan milik keluarga", "EN").greeting, "Pesan milik keluarga");
  assert.equal(invitationText("EN", "Datang, ya?"), "Coming along?");
  assert.equal(invitationText("EN", "Ulang Tahun"), "Birthday");
});

test("cake artwork exposes editable parts with valid Studio identities", () => {
  const markup = renderToStaticMarkup(createElement(BirthdayCake));
  const targets = [...markup.matchAll(/data-studio-native-object="([^"]+)"/g)].map((item) => item[1]);
  assert.ok(targets.includes("object:cover:cake-art"));
  for (const part of ["cake-stand-art", "cake-body-art", "cake-icing-art", "candles-art"]) {
    assert.ok(targets.includes("object:cover:" + part));
  }
  assert.ok(targets.every(isNativeVisualKey));
  assert.ok(nativeVisualUsesSystemContent("object:cover:start"));
  assert.ok(nativeVisualUsesSystemContent("object:identity:event-name"));
  const closing = renderToStaticMarkup(createElement(ConfettiClubSectionArt, { section: "closing" }));
  assert.match(closing, /object:closing:cake-art/);
  const rsvp = renderToStaticMarkup(createElement(ConfettiClubSectionArt, { section: "rsvp" }));
  assert.match(rsvp, /object:rsvp:ribbon-art/);
});

test("birthday motion uses the shared runtime and persisted OFF takes precedence", () => {
  assert.equal(templateHasDefaultMotion(key), true);
  assert.equal(templateHasDefaultPhotoMotion(key), true);
  assert.equal(templatePhotoMotion(key).gallery.animation, "rise");
  assert.equal(templatePhotoMotion(key, { gallery: { animation: "none" } }).gallery.animation, "none");
  assert.equal(templatePhotoMotion(key, {}, { cover: { animation: "none" } }).cover.animation, undefined);
  assert.equal(templateNativeMotionForKey(key, "object:cover:cake-art", { cover: { animation: "none" } }), undefined);
  assert.equal(templateNativeMotionForKey(key, "heading:rsvp").animation, "rise");
});

test("birthday scenes keep real event data, preview guards and instant keyboard opening", () => {
  const scenes = read("components/PublicInvitation/InvitationThemeScenes.tsx");
  const scene = read("components/PublicInvitation/ConfettiClubScene.tsx");
  const universal = read("components/PublicInvitation/UniversalInvitationTemplate.tsx");
  assert.match(scenes, /theme === "confetti-club"/);
  assert.match(scene, /eventLabel \|\| tr\("Ulang Tahun"\)/);
  assert.match(scene, /\{names\}/);
  assert.match(scene, /\{date\}/);
  assert.match(scene, /preview && !allowEnvelopeOpen/);
  assert.match(scene, /event\.detail === 0/);
  assert.match(scene, /useReducedMotion/);
  assert.match(scene, /disabled=\{opening\}/);
  assert.match(universal, /ConfettiClubSectionArt section=\{keyName\}/);
  assert.match(universal, /className="cc-portrait"/);
  assert.match(universal, /cropOverlay\("cover"\)/);
  assert.match(universal, /className="cc-photo-wall"/);
  assert.match(universal, /presentation: "masonry"/);
  assert.match(universal, /<RsvpForm/);
  assert.match(universal, /<GuestWishes/);
  assert.doesNotMatch(scene, /Dara|Una|2027|turning|fetch\(/i);
});

test("birthday styling provides readable controls and finite reduced-motion-safe transitions", () => {
  const css = read("components/PublicInvitation/confetti-club.css");
  assert.match(css, /min-height: 48px/);
  assert.match(css, /font-size: 16px/);
  assert.match(css, /focus-visible/);
  assert.match(css, /hover: hover/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /animation: none/);
  assert.doesNotMatch(css, /transition:\s*all|infinite|font-size:\s*(?:9|10)px/);
});

test("birthday theme reuses bundled music while owner choices still win", () => {
  const music = getInvitationDefaultMusic(key);
  assert.equal(music.url, "/assets/audio/dayfox-they-say.mp3");
  assert.equal(resolveInvitationMusic(key, "/my-track.mp3", []), "/my-track.mp3");
  assert.equal(resolveInvitationMusic(key, null, [{ type: "AUDIO", url: "/my-upload.mp3" }]), "/my-upload.mp3");
});

test("birthday palette keeps text and action contrast above accessibility minimums", () => {
  const luminance = (hex) => {
    const rgb = hex.slice(1).match(/../g).map((part) => parseInt(part, 16) / 255);
    const linear = rgb.map((c) => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4);
    return linear[0] * .2126 + linear[1] * .7152 + linear[2] * .0722;
  };
  const contrast = (a, b) => {
    const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (light + .05) / (dark + .05);
  };
  const palette = invitationPalettes.confetti;
  for (const surface of [palette.bg, palette.surface]) {
    assert.ok(contrast(palette.ink, surface) >= 4.5);
    assert.ok(contrast(palette.accent, surface) >= 4.5);
  }
  const mix = (a, b, amount) => "#" + [0, 1, 2].map((index) => {
    const start = 1 + index * 2;
    const value = Math.round(parseInt(a.slice(start, start + 2), 16) * amount + parseInt(b.slice(start, start + 2), 16) * (1 - amount));
    return value.toString(16).padStart(2, "0");
  }).join("");
  const coralInk = mix(palette.soft, palette.ink, .65);
  assert.ok(contrast(coralInk, palette.bg) >= 3, "Coral display type remains readable");
  const css = read("components/PublicInvitation/confetti-club.css");
  const borderWeight = Number(css.match(/--cc-input-border: color-mix\(in srgb, var\(--inv-accent\) (\d+)%/)[1]) / 100;
  const border = mix(palette.accent, palette.bg, borderWeight);
  for (const surface of [palette.bg, palette.surface]) {
    assert.ok(contrast(border, surface) >= 3, "Form boundaries remain visible");
  }
  const placeholderOpacity = Number(css.match(/::placeholder \{[^}]*opacity: ([\d.]+)/)[1]);
  assert.ok(contrast(mix(palette.ink, palette.surface, placeholderOpacity), palette.surface) >= 4.5, "Placeholder text stays legible");
});
