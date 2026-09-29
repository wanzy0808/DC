import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
const portal = read("components/Landing/Pintu/PortalTransition.tsx");
const doorScene = read("components/Landing/Pintu/LandingDoorScene.tsx");
const styles = read("app/globals.css");

test("marketing transitions use woodland foliage instead of the old pink veil", () => {
  assert.match(portal, /className="undara-portal-transition"/);
  assert.match(portal, /undara-portal-transition__landscape/);
  assert.match(portal, /undara-branch-gate--left-1/);
  assert.match(portal, /undara-branch-gate--right-1/);
  assert.doesNotMatch(portal, /undara-marketing-veil-in|undara-marketing-veil-out|#fae9ef|#f8dce7/);

  assert.match(styles, /canopy7\.webp/);
  assert.match(styles, /forest-silhouette\.webp/);
  assert.match(styles, /branch-01\.webp/);
  assert.match(styles, /branch-02\.webp/);
  assert.match(styles, /branch-03\.webp/);
  assert.match(styles, /branch-04\.webp/);
  assert.match(styles, /branch-05\.webp/);
  assert.match(styles, /branch-06\.webp/);
  assert.match(styles, /@keyframes undara-branch-close-a/);
  assert.match(styles, /@keyframes undara-branch-close-b/);
  assert.match(styles, /@keyframes undara-branch-close-c/);
  assert.match(styles, /@keyframes undara-branch-open-a/);
  assert.match(styles, /@keyframes undara-branch-open-b/);
  assert.match(styles, /@keyframes undara-branch-open-c/);
  assert.doesNotMatch(styles, /@keyframes undara-marketing-veil-in|@keyframes undara-marketing-veil-out/);
  assert.doesNotMatch(styles, /hue-rotate/);

  assert.match(doorScene, /function startWoodlandCover\(\)/);
  assert.match(doorScene, /color="#4F463A"/);
  assert.match(doorScene, /color=\{isDarkMode \? "#D6B38C" : "#B28B5E"\}/);
  assert.match(doorScene, /metal: "#B89168"/);
  assert.match(doorScene, /entering \? 0\.04 : 0\.30/);
  assert.match(doorScene, /entering \? 0\.65 : selected !== null/);
  assert.doesNotMatch(doorScene, /#e8a9bd|startRoseCover/);
});

test("woodland transition respects reduced motion", () => {
  assert.match(portal, /if \(phase === "idle" \|\| reducedMotion\) return null/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\) \{[\s\S]*\.undara-portal-transition \{ display: none; \}/);
});
