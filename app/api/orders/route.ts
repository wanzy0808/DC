import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServicePackage } from "@/lib/packages/catalog";
import { sendInvoiceEmail } from "@/lib/email";

const allowedPackages = ["INVITATION_BASIC", "GUESTBOOK_DIGITAL"] as const;

function invoiceNumber() {
  const stamp = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `DC-${stamp}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Silakan daftar atau login terlebih dahulu." }, { status: 401 });

  try {
    const body = await request.json();
    const packageKey = String(body.packageKey ?? "");
    if (!allowedPackages.includes(packageKey as (typeof allowedPackages)[number])) {
      return NextResponse.json({ error: "Paket tidak ditemukan." }, { status: 400 });
    }

    const selected = getServicePackage(packageKey);
    if (!selected) return NextResponse.json({ error: "Paket tidak ditemukan." }, { status: 400 });

    let invitation = await prisma.invitation.findFirst({
      where: { ownerId: user.id, type: "WEDDING" },
      include: { payment: true },
      orderBy: { createdAt: "asc" },
    });

    if (!invitation) {
      const slugBase = user.firstName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "wedding";
      invitation = await prisma.invitation.create({
        data: {
          ownerId: user.id,
          slug: `${slugBase}-moment-${user.id.slice(-6)}`,
          type: "WEDDING",
          title: "Undangan Pernikahan",
        },
        include: { payment: true },
      });
    }

    const currentPaid = invitation.payment?.status === "PAID" ? invitation.payment : null;
    if (currentPaid?.packageKey === "GUESTBOOK_DIGITAL") {
      return NextResponse.json({ error: "Paket Guestbook sudah aktif di akun ini." }, { status: 409 });
    }
    if (currentPaid?.packageKey === packageKey) {
      return NextResponse.json({ error: "Paket ini sudah aktif di akun ini." }, { status: 409 });
    }

    const amount = currentPaid?.packageKey === "INVITATION_BASIC" && packageKey === "GUESTBOOK_DIGITAL"
      ? Math.max(0, selected.price - currentPaid.amount)
      : selected.price;

    const existingPending = await prisma.paymentOrder.findFirst({
      where: { userId: user.id, invitationId: invitation.id, packageKey, status: "PENDING" },
      orderBy: { createdAt: "desc" },
    });

    const order = existingPending
      ? await prisma.paymentOrder.update({
          where: { id: existingPending.id },
          data: { amount, proofUrl: String(body.proofUrl ?? "").trim() || null, note: String(body.note ?? "").trim() || null },
        })
      : await prisma.paymentOrder.create({
          data: {
            invoiceNumber: invoiceNumber(),
            userId: user.id,
            invitationId: invitation.id,
            packageKey,
            amount,
            proofUrl: String(body.proofUrl ?? "").trim() || null,
            note: String(body.note ?? "").trim() || null,
          },
        });

    const invoiceUrl = `${process.env.APP_URL ?? "http://localhost:3000"}/checkout/${order.id}`;
    const email = await sendInvoiceEmail({
      to: user.email,
      invoiceNumber: order.invoiceNumber,
      packageName: selected.name.id,
      amount: order.amount,
      invoiceUrl,
    });

    return NextResponse.json({ order, email, invoiceUrl });
  } catch {
    return NextResponse.json({ error: "Order pembayaran belum dapat dibuat." }, { status: 500 });
  }
}
