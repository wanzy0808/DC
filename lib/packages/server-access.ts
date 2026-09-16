import { prisma } from "@/lib/prisma";
import { hasPaidDigitalInvitation, hasPaidGuestbook } from "@/lib/packages/access";

type PaymentLike = { packageKey: string; status: string } | null | undefined;

/**
 * Digital Invitation entitlement is invitation-scoped.
 * Buying one event must never unlock another event owned by the same account.
 * Keep this helper name for compatibility with existing API callers.
 */
export async function hasAccountDigitalInvitation(
  _userId: string,
  directPayment?: PaymentLike,
) {
  return hasPaidDigitalInvitation(directPayment);
}

export async function hasAccountGuestbook(
  userId: string,
  directPayment?: PaymentLike,
) {
  if (hasPaidGuestbook(directPayment)) return true;

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
