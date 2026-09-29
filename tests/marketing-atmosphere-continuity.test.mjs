import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), "utf8");

test("all framed marketing pages keep a visible outline over restrained ambience", () => {
  const css = read("app/globals.css");
  const frame = css.match(/\.undara-marketing-frame \{([^}]+)\}/)?.[1];
  const header = css.match(/\.undara-marketing-frame-header \{([^}]+)\}/)?.[1];
  assert.ok(frame);
  assert.match(frame, /overflow: visible/);
  assert.match(frame, /border: 2px solid/);
  assert.match(frame, /background: color-mix\(in srgb, var\(--background\) 12%, transparent\)/);
  assert.match(frame, /box-shadow: 0 12px 44px/);
  assert.doesNotMatch(frame, /backdrop-filter/);
  assert.match(header, /background: transparent/);
  assert.doesNotMatch(header, /backdrop-filter/);
  assert.match(css, /\.undara-marketing-scroll \{[^}]*overflow-y: auto/s);
  assert.match(css, /html\[data-undara-marketing-transition\] \[data-undara-marketing-frame\]/);

  for (const route of ["d-invitation", "guestbook", "undangan-fisik", "template-design", "help"]) {
    const source = read(`app/${route}/page.tsx`);
    assert.match(source, /<PublicMarketingAtmosphere \/>[\s\S]*data-undara-marketing-frame/, route);
  }

  const sharedAtmosphere = read("components/Layout/PublicMarketingAtmosphere.tsx");
  assert.match(sharedAtmosphere, /EventPlannerBotanicalAtmosphere/);
  assert.doesNotMatch(sharedAtmosphere, /LandingFloralGlow/);

  const home = read("app/page.tsx");
  assert.match(home, /<LandingWoodlandAtmosphere \/>[\s\S]*data-undara-marketing-frame/);
  assert.doesNotMatch(home, /flex-col overflow-hidden rounded-\[14px\]/);
  const woodland = read("components/Landing/LandingWoodlandAtmosphere.tsx");
  assert.match(woodland, /inset-x-\[4%\].*bottom-\[10%\].*top-\[12%\]/);
  assert.match(woodland, /BODY_MASK/);
});
