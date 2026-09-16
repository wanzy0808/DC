import { prisma } from "@/lib/prisma";
import { hasPaidDigitalInvitation, hasPaidGuestbook } from "@/lib/packages/access";

type PaymentLike = { packageKey: string; status: string } | null | undefined;

export async function hasAccountDigitalInvitation(
  userId: string,
  directPayment?: PaymentLike,
) {
  if (hasPaidDigitalInvitation(directPayment)) return true;

  const payment = await prisma.payment.findFirst({
    where: {
      userId,
      status: "PAID",
      packageKey: { in: ["INVITATION_BASIC", "INVITATION_GUESTBOOK"] },
    },
    select: { packageKey: true, status: true },
    orderBy: { paidAt: "desc" },
  });

  return hasPaidDigitalInvitation(payment);
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