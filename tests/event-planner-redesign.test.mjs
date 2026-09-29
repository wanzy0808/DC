import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), "utf8");

const page = read("app/event-planner/page.tsx");
const founder = read("components/EventPlanner/FounderSection.tsx");
const services = read("components/EventPlanner/ServicesSection.tsx");
const portfolio = read("components/EventPlanner/PortfolioSection.tsx");
const faq = read("components/Marketing/FaqSection.tsx");
const data = read("data/services/event-planner.ts");

test("event planner keeps the editorial redesign direction", () => {
  assert.match(page, /\/assets\/marketing\/event-planner\/hero\.webp/);
  assert.match(page, /Hadir penuh di momenmu/);
  assert.match(page, /We keep it moving/);
  assert.match(page, /lg:grid-cols-\[1\.05fr_0\.95fr\]/);
  assert.match(page, /plannerPackages\.map/);
  assert.doesNotMatch(page, /rounded-\[28px\].*plannerPackages/s);
  assert.doesNotMatch(page, /md:grid-cols-3/);

  assert.match(founder, /Christine/);
  assert.match(founder, /Pendiri & Lead Event Planner/);
  assert.match(founder, /rounded-\[8px_44px_8px_44px\]/);

  assert.match(services, /Cara kami bekerja/);
  assert.match(services, /md:grid-cols-\[2\.4rem_minmax\(0,0\.9fr\)_minmax\(0,1\.35fr\)\]/);
  assert.doesNotMatch(services, /max-w-\[10ch\]/);

  assert.match(portfolio, /Pilihan perayaan/);
  assert.match(portfolio, /max-w-\[18ch\]/);
  assert.match(portfolio, /lg:grid-cols-12/);

  assert.match(faq, /editorial\?: boolean/);
  assert.match(page, /editorial/);
  assert.doesNotMatch(data, /Event Planner DC|Undangan Digital DC|produk digital DC/);
});

test("event planner follows the ID EN toggle for visible copy", () => {
  assert.match(page, /const en = locale === "en"/);
  assert.match(page, /Sebelum kita mulai/);
  assert.match(page, /Before we plan/);
  assert.match(founder, /8\+ years of experience/);
  assert.match(founder, /8\+ tahun pengalaman/);
  assert.match(services, /Less noise, clearer decisions/);
  assert.match(services, /Lebih sedikit keruwetan/);
  assert.match(portfolio, /Selected celebrations/);
  assert.match(portfolio, /Pilihan perayaan/);
  assert.match(data, /questionEn:/);
  assert.match(data, /featuresEn:/);
  assert.match(data, /reviewEn:/);
});

test("event planner avoids narrow text columns and legacy typography", () => {
  const combined = [page, founder, services, portfolio].join("\n");
  assert.doesNotMatch(combined, /font-dc-/);
  assert.doesNotMatch(combined, /max-w-\[(10|11|12)ch\]/);
  assert.match(combined, /font-undara-heading/);
  assert.match(combined, /font-undara-body/);
  assert.match(combined, /font-undara-mono/);
});
