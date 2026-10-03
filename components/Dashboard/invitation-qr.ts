export type InvitationQrOption = {
  id: string;
  title: string;
  isPublished: boolean;
  accessPaid?: boolean;
};

export function accessibleInvitationQrOptions(invitations: InvitationQrOption[]) {
  return invitations.filter((invitation) => invitation.accessPaid === true);
}

export function invitationQrImageUrl(invitationId: string, download = false) {
  return `/api/invitations/qr?invitationId=${encodeURIComponent(invitationId)}${download ? "&download=1" : ""}`;
}
