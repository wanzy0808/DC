import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), "utf8");

test("all framed marketing pages let ambient effects cross the frame boundary", () => {
  const css = read("app/globals.css");
  const frame = css.match(/\.undara-marketing-frame \{([^}]+)\}/)?.[1];
  const header = css.match(/\.undara-marketing-frame-header \{([^}]+)\}/)?.[1];
  assert.ok(frame);
  assert.match(frame, /overflow: visible/);
  assert.match(frame, /background: transparent/);
  assert.match(frame, /box-shadow: none/);
  assert.doesNotMatch(frame, /backdrop-filter/);
  assert.match(header, /background: transparent/);
  assert.doesNotMatch(header, /backdrop-filter/);
  assert.match(css, /\.undara-marketing-scroll \{[^}]*overflow-y: auto/s);
  assert.match(css, /html\[data-undara-marketing-transition\] \[data-undara-marketing-frame\]/);

  for (const route of ["d-invitation", "guestbook", "undangan-fisik", "template-design", "help"]) {
    const source = read(`app/${route}/page.tsx`);
    assert.match(source, /<PublicMarketingAtmosphere \/>[\s\S]*data-undara-marketing-frame/, route);
  }

  const home = read("app/page.tsx");
  assert.match(home, /<LandingWoodlandAtmosphere \/>[\s\S]*data-undara-marketing-frame/);
  assert.doesNotMatch(home, /flex-col overflow-hidden rounded-\[14px\]/);
  const woodland = read("components/Landing/LandingWoodlandAtmosphere.tsx");
  assert.match(woodland, /absolute inset-0 z-0/);
});
