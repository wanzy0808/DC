import assert from "node:assert/strict";
import test from "node:test";
import { invitationQrTarget } from "../lib/invitations/qr.ts";

test("one invitation ID has one stable QR destination, independent of title and slug", () => {
  const first = invitationQrTarget("https://app.dcwedding.com/dashboard", "cm1paidinvitation");
  assert.equal(first, "https://app.dcwedding.com/q/cm1paidinvitation");
  assert.equal(invitationQrTarget("https://app.dcwedding.com/", "cm1paidinvitation"), first);
  assert.notEqual(invitationQrTarget("https://app.dcwedding.com/", "cm2paidinvitation"), first);
});

test("localhost QR destination stays on the active app port", () => {
  assert.equal(invitationQrTarget("http://localhost:3000/", "cm1"), "http://localhost:3000/q/cm1");
});

test("invalid invitation identifiers cannot inject query strings or paths", () => {
  assert.throws(() => invitationQrTarget("https://app.dcwedding.com/", "../invite"));
  assert.throws(() => invitationQrTarget("https://app.dcwedding.com/", "id?target=https://evil.example"));
  assert.throws(() => invitationQrTarget("https://app.dcwedding.com/", ""));
});
