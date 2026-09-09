import { createHmac, timingSafeEqual } from "node:crypto";

const PREFIX = "DCQR1";

function getSecret() {
  const secret = process.env.QR_SIGNING_SECRET;
  if (!secret) throw new Error("QR_SIGNING_SECRET belum dikonfigurasi.");
  return secret;
}

function sign(payload: string) {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export function createGuestQrToken(guestId: string) {
  const payload = `${PREFIX}.${guestId}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyGuestQrToken(token: string) {
  const parts = token.trim().split(".");
  if (parts.length !== 3 || parts[0] !== PREFIX || !parts[1] || !parts[2]) return null;
  const payload = `${parts[0]}.${parts[1]}`;
  const expected = sign(payload);
  const actualBuffer = Buffer.from(parts[2]);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length) return null;
  if (!timingSafeEqual(actualBuffer, expectedBuffer)) return null;
  return parts[1];
}
