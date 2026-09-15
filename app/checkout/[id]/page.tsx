import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServicePackage } from "@/lib/packages/catalog";
import CheckoutClient from "@/components/Payments/CheckoutClient";

export default async function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/checkout/${(await params).id}`);
  const { id } = await params;
  const order = await prisma.paymentOrder.findFirst({
    where: { id, userId: user.id },
    include: { invitation: { select: { title: true, groomName: true, brideName: true } } },
  });
  if (!order) redirect("/transactions");

  const packageData = getServicePackage(order.packageKey);
  return (
    <CheckoutClient
      order={{
        id: order.id,
        invoiceNumber: order.invoiceNumber,
        packageKey: order.packageKey,
        packageName: packageData?.name.id ?? order.packageKey,
        amount: order.amount,
        status: order.status,
        proofUrl: order.proofUrl,
        note: order.note,
        createdAt: order.createdAt.toISOString(),
        invitation: order.invitation,
      }}
      bank={{
        name: process.env.PAYMENT_BANK_NAME ?? "",
        account: process.env.PAYMENT_BANK_ACCOUNT ?? "",
        holder: process.env.PAYMENT_BANK_HOLDER ?? "",
      }}
    />
  );
}
