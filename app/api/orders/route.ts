import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServicePackage } from "@/lib/packages/catalog";
import { hasPaidDigitalInvitation } from "@/lib/packages/access";
import { sendInvoiceEmail } from "@/lib/notifications/email";
import { attributeOrderToPartner, getActivePartnerVoucher } from "@/lib/partners/vouchers";

const allowedPackages = ["INVITATION_BASIC", "GUESTBOOK_DIGITAL", "WA_BLAST_50"] as const;
type AllowedPackage = (typeof allowedPackages)[number];

function invoiceNumber() {
  const stamp = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `DC-${stamp}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

function slugPart(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function makeEventSlug(firstName: string, userId: string) {
  const baseName = slugPart(firstName) || "event";
  const token = randomBytes(3).toString("hex");
  let candidate = `${baseName}-event-${token}-${userId.slice(-4)}`;
  let suffix = 2;

  while (await prisma.invitation.findUnique({ where: { slug: candidate }, select: { id: true } })) {
    candidate = `${baseName}-event-${token}-${suffix}-${userId.slice(-4)}`;
    suffix += 1;
  }
  return candidate;
}

async function resolveOwnedInvitation(userId: string, invitationId: string) {
  if (!invitationId) return null;
  return prisma.invitation.findFirst({
    where: { id: invitationId, ownerId: userId },
    include: { payment: true },
  });
}

async function createDraftEvent(user: { id: string; firstName: string }) {
  return prisma.invitation.create({
    data: {
      ownerId: user.id,
      slug: await makeEventSlug(user.firstName, user.id),
      type: "WEDDING",
      templateKey: "",
      title: "",
      groomName: "",
      brideName: "",
      venue: "",
      timezone: "Asia/Jakarta",
      eventConfigured: false,
      description: null,
      waBlastQuota: 0,
    },
    include: { payment: true },
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Silakan daftar atau login terlebih dahulu." }, { status: 401 });

  try {
    const body = await request.json();
    const packageKey = String(body.packageKey ?? "") as AllowedPackage;
    const requestedInvitationId = String(body.invitationId ?? "").trim();
    const voucherCode = String(body.voucherCode ?? "").trim();
    const partnerVoucher = voucherCode ? await getActivePartnerVoucher(voucherCode) : null;

    if (voucherCode && !partnerVoucher) {
      return NextResponse.json({ error: "Kode voucher mitra tidak valid atau sudah tidak aktif." }, { status: 400 });
    }

    if (!allowedPackages.includes(packageKey)) {
      return NextResponse.json({ error: "Produk tidak ditemukan." }, { status: 400 });
    }

    const selected = getServicePackage(packageKey);
    if (!selected) return NextResponse.json({ error: "Produk tidak ditemukan." }, { status: 400 });

    let invitation = await resolveOwnedInvitation(user.id, requestedInvitationId);
    if (requestedInvitationId && !invitation) {
      return NextResponse.json({ error: "Acara tidak ditemukan." }, { status: 404 });
    }

    if (packageKey === "WA_BLAST_50") {
      if (!invitation) {
        return NextResponse.json({ error: "Pilih acara sebelum membeli add-on WA Blast." }, { status: 400 });
      }
      if (!hasPaidDigitalInvitation(invitation.payment)) {
        return NextResponse.json({ error: "Aktifkan Undangan Digital untuk acara ini sebelum membeli WA Blast." }, { status: 409 });
      }
    } else if (!invitation) {
      invitation = await createDraftEvent(user);
    }

    if (!invitation) {
      return NextResponse.json({ error: "Acara tidak ditemukan." }, { status: 404 });
    }

    if (packageKey === "INVITATION_BASIC" && hasPaidDigitalInvitation(invitation.payment)) {
      return NextResponse.json({ error: "Undangan Digital untuk acara ini sudah aktif." }, { status: 409 });
    }

    if (packageKey === "GUESTBOOK_DIGITAL" && invitation.payment?.status === "PAID" && invitation.payment.packageKey === "GUESTBOOK_DIGITAL") {
      return NextResponse.json({ error: "Guest Book Digital untuk acara ini sudah aktif." }, { status: 409 });
    }

    const amount = selected.price;
    const existingPending = await prisma.paymentOrder.findFirst({
      where: {
        userId: user.id,
        invitationId: invitation.id,
        packageKey,
        status: "PENDING",
      },
      orderBy: { createdAt: "desc" },
    });

    const order = existingPending
      ? await prisma.paymentOrder.update({
          where: { id: existingPending.id },
          data: {
            amount,
            proofUrl: String(body.proofUrl ?? "").trim() || null,
            note: String(body.note ?? "").trim() || null,
          },
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

    if (partnerVoucher) {
      await attributeOrderToPartner(user.id, order.id, partnerVoucher);
    }

    const invoiceUrl = `${process.env.APP_URL ?? "http://localhost:3000"}/checkout/${order.id}`;
    const email = await sendInvoiceEmail({
      to: user.email,
      invoiceNumber: order.invoiceNumber,
      packageName: selected.name.id,
      amount: order.amount,
      invoiceUrl,
    });

    return NextResponse.json({
      order,
      email,
      invoiceUrl,
      invitationId: invitation.id,
      voucher: partnerVoucher ? { code: partnerVoucher.code, partner: partnerVoucher.partner.email } : null,
    });
  } catch (error) {
    console.error("POST /api/orders failed", error);
    return NextResponse.json({ error: "Order pembayaran belum dapat dibuat." }, { status: 500 });
  }
}
