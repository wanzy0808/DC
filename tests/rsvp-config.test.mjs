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
  rsvpElementStyleCss,
  withInvitationRsvpConfig,
} from "../lib/templates/rsvp-config.ts";

const read = (name) => readFileSync(new URL(`../${name}`, import.meta.url), "utf8");

test("legacy RSVP stays unchanged until event options or custom fields are enabled", () => {
  assert.deepEqual(defaultInvitationRsvpConfig, {
    ceremony: false,
    reception: false,
    attendAll: false,
    customFields: [],
    elementStyles: {},
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
    title: "RSVP Kehadiran",
    elementStyles: {
      title: { fontSize: 30, align: "center" },
      name: { width: 80, opacity: 0.8, background: "#ffffff" },
    },
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
    elementStyles: {},
  };
  assert.deepEqual(normalizeRsvpEvents(["ceremony", "reception", "bad", "ceremony"], config), ["ceremony"]);
  assert.deepEqual(sanitizeRsvpAnswers({ meal: " Vegetarian ", unknown: "no" }, config), { meal: "Vegetarian" });
});

test("RSVP title and controls support independent persisted styling", () => {
  const config = sanitizeInvitationRsvpConfig({
    title: "Konfirmasi Tamu",
    elementStyles: {
      title: { fontSize: 34, align: "left", color: "#112233" },
      name: { width: 74, opacity: 0.7, background: "#ffffff", borderColor: "#c07a84" },
      bad: { width: 999, opacity: 0, background: "red" },
    },
  });
  assert.equal(config.title, "Konfirmasi Tamu");
  assert.deepEqual(config.elementStyles.title, { fontSize: 34, color: "#112233", align: "left" });
  assert.deepEqual(config.elementStyles.name, { width: 74, opacity: 0.7, background: "#ffffff", borderColor: "#c07a84" });
  assert.deepEqual(config.elementStyles.bad, { opacity: 0.2 });
  assert.deepEqual(rsvpElementStyleCss(config, "name"), {
    width: "74%",
    maxWidth: "100%",
    opacity: 0.7,
    backgroundColor: "#ffffff",
    borderColor: "#c07a84",
  });
});

test("Studio keeps RSVP function controls in Isi while the right inspector stays visual-only", () => {
  const inspector = read("components/InvitationStudio/RsvpElementInspector.tsx");
  const contentPanel = read("components/InvitationStudio/DesignerPanels.tsx");
  const panels = read("components/InvitationStudio/RsvpPanels.tsx");
  const designer = read("components/InvitationStudio/InvitationDesigner.tsx");
  assert.match(contentPanel, /Hadiri Semua Acara/);
  assert.match(contentPanel, /Centang opsi acara yang boleh dipilih tamu di dropdown RSVP/);
  assert.match(contentPanel, /type="checkbox" checked=\{rsvpConfig\.ceremony\}/);
  assert.match(contentPanel, /type="checkbox" checked=\{rsvpConfig\.reception\}/);
  assert.match(contentPanel, /type="checkbox" checked=\{rsvpConfig\.attendAll\}/);
  assert.match(contentPanel, /Tambah Kolom/);
  assert.match(contentPanel, /MAX_RSVP_CUSTOM_FIELDS/);
  assert.doesNotMatch(inspector, /Hadiri Semua Acara|Tambah Kolom|MAX_RSVP_CUSTOM_FIELDS/);
  assert.match(designer, /addRsvpCustomField/);
  assert.match(designer, /updateRsvpCustomField/);
  assert.match(designer, /removeRsvpCustomField/);
  assert.match(panels, /Upacara Nikah/);
  assert.match(panels, /Resepsi/);
  assert.match(panels, /Hadiri Semua Acara/);
  assert.match(panels, /<select[\s\S]*aria-label="Acara yang akan dihadiri"[\s\S]*<option value="all">Hadiri Semua Acara<\/option>/);
  assert.match(panels, /rsvpConfig\.customFields\.map/);
  assert.match(panels, /data-studio-rsvp-element="inputs"/);
  assert.match(panels, /data-studio-rsvp-element="button"/);
  assert.doesNotMatch(panels, /data-studio-rsvp-element="name"/);
  assert.doesNotMatch(panels, /data-studio-rsvp-element="phone"/);
  assert.doesNotMatch(panels, /data-studio-rsvp-element="status"/);
  assert.doesNotMatch(panels, /data-studio-rsvp-element="companions"/);
  assert.doesNotMatch(panels, /data-studio-rsvp-element="submit"/);
  assert.doesNotMatch(panels, /appearance !== "zen" && <h2/);
  const componentInspector = read("components/InvitationStudio/RsvpElementInspector.tsx");
  assert.match(designer, /selectedRsvpElementKey/);
  assert.match(designer, /target\.closest<HTMLElement>\("\[data-studio-rsvp-element\]"\)/);
  assert.match(designer, /<RsvpElementInspector/);
  assert.match(componentInspector, />\s*Reset\s*</);
  assert.doesNotMatch(componentInspector, /Reset komponen|Reset component/);
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
