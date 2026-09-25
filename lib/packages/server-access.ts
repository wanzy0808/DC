import { prisma } from "@/lib/prisma";
import { hasPaidDigitalInvitation, hasPaidGuestbook } from "@/lib/packages/access";
import { getOwnerPackageGrant } from "@/lib/packages/owner-grants";

type PaymentLike = { packageKey: string; status: string } | null | undefined;

/**
 * Payment entitlements remain event-scoped.
 * Owner grants are explicit account-level overrides and never count as sales.
 */
export async function hasAccountDigitalInvitation(
  userId: string,
  directPayment?: PaymentLike,
) {
  if (hasPaidDigitalInvitation(directPayment)) return true;
  const grant = await getOwnerPackageGrant(userId);
  return grant.digital;
}

export async function hasAccountGuestbook(
  userId: string,
  directPayment?: PaymentLike,
) {
  if (hasPaidGuestbook(directPayment)) return true;

  const grant = await getOwnerPackageGrant(userId);
  if (grant.guestbook) return true;

  const payment = await prisma.payment.findFirst({
    where: {
      userId,
      status: "PAID",
      packageKey: { in: ["GUESTBOOK_DIGITAL", "INVITATION_GUESTBOOK"] },
    },
    select: { packageKey: true, status: true },
    orderBy: { paidAt: "desc" },
  });

  return hasPaidGuestbook(payment);
}
