export const digitalInvitationPackages = new Set([
  "INVITATION_BASIC",
  "INVITATION_GUESTBOOK",
]);

export const guestbookPackages = new Set([
  "GUESTBOOK_DIGITAL",
  "INVITATION_GUESTBOOK",
]);

export function isPaidPayment(payment: { packageKey: string; status: string } | null | undefined) {
  return Boolean(payment && payment.status === "PAID");
}

export function hasPaidDigitalInvitation(payment: { packageKey: string; status: string } | null | undefined) {
  return Boolean(isPaidPayment(payment) && digitalInvitationPackages.has(payment!.packageKey));
}

export function hasPaidGuestbook(payment: { packageKey: string; status: string } | null | undefined) {
  return Boolean(isPaidPayment(payment) && guestbookPackages.has(payment!.packageKey));
}

export function hasPaidBundle(payment: { packageKey: string; status: string } | null | undefined) {
  return Boolean(isPaidPayment(payment) && payment!.packageKey === "INVITATION_GUESTBOOK");
}
