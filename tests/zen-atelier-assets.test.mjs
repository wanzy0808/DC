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

test("Zen envelope uses Japanese washi folds, mizuhiki knot and existing Zen artwork", () => {
  const css = readFileSync(repoFile("components/PublicInvitation/zen-atelier.css"), "utf8");
  const envelope = scene.split('stage === "envelope" ? <>')[1]?.split("</> : <>")[0];
  assert.ok(envelope, "expected distinct Zen digital envelope stage");
  assert.match(envelope, /<BlossomBranch className="zen-jp-branch"/);
  assert.match(envelope, /<EnsoSun className="zen-jp-sun"/);
  assert.match(envelope, /<InkMountains className="zen-jp-mountains"/);
  assert.match(envelope, /<div className="zen-jp-envelope-shell"/);
  assert.match(envelope, /className="zen-jp-fold-left"/);
  assert.match(envelope, /className="zen-jp-fold-right"/);
  assert.match(envelope, /className="zen-jp-fold-top"/);
  assert.match(envelope, /className="zen-jp-mizuhiki-band"/);
  assert.match(envelope, /<svg className="zen-jp-mizuhiki"/);
  assert.match(envelope, /className="zen-jp-seal" lang="ja"/);
  assert.match(envelope, /<span className="zen-jp-letter-names">\{title\}<\/span>/);
  assert.match(envelope, /Buka Undangan<\/span>/);
  assert.match(envelope, /disabled=\{opening\}/);
  assert.doesNotMatch(envelope, /amplop1\.png|wax|Lihat Undangan|Pratinjau|Preview/);
  assert.match(css, /\.zen-envelope\[data-opening\] \.zen-jp-mizuhiki-band \{ animation:zen-jp-untie/);
  assert.match(css, /\.zen-envelope\[data-opening\] \.zen-jp-fold-top \{ animation:zen-jp-unfold/);
  assert.match(css, /\.zen-envelope\[data-opening\] \.zen-jp-letter \{ animation:zen-jp-letter-rise/);
  assert.match(css, /\.zen-envelope\[data-opening\] \.zen-jp-paper-stage \{ animation:zen-jp-paper-exit/);
  assert.match(css, /@media\(prefers-reduced-motion:reduce\)/);
  const universal = readFileSync(repoFile("components/PublicInvitation/UniversalInvitationTemplate.tsx"), "utf8");
  assert.match(universal, /musicRef\.current\?\.playOnOpen\(\)/);
  assert.match(universal, /window\.matchMedia\("\(prefers-reduced-motion: reduce\)"\)/);
  assert.match(universal, /setOpened\(true\);\s*setOpening\(false\);\s*onEnvelopeOpened\?\.\(\)/);
});
