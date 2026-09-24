import assert from "node:assert/strict";
import test from "node:test";
import { createGuestQrToken, verifyGuestQrToken } from "../lib/usher/qr.ts";
import { buildRsvpTicketQrUrl } from "../components/InvitationStudio/rsvp-helpers.ts";
import QRCode from "qrcode";

test("signed guest QR survives URL encoding and renders as a downloadable PNG", async () => {
  const previous = process.env.QR_SIGNING_SECRET;
  process.env.QR_SIGNING_SECRET = "test-only-rsvp-signing-secret";
  try {
    const token = createGuestQrToken("guest-test-123");
    const path = buildRsvpTicketQrUrl("acara-keluarga", token);
    const url = new URL(path, "https://example.test");
    assert.equal(url.origin, "https://example.test");
    assert.equal(url.pathname, "/api/invite/acara-keluarga/rsvp/qr");
    assert.equal(verifyGuestQrToken(url.searchParams.get("token")), "guest-test-123");
    assert.equal(verifyGuestQrToken(token.replace("guest-test-123", "another-guest")), null);
    const png = await QRCode.toBuffer(token, { type: "png", width: 840, margin: 4 });
    assert.equal(png.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
  } finally {
    if (previous === undefined) delete process.env.QR_SIGNING_SECRET;
    else process.env.QR_SIGNING_SECRET = previous;
  }
});

test("a saved RSVP without a ticket never creates an invalid QR link", () => {
  assert.equal(buildRsvpTicketQrUrl("acara", null), "");
});
