import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const bridge = readFileSync(new URL("../components/Three/ThreeConsoleBridge.tsx", import.meta.url), "utf8");
const layout = readFileSync(new URL("../app/layout.tsx", import.meta.url), "utf8");
const templatePage = readFileSync(new URL("../app/template-design/page.tsx", import.meta.url), "utf8");

test("Three console bridge suppresses only the known R3F Clock deprecation", () => {
  assert.match(bridge, /R3F_CLOCK_DEPRECATION/);
  assert.match(bridge, /type === "warn" && message === R3F_CLOCK_DEPRECATION/);
  assert.match(bridge, /previous\(type, message, \.\.\.params\)/);
  assert.match(bridge, /console\.error/);
  assert.match(bridge, /console\.warn/);
  assert.match(bridge, /console\.log/);
});

test("Three console bridge is installed before marketing 3D surfaces", () => {
  const bridgeIndex = layout.indexOf("<ThreeConsoleBridge />");
  const portalIndex = layout.indexOf("<PortalTransition />");
  assert.ok(bridgeIndex >= 0);
  assert.ok(portalIndex >= 0);
  assert.ok(bridgeIndex < portalIndex);
});

test("template selection wheel does not wrap live invitation markup in a button", () => {
  assert.match(templatePage, /<div\s+key=\{template\.key\}[\s\S]*<TemplateCardCanvas/);
  assert.doesNotMatch(templatePage, /<button\s+key=\{template\.key\}[\s\S]*<TemplateCardCanvas/);
});
