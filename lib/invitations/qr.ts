import { slugifyEvent } from "@/lib/invitations/slug";

/**
 * Invitation-share QR: one stable destination per accessible Invitation.id.
 * This is NOT the HMAC-signed QR token used for per-guest Usher check-in.
 * The redirect route resolves the current slug, so editing the draft does not
 * invalidate a QR downloaded earlier.
 */
export function invitationQrTarget(appOrigin: string, invitationId: string): string {
  const base = new URL(appOrigin);
  const id = invitationId.trim();
  if (!id || !/^[a-zA-Z0-9_-]{1,128}$/.test(id)) {
    throw new Error("Invalid invitation ID.");
  }
  return new URL(`/q/${encodeURIComponent(id)}`, base.origin).toString();
}

export function invitationQrFilename(title?: string | null): string {
  const eventName = slugifyEvent(title?.trim() || "acara").slice(0, 80).replace(/-+$/, "");
  return `undara-undangan-${eventName}-qr.png`;
}
