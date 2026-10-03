import { hasPaidDigitalInvitation } from "@/lib/packages/access";

export type InvitationQrOption = {
  id: string;
  title: string;
  isPublished: boolean;
  payment?: { packageKey: string; status: string } | null;
};

export function paidInvitationQrOptions(invitations: InvitationQrOption[]) {
  return invitations.filter((invitation) => hasPaidDigitalInvitation(invitation.payment));
}

export function invitationQrImageUrl(invitationId: string, download = false) {
  return `/api/invitations/qr?invitationId=${encodeURIComponent(invitationId)}${download ? "&download=1" : ""}`;
}
