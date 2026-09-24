import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getInvitationCountdown } from "../lib/invitations/countdown.ts";

test("shared countdown uses integer seconds consistently for each renderer", () => {
  const start = Date.parse("2026-09-24T00:00:00.000Z");
  const end = new Date(start + ((2 * 86400 + 3 * 3600 + 4 * 60 + 5) * 1000) + 999);
  assert.deepEqual(getInvitationCountdown(end, start), {
    days: 2, hours: 3, minutes: 4, seconds: 5,
  });
  assert.deepEqual(getInvitationCountdown(end.toISOString(), start), getInvitationCountdown(end, start));
});

test("finished events clamp to zero and invalid dates cannot show a fictitious timer", () => {
  const now = Date.parse("2026-09-24T00:00:00.000Z");
  assert.deepEqual(getInvitationCountdown(new Date(now - 10000), now), {
    days: 0, hours: 0, minutes: 0, seconds: 0,
  });
  assert.equal(getInvitationCountdown("not a date", now), null);
});

test("Universal and Romantic Rose both consume one countdown helper without changing their visual sections", () => {
  const universal = readFileSync(new URL("../components/PublicInvitation/UniversalInvitationTemplate.tsx", import.meta.url), "utf8");
  const romantic = readFileSync(new URL("../components/PublicInvitation/RomanticRoseTemplate.tsx", import.meta.url), "utf8");
  assert.match(universal, /const remaining = getInvitationCountdown\(value, now\)/);
  assert.match(romantic, /const countdown = getInvitationCountdown\(invitation\.eventDate, now \?\? 0\)/);
  assert.match(universal, /\{section\("countdown", countdown \?/);
  assert.match(romantic, /\{countdown &&/);
});
