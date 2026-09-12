import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServicePackage } from "@/lib/packages/catalog";

const invitationKey = "INVITATION_BASIC";
const guestbookKey = "GUESTBOOK_DIGITAL";
const legacyBundleKey = "INVITATION_GUESTBOOK";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });

  try {
    const body = await request.json();
    const requestedKey = String(body.packageKey ?? "");
    const selected = getServicePackage(requestedKey);
    if (!selected || ![invitationKey, guestbookKey].includes(requestedKey)) {
      return NextResponse.json({ error: "Paket tidak ditemukan." }, { status: 400 });
    }

    let invitation = await prisma.invitation.findFirst({
      where: { ownerId: user.id },
      include: { payment: true },
      orderBy: { createdAt: "asc" },
    });

    if (!invitation) {
      invitation = await prisma.invitation.create({
        data: {
          ownerId: user.id,
          slug: `${user.firstName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-moment-${user.id.slice(-6)}`,
          type: "WEDDING",
          title: "Undangan Pernikahan",
        },
        include: { payment: true },
      });
    }

    const currentPaidKey = invitation.payment?.status === "PAID" ? invitation.payment.packageKey : null;

    // Guest Book already includes every Digital Invitation entitlement,
    // so it is a terminal paid package rather than a package to downgrade.
    if (currentPaidKey === guestbookKey || currentPaidKey === legacyBundleKey) {
      return NextResponse.json({ error: "Paket Guest Book sudah aktif dan sudah mencakup Undangan Digital." }, { status: 409 });
    }

    // A paid Digital Invitation can be upgraded to Guest Book.
    const packageKey = currentPaidKey === invitationKey && requestedKey === guestbookKey
      ? guestbookKey
      : requestedKey;

    const packageData = getServicePackage(packageKey);
    if (!packageData) return NextResponse.json({ error: "Paket tidak ditemukan." }, { status: 400 });

    const proofUrl = String(body.proofUrl ?? "").trim() || null;
    const payment = await prisma.payment.upsert({
      where: { invitationId: invitation.id },
      update: {
        packageKey,
        amount: packageData.price,
        proofUrl,
        status: "PENDING",
        confirmedAt: null,
        confirmedById: null,
      },
      create: {
        userId: user.id,
        invitationId: invitation.id,
        packageKey,
        amount: packageData.price,
        proofUrl,
      },
    });

    return NextResponse.json({ payment, package: packageData });
  } catch {
    return NextResponse.json({ error: "Paket belum dapat dipilih." }, { status: 500 });
  }
}
