import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), "utf8");

const page = read("app/event-planner/page.tsx");
const services = read("components/EventPlanner/ServicesSection.tsx");
const faq = read("components/Marketing/FaqSection.tsx");
const data = read("data/services/event-planner.ts");
const atmosphere = read("components/EventPlanner/EventPlannerBotanicalAtmosphere.tsx");
const leaves = read("components/Layout/FallingLeaves.tsx");
const styles = read("app/globals.css");
const reveal = read("components/EventPlanner/ScrollReveal.tsx");

test("event planner is a connector-only Undara service", () => {
  assert.match(page, /const WHATSAPP_NUMBER = "6281285009609"/);
  assert.doesNotMatch(page, /6282124786516|FounderSection|PortfolioSection|plannerReviews|plannerPortfolio|Christine/);
  assert.doesNotMatch(data, /\bDC\b|DC Organizer|Christine|plannerReviews|plannerPortfolio/);

  assert.match(page, /Butuh Event Planner\?/);
  assert.match(page, /Undara bantu menerima kebutuhan awal lalu menghubungkan kamu/);
  assert.match(data, /Apa peran Undara untuk layanan Event Planner\?/);
  assert.match(data, /Siapa yang menangani pelaksanaan acaranya\?/);
  assert.match(data, /penyedia layanan yang relevan/);
  assert.match(services, /Sebelum kami hubungkan/);
  assert.match(services, /Sebelum kami hubungkan/);
});

test("event planner uses planner notes as decoration and a wider body", () => {
  assert.match(page, /\/assets\/note1\.webp/);
  assert.match(page, /\/assets\/note2\.webp/);
  assert.match(page, /\/assets\/note3\.webp/);
  assert.match(page, /function PlannerNote/);
  assert.match(page, /motion, useReducedMotion/);
  assert.match(page, /w-full max-w-none/);
  assert.match(page, /max-w-\[1560px\]/);
  assert.doesNotMatch(page, /md:grid-cols-3/);
});

test("event planner uses its own animated bronze botanical atmosphere", () => {
  assert.match(page, /EventPlannerBotanicalAtmosphere/);
  assert.doesNotMatch(page, /PublicMarketingAtmosphere|LandingFloralGlow/);

  assert.match(atmosphere, /<svg viewBox="0 0 470 760"/);
  assert.match(atmosphere, /<FoliageDrawing \/>/);
  assert.doesNotMatch(atmosphere, /foliage-(left|right|floating)\.webp/);
  assert.match(atmosphere, /FallingLeaves/);
  assert.match(atmosphere, /useReducedMotion/);
  assert.match(atmosphere, /repeat: Infinity/);
  assert.match(atmosphere, /absolute inset-0 z-0/);
  assert.match(atmosphere, /FallingLeaves embedded variety="forest"/);
  assert.match(page, /<EventPlannerBotanicalAtmosphere \/>\s*<div data-undara-marketing-frame/);
  assert.match(page, /undara-marketing-scroll relative z-20/);
  assert.doesNotMatch(atmosphere, /branch-0[1-6]\.webp/);
  assert.match(leaves, /index % 3 === 0/);
  assert.match(leaves, /index % 3 === 1/);
  assert.match(styles, /\.undara-marketing-frame\.event-planner-frame \{/);
  assert.match(styles, /border-radius: 0;\s*background: transparent;\s*box-shadow: none/);
  assert.doesNotMatch(page, /MarketingTextReveal/);
  assert.match(reveal, /once: true/);
  assert.doesNotMatch(reveal, /y: 18/);
});

test("event planner follows ID EN and avoids legacy copy", () => {
  assert.match(page, /const en = locale === "en"/);
  assert.match(data, /questionEn:/);
  assert.match(data, /featuresEn:/);
  assert.match(data, /titleEn:/);
  assert.match(faq, /editorial\?: boolean/);

  const combined = [page, services, data].join("\n");
  assert.doesNotMatch(combined, /font-dc-/);
  assert.doesNotMatch(combined, /max-w-\[(10|11|12)ch\]/);
  assert.doesNotMatch(combined, /\bDC\b|DC Organizer/);
  assert.match(combined, /font-undara-heading/);
  assert.match(combined, /font-undara-body/);
  assert.match(combined, /font-undara-mono/);
});
