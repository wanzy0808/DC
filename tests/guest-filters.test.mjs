import assert from "node:assert/strict";
import test from "node:test";
import { matchesGuestLabels } from "../lib/guests/filters.ts";

test("unfiltered roster includes legacy guests without labels", () => {
  assert.equal(matchesGuestLabels({}, "", ""), true);
  assert.equal(matchesGuestLabels({ category: null, tags: [] }, "", ""), true);
  assert.equal(matchesGuestLabels({}, "VIP", ""), false);
  assert.equal(matchesGuestLabels({}, "", "Family"), false);
});

test("category and tag combine without substring matches", () => {
  const guest = { category: "VIP", tags: ["Family", "Shuttle"] };
  assert.equal(matchesGuestLabels(guest, "VIP", ""), true);
  assert.equal(matchesGuestLabels(guest, "", "Shuttle"), true);
  assert.equal(matchesGuestLabels(guest, "VIP", "Family"), true);
  assert.equal(matchesGuestLabels(guest, "VVIP", "Family"), false);
  assert.equal(matchesGuestLabels(guest, "VIP", "Fam"), false);
});

test("custom labels work and filtering preserves the complete seating data", () => {
  const guests = Object.freeze([
    Object.freeze({ id: "a", category: "Keluarga ibu", tags: Object.freeze(["Bus A"]) }),
    Object.freeze({ id: "b", category: "Office", tableId: "occupied-table", seatNumber: 1 }),
  ]);
  const filtered = guests.filter((guest) => matchesGuestLabels(guest, "Keluarga ibu", "Bus A"));
  assert.deepEqual(filtered.map((guest) => guest.id), ["a"]);
  assert.equal(guests[1].tableId, "occupied-table");
  assert.equal(guests.length, 2);
  assert.equal(guests.filter((guest) => matchesGuestLabels(guest, "", "")).length, 2);
});
