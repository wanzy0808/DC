import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const repoFile = (path) => new URL(`../${path}`, import.meta.url);
const scene = readFileSync(repoFile("components/PublicInvitation/ZenAtelierScene.tsx"), "utf8");
const artwork = readFileSync(repoFile("assets/templates/zen-atelier/ZenArtwork.tsx"), "utf8");
const source = scene + artwork;

test("Zen Atelier references only artwork that exists in the public template assets", () => {
  const files = [...source.matchAll(/(?:root \+ "|"\/templates\/)([a-z0-9]+\.png)/g)].map((match) => match[1]);
  assert.ok(files.length >= 12, "expected the envelope, cover and section artwork");
  for (const file of new Set(files)) {
    assert.ok(existsSync(repoFile(`public/templates/${file}`)), `missing artwork: ${file}`);
  }
});

test("Zen Atelier opens using the direct user gesture and reuses the shared invitation renderer", () => {
  assert.match(scene, /onClick=\{onOpen\}/);
  assert.doesNotMatch(scene, /setTimeout\(onOpen/);
  const universal = readFileSync(repoFile("components/PublicInvitation/UniversalInvitationTemplate.tsx"), "utf8");
  assert.match(universal, /<InvitationMusic ref=\{musicRef\}/);
  assert.match(universal, /<RsvpForm slug=\{invitation\.slug\}/);
});
