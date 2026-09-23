import assert from "node:assert/strict";
import test from "node:test";
import { displayTitleCase } from "../lib/text/display-title-case.ts";

test("dropdown options and event titles use Title Case", () => {
  assert.equal(displayTitleCase("saya akan hadir"), "Saya Akan Hadir");
  assert.equal(displayTitleCase("acara keluarga chandra"), "Acara Keluarga Chandra");
  assert.equal(displayTitleCase("bapak chandra & ibu juni"), "Bapak Chandra & Ibu Juni");
  assert.equal(displayTitleCase("tamu kehormatan - keluarga"), "Tamu Kehormatan - Keluarga");
});
test("acronyms and official brand spelling survive capitalization", () => {
  assert.equal(displayTitleCase("dc organizer · wa blast · rsvp · vip · vvip · whatsapp"), "DC Organizer · WA Blast · RSVP · VIP · VVIP · WhatsApp");
  assert.equal(displayTitleCase("RSVP / QR Check-in"), "RSVP / QR Check-In");
});
test("display-only capitalization does not alter the stored value", () => {
  const saved = "keluarga chandra";
  assert.equal(displayTitleCase(saved), "Keluarga Chandra");
  assert.equal(saved, "keluarga chandra");
});
