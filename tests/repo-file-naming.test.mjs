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
  assert.equal(existsSync(path("public/assets/brand/undara/logo.png")), true);
  assert.equal(existsSync(path("app/logo.png")), false);
  const brand = read("components/Brand/BrandWordmark.tsx");
  const globalStyles = read("app/globals.css");
  assert.match(brand, /undara-brand-logo/);
  assert.match(brand, /<span className="sr-only">Undara<\/span>/);
  assert.match(brand, /Melangkah Bersama, Menuju Hari Penuh Makna/);
  assert.match(brand, /public: "w-\[112px\] sm:w-\[140px\] lg:w-\[148px\]"/);
  assert.match(brand, /text-\[7px\] sm:text-\[9px\] lg:text-\[10px\]/);
  assert.match(globalStyles, /mask-image:\s*url\("\/assets\/brand\/undara\/logo\.png"\)/);
});


test("Undara light and dark palette stays on the canonical pair", () => {
  const styles = read("app/globals.css");
  assert.match(styles, /:root \{[\s\S]*?--background:\s*#EDE3D8;/);
  assert.match(styles, /\.dark \{[\s\S]*?--background:\s*#703B3B;/);
  assert.match(styles, /--dc-dashboard-canvas:\s*#EDE3D8;/);
});


test("Undara production doors keep the brand body color under rear-only lighting", () => {
  const doors = read("components/Landing/Pintu/LandingDoorScene.tsx");
  assert.match(doors, /frame: "#703B3B"[\s\S]*?panel: "#703B3B"[\s\S]*?panelBottom: "#5E3030"/);
  assert.match(doors, /trim: isDarkMode \? "#D6B38C" : "#EDE3D8"/);
  assert.match(doors, /<DoorFrame color=\{palette\.frame\} \/>/);
  assert.match(doors, /emissive=\{color\} emissiveIntensity=\{0\.1[34-6]\}/);
  assert.match(doors, /directionalLight[\s\S]*?position=\{\[0, 5\.8, -7\.2\]\}/);
  assert.match(doors, /pointLight position=\{\[0, 1\.2, -2\.6\]\}/);
  assert.match(doors, /isDarkMode=\{isDarkMode\}/);
});


test("Undara shared assets stay centralized", () => {
  const expected = [
    "public/assets/brand/undara/logo.png",
    "public/assets/landing/doors/digital-invitation.png",
    "public/assets/landing/doors/physical-invitation.png",
    "public/assets/landing/doors/guestbook.png",
    "public/assets/landing/doors/event-planner.png",
    "public/assets/landing/ornaments/botanical/branch-01.png",
    "public/assets/landing/ornaments/botanical/branch-06.png",
    "public/assets/landing/atmosphere/forest-silhouette.png",
    "public/assets/demo/invitation/couple.jpg",
    "public/assets/payments/banks/bca.webp",
    "public/assets/audio/a-himitsu-fragile.mp3",
    "app/icon.png",
  ];
  for (const file of expected) assert.equal(existsSync(path(file)), true, file);

  const retired = [
    "public/Idigi.png",
    "public/Ufisik.png",
    "public/eventplanner.png",
    "public/guestbook.png",
    "public/flower.png",
    "public/couple.jpg",
    "public/bca.webp",
    "public/A Himitsu - Fragile.mp3",
    "app/Undara Door icon.png",
    "assets/templates/landing page/branch1.png",
  ];
  for (const file of retired) assert.equal(existsSync(path(file)), false, file);
});


test("runtime source does not reference retired root asset URLs", () => {
  const extensions = /\.(?:ts|tsx|js|jsx|css)$/;
  const roots = ["app", "components", "lib", "data"];
  const files = [];
  const walk = (directory) => {
    for (const entry of readdirSync(path(directory), { withFileTypes: true })) {
      const relative = join(directory, entry.name);
      if (entry.isDirectory()) walk(relative);
      else if (extensions.test(entry.name)) files.push(relative);
    }
  };
  roots.forEach(walk);

  const retiredUrls = [
    "/Idigi.png",
    "/Ufisik.png",
    "/eventplanner.png",
    "/guestbook.png",
    "/flower.png",
    "/cloud.png",
    "/tiara.png",
    "/couple.jpg",
    "/couple2.jpg",
    "/couple3.jpg",
    "/man.jpg",
    "/female.jpg",
    "/bca.webp",
    "/A%20Himitsu%20-%20Fragile.mp3",
  ];

  for (const file of files) {
    const source = read(file);
    for (const legacy of retiredUrls) {
      const hasRetiredRootLiteral =
        source.includes(`"${legacy}"`) ||
        source.includes(`'${legacy}'`) ||
        source.includes("`" + legacy + "`");
      assert.equal(hasRetiredRootLiteral, false, `${file} still references root URL ${legacy}`);
    }
  }
});


test("shared non-home marketing atmosphere uses botanical branch-02 instead of the legacy flower asset", () => {
  const landingOrnament = read("components/Landing/LandingFloralGlow.tsx");
  assert.match(landingOrnament, /\/assets\/landing\/ornaments\/botanical\/branch-02\.png/);
  assert.equal(landingOrnament.includes("/assets/landing/ornaments/legacy/flower.png"), false);
});

test("homepage uses the dedicated woodland composition without cloud or petal ambience", () => {
  const home = read("app/page.tsx");
  const woodland = read("components/Landing/LandingWoodlandAtmosphere.tsx");
  const story = read("components/Landing/LandingStoryCopy.tsx");

  assert.match(home, /LandingWoodlandAtmosphere/);
  assert.match(home, /LandingStoryCopy/);
  assert.equal(home.includes("PublicMarketingAtmosphere"), false);
  assert.equal(home.includes("CloudCopy"), false);
  assert.equal(home.includes("WindRosePetals"), false);
  assert.equal(existsSync(path("components/Landing/CloudCopy.tsx")), false);

  assert.equal(existsSync(path("public/assets/landing/atmosphere/forest-silhouette.png")), true);
  assert.equal(existsSync(path("public/assets/landing/ornaments/botanical/bgwood.png")), false);
  assert.match(woodland, /\/assets\/landing\/atmosphere\/forest-silhouette\.png/);
  for (const branch of ["01", "02", "03", "04"]) {
    assert.ok(woodland.includes(`/assets/landing/ornaments/botanical/branch-${branch}.png`));
  }
  assert.match(story, /\/assets\/landing\/ornaments\/botanical\/branch-05\.png/);
});


test("landing fireflies follow the Undara theme colors", () => {
  const doors = read("components/Landing/Pintu/LandingDoorScene.tsx");
  assert.match(doors, /function Fireflies\(\{ reducedMotion, isDarkMode \}/);
  assert.match(doors, /color=\{isDarkMode \? "#D6B38C" : "#703B3B"\}/);
  assert.match(doors, /blending=\{isDarkMode \? THREE\.AdditiveBlending : THREE\.NormalBlending\}/);
  assert.match(doors, /<Fireflies reducedMotion=\{Boolean\(reducedMotion\)\} isDarkMode=\{isDarkMode\} \/>/);
});
