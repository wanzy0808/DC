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
  assert.equal(existsSync(path("components/InvitationStudio/StudioEntrySection.tsx")), true);
  assert.equal(existsSync(path("components/DigitalInvitation/StudioEntrySection.tsx")), false);
  assert.equal(existsSync(path("components/PublicInvitation/ZenAtelierArtwork.tsx")), true);
  assert.equal(existsSync(path("assets/templates/zen-atelier/ZenArtwork.tsx")), false);
  assert.equal(existsSync(path("dashboard-redesign-history.md")), true);
  assert.equal(existsSync(path("Dashboard-redesign.md")), false);
});

test("old design lab routes stay retired without renaming customer media URLs", () => {
  assert.equal(existsSync(path("app/jiplak")), false);
  assert.equal(existsSync(path("app/pintu-lab")), false);
  assert.equal(existsSync(path("public/templates/Zen Atelier/amplop1.png")), true);
  assert.equal(existsSync(path("public/templates/pencil-reverie/bycicle.png")), true);
});

test("package metadata uses the product name rather than a starter-app placeholder", () => {
  const pkg = JSON.parse(read("package.json"));
  assert.equal(pkg.name, "undara");
  assert.equal(pkg.private, true);
});


test("Undara navbar brand uses the shared image logo asset", () => {
  assert.equal(existsSync(path("public/brand/undara/logo.png")), true);
  assert.equal(existsSync(path("app/logo.png")), false);
  const brand = read("components/Brand/BrandWordmark.tsx");
  const globalStyles = read("app/globals.css");
  assert.match(brand, /undara-brand-logo/);
  assert.match(brand, /<span className="sr-only">Undara<\/span>/);
  assert.match(brand, /Melangkah Bersama, Menuju Hari Penuh Makna/);
  assert.match(brand, /public: "w-\[112px\] sm:w-\[140px\] lg:w-\[148px\]"/);
  assert.match(brand, /text-\[7px\] sm:text-\[9px\] lg:text-\[10px\]/);
  assert.match(globalStyles, /mask-image:\s*url\("\/brand\/undara\/logo\.png"\)/);
});


test("Undara light and dark palette stays on the canonical pair", () => {
  const styles = read("app/globals.css");
  assert.match(styles, /:root \{[\s\S]*?--background:\s*#EDE3D8;/);
  assert.match(styles, /\.dark \{[\s\S]*?--background:\s*#703B3B;/);
  assert.match(styles, /--dc-dashboard-canvas:\s*#EDE3D8;/);
});


test("Undara production doors use the theme-specific color-only palette", () => {
  const doors = read("components/Landing/Pintu/LandingDoorScene.tsx");
  assert.match(doors, /isDarkMode[\s\S]*?frame: "#D6B38C"[\s\S]*?trim: "#703B3B"/);
  assert.match(doors, /frame: "#703B3B"[\s\S]*?trim: "#EDE3D8"/);
  assert.match(doors, /<DoorFrame color=\{palette\.frame\} \/>/);
  assert.match(doors, /color=\{palette\.trim\} roughness=\{0\.58\} metalness=\{0\.12\}/);
  assert.match(doors, /isDarkMode=\{isDarkMode\}/);
});
