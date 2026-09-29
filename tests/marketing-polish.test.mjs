import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { blankCanvasTemplate, invitationTemplates } from "../lib/templates/catalog.ts";

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), "utf8");

test("marketing footer keeps mobile controls from colliding", () => {
  const footer = read("components/Layout/MarketingFrameFooter.tsx");
  assert.match(footer, /grid-rows-\[auto_auto\]/);
  assert.match(footer, /sm:grid-cols-\[minmax\(0,1fr\)_auto_minmax\(0,1fr\)\]/);
  assert.match(footer, /col-span-2 row-start-2/);
  assert.match(footer, /<UndaraSocialIcons \/>/);
});

test("marketing footer controls follow the global ID EN language", () => {
  const audio = read("components/Layout/MarketingAudio.tsx");
  const social = read("components/Layout/UndaraSocialIcons.tsx");
  assert.match(audio, /useLanguage/);
  assert.match(audio, /Turn sound off/);
  assert.match(audio, /Music volume/);
  assert.match(social, /link coming soon/);
  assert.match(social, /Undara social media/);
});

test("every built-in template has an English catalog description", () => {
  for (const template of [blankCanvasTemplate, ...invitationTemplates]) {
    assert.ok(template.descriptionEn?.trim(), `${template.key} is missing descriptionEn`);
  }
});

test("public catalog and featured collection render localized descriptions", () => {
  const catalogPage = read("app/template-design/page.tsx");
  const featured = read("components/DigitalInvitation/TemplateSection.tsx");
  assert.match(catalogPage, /template\.descriptionEn \?\? template\.description/);
  assert.match(catalogPage, /descriptionFor\(selected\)/);
  assert.match(featured, /template\.descriptionEn \?\? template\.description/);
});


test("marketing navbar menu labels follow ID EN", () => {
  const navbar = read("components/Layout/Navbar/Navbar.tsx");
  assert.match(navbar, /Open navigation menu/);
  assert.match(navbar, /Close navigation menu/);
  assert.match(navbar, /Close menu/);
});


test("public legal pages use the shared marketing frame", () => {
  for (const file of ["app/privacy-policy/page.tsx", "app/terms-and-conditions/page.tsx"]) {
    const source = read(file);
    assert.match(source, /data-undara-marketing-frame/);
    assert.match(source, /<Navbar embedded \/>/);
    assert.match(source, /<MarketingFrameFooter \/>/);
    assert.match(source, /undara-marketing-content/);
  }
});


test("template catalog keeps wide-screen editorial staggering without overriding hover transforms", () => {
  const catalogPage = read("app/template-design/page.tsx");
  const styles = read("app/globals.css");
  assert.match(catalogPage, /undara-template-catalog-grid/);
  assert.match(styles, /\.undara-template-catalog-grid > article:nth-child\(3n \+ 2\)/);
  assert.match(styles, /margin-top: 2rem/);
});
