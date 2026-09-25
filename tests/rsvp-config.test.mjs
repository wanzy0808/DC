import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  defaultInvitationRsvpConfig,
  MAX_RSVP_CUSTOM_FIELDS,
  normalizeRsvpEvents,
  parseInvitationRsvpConfig,
  sanitizeInvitationRsvpConfig,
  sanitizeRsvpAnswers,
  withInvitationRsvpConfig,
} from "../lib/templates/rsvp-config.ts";

const read = (name) => readFileSync(new URL(`../${name}`, import.meta.url), "utf8");

test("legacy RSVP stays unchanged until event options or custom fields are enabled", () => {
  assert.deepEqual(defaultInvitationRsvpConfig, {
    ceremony: false,
    reception: false,
    attendAll: false,
    customFields: [],
  });
  const base = "romantic-rose::rose::cinzelFauna";
  assert.equal(withInvitationRsvpConfig(base, defaultInvitationRsvpConfig), base);
  assert.deepEqual(parseInvitationRsvpConfig(base), defaultInvitationRsvpConfig);
});

test("RSVP config round-trips event options and bounded custom fields", () => {
  const base = "romantic-rose::rose::cinzelFauna";
  const config = {
    ceremony: true,
    reception: true,
    attendAll: true,
    customFields: [
      { id: "meal", label: "Pilihan makanan", required: true },
      { id: "note", label: "Catatan", required: false },
    ],
  };
  const key = withInvitationRsvpConfig(base, config);
  assert.deepEqual(parseInvitationRsvpConfig(key), config);
  assert.equal(MAX_RSVP_CUSTOM_FIELDS, 5);
  assert.equal(
    sanitizeInvitationRsvpConfig({
      ceremony: true,
      customFields: Array.from({ length: 8 }, (_, index) => ({ id: `field${index}`, label: `Field ${index}` })),
    }).customFields.length,
    5,
  );
});

test("RSVP answers and event choices accept only configured values", () => {
  const config = {
    ceremony: true,
    reception: false,
    attendAll: false,
    customFields: [{ id: "meal", label: "Makanan", required: true }],
  };
  assert.deepEqual(normalizeRsvpEvents(["ceremony", "reception", "bad", "ceremony"], config), ["ceremony"]);
  assert.deepEqual(sanitizeRsvpAnswers({ meal: " Vegetarian ", unknown: "no" }, config), { meal: "Vegetarian" });
});

test("Studio exposes Attend All and Add Column and the live RSVP renders them", () => {
  const inspector = read("components/InvitationStudio/SectionInspector.tsx");
  const panels = read("components/InvitationStudio/RsvpPanels.tsx");
  const designer = read("components/InvitationStudio/InvitationDesigner.tsx");
  assert.match(inspector, /Hadir Semua Acara/);
  assert.match(inspector, /Tambah Kolom/);
  assert.match(inspector, /MAX_RSVP_CUSTOM_FIELDS/);
  assert.match(designer, /addRsvpCustomField/);
  assert.match(designer, /updateRsvpCustomField/);
  assert.match(designer, /removeRsvpCustomField/);
  assert.match(panels, /Upacara Nikah/);
  assert.match(panels, /Resepsi/);
  assert.match(panels, /Hadir Semua Acara/);
  assert.match(panels, /rsvpConfig\.customFields\.map/);
});

test("RSVP API persists event selection and custom answers on the same Guest record", () => {
  const route = read("app/api/invite/[slug]/rsvp/route.ts");
  const schema = read("prisma/schema.prisma");
  const migration = read("prisma/migrations/20260925095000_guest_rsvp_event_answers/migration.sql");
  assert.match(route, /parseInvitationRsvpConfig\(invitation\.templateKey\)/);
  assert.match(route, /normalizeRsvpEvents\(body\.rsvpEvents, rsvpConfig\)/);
  assert.match(route, /sanitizeRsvpAnswers\(body\.rsvpAnswers, rsvpConfig\)/);
  assert.match(route, /rsvpEvents: status === "ATTENDING" \? rsvpEvents : \[\]/);
  assert.match(route, /rsvpAnswers,/);
  assert.match(schema, /rsvpEvents\s+String\[\]\s+@default\(\[\]\)/);
  assert.match(schema, /rsvpAnswers\s+Json\?/);
  assert.match(migration, /ADD COLUMN "rsvpEvents" TEXT\[\]/);
  assert.match(migration, /ADD COLUMN "rsvpAnswers" JSONB/);
});
