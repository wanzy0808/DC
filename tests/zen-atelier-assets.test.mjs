import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const repoFile = (path) => new URL(`../${path}`, import.meta.url);
const scene = readFileSync(repoFile("components/PublicInvitation/ZenAtelierScene.tsx"), "utf8");
const artwork = readFileSync(repoFile("assets/templates/zen-atelier/ZenArtwork.tsx"), "utf8");
const source = scene + artwork;

test("Zen Atelier references only artwork that exists in the public template assets", () => {
  const files = [...source.matchAll(/(?:root \+ "|"\/templates\/Zen%20Atelier\/)([a-z0-9]+\.png)/g)].map((match) => match[1]);
  assert.ok(new Set(files).size >= 4, "expected the envelope, cover and section artwork");
  for (const file of new Set(files)) {
    assert.ok(existsSync(repoFile(`public/templates/Zen Atelier/${file}`)), `missing artwork: ${file}`);
  }
});

test("Zen Atelier opens using the direct user gesture and reuses the shared invitation renderer", () => {
  assert.match(scene, /setOpening\(true\); onOpen\(\)/);
  assert.doesNotMatch(scene, /setTimeout\(onOpen/);
  const universal = readFileSync(repoFile("components/PublicInvitation/UniversalInvitationTemplate.tsx"), "utf8");
  assert.match(universal, /<InvitationMusic ref=\{musicRef\}/);
  assert.match(universal, /<RsvpForm slug=\{invitation\.slug\}/);
});

test("stage-specific Zen envelope uses the supplied paper artwork and opens before advancing", () => {
  const css = readFileSync(repoFile("components/PublicInvitation/zen-atelier.css"), "utf8");
  const sceneEnvelope = scene.split('stage === "envelope" ? <>')[1]?.split("</> : <>")[0];
  assert.ok(sceneEnvelope, "expected a distinct envelope stage");
  assert.match(sceneEnvelope, /Sebuah undangan<br \/>untuk orang istimewa/);
  assert.match(sceneEnvelope, /Buka Undangan<\/span>/);
  assert.match(sceneEnvelope, /className="zen-envelope-back"/);
  assert.match(sceneEnvelope, /className="zen-envelope-flap"/);
  assert.match(sceneEnvelope, /className="zen-envelope-front"/);
  assert.match(sceneEnvelope, /disabled=\{opening\}/);
  assert.doesNotMatch(sceneEnvelope, /Lihat Undangan|Pratinjau|Preview/);
  assert.match(css, /\.zen-envelope\[data-opening\] \.zen-envelope-flap \{ animation:zen-flap/);
  assert.match(css, /\.zen-envelope\[data-opening\] \.zen-letter \{ animation:zen-letter/);
  assert.match(css, /@media\(prefers-reduced-motion:reduce\)/);
  const universal = readFileSync(repoFile("components/PublicInvitation/UniversalInvitationTemplate.tsx"), "utf8");
  assert.match(universal, /musicRef\.current\?\.playOnOpen\(\)/);
  assert.match(universal, /window\.matchMedia\("\(prefers-reduced-motion: reduce\)"\)/);
  assert.match(universal, /setOpened\(true\);\s*setOpening\(false\);\s*onEnvelopeOpened\?\.\(\)/);
});
