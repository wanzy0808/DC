import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const repo = new URL("../", import.meta.url);
const path = (name) => new URL(name, repo);
const read = (name) => readFileSync(path(name), "utf8");

function featureComponents(directory = "components") {
  return readdirSync(path(directory), { withFileTypes: true }).flatMap((entry) => {
    const relative = join(directory, entry.name);
    if (entry.isDirectory()) return featureComponents(relative);
    return entry.name.endsWith(".tsx") ? [relative] : [];
  });
}

test("feature TSX components use PascalCase names; shadcn/ui keeps its standard lowercase names", () => {
  const components = featureComponents().filter((file) => !file.startsWith("components/ui/"));
  assert.ok(components.length >= 100, "source file walk should cover all active feature components");
  for (const component of components) {
    const filename = component.split("/").at(-1);
    assert.match(filename, /^[A-Z][A-Za-z0-9]*\.tsx$/, component);
    assert.doesNotMatch(filename, /^(?:Temp|Draft|Old|Backup|Jiplak)(?:[A-Z0-9_.-]|$)|V[2-9]\.tsx$/, component);
  }
});

test("the homepage uses the actual four-door production scene, not a misleading Lab filename", () => {
  assert.equal(existsSync(path("components/Landing/Pintu/SimpleDoorLab.tsx")), false);
  const source = read("components/Landing/Pintu/LandingDoorScene.tsx");
  const home = read("app/page.tsx");
  assert.match(source, /export default function LandingDoorScene\(/);
  assert.match(home, /import LandingDoorScene from "@\/components\/Landing\/Pintu\/LandingDoorScene"/);
  assert.ok(home.includes("<LandingDoorScene fullFrame onDoorOpenChange={setDoorOpen} />"));
  assert.match(source, /<Canvas shadows=\{\{ type: THREE\.PCFShadowMap \}\}/);
  assert.equal(existsSync(path("components/Landing/Pintu/PortalTransition.tsx")), true);
});

test("old design lab routes stay retired without renaming customer media URLs", () => {
  assert.equal(existsSync(path("app/jiplak")), false);
  assert.equal(existsSync(path("app/pintu-lab")), false);
  assert.equal(existsSync(path("public/templates/Zen Atelier/amplop1.png")), true);
  assert.equal(existsSync(path("public/templates/pencil-reverie/bycicle.png")), true);
});
