import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { LanguageProvider } from "../components/I18n/LanguageProvider.tsx";
import { MusicPanel } from "../components/InvitationStudio/MusicPanel.tsx";
import { hasAudioSignature } from "../lib/invitations/audio-limits.ts";
import { invitationTemplates, blankCanvasTemplate } from "../lib/templates/catalog.ts";
import { getInvitationDefaultMusic, invitationDefaultTracks, invitationMusicLibrary, resolveInvitationMusic } from "../lib/templates/music.ts";

const audio = { id: "owned-audio", type: "AUDIO", title: "Lagu Saya", url: "/api/media/invitation-assets/owned.mp3" };
const renderPanel = (props = {}, locale = "id") => renderToStaticMarkup(createElement(LanguageProvider, {
  initialLocale: locale,
}, createElement(MusicPanel, {
  templateKey: "botanical-ivory", musicUrl: "", assets: [], busy: false,
  setMusicUrl() {}, ...props,
})));
const selectedUrls = (markup) => [...markup.matchAll(/<input\b[^>]*type="radio"[^>]*>/g)]
  .map(([input]) => input).filter((input) => input.includes("checked=\"\""))
  .map((input) => input.match(/value="([^"]*)"/)?.[1]);

test("shared music library lists each bundled playable file once", () => {
  const files = readdirSync(new URL("../public/assets/audio/", import.meta.url)).filter((file) => file.endsWith(".mp3")).sort();
  assert.deepEqual(invitationMusicLibrary.map((track) => track.file.split("/").at(-1)).sort(), files);
  assert.equal(new Set(invitationMusicLibrary.map((track) => track.url)).size, files.length);
  for (const track of invitationMusicLibrary) {
    const bytes = readFileSync(new URL(`../public/${track.file}`, import.meta.url));
    assert.ok(hasAudioSignature(bytes.subarray(0, 16), "audio/mpeg"), track.file);
  }
});

test("every ready template has an explicit default from the shared library", () => {
  for (const template of invitationTemplates) {
    assert.ok(Object.hasOwn(invitationDefaultTracks, template.key), template.key);
    const track = getInvitationDefaultMusic(`${template.key}::custom-design`);
    assert.ok(invitationMusicLibrary.some((item) => item.url === track.url), template.key);
  }
  assert.ok(invitationMusicLibrary.some((track) => track.url === getInvitationDefaultMusic(blankCanvasTemplate.key).url));
});

test("Studio and public music resolution preserve saved choice, event upload, then theme default", () => {
  const defaultUrl = getInvitationDefaultMusic("botanical-ivory").url;
  assert.equal(resolveInvitationMusic("botanical-ivory", "  https://example.org/legacy.mp3  ", [audio]), "https://example.org/legacy.mp3");
  assert.equal(resolveInvitationMusic("botanical-ivory", "", [audio]), audio.url);
  assert.equal(resolveInvitationMusic("botanical-ivory", null, [{ type: "IMAGE", url: "/photo.webp" }]), defaultUrl);
  assert.equal(resolveInvitationMusic("botanical-ivory", " ", [{ ...audio, url: " " }]), defaultUrl);
});

test("panel selects the template default without saved music or uploads and creates only one preview audio", () => {
  const markup = renderPanel();
  assert.deepEqual(selectedUrls(markup), [getInvitationDefaultMusic("botanical-ivory").url]);
  assert.match(markup, /Musik Aktif:.*White Petals/);
  assert.match(markup, /Koleksi Undara/);
  assert.match(markup, /Bawaan Tema/);
  assert.equal((markup.match(/<audio\b/g) || []).length, 1);
  assert.match(markup, /preload="none"/);
  assert.doesNotMatch(markup, /<audio[^>]*(?:autoPlay|src=)/);
  assert.doesNotMatch(markup, /type="file"/);
});

test("a saved library song remains selected and recognizable independently of template default", () => {
  const track = invitationMusicLibrary.find((item) => item.title === "Lullaby");
  const markup = renderPanel({ musicUrl: track.url, assets: [audio] });
  assert.deepEqual(selectedUrls(markup), [track.url]);
  assert.match(markup, /Musik Aktif:.*Lullaby/);
  assert.doesNotMatch(markup, /Musik Tersimpan/);
  assert.match(markup, /Lagu Saya/);
});

test("only event uploads consume slots, and a full quota still allows the built-in library", () => {
  const markup = renderPanel({ assets: [audio, { ...audio, id: "second", url: "/api/media/invitation-assets/second.mp3" }], onUpload() {}, onDelete() {} });
  assert.deepEqual(selectedUrls(markup), [audio.url]);
  assert.match(markup, /2 \/ 2 file/);
  assert.match(markup, /<input[^>]*type="file"[^>]*disabled=""/);
  assert.match(markup, /Dengarkan White Petals/);
  assert.doesNotMatch(markup, /<fieldset[^>]*disabled=/);
});

test("legacy saved music stays selected and playable; English translates panel controls", () => {
  const legacy = "https://example.org/old-song.mp3";
  const markup = renderPanel({ musicUrl: legacy }, "en");
  assert.deepEqual(selectedUrls(markup), [legacy]);
  assert.match(markup, /Active Music:.*Saved Music/);
  assert.match(markup, /Listen to Saved Music/);
  assert.match(markup, /Undara Collection/);
  assert.match(markup, /Search songs or artists/);
  assert.doesNotMatch(markup, /Dengarkan|Bawaan Tema|Musik Tersimpan/);
});
