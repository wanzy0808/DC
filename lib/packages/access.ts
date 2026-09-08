export const digitalInvitationPackages = new Set([
  "INVITATION_BASIC",
  "GUESTBOOK_DIGITAL",
]);

export function hasPaidDigitalInvitation(payment: { packageKey: string; status: string } | null | undefined) {
  return Boolean(payment && payment.status === "PAID" && digitalInvitationPackages.has(payment.packageKey));
}