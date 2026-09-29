export type OwnerGrant = { digital: boolean; guestbook: boolean };

export function ownerAccessState(
  purchased: { purchasedDigital: boolean; purchasedGuestbook: boolean },
  grant: OwnerGrant,
) {
  const guestbook = purchased.purchasedGuestbook || grant.guestbook;
  return {
    digital: purchased.purchasedDigital || guestbook || grant.digital,
    guestbook,
    digitalLocked: purchased.purchasedDigital || guestbook,
    guestbookLocked: purchased.purchasedGuestbook,
  };
}

export function changeOwnerGrant(grant: OwnerGrant, packageKey: keyof OwnerGrant, checked: boolean): OwnerGrant {
  if (packageKey === "guestbook") return { digital: checked || grant.digital, guestbook: checked };
  return { ...grant, digital: checked };
}
