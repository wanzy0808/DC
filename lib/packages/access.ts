export type PackageEntitlement = {
  hasDigitalInvitation: boolean;
  hasGuestbook: boolean;
  canPublishInvitation: boolean;
  canUploadInvitationAssets: boolean;
  canUseGuestPlacement: boolean;
  canUseUsherApp: boolean;
};

export const digitalInvitationPackages = new Set([
  "INVITATION_BASIC",
  "INVITATION_GUESTBOOK",
]);

export const guestbookPackages = new Set([
  "GUESTBOOK_DIGITAL",
  "INVITATION_GUESTBOOK",
]);

export function isPaidPayment(
  payment: { packageKey: string; status: string } | null | undefined,
) {
  return Boolean(payment && payment.status === "PAID");
}

export function hasPaidDigitalInvitation(
  payment: { packageKey: string; status: string } | null | undefined,
) {
  return Boolean(
    isPaidPayment(payment) && digitalInvitationPackages.has(payment!.packageKey),
  );
}

export function hasPaidGuestbook(
  payment: { packageKey: string; status: string } | null | undefined,
) {
  return Boolean(isPaidPayment(payment) && guestbookPackages.has(payment!.packageKey));
}

export function hasPaidBundle(
  payment: { packageKey: string; status: string } | null | undefined,
) {
  return Boolean(isPaidPayment(payment) && payment!.packageKey === "INVITATION_GUESTBOOK");
}

/**
 * Single source of truth for dashboard feature access.
 * Guestbook and Usher App are intentionally one entitlement.
 * Table/seat placement belongs to the paid Digital Invitation scope;
 * Guest Book users inherit it because Guest Book includes Digital Invitation.
 */
export function getPackageEntitlements(
  payment: { packageKey: string; status: string } | null | undefined,
): PackageEntitlement {
  const hasDigitalInvitation = hasPaidDigitalInvitation(payment);
  const hasGuestbook = hasPaidGuestbook(payment);

  return {
    hasDigitalInvitation,
    hasGuestbook,
    canPublishInvitation: hasDigitalInvitation,
    canUploadInvitationAssets: hasDigitalInvitation,
    canUseGuestPlacement: hasDigitalInvitation,
    canUseUsherApp: hasGuestbook,
  };
}
