import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), "utf8");

const page = read("app/event-planner/page.tsx");
const services = read("components/EventPlanner/ServicesSection.tsx");
const faq = read("components/Marketing/FaqSection.tsx");
const data = read("data/services/event-planner.ts");

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
  assert.match(services, /Kami Hubungkan/);
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
