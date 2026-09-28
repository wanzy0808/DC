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
  assert.equal(existsSync(path("public/templates/Zen Atelier/amplop1.webp")), true);
  assert.equal(existsSync(path("public/templates/pencil-reverie/bycicle.webp")), true);
});

test("package metadata uses the product name rather than a starter-app placeholder", () => {
  const pkg = JSON.parse(read("package.json"));
  assert.equal(pkg.name, "undara");
  assert.equal(pkg.private, true);
});


test("Undara navbar brand uses the shared image logo asset", () => {
  assert.equal(existsSync(path("public/assets/brand/undara/logo.webp")), true);
  assert.equal(existsSync(path("app/logo.webp")), false);
  const brand = read("components/Brand/BrandWordmark.tsx");
  const globalStyles = read("app/globals.css");
  assert.match(brand, /undara-brand-logo/);
  assert.match(brand, /<span className="sr-only">Undara<\/span>/);
  assert.match(brand, /Melangkah Bersama, Menuju Hari Penuh Makna/);
  assert.match(brand, /public: "w-\[112px\] sm:w-\[140px\] lg:w-\[148px\]"/);
  assert.match(brand, /text-\[7px\] sm:text-\[9px\] lg:text-\[10px\]/);
  assert.match(globalStyles, /mask-image:\s*url\("\/assets\/brand\/undara\/logo\.webp"\)/);
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
  assert.match(doors, /directionalLight[\s\S]*?position=\{\[0, 6\.1, -7\.8\]\}/);
  assert.match(doors, /pointLight position=\{\[0, 1\.35, -2\.9\]\}/);
  assert.match(doors, /function ForestShadowFloor/);
  assert.match(doors, /planeGeometry args=\{\[17, 13\]\}/);
  assert.match(doors, /isDarkMode=\{isDarkMode\}/);
});


test("Undara shared assets stay centralized", () => {
  const expected = [
    "public/assets/brand/undara/logo.webp",
    "public/assets/landing/doors/digital-invitation.webp",
    "public/assets/landing/doors/physical-invitation.webp",
    "public/assets/landing/doors/guestbook.webp",
    "public/assets/landing/doors/event-planner.webp",
    "public/assets/landing/ornaments/botanical/branch-01.webp",
    "public/assets/landing/ornaments/botanical/branch-06.webp",
    "public/assets/landing/atmosphere/forest-silhouette.webp",
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
    "public/guestbook.webp",
    "public/flower.webp",
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
    "/guestbook.webp",
    "/flower.webp",
    "/cloud.webp",
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
  assert.match(landingOrnament, /\/assets\/landing\/ornaments\/botanical\/branch-02\.webp/);
  assert.equal(landingOrnament.includes("/assets/landing/ornaments/legacy/flower.webp"), false);
});

test("homepage uses the dedicated woodland composition without cloud or petal ambience", () => {
  const home = read("app/page.tsx");
  const woodland = read("components/Landing/LandingWoodlandAtmosphere.tsx");
  const story = read("components/Landing/LandingStoryCopy.tsx");
  const canopy = read("components/Landing/LandingTopCanopy.tsx");

  assert.match(home, /LandingWoodlandAtmosphere/);
  assert.match(home, /LandingStoryCopy/);
  assert.equal(home.includes("PublicMarketingAtmosphere"), false);
  assert.equal(home.includes("CloudCopy"), false);
  assert.equal(home.includes("WindRosePetals"), false);
  assert.equal(home.includes("FallingLeaves"), false);
  assert.equal(existsSync(path("components/Landing/CloudCopy.tsx")), false);

  assert.equal(existsSync(path("public/assets/landing/atmosphere/forest-silhouette.webp")), true);
  assert.equal(existsSync(path("public/assets/landing/ornaments/botanical/bgwood.png")), false);
  assert.match(woodland, /\/assets\/landing\/atmosphere\/forest-silhouette\.webp/);
  assert.match(canopy, /data-landing-canopy/);
  assert.equal(/\/assets\/landing\/ornaments\/botanical\/branch-0[1-6]\.png/.test(woodland), false);
  assert.match(story, /\/assets\/landing\/ornaments\/botanical\/branch-05\.webp/);
  assert.equal(home.includes("LandingOuterBranches"), false);
});


test("public marketing pages share one frame, footer control system and falling-leaf ambience", () => {
  const styles = read("app/globals.css");
  const atmosphere = read("components/Layout/PublicMarketingAtmosphere.tsx");
  const footer = read("components/Layout/MarketingFrameFooter.tsx");
  const audio = read("components/Layout/MarketingAudio.tsx");
  const framedPages = [
    "app/d-invitation/page.tsx",
    "app/template-design/page.tsx",
    "app/event-planner/page.tsx",
    "app/guestbook/page.tsx",
    "app/undangan-fisik/page.tsx",
    "app/help/page.tsx",
  ];

  assert.equal(existsSync(path("components/Layout/FallingLeaves.tsx")), true);
  assert.equal(existsSync(path("components/Layout/RosePetalBackground.tsx")), false);
  assert.equal(existsSync(path("components/Landing/WindRosePetals.tsx")), false);
  assert.match(atmosphere, /FallingLeaves/);
  assert.doesNotMatch(atmosphere, /WindRosePetals|RosePetalBackground/);

  assert.match(styles, /\.undara-marketing-frame \{/);
  assert.match(styles, /\.undara-marketing-frame-header \{/);
  assert.match(styles, /\.undara-marketing-scroll \{/);
  assert.match(styles, /\.undara-footer-control \{/);
  assert.match(styles, /\.undara-volume-slider/);
  assert.match(footer, /MarketingAudioControls/);
  assert.match(footer, /UndaraSocialIcons/);
  assert.match(read("components/Layout/UndaraSocialIcons.tsx"), /undara-footer-control/);
  assert.match(audio, /className="undara-footer-control"/);
  assert.match(audio, /className="undara-volume-slider/);

  for (const file of framedPages) {
    const source = read(file);
    assert.match(source, /className="undara-marketing-frame"/, file);
    assert.match(source, /className="undara-marketing-frame-header"/, file);
    assert.match(source, /undara-marketing-scroll/, file);
    assert.match(source, /<MarketingFrameFooter/, file);
    assert.equal(source.includes("LandingWoodlandAtmosphere"), false, file);
    assert.equal(source.includes("forest-silhouette.webp"), false, file);
  }
});


test("Undara footer social icons stay link-free until official profiles exist", () => {
  const social = read("components/Layout/UndaraSocialIcons.tsx");
  const frameFooter = read("components/Layout/MarketingFrameFooter.tsx");
  const publicFooter = read("components/Layout/Footer.tsx");

  assert.match(social, /Instagram Undara/);
  assert.match(social, /TikTok Undara/);
  assert.match(social, /Facebook Undara/);
  assert.match(social, /data-social-pending="true"/);
  assert.doesNotMatch(social, /dc\.organizer/i);
  assert.doesNotMatch(frameFooter, /dc\.organizer/i);
  assert.match(frameFooter, /<UndaraSocialIcons \/>/);
  assert.match(publicFooter, /<UndaraSocialIcons compact \/>/);
});


test("landing fireflies follow the Undara theme colors", () => {
  const doors = read("components/Landing/Pintu/LandingDoorScene.tsx");
  assert.match(doors, /function Fireflies\(\{ reducedMotion, isDarkMode \}/);
  assert.match(doors, /color=\{isDarkMode \? "#D6B38C" : "#703B3B"\}/);
  assert.match(doors, /blending=\{isDarkMode \? THREE\.AdditiveBlending : THREE\.NormalBlending\}/);
  assert.match(doors, /<Fireflies reducedMotion=\{Boolean\(reducedMotion\)\} isDarkMode=\{isDarkMode\} \/>/);
});


test("burger services submenu keeps clearance below the Services trigger", () => {
  const burger = read("components/Layout/Navbar/BurgerMenuContent.tsx");
  assert.match(burger, /className="space-y-2 overflow-hidden pl-4 pt-2"/);
});


test("burger services submenu is closed by default", () => {
  const burger = read("components/Layout/Navbar/BurgerMenuContent.tsx");
  assert.match(burger, /const \[servicesOpen, setServicesOpen\] = useState\(false\);/);
});


test("landing story copy keeps the Undara doorway message and larger emphasis", () => {
  const story = read("components/Landing/LandingStoryCopy.tsx");
  assert.match(story, /Setiap cerita dimulai dari sebuah pintu/);
  assert.match(story, /Temukan kebutuhanmu di balik pintu\./);
  assert.match(story, /Seluruh kebutuhan perayaanmu ada di sini/);
  assert.match(story, /w-\[min\(88vw,460px\)\][^"]*sm:w-\[min\(42vw,520px\)\][^"]*lg:w-\[min\(31vw,560px\)\]/);
  assert.match(story, /text-\[clamp\(1\.35rem,2\.05vw,2\.05rem\)\]/);
  assert.match(story, /branch-05\.webp/);
  assert.doesNotMatch(story, /h-px w-\[180px\] bg-gradient-to-l/);
});


test("story divider keeps the wider ornamental width", () => {
  const story = read("components/Landing/LandingStoryCopy.tsx");
  assert.match(story, /h-8 w-\[280px\][^"]*sm:w-\[350px\][^"]*lg:w-\[430px\]/);
  assert.match(story, /branch-05\.webp/);
});
