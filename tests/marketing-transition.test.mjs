import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
const portal = read("components/Landing/Pintu/PortalTransition.tsx");
const styles = read("app/globals.css");

test("marketing page transitions use the woodland passage instead of the old rose veil", () => {
  assert.match(portal, /className="undara-portal-transition"/);
  assert.match(portal, /data-phase=\{phase\}/);
  assert.match(portal, /undara-portal-transition__landscape/);
  assert.match(portal, /undara-portal-transition__foliage--left-front/);
  assert.match(portal, /undara-portal-transition__foliage--right-front/);
  assert.doesNotMatch(portal, /undara-marketing-veil-in|undara-marketing-veil-out|#fae9ef|#f8dce7/);

  assert.match(styles, /lightbg\.webp/);
  assert.match(styles, /darkbg\.webp/);
  assert.match(styles, /canopy7\.webp/);
  assert.match(styles, /branch-03\.webp/);
  assert.match(styles, /branch-06\.webp/);
  assert.match(styles, /forest-silhouette\.webp/);
  assert.match(styles, /@keyframes undara-portal-left-front-cover/);
  assert.match(styles, /@keyframes undara-portal-right-front-reveal/);
  assert.doesNotMatch(styles, /@keyframes undara-marketing-veil-in|@keyframes undara-marketing-veil-out/);
});

test("woodland transition keeps reduced-motion users on the no-animation route", () => {
  assert.match(portal, /if \(phase === "idle" \|\| reducedMotion\) return null/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\) \{[\s\S]*\.undara-portal-transition \{ display: none; \}/);
});
