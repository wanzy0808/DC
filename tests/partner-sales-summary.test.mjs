import assert from "node:assert/strict";
import test from "node:test";
import { saleAmounts, summarizePartnerSales } from "../lib/partners/sales-summary.ts";

test("partner sales use the invoice total after the recorded referral discount", () => {
  const digital = saleAmounts(105_000, 150_000);
  const guestbook = saleAmounts(1_700_000, 2_000_000);
  assert.deepEqual(digital, { regularPrice: 150_000, discount: 45_000, amount: 105_000 });
  assert.deepEqual(guestbook, { regularPrice: 2_000_000, discount: 300_000, amount: 1_700_000 });

  assert.deepEqual(summarizePartnerSales([
    { ...digital, status: "PAID" },
    { ...guestbook, status: "PAID" },
    { ...guestbook, status: "PENDING" },
    { ...digital, status: "CANCELLED" },
  ]), {
    attributedOrders: 4,
    paidSales: 2,
    pendingSales: 1,
    gross: 2_150_000,
    discountGiven: 345_000,
    revenue: 1_805_000,
    pendingDiscount: 300_000,
  });
});

test("older attribution without a price snapshot does not invent a discount", () => {
  assert.deepEqual(saleAmounts(150_000, undefined), {
    regularPrice: 150_000, discount: 0, amount: 150_000,
  });
  assert.deepEqual(saleAmounts(105_000, 90_000), {
    regularPrice: 105_000, discount: 0, amount: 105_000,
  });
});
