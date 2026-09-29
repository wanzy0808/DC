import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
const portal = read("components/Landing/Pintu/PortalTransition.tsx");
const doorScene = read("components/Landing/Pintu/LandingDoorScene.tsx");
const styles = read("app/globals.css");

test("marketing transitions use a single 10x10 branch swarm instead of mixed foliage", () => {
  assert.match(portal, /const BRANCH_SWARM: BranchSwarmLayer\[\] = \[/);
  const swarmBlock = portal.match(/const BRANCH_SWARM:[\s\S]*?\n\];/)?.[0] ?? "";
  assert.equal((swarmBlock.match(/\{ top:/g) ?? []).length, 10);

  assert.match(portal, /undara-branch-swarm undara-branch-swarm--left/);
  assert.match(portal, /undara-branch-swarm undara-branch-swarm--right/);
  assert.match(styles, /background-image: url\("\/assets\/landing\/ornaments\/botanical\/branch-03\.webp"\)/);
  assert.doesNotMatch(styles, /branch-01\.webp|branch-02\.webp|branch-04\.webp|branch-05\.webp|branch-06\.webp/);

  assert.match(styles, /@keyframes undara-branch-swarm-close-left/);
  assert.match(styles, /@keyframes undara-branch-swarm-close-right/);
  assert.match(styles, /@keyframes undara-branch-swarm-open-left/);
  assert.match(styles, /@keyframes undara-branch-swarm-open-right/);
  assert.match(styles, /translate3d\(43%, var\(--branch-y\), 0\)/);
  assert.match(styles, /translate3d\(-43%, var\(--branch-y\), 0\)/);
  assert.doesNotMatch(portal, /undara-branch-gate/);
  assert.doesNotMatch(styles, /undara-branch-gate/);
  assert.doesNotMatch(portal, /undara-marketing-veil-in|undara-marketing-veil-out|#fae9ef|#f8dce7/);
  assert.doesNotMatch(styles, /@keyframes undara-marketing-veil-in|@keyframes undara-marketing-veil-out|hue-rotate/);

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
