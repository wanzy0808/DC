import assert from "node:assert/strict";
import test from "node:test";
import { normalizeReferralCode, referralPrice } from "../lib/partners/referral-pricing.ts";

test("Mitra referral prices are calculated from the actual package prices", () => {
  assert.deepEqual(referralPrice("INVITATION_BASIC", 150_000), {
    percent: 30, regularPrice: 150_000, discount: 45_000, amount: 105_000,
  });
  assert.deepEqual(referralPrice("GUESTBOOK_DIGITAL", 2_000_000), {
    percent: 15, regularPrice: 2_000_000, discount: 300_000, amount: 1_700_000,
  });
  assert.deepEqual(referralPrice("WA_BLAST_50", 75_000), {
    percent: 0, regularPrice: 75_000, discount: 0, amount: 75_000,
  });
});

test("referral codes ignore case and accidental whitespace", () => {
  assert.equal(normalizeReferralCode(" mitra-ab 12 cd "), "MITRA-AB12CD");
});
