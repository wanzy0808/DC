import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), "utf8");

const page = read("app/event-planner/page.tsx");
const founder = read("components/EventPlanner/FounderSection.tsx");
const services = read("components/EventPlanner/ServicesSection.tsx");
const portfolio = read("components/EventPlanner/PortfolioSection.tsx");
const data = read("data/services/event-planner.ts");

test("event planner keeps the editorial redesign direction", () => {
  assert.match(page, /\/assets\/marketing\/event-planner\/hero\.webp/);
  assert.match(page, /Kamu hadir di momenmu/);
  assert.match(page, /Kami jaga alurnya/);
  assert.match(page, /lg:grid-cols-\[0\.92fr_1\.08fr\]/);
  assert.match(page, /plannerPackages\.map/);
  assert.doesNotMatch(page, /rounded-\[28px\].*plannerPackages/s);

  assert.match(founder, /Christine/);
  assert.match(founder, /Founder & Lead Event Planner/);
  assert.match(founder, /rounded-\[8px_44px_8px_44px\]/);

  assert.match(services, /How we work/);
  assert.match(services, /border-b border-primary\/25/);
  assert.doesNotMatch(services, /md:grid-cols-2/);

  assert.match(portfolio, /lg:grid-cols-12/);
  assert.match(portfolio, /lg:col-span-7 lg:row-span-2/);
  assert.match(portfolio, /lg:col-span-5/);

  assert.doesNotMatch(data, /Event Planner DC|Undangan Digital DC|produk digital DC/);
});

test("event planner keeps Undara typography tokens", () => {
  const combined = [page, founder, services, portfolio].join("\n");
  assert.doesNotMatch(combined, /font-dc-/);
  assert.match(combined, /font-undara-heading/);
  assert.match(combined, /font-undara-body/);
  assert.match(combined, /font-undara-mono/);
});
